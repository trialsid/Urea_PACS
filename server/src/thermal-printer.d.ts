declare class ESCPOSPrinter {
    constructor(devicePath?: string);
    sendCommand(data: string | Buffer): void;
    initialize(): void;
    printText(text: string): void;
    setBold(enabled?: boolean): void;
    setFontSize(width?: number, height?: number): void;
    setAlignCenter(): void;
    setAlignLeft(): void;
    cutPaper(): void;
    feedLines(lines?: number): void;
}

declare class ThermalPrinter {
    constructor();
    generateSimplePACSReceipt(data: any): Function;
    printESCPOS(receiptFunction: Function): Promise<any>;
}

declare class PACSReceiptPrinter {
    printer: ThermalPrinter;
    constructor();
    printOrderReceipt(order: any, farmer: any): Promise<any>;
    checkPrinterStatus(): Promise<any>;
}

export { ESCPOSPrinter, ThermalPrinter, PACSReceiptPrinter };