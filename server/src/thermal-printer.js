const { exec } = require('child_process');
const moment = require('moment');

class WorkingThermalPrinter {
    constructor(printerName = 'Posiflex-PP8800') {
        this.printerName = printerName;
        this.width = 42; // Working width that fits without wrapping
    }

    // Create horizontal line
    createLine(char = '-', length = this.width) {
        return char.repeat(length);
    }

    // Generate Simple PACS Receipt - focused and minimal
    generateSimplePACSReceipt(data) {
        const currentDate = moment().format('DD-MM-YYYY');
        const currentTime = moment().format('hh:mm A');
        
        // Create centered text lines
        const orgName = data.organization || "PACS, Ieeja";
        const tokenNum = data.tokenNumber || "142";
        
        // Simple left alignment for everything
        const tokenLabel = "Token No: ";
        
        const receiptTemplate = `\\x1B\\x21\\x30%s\\x1B\\x21\\x00\\n\\n%s\\x1B\\x21\\x38\\x1B\\x45\\x01%s\\x1B\\x45\\x00\\x1B\\x21\\x00\\n\\nFarmer: %s\\n\\n%-20s %10s %10s\\n%s\\n%-20s %10s \\x1B\\x45\\x01%10s\\x1B\\x45\\x00\\n\\nDate: %-20s Time: %s\\n\\n\\n\\x1D\\x56\\x00`;
        
        const values = [
            orgName,
            tokenLabel,
            tokenNum,
            (data.farmer && data.farmer.name) ? data.farmer.name : "Unknown",
            "Item",
            "Qty x Rate",
            "Total",
            this.createLine('-', 40),
            (data.items && data.items[0]) ? data.items[0].description : "Urea (50kg)",
            `${(data.items && data.items[0]) ? data.items[0].quantity : "2"} x ${(data.items && data.items[0]) ? data.items[0].rate : "268"}`,
            (data.items && data.items[0]) ? data.items[0].total : "536",
            currentDate,
            currentTime
        ];
        
        return { template: receiptTemplate, values: values };
    }

    // Print using the working printf approach
    async print(receiptData) {
        return new Promise((resolve, reject) => {
            // Construct printf command with template and values
            const command = `printf "${receiptData.template}" ${receiptData.values.map(v => `"${v}"`).join(' ')} | lp -d ${this.printerName}`;
            
            exec(command, { shell: '/bin/bash' }, (error, stdout, stderr) => {
                if (error) {
                    reject(new Error(`Print failed: ${error.message}`));
                    return;
                }
                
                if (stderr) {
                    console.warn('Print warning:', stderr);
                }
                
                // Extract job ID from stdout
                const jobMatch = stdout.match(/request id is (.+) \(/);
                const jobId = jobMatch ? jobMatch[1] : 'unknown';
                
                console.log(`Receipt printed successfully! Job ID: ${jobId}`);
                resolve(jobId);
            });
        });
    }
}

// PACS Receipt Printer - integrates with main app data structures
class PACSReceiptPrinter {
    constructor() {
        this.printer = new WorkingThermalPrinter();
    }

    async printOrderReceipt(order, farmer) {
        const receiptData = {
            organization: "PACS, Ieeja", 
            tokenNumber: order.id.toString(),
            items: [{
                description: "Urea (50kg)",
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

        console.log('🖨️  Generating PACS2 receipt for Order #' + order.id);
        const thermalReceipt = this.printer.generateSimplePACSReceipt(receiptData);
        return await this.printer.print(thermalReceipt);
    }

    // Check if printer is available
    async checkPrinterStatus() {
        return new Promise((resolve, reject) => {
            exec(`lpstat -p ${this.printer.printerName}`, (error, stdout, stderr) => {
                if (error) {
                    resolve({ 
                        success: false, 
                        message: 'Printer not found or not ready',
                        printer: this.printer.printerName
                    });
                    return;
                }
                
                const isReady = stdout.includes('enabled') || stdout.includes('idle');
                resolve({ 
                    success: isReady, 
                    message: isReady ? 'Printer is ready' : 'Printer not ready',
                    printer: this.printer.printerName,
                    status: stdout.trim()
                });
            });
        });
    }
}

module.exports = { WorkingThermalPrinter, PACSReceiptPrinter };