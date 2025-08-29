import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { db, initializeDatabase } from './database';
import { Farmer, Order, OrderWithFarmer } from './models';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Serve static files from the React build
app.use(express.static(path.join(__dirname, '../../dist')));

// Aadhaar validation function
const validateAadhaar = (aadhaar: string): boolean => {
  // Basic Aadhaar validation: 12 digits
  return /^\d{12}$/.test(aadhaar);
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

// Helper function to get current Indian time as ISO string
const getIndianTimeISO = (): string => {
  const utcTime = new Date();
  const indianTime = new Date().toLocaleString('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).replace(/,\s/, 'T');
  
  console.log(`[SERVER] UTC: ${utcTime.toISOString()}, Indian: ${indianTime}`);
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
      'GET /api/farmers'
    ]
  });
});

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve React app for root route
app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../../dist/index.html'));
});

// Initialize database and start server
const startServer = async () => {
  try {
    await initializeDatabase();
    const server = app.listen(PORT, () => {
      console.log(`🚀 Urea PACS Server running on http://localhost:${PORT}`);
      console.log(`📊 Database initialized and ready`);
      console.log(`🔄 Server is running and waiting for requests...`);
      console.log(`💡 Press Ctrl+C to stop the server`);
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