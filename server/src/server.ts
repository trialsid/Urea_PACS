import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { db, initializeDatabase } from './database';
import { Farmer, Order, OrderWithFarmer } from './models';
import { PACSReceiptPrinter } from './thermal-printer';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

// Client connection tracking middleware  
app.use((req: Request, res: Response, next) => {
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  
  // Skip tracking for localhost connections (Pi itself)
  if (clientIP !== '127.0.0.1' && clientIP !== '::1' && !clientIP.includes('localhost')) {
    if (!connectedClients.has(clientIP)) {
      connectedClients.add(clientIP);
      clientConnectionCount++;
      
      console.log(`📱 New client connected: ${clientIP} (#${clientConnectionCount})`);
      
      // Print basic connection message (time sync info will be printed separately if needed)
      printClientConnection(clientIP, clientConnectionCount);
    }
  }
  
  next();
});

// Serve static files from the React build
app.use(express.static(path.join(__dirname, '../../dist')));

// Initialize thermal printer
const thermalPrinter = new PACSReceiptPrinter();

// Time synchronization variables
let timeOffset = 0; // Milliseconds to add to server time
let isTimeSynced = false; // Has time been synced with a client device

// Client connection tracking
const connectedClients = new Set<string>(); // Track unique IP addresses
let clientConnectionCount = 0;

// Aadhaar validation function
const validateAadhaar = (aadhaar: string): boolean => {
  // Basic Aadhaar validation: 12 digits
  return /^\d{12}$/.test(aadhaar);
};

// Thermal print function for client connections
const printClientConnection = (clientIP: string, connectionNumber: number, timeSyncInfo?: { synced: boolean; diffMinutes?: number }) => {
  try {
    let message = `CLIENT CONNECTED #${connectionNumber}\\nIP: ${clientIP}\\n`;
    
    // Only show time info if we have meaningful sync information
    if (timeSyncInfo) {
      if (timeSyncInfo.synced && timeSyncInfo.diffMinutes && timeSyncInfo.diffMinutes > 5) {
        message += `Time: SYNCED (+${timeSyncInfo.diffMinutes} min)\\n`;
      } else if (timeSyncInfo.synced) {
        message += `Time: Already synced\\n`;
      } else {
        message += `Time: OK\\n`;
      }
    }
    // Don't show "Time: Checking..." - just skip time info if not available
    
    message += `Ready for orders\\n`;
    
    // ESC/POS commands for thermal printing with proper paper cut
    // Use echo -e instead of printf for better ESC/POS handling
    const escPos = `\\x1B\\x21\\x10${message}\\x1B\\x21\\x00\\n\\x1D\\x56\\x41\\x03`;
    
    // Print to thermal printer using echo -e for proper ESC/POS
    require('child_process').exec(`echo -e "${escPos}" | sudo tee /dev/usb/lp0 > /dev/null 2>&1`, (error: any) => {
      if (error) {
        console.log('📋 Thermal printer not available for connection message');
      } else {
        console.log(`🖨️  Printed connection message for ${clientIP}`);
      }
    });
  } catch (error) {
    console.warn('Failed to print client connection message:', error);
  }
};

// API Routes

// Get farmer by Aadhaar
app.get('/api/farmer/:aadhaar', (req: Request, res: Response) => {
  const { aadhaar } = req.params;
  
  if (!validateAadhaar(aadhaar)) {
    return res.status(400).json({ error: 'Invalid Aadhaar number format' });
  }

  db.get(
    'SELECT * FROM farmers WHERE aadhaar = ?',
    [aadhaar],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ farmer: row || null });
    }
  );
});

// Get order history for a farmer
app.get('/api/orders/:aadhaar', (req: Request, res: Response) => {
  const { aadhaar } = req.params;
  
  if (!validateAadhaar(aadhaar)) {
    return res.status(400).json({ error: 'Invalid Aadhaar number format' });
  }

  db.all(`
    SELECT o.*, f.name as farmer_name, f.aadhaar as farmer_aadhaar
    FROM orders o
    JOIN farmers f ON o.farmer_id = f.id
    WHERE f.aadhaar = ?
    ORDER BY o.created_at DESC
  `, [aadhaar], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ orders: rows || [] });
  });
});

