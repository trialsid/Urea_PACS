import React from 'react';

interface DashboardProps {
  onNavigate: (view: 'new-order' | 'farmers' | 'orders') => void;
  stats?: {
    todayOrders: number;
    totalFarmers: number;
    todayRevenue: number;
  };
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, stats }) => {
  return (
    <div className="space-y-8">
      {/* Welcome Header - Mobile Responsive */}
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-3xl font-bold text-neutral-900 mb-2">
          <span className="hidden sm:inline">Welcome to Urea Distribution System</span>
          <span className="sm:hidden">Urea Distribution</span>
        </h1>
        <p className="text-sm sm:text-base text-neutral-600 max-w-2xl mx-auto px-2">
          <span className="hidden sm:inline">Manage fertilizer distribution, track farmer orders, and maintain comprehensive records 
          of your cooperative's operations.</span>
          <span className="sm:hidden">Manage fertilizer distribution and track farmer orders.</span>
        </p>
      </div>

      {/* Stats Cards - Mobile Responsive */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg border border-neutral-200 p-4 sm:p-6 shadow-sm">
            <div className="flex items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-neutral-600">Today's Orders</p>
                <p className="text-xl sm:text-2xl font-bold text-neutral-900">{stats.todayOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-neutral-200 p-4 sm:p-6 shadow-sm">
            <div className="flex items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-success-100 rounded-lg flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-neutral-600">Total Farmers</p>
                <p className="text-xl sm:text-2xl font-bold text-neutral-900">{stats.totalFarmers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-neutral-200 p-4 sm:p-6 shadow-sm sm:col-span-2 lg:col-span-1">
            <div className="flex items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-neutral-600">Today's Revenue</p>
                <p className="text-xl sm:text-2xl font-bold text-neutral-900">₹{stats.todayRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Action Cards - Mobile Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* New Order Card */}
        <button 
          onClick={() => onNavigate('new-order')}
          className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg border border-primary-200 p-4 sm:p-6 hover:from-primary-100 hover:to-primary-200 transition-all duration-200 group shadow-sm hover:shadow-md text-left"
        >
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200 flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-primary-900 mb-1">New Order</h3>
              <p className="text-primary-700 text-xs sm:text-sm leading-relaxed">
                Process urea distribution by entering Aadhaar number
              </p>
            </div>
            <div className="text-primary-600 group-hover:translate-x-1 transition-transform duration-200 flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </button>

        {/* View Farmers Card */}
        <button 
          onClick={() => onNavigate('farmers')}
          className="bg-gradient-to-br from-success-50 to-success-100 rounded-lg border border-success-200 p-4 sm:p-6 hover:from-success-100 hover:to-success-200 transition-all duration-200 group shadow-sm hover:shadow-md text-left"
        >
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-success-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200 flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-success-900 mb-1">View Farmers</h3>
              <p className="text-success-700 text-xs sm:text-sm leading-relaxed">
                Browse farmers, view details and purchase history
              </p>
            </div>
            <div className="text-success-600 group-hover:translate-x-1 transition-transform duration-200 flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </button>

        {/* Order History Card */}
        <button 
          onClick={() => onNavigate('orders')}
          className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-4 sm:p-6 hover:from-blue-100 hover:to-blue-200 transition-all duration-200 group shadow-sm hover:shadow-md text-left"
        >
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200 flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-blue-900 mb-1">Order History</h3>
              <p className="text-blue-700 text-xs sm:text-sm leading-relaxed">
                View orders, generate reports and track patterns
              </p>
            </div>
            <div className="text-blue-600 group-hover:translate-x-1 transition-transform duration-200 flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </button>
      </div>

      {/* Quick Actions - Mobile Responsive */}
      <div className="bg-white rounded-lg border border-neutral-200 p-4 sm:p-6 shadow-sm">
        <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-3 sm:mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <button 
            onClick={() => onNavigate('new-order')}
            className="p-3 text-left border border-neutral-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
          >
            <div className="text-xs sm:text-sm font-medium text-neutral-900">Process Order</div>
            <div className="text-xs text-neutral-600 mt-1">New distribution</div>
          </button>
          
          <button 
            onClick={() => onNavigate('farmers')}
            className="p-3 text-left border border-neutral-200 rounded-lg hover:border-success-300 hover:bg-success-50 transition-colors"
          >
            <div className="text-xs sm:text-sm font-medium text-neutral-900">Search Farmer</div>
            <div className="text-xs text-neutral-600 mt-1">Find by name/Aadhaar</div>
          </button>
          
          <button 
            onClick={() => onNavigate('orders')}
            className="p-3 text-left border border-neutral-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <div className="text-xs sm:text-sm font-medium text-neutral-900">Today's Report</div>
            <div className="text-xs text-neutral-600 mt-1">View daily summary</div>
          </button>
          
          <button 
            onClick={() => window.location.reload()}
            className="p-3 text-left border border-neutral-200 rounded-lg hover:border-neutral-300 hover:bg-neutral-50 transition-colors"
          >
            <div className="text-xs sm:text-sm font-medium text-neutral-900">Refresh Data</div>
            <div className="text-xs text-neutral-600 mt-1">Update all information</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;