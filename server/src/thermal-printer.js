const moment = require('moment');
const fs = require('fs');

// Enhanced ESC/POS Thermal Printer with direct device communication
class ESCPOSPrinter {
    constructor(devicePath = '/dev/usb/lp0') {
        this.devicePath = devicePath;
        this.width = 42;
    }

    sendCommand(data) {
        try {
            if (typeof data === 'string') {
                data = Buffer.from(data, 'utf8');
            }
            fs.writeFileSync(this.devicePath, data);
        } catch (error) {
            if (error.code === 'EACCES') {
                throw new Error('Permission denied. Try running with sudo or add user to "lp" group');
            } else if (error.code === 'ENOENT') {
                throw new Error(`Printer not found at ${this.devicePath}`);
            } else {
                throw new Error(`Error sending to printer: ${error.message}`);
            }
        }
    }

    initialize() {
        this.sendCommand(Buffer.from([0x1b, 0x40])); // ESC @
    }

    printText(text) {
        this.sendCommand(text + '\n');
    }

    printLine(char = '-', length = 40) {
        this.sendCommand(char.repeat(length) + '\n');
    }

    cutPaper() {
        this.sendCommand(Buffer.from([0x1d, 0x56, 0x00])); // GS V 0
    }

    feedLines(lines = 3) {
        this.sendCommand('\n'.repeat(lines));
    }

    setBold(enabled = true) {
        if (enabled) {
            this.sendCommand(Buffer.from([0x1b, 0x45, 0x01])); // ESC E 1
        } else {
            this.sendCommand(Buffer.from([0x1b, 0x45, 0x00])); // ESC E 0
        }
    }

    setUnderline(enabled = true) {
        if (enabled) {
            this.sendCommand(Buffer.from([0x1b, 0x2d, 0x01])); // ESC - 1
        } else {
            this.sendCommand(Buffer.from([0x1b, 0x2d, 0x00])); // ESC - 0
        }
    }

    setAlignCenter() {
        this.sendCommand(Buffer.from([0x1b, 0x61, 0x01])); // ESC a 1
    }

    setAlignLeft() {
        this.sendCommand(Buffer.from([0x1b, 0x61, 0x00])); // ESC a 0
    }

    setAlignRight() {
        this.sendCommand(Buffer.from([0x1b, 0x61, 0x02])); // ESC a 2
    }

    setFontSize(width = 1, height = 1) {
        const size = ((width - 1) << 4) | (height - 1);
        this.sendCommand(Buffer.from([0x1d, 0x21, size])); // GS ! size
    }

    setDoubleWidth(enabled = true) {
        if (enabled) {
            this.sendCommand(Buffer.from([0x1b, 0x0e])); // ESC SO
        } else {
            this.sendCommand(Buffer.from([0x1b, 0x14])); // ESC DC4
        }
    }

    resetFont() {
        this.sendCommand(Buffer.from([0x1b, 0x21, 0x00])); // ESC ! 0
        this.sendCommand(Buffer.from([0x1b, 0x12]));        // Cancel condensed
        this.sendCommand(Buffer.from([0x1b, 0x14]));        // Cancel double width
        this.sendCommand(Buffer.from([0x1d, 0x21, 0x00]));  // Reset font size
    }

    centerText(text, width = 42) {
        if (text.length >= width) return text;
        const padding = Math.floor((width - text.length) / 2);
        return ' '.repeat(padding) + text;
    }
}

class ThermalPrinter {
    constructor() {
        this.width = 42; // Working width that fits without wrapping
    }

    // Generate PACS Receipt using ESC/POS commands
    generateSimplePACSReceipt(data) {
        // Use order's timestamp if provided, otherwise current time
        let orderDate, orderTime;
        if (data.created_at) {
            const orderDateTime = moment(data.created_at);
            orderDate = orderDateTime.format('DD-MM-YYYY');
            orderTime = orderDateTime.format('hh:mm A');
        } else {
            orderDate = moment().format('DD-MM-YYYY');
            orderTime = moment().format('hh:mm A');
        }
        
        const orgName = data.organization || "PACS-AIZA";
        const tokenNum = data.tokenNumber || "142";
        const farmerName = (data.farmer && data.farmer.name) ? data.farmer.name : "Unknown";
        
        return this.generateDecorativeStyleESCPOS(orgName, tokenNum, farmerName, data, orderDate, orderTime);
    }





