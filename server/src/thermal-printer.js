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

    // Generate PACS Receipt with multiple style options
    generateSimplePACSReceipt(data, style = 'decorative') {
        const currentDate = moment().format('DD-MM-YYYY');
        const currentTime = moment().format('hh:mm A');
        
        const orgName = data.organization || "PACS-AIZA";
        const tokenNum = data.tokenNumber || "142";
        const farmerName = (data.farmer && data.farmer.name) ? data.farmer.name : "Unknown";
        
        const styles = {
            classic: this.generateClassicStyle(orgName, tokenNum, farmerName, data, currentDate, currentTime),
            decorative: this.generateDecorativeStyle(orgName, tokenNum, farmerName, data, currentDate, currentTime),
            modern: this.generateModernStyle(orgName, tokenNum, farmerName, data, currentDate, currentTime),
            elegant: this.generateElegantStyle(orgName, tokenNum, farmerName, data, currentDate, currentTime)
        };
        
        return styles[style] || styles.decorative;
    }

    // Style 1: Classic - Simple and clean like original
    generateClassicStyle(orgName, tokenNum, farmerName, data, currentDate, currentTime) {
        const receiptTemplate = `\\x1B\\x21\\x30%s\\x1B\\x21\\x00\\n\\n%s\\x1B\\x21\\x38\\x1B\\x45\\x01%s\\x1B\\x45\\x00\\x1B\\x21\\x00\\n\\nFarmer: %s\\n\\n%-20s %10s %10s\\n%s\\n%-20s %10s \\x1B\\x45\\x01%10s\\x1B\\x45\\x00\\n\\nDate: %-20s Time: %s\\n\\n\\n\\x1D\\x56\\x00`;
        
        return {
            template: receiptTemplate,
            values: [
                orgName,
                "Token No: ",
                tokenNum,
                farmerName,
                "Item", "Qty x Rate", "Total",
                this.createLine('-', 40),
                (data.items && data.items[0]) ? data.items[0].description : "Urea (45kg)",
                `${(data.items && data.items[0]) ? data.items[0].quantity : "2"} x ${(data.items && data.items[0]) ? data.items[0].rate : "268"}`,
                (data.items && data.items[0]) ? data.items[0].total : "536",
                currentDate,
                currentTime
            ]
        };
    }

    // Style 2: Decorative - ASCII art borders
    generateDecorativeStyle(orgName, tokenNum, farmerName, data, currentDate, currentTime) {
        const receiptTemplate = `%s
\\x1B\\x21\\x30%s\\x1B\\x21\\x00
%s
%s
Token No: \\x1B\\x21\\x30%s\\x1B\\x21\\x00
Farmer: %s
%s
%-18s %8s %10s
%s
%-18s %8s \\x1B\\x45\\x01%10s\\x1B\\x45\\x00
%s
%-20s%22s
%s
%s
%s
%s
\\x1D\\x56\\x00`;
        
        return {
            template: receiptTemplate,
            values: [
                "+========================================+",
                orgName,
                "FERTILIZER RECEIPT",
                "+========================================+",
                tokenNum,
                farmerName,
                "+========================================+",
                "Item", "Qty x Rate", "Amount",
                "+----------------------------------------+",
                (data.items && data.items[0]) ? data.items[0].description : "Urea (45kg)",
                `${(data.items && data.items[0]) ? data.items[0].quantity : "2"} x ${(data.items && data.items[0]) ? data.items[0].rate : "268"}`,
                (data.items && data.items[0]) ? data.items[0].total : "536",
                "+========================================+",
                `Date: ${currentDate}`,
                `Time: ${currentTime}`,
                "   * Thank you for your cooperation! *",
                "+========================================+",
                "",
                ""
            ]
        };
    }

    // Style 3: Modern - Clean with emphasis
    generateModernStyle(orgName, tokenNum, farmerName, data, currentDate, currentTime) {
        const receiptTemplate = `%s
  %s
%s

    \\x1B\\x21\\x38\\x1B\\x45\\x01TOKEN: %s\\x1B\\x45\\x00\\x1B\\x21\\x00

    FARMER: %s

%s
%-20s %10s %10s
%s
%-20s %10s \\x1B\\x45\\x01%10s\\x1B\\x45\\x00
%s

%s | %s

%s
\\x1D\\x56\\x00`;
        
        return {
            template: receiptTemplate,
            values: [
                "########################################",
                orgName,
                "########################################",
                tokenNum,
                farmerName,
                "----------------------------------------",
                "ITEM", "QTY x RATE", "AMOUNT",
                "========================================",
                (data.items && data.items[0]) ? data.items[0].description : "Urea (45kg)",
                `${(data.items && data.items[0]) ? data.items[0].quantity : "2"} x ${(data.items && data.items[0]) ? data.items[0].rate : "268"}`,
                (data.items && data.items[0]) ? data.items[0].total : "536",
                "========================================",
                currentDate,
                currentTime,
                "        Thank you! Visit again."
            ]
        };
    }

    // Style 4: Elegant - Ornate ASCII design
    generateElegantStyle(orgName, tokenNum, farmerName, data, currentDate, currentTime) {
        const receiptTemplate = `%s
%s
%s
%s
%s\\x1B\\x21\\x38\\x1B\\x45\\x01%s\\x1B\\x45\\x00\\x1B\\x21\\x00%s
%s %s %s
%s
%-18s %8s %10s
%s
%-18s %8s \\x1B\\x45\\x01%10s\\x1B\\x45\\x00
%s
%s | %s
%s
%s
%s
\\x1D\\x56\\x00`;
        
        return {
            template: receiptTemplate,
            values: [
                "  *-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*",
                "  -" + this.centerText(orgName, 34) + "-",
                "  *" + this.centerText("FERTILIZER RECEIPT", 34) + "*",
                "  -*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*",
                "  - Token:",
                tokenNum,
                " -",
                "  * Farmer:",
                farmerName,
                "*",
                "  -*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*",
                "Item", "Qty x Rate", "Amount",
                "  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
                (data.items && data.items[0]) ? data.items[0].description : "Urea (45kg)",
                `${(data.items && data.items[0]) ? data.items[0].quantity : "2"} x ${(data.items && data.items[0]) ? data.items[0].rate : "268"}`,
                (data.items && data.items[0]) ? data.items[0].total : "536",
                "  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
                currentDate,
                currentTime,
                "  -*-  Thank you for your visit!  -*-",
                "  -*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*",
                "  *-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*"
            ]
        };
    }

    // Helper function to center text within the receipt width
    centerText(text, width = 42) {
        if (text.length >= width) return text;
        const padding = Math.floor((width - text.length) / 2);
        return ' '.repeat(padding) + text;
    }

    // Print using the working printf approach
    async print(receiptData) {
        return new Promise((resolve, reject) => {
            // Construct printf command with template and values
            const command = `printf "${receiptData.template}" ${receiptData.values.map(v => `"${v}"`).join(' ')} | sudo tee /dev/usb/lp0 > /dev/null`;
            
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

    async printOrderReceipt(order, farmer, style = 'decorative') {
        const receiptData = {
            organization: "PACS-AIZA", 
            tokenNumber: order.id.toString(),
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

        console.log(`🖨️  Generating PACS receipt (${style} style) for Order #${order.id}`);
        const thermalReceipt = this.printer.generateSimplePACSReceipt(receiptData, style);
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