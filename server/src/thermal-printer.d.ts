declare class WorkingThermalPrinter {
    constructor(printerName?: string);
    generateSimplePACSReceipt(data: any): { template: string; values: string[] };
    printReceipt(receiptText: string): Promise<any>;
}

declare class PACSReceiptPrinter {
    printer: WorkingThermalPrinter;
    constructor();
    generateReceipt(data: any): string;
    printReceipt(receiptText: string): Promise<any>;
    printOrderReceipt(order: any, farmer: any): Promise<any>;
    checkPrinterStatus(): Promise<any>;
}

export { WorkingThermalPrinter, PACSReceiptPrinter };