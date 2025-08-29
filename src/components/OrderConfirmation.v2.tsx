import { Farmer, OrderWithFarmer } from '../types';

interface OrderConfirmationV2Props {
  farmer: Farmer;
  onConfirm: () => void;
  onBack: () => void;
  loading: boolean;
  dailyBagCount: number;
  todaysOrders: OrderWithFarmer[];
}

function OrderConfirmationV2({ farmer, onConfirm, onBack, loading, dailyBagCount, todaysOrders: _ }: OrderConfirmationV2Props) {
  const DAILY_LIMIT = 2;
  const isLimitExceeded = dailyBagCount >= DAILY_LIMIT;
  const remainingBags = DAILY_LIMIT - dailyBagCount;
  return (
    <div className="card card-elevated max-w-2xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Confirm Order</h2>
          <p className="text-sm text-gray-600">Please review the details below before proceeding.</p>
        </div>
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
      </div>

      {/* Daily Limit Warning */}
      {isLimitExceeded && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-red-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-red-800 mb-1">Daily Limit Reached</h4>
              <p className="text-sm text-red-700">
                This farmer has already taken {dailyBagCount} bags today (limit: {DAILY_LIMIT} bags per day).
                Cannot process additional orders today.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Remaining Quota Info */}
      {!isLimitExceeded && dailyBagCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-yellow-800 mb-1">Partial Daily Quota Used</h4>
              <p className="text-sm text-yellow-700">
                This farmer has taken {dailyBagCount} bags today. {remainingBags} bags remaining for today.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Details Sections */}
      <div className="space-y-6">
        {/* Farmer Details */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            Farmer Information
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Name:</span>
              <span className="font-medium text-gray-900">{farmer.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Village:</span>
              <span className="font-medium text-gray-900">{farmer.village}</span>
            </div>
            {farmer.contact && (
              <div className="flex justify-between">
                <span className="text-gray-500">Contact:</span>
                <span className="font-mono text-gray-900">{farmer.contact}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Aadhaar:</span>
              <span className="font-mono text-gray-900">{farmer.aadhaar.replace(/(\d{4})/g, '$1 ').trim()}</span>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
            Order Summary
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Item:</span>
              <span className="font-medium text-gray-900">Urea Fertilizer</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Quantity:</span>
              <span className="font-medium text-gray-900">2 Bags</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Price per Bag:</span>
              <span className="font-medium text-gray-900">₹ 268.00</span>
            </div>
          </div>
        </div>
      </div>

      {/* Total Amount */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <div className="flex justify-between items-center">
          <span className="text-base font-medium text-gray-900">Total Amount Due:</span>
          <span className="text-xl font-bold text-blue-600">₹ 536.00</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-200">
        <button
          onClick={onBack}
          className="py-2.5 px-4 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-sm font-medium"
          disabled={loading}
        >
          Go Back
        </button>
        <button
          onClick={onConfirm}
          className="py-2.5 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-sm font-medium disabled:bg-gray-400"
          disabled={loading || isLimitExceeded}
        >
          {loading ? 'Processing...' : isLimitExceeded ? 'Daily Limit Reached' : 'Confirm & Create Order'}
        </button>
      </div>
    </div>
  );
}

export default OrderConfirmationV2;