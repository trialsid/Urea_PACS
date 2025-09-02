import { OrderWithFarmer } from '../types';

interface ActualThermalReceiptProps {
  order: OrderWithFarmer;
}

// Component that shows what actually gets printed on the thermal printer
function ActualThermalReceipt({ order }: ActualThermalReceiptProps) {
  if (!order) {
    return <div>No order data available</div>;
  }

  // Generate the actual text format that gets sent to the thermal printer
  // Based on the thermal-printer.js generateSimplePACSReceipt method
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

  const orgName = "PACS, Ieeja";
  const tokenNum = order.id?.toString() || '0';
  const createLine = (char: string, length: number) => char.repeat(length);

  // This matches the actual format sent to the thermal printer
  const thermalText = `${orgName}

Token No: ${tokenNum}

Item                 Qty x Rate      Total
${createLine('-', 40)}
Urea (45kg)          ${order.quantity} x ${(order.total_amount / order.quantity).toFixed(0)}       ${order.total_amount.toFixed(0)}

Date: ${currentDate}                Time: ${currentTime}`;

  const thermalStyle: React.CSSProperties = {
    fontFamily: '"Courier New", "Liberation Mono", "DejaVu Sans Mono", monospace',
    fontSize: '12px',
    lineHeight: '1.2',
    backgroundColor: '#fff',
    color: '#000',
    padding: '16px',
    border: '2px solid #333',
    borderRadius: '4px',
    maxWidth: '320px',
    margin: '0 auto',
    whiteSpace: 'pre-line',
    textAlign: 'left' as const,
    overflow: 'hidden'
  };

  return (
    <div style={thermalStyle}>
      {thermalText}
    </div>
  );
}

export default ActualThermalReceipt;