// Create new farmer
app.post('/api/farmer', (req: Request, res: Response) => {
  const { aadhaar, name, village, contact }: { aadhaar: string; name: string; village: string; contact?: string } = req.body;
  
  if (!validateAadhaar(aadhaar)) {
    return res.status(400).json({ error: 'Invalid Aadhaar number format' });
  }
  
  if (!name || name.trim().length === 0) {
    return res.status(400).json({ error: 'Name is required' });
  }

  if (!village || village.trim().length === 0) {
    return res.status(400).json({ error: 'Village is required' });
  }

  const indianTime = getIndianTimeISO();

  db.run(
    'INSERT INTO farmers (aadhaar, name, village, contact, created_at) VALUES (?, ?, ?, ?, ?)',
    [aadhaar, name.trim(), village.trim(), contact?.trim() || null, indianTime],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(409).json({ error: 'Farmer with this Aadhaar already exists' });
        }
        return res.status(500).json({ error: 'Database error' });
      }
      
      // Get the created farmer
      db.get(
        'SELECT * FROM farmers WHERE id = ?',
        [this.lastID],
        (err, row) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }
          res.status(201).json({ farmer: row });
        }
      );
    }
  );
});

// Helper function to get current Indian time as ISO string (with client sync adjustment)
const getIndianTimeISO = (): string => {
  const adjustedTime = new Date(Date.now() + timeOffset);
  const indianTime = adjustedTime.toLocaleString('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).replace(/,\s/, 'T');
  
  return indianTime;
};

// Create new order (cash payment only - always paid)
app.post('/api/order', (req: Request, res: Response) => {
  const { farmer_id, quantity = 2, unit_price = 268.0 }: {
    farmer_id: number;
    quantity?: number;
    unit_price?: number;
  } = req.body;
  
  if (!farmer_id) {
    return res.status(400).json({ error: 'Farmer ID is required' });
  }
  
  const total_amount = quantity * unit_price;
  const indianTime = getIndianTimeISO();

  db.run(
    'INSERT INTO orders (farmer_id, quantity, unit_price, total_amount, created_at) VALUES (?, ?, ?, ?, ?)',
    [farmer_id, quantity, unit_price, total_amount, indianTime],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      // Get the created order with farmer details
      db.get(`
        SELECT o.*, f.name as farmer_name, f.aadhaar as farmer_aadhaar
        FROM orders o
        JOIN farmers f ON o.farmer_id = f.id
        WHERE o.id = ?
      `, [this.lastID], (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({ order: row });
      });
    }
  );
});

// Remove payment update endpoint - no longer needed for cash-only system

// Get all orders (for admin/reporting)
app.get('/api/orders', (req: Request, res: Response) => {
  const { date } = req.query;
  let query = `
    SELECT o.*, f.name as farmer_name, f.aadhaar as farmer_aadhaar, f.village as farmer_village
    FROM orders o
    JOIN farmers f ON o.farmer_id = f.id
  `;
  let params: any[] = [];
  
  if (date) {
    query += ` WHERE DATE(o.created_at) = ?`;
    params.push(date);
  }
  
  query += ` ORDER BY o.created_at DESC`;

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ orders: rows || [] });
  });
});

// Get all farmers (for admin/reporting)
app.get('/api/farmers', (req: Request, res: Response) => {
  db.all(`
    SELECT f.*, 
           COUNT(o.id) as total_orders,
           COALESCE(SUM(o.total_amount), 0) as total_spent,
           MAX(o.created_at) as last_order_date
    FROM farmers f
    LEFT JOIN orders o ON f.id = o.farmer_id
    GROUP BY f.id, f.aadhaar, f.name, f.village, f.contact, f.created_at
    ORDER BY f.created_at DESC
  `, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ farmers: rows || [] });
  });
});

// API info route (moved to /api)
app.get('/api', (req: Request, res: Response) => {
  res.json({ 
    message: 'Urea PACS Distribution API',
    version: '1.0.0',
    endpoints: [
      'GET /api/health',
      'GET /api/farmer/:aadhaar',
      'GET /api/orders/:aadhaar',
      'POST /api/farmer',
      'POST /api/order',
      'GET /api/orders',
      'GET /api/farmers',
      'POST /api/print/thermal-receipt',
      'GET /api/printer/status'
    ]
  });
});

