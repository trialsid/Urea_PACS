import React from 'react';

interface Order {
  id: number;
  farmer_id: number;
  farmer_name: string;
  farmer_aadhaar: string;
  farmer_village: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  created_at: string;
}

interface Farmer {
  id: number;
  aadhaar: string;
  name: string;
  village: string;
  contact?: string;
  created_at: string;
  total_orders: number;
  total_spent: number;
  last_order_date?: string;
}

interface OrderDetailProps {
  order: Order;
  farmer?: Farmer;
  relatedOrders: Order[];
  onBack: () => void;
  onReprintReceipt?: (order: Order) => void;
  onViewFarmer?: (farmer: Farmer) => void;
}

const OrderDetail: React.FC<OrderDetailProps> = ({ 
  order, 
  farmer, 
  relatedOrders, 
  onBack, 
  onReprintReceipt, 
  onViewFarmer 
}) => {
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    };
  };

  const { date, time } = formatDateTime(order.created_at);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Order Details</h2>
            <p className="text-neutral-600">Complete order information and transaction history</p>
          </div>
        </div>
        {onReprintReceipt && (
          <button
            onClick={() => onReprintReceipt(order)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            Reprint Receipt
          </button>
        )}
      </div>

      {/* Two Panel Layout */}
      <div className="flex justify-center items-start gap-6">
        {/* Left Panel - Order Details */}
        <div className="w-auto flex-shrink-0">
          <div className="bg-white rounded-lg border border-neutral-200 shadow-sm" style={{ width: '480px' }}>
            {/* Compact Header */}
            <div className="bg-gradient-to-r from-primary-50 to-primary-100 p-4 rounded-t-lg border-b border-primary-200">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-neutral-900">Order #{order.id}</h3>
                  <p className="text-sm text-neutral-600">{date} at {time}</p>
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success-100 text-success-800">
                      <div className="w-1.5 h-1.5 bg-success-500 rounded-full mr-1"></div>
                      Completed & Paid
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-primary-900">₹{order.total_amount.toLocaleString()}</div>
                  <div className="text-xs text-primary-600">{order.quantity} bags</div>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* Order Information - Compact Grid */}
              <div>
                <h4 className="text-sm font-semibold text-neutral-900 mb-3">Order Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-neutral-600 block">Order ID</span>
                    <span className="text-neutral-900 font-mono">#{order.id}</span>
                  </div>
                  <div>
                    <span className="text-neutral-600 block">Quantity</span>
                    <span className="text-neutral-900">{order.quantity} bags</span>
                  </div>
                  <div>
                    <span className="text-neutral-600 block">Unit Price</span>
                    <span className="text-neutral-900">₹{order.unit_price.toLocaleString()}/bag</span>
                  </div>
                  <div>
                    <span className="text-neutral-600 block">Payment</span>
                    <span className="text-neutral-900">Cash Payment</span>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-primary-50 rounded border border-primary-200">
                  <div className="text-center">
                    <div className="text-lg font-bold text-primary-900">₹{order.total_amount.toLocaleString()}</div>
                    <div className="text-xs text-primary-600">Total Amount</div>
                  </div>
                </div>
              </div>

              {/* Farmer Information - Compact */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-neutral-900">Farmer Information</h4>
                  {farmer && onViewFarmer && (
                    <button
                      onClick={() => onViewFarmer(farmer)}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      View Profile →
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-neutral-600 block">Name</span>
                    <span className="text-neutral-900">{order.farmer_name}</span>
                  </div>
                  <div>
                    <span className="text-neutral-600 block">Village</span>
                    <span className="text-neutral-900">{order.farmer_village}</span>
                  </div>
                  <div>
                    <span className="text-neutral-600 block">Aadhaar</span>
                    <span className="text-neutral-900 font-mono">****-****-{order.farmer_aadhaar.slice(-4)}</span>
                  </div>
                  {farmer && (
                    <div>
                      <span className="text-neutral-600 block">Total Orders</span>
                      <span className="text-neutral-900">{farmer.total_orders}</span>
                    </div>
                  )}
                </div>
                {farmer && (
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="bg-success-50 rounded p-2 text-center border border-success-200">
                      <div className="text-sm font-bold text-success-900">{farmer.total_orders}</div>
                      <div className="text-xs text-success-600">Orders</div>
                    </div>
                    <div className="bg-blue-50 rounded p-2 text-center border border-blue-200">
                      <div className="text-sm font-bold text-blue-900">₹{farmer.total_spent.toLocaleString()}</div>
                      <div className="text-xs text-blue-600">Total Spent</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons - Compact */}
              <div className="flex flex-col space-y-2 pt-2">
                {onReprintReceipt && (
                  <button
                    onClick={() => onReprintReceipt(order)}
                    className="px-3 py-2 bg-primary-600 text-white rounded text-sm font-medium hover:bg-primary-700 transition-colors"
                  >
                    Reprint Receipt
                  </button>
                )}
                <div className="flex space-x-2">
                  <button
                    onClick={() => window.print()}
                    className="flex-1 px-3 py-2 bg-neutral-100 text-neutral-900 rounded text-sm font-medium hover:bg-neutral-200 transition-colors"
                  >
                    Print Details
                  </button>
                  {farmer && onViewFarmer && (
                    <button
                      onClick={() => onViewFarmer(farmer)}
                      className="flex-1 px-3 py-2 bg-success-100 text-success-900 rounded text-sm font-medium hover:bg-success-200 transition-colors"
                    >
                      View Farmer
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Related Orders */}
        <div className="flex-1 min-w-80 max-w-2xl">
          <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
            <div className="p-6 border-b border-neutral-200">
              <h4 className="text-lg font-semibold text-neutral-900">Related Orders from {order.farmer_name}</h4>
              <p className="text-sm text-neutral-600 mt-1">All orders by this farmer</p>
            </div>
            
            <div className="divide-y divide-neutral-200">
              {relatedOrders.length === 0 ? (
                <div className="p-6 text-center text-neutral-500">
                  <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <p>No other orders found</p>
                </div>
              ) : (
                relatedOrders.map((relatedOrder) => {
                  const { date: orderDate, time: orderTime } = formatDateTime(relatedOrder.created_at);
                  const isCurrentOrder = relatedOrder.id === order.id;
                  
                  return (
                    <div 
                      key={relatedOrder.id} 
                      className={`p-4 hover:bg-neutral-50 transition-colors ${
                        isCurrentOrder ? 'bg-primary-50 border-l-4 border-primary-600' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            isCurrentOrder ? 'bg-primary-100' : 'bg-neutral-100'
                          }`}>
                            <svg className={`w-5 h-5 ${
                              isCurrentOrder ? 'text-primary-600' : 'text-neutral-600'
                            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className={`font-medium ${
                                isCurrentOrder ? 'text-primary-900' : 'text-neutral-900'
                              }`}>
                                Order #{relatedOrder.id}
                              </span>
                              {isCurrentOrder && (
                                <span className="px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-700 rounded">
                                  Current
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-neutral-600">
                              {orderDate} at {orderTime}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-medium ${
                            isCurrentOrder ? 'text-primary-900' : 'text-neutral-900'
                          }`}>
                            ₹{relatedOrder.total_amount.toLocaleString()}
                          </div>
                          <div className="text-sm text-neutral-600">
                            {relatedOrder.quantity} bags
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            
            {relatedOrders.length > 0 && (
              <div className="p-4 bg-neutral-50 border-t border-neutral-200">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Total Orders:</span>
                  <span className="font-medium text-neutral-900">{relatedOrders.length}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-neutral-600">Total Amount:</span>
                  <span className="font-medium text-neutral-900">
                    ₹{relatedOrders.reduce((sum, o) => sum + o.total_amount, 0).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;