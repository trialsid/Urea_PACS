import { OrderWithFarmer } from '../types';
import { formatIndianDateTime, getCurrentIndianDateTime } from '../utils/dateTime';

interface ThermalReceiptProps {
  order: OrderWithFarmer;
}

// Minimal modern thermal receipt design
function ThermalReceipt({ order }: ThermalReceiptProps) {
  if (!order) {
    return <div>No order data available</div>;
  }

  const receiptStyle: React.CSSProperties = {
    width: '280px',
    fontFamily: '"Inter", "SF Pro Display", "Arial", sans-serif',
    fontSize: '16px',
    lineHeight: '1.2',
    padding: '12px 10px',
    color: '#000',
    backgroundColor: '#fff',
  };

  const farmerName = order.farmer_name || 'N/A';
  const farmerAadhaar = order.farmer_aadhaar || 'N/A';
  const farmerVillage = order.farmer_village || '';

  return (
    <div style={receiptStyle}>
      {/* Minimal Header */}
      <div style={{ textAlign: 'center', marginBottom: '12px' }}>
        <div style={{ fontSize: '22px', fontWeight: '700', marginBottom: '2px', letterSpacing: '1px' }}>
          PACS IJA
        </div>
        <div style={{ fontSize: '14px', fontWeight: '500' }}>
          Urea Distribution
        </div>
      </div>

      {/* Receipt Info */}
      <div style={{ marginBottom: '10px' }}>
        <div style={{ textAlign: 'center', marginBottom: '6px' }}>
          <div style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '0.5px' }}>
            RECEIPT #{order.id}
          </div>
        </div>
        <div style={{ textAlign: 'center', fontSize: '14px' }}>
          {formatIndianDateTime(order.created_at || getCurrentIndianDateTime())}
        </div>
      </div>

      <div style={{ borderTop: '1px solid #000', margin: '10px 0' }} />

      {/* Farmer Info */}
      <div style={{ fontSize: '15px', marginBottom: '10px' }}>
        <div style={{ marginBottom: '2px', fontSize: '17px', fontWeight: '600' }}>
          {farmerName}
        </div>
        <div style={{ fontSize: '14px' }}>
          {farmerAadhaar.replace(/(\d{4})/g, '$1 ').trim()}
        </div>
        {farmerVillage && (
          <div style={{ fontSize: '14px' }}>
            {farmerVillage}
          </div>
        )}
      </div>

      <div style={{ borderTop: '1px solid #000', margin: '10px 0' }} />

      {/* Product */}
      <div style={{ fontSize: '16px', marginBottom: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', fontWeight: '500' }}>
          <span>Urea Fertilizer (45kg)</span>
          <span>×{order.quantity}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px' }}>
          <span>₹{(order.total_amount / order.quantity).toFixed(2)} each</span>
          <span>₹{order.total_amount.toFixed(2)}</span>
        </div>
      </div>

      <div style={{ borderTop: '2px solid #000', margin: '12px 0' }} />

      {/* Total */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>
        <span>TOTAL</span>
        <span>₹{order.total_amount.toFixed(2)}</span>
      </div>

      {/* Payment Status */}
      <div style={{ textAlign: 'center', fontSize: '16px', marginBottom: '12px' }}>
        <div style={{ border: '2px solid #000', padding: '6px 12px', fontWeight: '600' }}>
          ✓ PAID CASH
        </div>
      </div>

      {/* Daily Limit */}
      <div style={{ fontSize: '14px', textAlign: 'center', marginBottom: '12px', padding: '6px', border: '1px solid #000', fontWeight: '500' }}>
        Daily Limit: {order.quantity}/2 bags today
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', fontSize: '13px' }}>
        <div style={{ marginBottom: '3px', fontWeight: '500' }}>Thank you!</div>
        <div style={{ marginBottom: '12px' }}>Keep this receipt for records</div>
      </div>

      {/* Stamp Area */}
      <div style={{ 
        border: '2px solid #000', 
        height: '120px', 
        width: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontSize: '12px',
        fontWeight: '500'
      }}>
        OFFICIAL STAMP
      </div>
    </div>
  );
}

export default ThermalReceipt;