// Time synchronization endpoint
app.post('/api/sync-time', (req: Request, res: Response) => {
  const { timestamp: clientTimestamp } = req.body;
  
  if (!clientTimestamp) {
    return res.status(400).json({ error: 'Client timestamp is required' });
  }
  
  try {
    const clientTime = new Date(clientTimestamp);
    const serverTime = new Date();
    const timeDiffMs = clientTime.getTime() - serverTime.getTime();
    const timeDiffMinutes = Math.abs(timeDiffMs) / (1000 * 60);
    
    // Validate client time is reasonable (not in future/past by more than 1 day)
    const dayInMs = 24 * 60 * 60 * 1000;
    if (Math.abs(timeDiffMs) > dayInMs) {
      return res.json({
        synced: false,
        message: 'Client time appears invalid',
        serverTime: serverTime.toISOString(),
        timeDiffMinutes: Math.round(timeDiffMinutes)
      });
    }
    
    // If time not yet synced and difference is significant (>5 minutes)
    if (!isTimeSynced && timeDiffMinutes > 5) {
      timeOffset = timeDiffMs;
      isTimeSynced = true;
      
      console.log(`📱 Time synced with client device`);
      console.log(`   Server time: ${serverTime.toISOString()}`);
      console.log(`   Client time: ${clientTime.toISOString()}`);
      console.log(`   Offset: ${Math.round(timeDiffMinutes)} minutes`);
      
      // Print time sync info to thermal printer
      const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
      if (clientIP !== '127.0.0.1' && clientIP !== '::1' && !clientIP.includes('localhost')) {
        const connectionNumber = Array.from(connectedClients).indexOf(clientIP) + 1;
        if (connectionNumber > 0) {
          printClientConnection(clientIP, connectionNumber, { 
            synced: true, 
            diffMinutes: Math.round(timeDiffMinutes) 
          });
        }
      }
      
      return res.json({
        synced: true,
        message: `Time synchronized (${Math.round(timeDiffMinutes)} minutes adjustment)`,
        serverTime: serverTime.toISOString(),
        clientTime: clientTime.toISOString(),
        adjustedTime: getIndianTimeISO(),
        timeDiffMinutes: Math.round(timeDiffMinutes)
      });
    }
    
    // Time already synced or difference is small
    res.json({
      synced: isTimeSynced,
      message: isTimeSynced ? 'Time already synchronized' : 'Time difference acceptable',
      serverTime: serverTime.toISOString(),
      adjustedTime: getIndianTimeISO(),
      timeDiffMinutes: Math.round(timeDiffMinutes)
    });
    
  } catch (error) {
    res.status(400).json({ error: 'Invalid timestamp format' });
  }
});

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    adjustedTimestamp: getIndianTimeISO(),
    timeSynced: isTimeSynced,
    timeOffset: timeOffset
  });
});

// Get counts for real-time change detection
app.get('/api/counts', (req: Request, res: Response) => {
  db.all(`
    SELECT 
      (SELECT COUNT(*) FROM farmers) as farmers,
      (SELECT COUNT(*) FROM orders) as orders,
      (SELECT MAX(id) FROM orders) as lastOrderId
  `, [], (err, rows: any[]) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    const counts = rows[0] || { farmers: 0, orders: 0, lastOrderId: null };
    res.json(counts);
  });
});

// Get orders since a specific ID (for real-time updates)
app.get('/api/orders/since/:lastId', (req: Request, res: Response) => {
  const lastId = parseInt(req.params.lastId);
  
  if (isNaN(lastId)) {
    return res.status(400).json({ error: 'Invalid lastId parameter' });
  }

  db.all(`
    SELECT o.*, f.name as farmer_name, f.aadhaar as farmer_aadhaar, f.village as farmer_village
    FROM orders o
    JOIN farmers f ON o.farmer_id = f.id
    WHERE o.id > ?
    ORDER BY o.created_at DESC
  `, [lastId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ orders: rows || [] });
  });
});

// Get farmers since a specific count (for real-time updates)
app.get('/api/farmers/since/:lastCount', (req: Request, res: Response) => {
  const lastCount = parseInt(req.params.lastCount);
  
  if (isNaN(lastCount)) {
    return res.status(400).json({ error: 'Invalid lastCount parameter' });
  }

  db.all(`
    SELECT f.*, 
           COUNT(o.id) as total_orders,
           COALESCE(SUM(o.total_amount), 0) as total_spent,
           MAX(o.created_at) as last_order_date
    FROM farmers f
    LEFT JOIN orders o ON f.id = o.farmer_id
    GROUP BY f.id, f.aadhaar, f.name, f.village, f.contact, f.created_at
    ORDER BY f.created_at DESC
    LIMIT ?
  `, [1000], (err, allRows: any[]) => {  // Get all farmers, then slice
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Return only new farmers (beyond the last count)
    const newFarmers = allRows.slice(0, Math.max(0, allRows.length - lastCount));
    res.json({ farmers: newFarmers });
  });
});

// Thermal Printer Endpoints

// Get available receipt styles
app.get('/api/receipt-styles', (req: Request, res: Response) => {
  res.json({
    styles: [
      { id: 'classic', name: 'Classic', description: 'Simple and clean (original format)' },
      { id: 'decorative', name: 'Decorative', description: 'ASCII art borders and frames' },
      { id: 'modern', name: 'Modern', description: 'Clean with emphasis blocks' },
      { id: 'elegant', name: 'Elegant', description: 'Ornate design with diamond patterns' }
    ]
  });
});