    // ESC/POS Decorative Style - Enhanced version with better typography
    generateDecorativeStyleESCPOS(orgName, tokenNum, farmerName, data, currentDate, currentTime) {
        const item = (data.items && data.items[0]) ? data.items[0] : 
                    { description: "Urea (45kg)", quantity: "2", rate: "268", total: "536" };

        return (printer) => {
            // Initialize printer
            printer.initialize();
            
            // Top border - centered
            printer.setAlignCenter();
            printer.printText("+========================================+");
            
            // Organization name - large and bold
            printer.setFontSize(2, 1);
            printer.setBold(true);
            printer.printText(orgName);
            printer.resetFont();
            
            // Receipt title
            printer.printText("FERTILIZER RECEIPT");
            printer.printText("+========================================+");
            
            // Token section - left aligned with emphasis
            printer.setAlignLeft();
            printer.sendCommand("Token No: ");
            printer.setBold(true);
            printer.setFontSize(2, 2);
            printer.sendCommand(tokenNum);
            printer.resetFont();
            printer.printText("");
            
            // Farmer name
            printer.printText(`Farmer: ${farmerName}`);
            printer.printText("+========================================+");
            
            // Table header - properly spaced
            printer.printText("Item               Qty x Rate     Amount");
            printer.printText("+----------------------------------------+");
            
            // Item details with formatting
            const itemLine = item.description.padEnd(18, ' ');
            const qtyRate = `${item.quantity} x ${item.rate}`.padStart(8, ' ');
            printer.sendCommand(itemLine + " " + qtyRate + " ");
            
            // Bold total amount
            printer.setBold(true);
            printer.printText(item.total.padStart(10, ' '));
            printer.resetFont();
            
            // Bottom border
            printer.printText("+========================================+");
            
            // Date and time on same line
            const dateLine = `Date: ${currentDate}`.padEnd(20, ' ');
            const timeLine = `Time: ${currentTime}`.padStart(22, ' ');
            printer.printText(dateLine + timeLine);
            
            // Thank you message - centered
            printer.setAlignCenter();
            printer.printText("   * Thank you for your cooperation! *");
            printer.printText("+========================================+");
            
            // Feed and cut paper
            printer.feedLines(2);
            printer.cutPaper();
        };
    }

    // Helper function to center text within the receipt width
    centerText(text, width = 42) {
        if (text.length >= width) return text;
        const padding = Math.floor((width - text.length) / 2);
        return ' '.repeat(padding) + text;
    }

    // Print using ESC/POS direct approach
    async printESCPOS(receiptFunction) {
        return new Promise((resolve, reject) => {
            try {
                const printer = new ESCPOSPrinter();
                receiptFunction(printer);
                console.log('Receipt printed successfully using ESC/POS!');
                resolve('escpos_success');
            } catch (error) {
                reject(new Error(`ESC/POS Print failed: ${error.message}`));
            }
        });
    }

}

// PACS Receipt Printer - integrates with main app data structures
class PACSReceiptPrinter {
    constructor() {
        this.printer = new ThermalPrinter();
    }

    async printOrderReceipt(order, farmer) {
        const receiptData = {
            organization: "PACS-AIZA", 
            tokenNumber: order.id.toString(),
            created_at: order.created_at,  // Pass order's original timestamp
            items: [{
                description: "Urea (45kg)",
                quantity: order.quantity,
                rate: order.unit_price.toString(),
                unit: "bag",
                total: order.total_amount.toString()
            }],
            subtotal: order.total_amount,
            tax: 0.00,
            farmer: {
                name: farmer?.name || order.farmer_name,
                village: farmer?.village || order.farmer_village,
                aadhaar: farmer?.aadhaar || order.farmer_aadhaar
            },
            customerService: "1800-123-4567"
        };

        console.log(`🖨️  Printing PACS receipt for Order #${order.id}`);
        const thermalReceipt = this.printer.generateSimplePACSReceipt(receiptData);
        return await this.printer.printESCPOS(thermalReceipt);
    }

