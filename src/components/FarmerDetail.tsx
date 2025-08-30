import React from 'react';
import OrderHistoryV2 from './OrderHistory.v2';

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

interface Order {
  id: number;
  farmer_id: number;
  farmer_name: string;
  farmer_aadhaar: string;
  farmer_village?: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  created_at: string;
}

interface FarmerDetailProps {
  farmer: Farmer;
  orders: Order[];
  onBack: () => void;
  onNewOrder?: (farmer: Farmer) => void;
}

const FarmerDetail: React.FC<FarmerDetailProps> = ({ farmer, orders, onBack, onNewOrder }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long', 
      year: 'numeric'
    });
  };

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
            <h2 className="text-2xl font-bold text-neutral-900">Farmer Details</h2>
            <p className="text-neutral-600">Complete information and order history</p>
          </div>
        </div>
        {onNewOrder && (
          <button
            onClick={() => onNewOrder(farmer)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            New Order for {farmer.name}
          </button>
        )}
      </div>

      {/* Two Panel Layout */}
      <div className="flex justify-center items-start gap-6">
        {/* Left Panel - Farmer Details */}
        <div className="w-auto flex-shrink-0">
          <div className="bg-white rounded-lg border border-neutral-200 shadow-sm" style={{ width: '480px' }}>
            {/* Compact Header */}
            <div className="bg-gradient-to-r from-success-50 to-success-100 p-4 rounded-t-lg border-b border-success-200">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-success-400 to-success-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-neutral-900">{farmer.name}</h3>
                  <p className="text-sm text-neutral-600">{farmer.village}</p>
                  <div className="mt-2">
                    {farmer.total_orders > 0 ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success-100 text-success-800">
                        <div className="w-1.5 h-1.5 bg-success-500 rounded-full mr-1"></div>
                        Active Customer
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800">
                        <div className="w-1.5 h-1.5 bg-neutral-500 rounded-full mr-1"></div>
                        New Registration
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-success-900">{farmer.total_orders}</div>
                  <div className="text-xs text-success-600">Orders</div>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* Personal Information - Compact Grid */}
              <div>
                <h4 className="text-sm font-semibold text-neutral-900 mb-3">Personal Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-neutral-600 block">Aadhaar Number</span>
                    <span className="text-neutral-900 font-mono">****-****-{farmer.aadhaar.slice(-4)}</span>
                  </div>
                  <div>
                    <span className="text-neutral-600 block">Village</span>
                    <span className="text-neutral-900">{farmer.village}</span>
                  </div>
                  {farmer.contact && (
                    <div>
                      <span className="text-neutral-600 block">Contact</span>
                      <span className="text-neutral-900 font-mono">{farmer.contact}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-neutral-600 block">Registered</span>
                    <span className="text-neutral-900">{formatDate(farmer.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* Order Statistics - Horizontal Cards */}
              <div>
                <h4 className="text-sm font-semibold text-neutral-900 mb-3">Order Statistics</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-primary-50 rounded p-3 text-center border border-primary-200">
                    <div className="text-lg font-bold text-primary-900">{farmer.total_orders}</div>
                    <div className="text-xs text-primary-600">Total Orders</div>
                  </div>
                  <div className="bg-success-50 rounded p-3 text-center border border-success-200">
                    <div className="text-lg font-bold text-success-900">₹{farmer.total_spent.toLocaleString()}</div>
                    <div className="text-xs text-success-600">Total Spent</div>
                  </div>
                  <div className="bg-blue-50 rounded p-3 text-center border border-blue-200">
                    <div className="text-lg font-bold text-blue-900">
                      {farmer.total_orders > 0 ? Math.round(farmer.total_spent / farmer.total_orders) : 0}
                    </div>
                    <div className="text-xs text-blue-600">Avg Order</div>
                  </div>
                </div>
                {farmer.last_order_date && (
                  <div className="mt-3 p-2 bg-neutral-50 rounded text-sm border border-neutral-200">
                    <span className="text-neutral-600">Last Order: </span>
                    <span className="text-neutral-900 font-medium">{formatDate(farmer.last_order_date)}</span>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Right Panel - Order History */}
        <div className="flex-1 min-w-80 max-w-2xl">
          <OrderHistoryV2 
            orders={orders}
            title={`Order History for ${farmer.name}`}
            showFarmerInfo={false}
          />
        </div>
      </div>
    </div>
  );
};

export default FarmerDetail;