// Print thermal receipt for an order
app.post('/api/print/thermal-receipt', async (req: Request, res: Response) => {
  try {
    const { orderId, style = 'decorative' } = req.body;
    
    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    // Get order details from database
    db.get(`
      SELECT o.*, f.name as farmer_name, f.aadhaar as farmer_aadhaar, f.village as farmer_village, f.contact as farmer_contact
      FROM orders o
      JOIN farmers f ON o.farmer_id = f.id
      WHERE o.id = ?
    `, [orderId], async (err, order: any) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      try {
        // Print thermal receipt
        const jobId = await thermalPrinter.printOrderReceipt(order, {
          name: order.farmer_name,
          village: order.farmer_village,
          aadhaar: order.farmer_aadhaar,
          contact: order.farmer_contact
        });

        console.log(`✅ Thermal receipt printed for Order #${orderId}, Job: ${jobId}`);
        
        res.json({
          success: true,
          message: 'Receipt printed to thermal printer',
          jobId: jobId,
          order: {
            id: order.id,
            farmer_name: order.farmer_name,
            total_amount: order.total_amount,
            quantity: order.quantity
          }
        });
      } catch (printError) {
        console.error('❌ Thermal print failed:', printError);
        res.status(500).json({
          success: false,
          message: 'Thermal print failed: ' + (printError as Error).message
        });
      }
    });
  } catch (error) {
    console.error('❌ Print endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error: ' + (error as Error).message
    });
  }
});

// Preview thermal receipt for an order (same format as printing, but returns text)
app.get('/api/preview/thermal-receipt/:orderId', (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { style = 'decorative' } = req.query;
    
    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    // Get order details from database (same query as print endpoint)
    db.get(`
      SELECT o.*, f.name as farmer_name, f.aadhaar as farmer_aadhaar, f.village as farmer_village, f.contact as farmer_contact
      FROM orders o
      JOIN farmers f ON o.farmer_id = f.id
      WHERE o.id = ?
    `, [orderId], (err, order: any) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      try {
        // Generate the same receipt data as the printer would use
        const receiptData = {
          organization: "PACS-AIZA", 
          tokenNumber: order.id.toString(),
          items: [{
            description: "Urea (45kg)",
            quantity: order.quantity,
            rate: (order.total_amount / order.quantity).toString(),
            unit: "bag",
            total: order.total_amount.toString()
          }],
          subtotal: order.total_amount,
          tax: 0.00,
          farmer: {
            name: order.farmer_name,
            village: order.farmer_village,
            aadhaar: order.farmer_aadhaar
          },
          customerService: "1800-123-4567"
        };

        // Generate preview text for the ESC/POS receipt
        const currentDate = new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit', 
          year: 'numeric'
        });
        
        const currentTime = new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });

        // Create a simple text preview of what would be printed
        const previewText = `+========================================+
${receiptData.organization}
FERTILIZER RECEIPT
+========================================+
Token No: ${receiptData.tokenNumber}
Farmer: ${receiptData.farmer.name}
+========================================+
Item               Qty x Rate     Amount
+----------------------------------------+
${receiptData.items[0].description}          ${receiptData.items[0].quantity} x ${receiptData.items[0].rate}       ${receiptData.items[0].total}
+========================================+
Date: ${currentDate}              Time: ${currentTime}
   * Thank you for your cooperation! *
+========================================+`;
        
        res.json({
          success: true,
          preview: previewText,
          order: {
            id: order.id,
            farmer_name: order.farmer_name,
            total_amount: order.total_amount,
            quantity: order.quantity
          }
        });
      } catch (previewError) {
        console.error('❌ Preview generation failed:', previewError);
        res.status(500).json({
          success: false,
          message: 'Preview generation failed: ' + (previewError as Error).message
        });
      }
    });
  } catch (error) {
    console.error('❌ Preview endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error: ' + (error as Error).message
    });
  }
});

// Check thermal printer status
app.get('/api/printer/status', async (req: Request, res: Response) => {
  try {
    const status = await thermalPrinter.checkPrinterStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to check printer status',
      error: (error as Error).message
    });
  }
});

// Serve React app for root route
app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../../dist/index.html'));
});

// Initialize database and start server
const startServer = async () => {
  try {
    await initializeDatabase();
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Urea PACS Server running on http://0.0.0.0:${PORT}`);
      console.log(`📊 Database initialized and ready`);
      console.log(`🔄 Server is running and waiting for requests...`);
      console.log(`💡 Press Ctrl+C to stop the server`);
      console.log(`✅ Client connection printing enabled (READY message already printed)`)
    });

    // Handle server errors
    server.on('error', (error) => {
      console.error('Server error:', error);
    });

    // Graceful shutdown handlers
    process.on('SIGTERM', () => {
      console.log('🛑 SIGTERM received, shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('\n🛑 SIGINT received (Ctrl+C), shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });

    // Keep process alive
    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      // Don't exit immediately, log the error
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      // Don't exit immediately, log the error
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();