    // Print daily sales summary
    async printDailySummary(summaryData) {
        const generateDailySummaryReceipt = (data) => {
            const currentDate = moment(data.date).format('DD-MM-YYYY');
            const currentTime = moment().format('hh:mm A');
            
            // Helper function to create aligned rows
            const createTableRow = (label, value, totalWidth = 34) => {
                const valueStr = value.toString();
                const spaces = totalWidth - label.length - valueStr.length;
                return label + ' '.repeat(Math.max(1, spaces)) + valueStr;
            };
            
            return (printer) => {
                // Initialize printer
                printer.initialize();
                
                // Top decorative border
                printer.setAlignCenter();
                printer.setBold(true);
                printer.printText("========================================");
                printer.setBold(false);
                
                // Organization header with large font
                printer.setFontSize(2, 2);
                printer.setBold(true);
                printer.printText("PACS-AIZA");
                printer.setFontSize(1, 1);
                printer.setBold(false);
                
                // Report title with underline
                printer.setUnderline(true);
                printer.setBold(true);
                printer.printText("DAILY SALES SUMMARY");
                printer.setUnderline(false);
                printer.setBold(false);
                
                printer.printText("========================================");
                
                // Date and time header on same line
                printer.setAlignLeft();
                printer.setBold(true);
                const dateStr = `Date: ${currentDate}`;
                const timeStr = `Time: ${currentTime}`;
                const totalWidth = 38; // Width of the content area
                const spaces = totalWidth - dateStr.length - timeStr.length;
                const dateTimeLine = dateStr + ' '.repeat(Math.max(1, spaces)) + timeStr;
                printer.printText(dateTimeLine);
                printer.setBold(false);
                printer.printText("");
                
                // Main summary table with ASCII box drawing
                printer.printText("+--------------------------------------+");
                printer.setBold(true);
                printer.printText("|            ORDER SUMMARY            |");
                printer.setBold(false);
                printer.printText("+--------------------------------------+");
                
                // Table rows with proper alignment
                printer.printText(`| ${createTableRow('Total Orders:', data.totalOrders, 34)} |`);
                printer.printText(`| ${createTableRow('Total Bags:', data.totalBags, 34)} |`);
                printer.printText(`| ${createTableRow('Total Revenue:', `Rs. ${data.totalRevenue.toLocaleString()}`, 34)} |`);
                
                printer.printText("+--------------------------------------+");
                
                // Average section
                printer.printText(`| ${createTableRow('Avg per Order:', `Rs. ${data.avgPerOrder.toLocaleString()}`, 34)} |`);
                printer.printText(`| ${createTableRow('Avg Bags/Order:', data.avgBags, 34)} |`);
                
                printer.printText("+--------------------------------------+");
                printer.printText("");
                
                // Performance indicator
                if (data.totalOrders > 10) {
                    printer.setAlignCenter();
                    printer.setBold(true);
                    printer.printText("*** HIGH ACTIVITY DAY ***");
                    printer.setBold(false);
                } else if (data.totalOrders > 5) {
                    printer.setAlignCenter();
                    printer.setBold(true);
                    printer.printText("** MODERATE ACTIVITY **");
                    printer.setBold(false);
                }
                
                // Footer
                printer.setAlignCenter();
                printer.printText("");
                printer.setBold(true);
                printer.setUnderline(true);
                printer.printText("END OF DAY REPORT");
                printer.setUnderline(false);
                printer.setBold(false);
                printer.printText("Generated by PACS System");
                printer.printText("========================================");
                
                // Paper cut and feed
                printer.feedLines(3);
                printer.cutPaper();
            };
        };

        console.log(`🖨️  Printing daily sales summary for ${summaryData.date}`);
        const thermalReceipt = generateDailySummaryReceipt(summaryData);
        return await this.printer.printESCPOS(thermalReceipt);
    }

    // Check if printer device is available
    async checkPrinterStatus() {
        try {
            fs.accessSync('/dev/usb/lp0', fs.constants.W_OK);
            return { 
                success: true, 
                message: 'Printer device is accessible',
                printer: '/dev/usb/lp0'
            };
        } catch (error) {
            return { 
                success: false, 
                message: 'Printer device not accessible: ' + error.message,
                printer: '/dev/usb/lp0'
            };
        }
    }
}

module.exports = { ESCPOSPrinter, ThermalPrinter, PACSReceiptPrinter };