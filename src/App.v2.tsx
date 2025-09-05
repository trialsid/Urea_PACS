import { useState, useEffect } from 'react';
import { AppState } from './types';
import { api } from './api';
import AadhaarFormV2 from './components/AadhaarForm.v2';
import OrderConfirmationV2 from './components/OrderConfirmation.v2';
import ReceiptV2 from './components/Receipt.v2';
import OrderHistoryV2 from './components/OrderHistory.v2';
import Dashboard from './components/Dashboard';
import FarmersTable from './components/FarmersTable';
import OrdersList from './components/OrdersList';
import FarmerDetail from './components/FarmerDetail';
import OrderDetail from './components/OrderDetail';
import ThermalReceiptPreview from './components/ThermalReceiptPreview';
import { useToast } from './components/ToastContainer';
import { useRealTimeUpdates } from './hooks/useRealTimeUpdates';
import { isToday, getCurrentIndianDateTime } from './utils/dateTime';

function AppV2() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'new-order' | 'farmers' | 'orders' | 'farmer-detail' | 'order-detail'>('dashboard');
  const [selectedFarmer, setSelectedFarmer] = useState<any | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [showReprintModal, setShowReprintModal] = useState(false);
  const [reprintOrder, setReprintOrder] = useState<any | null>(null);
  const selectedReprintStyle = 'decorative';
  const [appState, setAppState] = useState<AppState>({
    step: 'aadhaar-entry',
    aadhaar: '',
    aadhaarConfirm: '',
    farmer: null,
    currentOrder: null,
    orderHistory: [],
    dailyBagCount: 0,
    todaysOrders: []
  });

  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [allFarmers, setAllFarmers] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [currentTime, setCurrentTime] = useState<string>(getCurrentIndianDateTime());

  // Toast notifications
  const { addToast, ToastContainer } = useToast();

  // Time synchronization
  const syncTimeWithServer = async () => {
    try {
      const clientTimestamp = new Date().toISOString();
      const response = await fetch('/api/sync-time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timestamp: clientTimestamp })
      });
      
      const data = await response.json();
      if (data.synced && data.timeDiffMinutes > 5) {
        addToast({
          type: 'success',
          title: 'Time Synchronized',
          message: `Device time adjusted by ${data.timeDiffMinutes} minutes`,
          duration: 5000
        });
        console.log('📱 Time sync:', data.message);
      }
    } catch (error) {
      console.warn('Time sync failed:', error);
      // Don't show error toast - this is optional functionality
    }
  };

  // Smart state update functions
  const addNewFarmer = (farmer: any) => {
    setAllFarmers(prev => {
      // Check if farmer already exists
      if (prev.some(f => f.id === farmer.id)) {
        return prev;
      }
      // Add new farmer to beginning of array
      const updated = [farmer, ...prev];
      
      // Show notification
      addToast({
        type: 'success',
        title: 'New Farmer Registered',
        message: `${farmer.name} from ${farmer.village} has been registered`
      });
      
      return updated;
    });
  };

  const addNewOrder = (order: any) => {
    setAllOrders(prev => {
      // Check if order already exists
      if (prev.some(o => o.id === order.id)) {
        return prev;
      }
      // Add new order to beginning of array
      const updated = [order, ...prev];
      
      // Show notification
      addToast({
        type: 'info',
        title: 'New Order Placed',
        message: `Order #${order.id} - ${order.farmer_name} (₹${order.total_amount})`
      });
      
      return updated;
    });
  };

  // Real-time updates - only enable when not in new-order flow
  useRealTimeUpdates({
    onNewFarmer: addNewFarmer,
    onNewOrder: addNewOrder,
    enabled: backendStatus === 'online' && currentView !== 'new-order'
  });

  // Check backend status, sync time, and load data on app load
  useEffect(() => {
    const checkBackend = async () => {
      try {
        await api.healthCheck();
        setBackendStatus('online');
        
        // Sync time with server on first load
        await syncTimeWithServer();
        
        await loadDashboardData();
      } catch {
        setBackendStatus('offline');
      }
    };
    checkBackend();
  }, []);


  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentIndianDateTime());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const loadDashboardData = async () => {
    try {
      const [farmersResponse, ordersResponse] = await Promise.all([
        api.getAllFarmers(),
        api.getAllOrders()
      ]);
      setAllFarmers(farmersResponse.farmers || []);
      setAllOrders(ordersResponse.orders || []);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const handleAadhaarSubmit = async (aadhaar: string, name?: string, village?: string, contact?: string) => {
    setLoading(true);
    setError(null);

    try {
      // Check if farmer exists
      const { farmer } = await api.getFarmer(aadhaar);
      
      if (farmer) {
        // Existing farmer
        setAppState(prev => ({
          ...prev,
          aadhaar,
          farmer,
          step: 'order-confirmation'
        }));
        
        // Load order history
        const { orders } = await api.getOrderHistory(aadhaar);
        
        // Check daily limit (2 bags per day) using Indian timezone
        const todaysOrders = orders.filter(order => {
          return isToday(order.created_at || '');
        });
        
        // Calculate total bags taken today (assuming 45kg per bag, so total_amount/45 = bags)
        const bagsToday = todaysOrders.reduce((total, order) => total + (order.quantity || 2), 0);
        
        setAppState(prev => ({
          ...prev,
          orderHistory: orders,
          dailyBagCount: bagsToday,
          todaysOrders: todaysOrders
        }));
      } else {
        // New farmer - name and village should be provided by AadhaarForm
        if (!name) {
          setError('Name is required for new farmer registration');
          return;
        }
        
        if (!village) {
          setError('Village is required for new farmer registration');
          return;
        }
        
        const { farmer: newFarmer } = await api.createFarmer({ aadhaar, name, village, contact });
        
        // Add new farmer to state immediately (optimistic update)
        setAllFarmers(prev => [{ ...newFarmer, total_orders: 0, total_spent: 0 }, ...prev]);
        
        setAppState(prev => ({
          ...prev,
          aadhaar,
          farmer: newFarmer,
          step: 'order-confirmation'
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }

    setLoading(false);
  };

  const handleCreateOrder = async () => {
    if (!appState.farmer) return;

    setLoading(true);
    setError(null);

    try {
      const { order } = await api.createOrder({ 
        farmer_id: appState.farmer.id!,
        quantity: 2,
        unit_price: 268
      });
      
      // Update state with new order immediately (optimistic update)
      setAllOrders(prev => [order, ...prev]);
      
      // Update farmer data to reflect new order
      setAllFarmers(prev => prev.map(f => 
        f.id === appState.farmer?.id 
          ? { 
              ...f, 
              total_orders: f.total_orders + 1, 
              total_spent: f.total_spent + order.total_amount,
              last_order_date: order.created_at 
            }
          : f
      ));
      
      setAppState(prev => ({
        ...prev,
        currentOrder: order,
        step: 'receipt'
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order');
    }

    setLoading(false);
  };

  const handleReset = () => {
    setAppState({
      step: 'aadhaar-entry',
      aadhaar: '',
      aadhaarConfirm: '',
      farmer: null,
      currentOrder: null,
      orderHistory: [],
      dailyBagCount: 0,
      todaysOrders: []
    });
    setError(null);
    setCurrentView('new-order');
  };

  const handleNavigate = (view: 'new-order' | 'farmers' | 'orders') => {
    if (view === 'new-order') {
      setCurrentView('new-order');
      setAppState({
        step: 'aadhaar-entry',
        aadhaar: '',
        aadhaarConfirm: '',
        farmer: null,
        currentOrder: null,
        orderHistory: [],
        dailyBagCount: 0,
        todaysOrders: []
      });
      setError(null);
    } else {
      setCurrentView(view);
    }
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    loadDashboardData(); // Refresh data when returning to dashboard
  };

  // Calculate dashboard stats
  const getDashboardStats = () => {
    const todayOrders = allOrders.filter(order => 
      isToday(order.created_at)
    );
    
    return {
      todayOrders: todayOrders.length,
      totalFarmers: allFarmers.length,
      todayRevenue: todayOrders.reduce((sum, order) => sum + order.total_amount, 0)
    };
  };

  // Handle farmer selection
  const handleSelectFarmer = async (farmer: any) => {
    setSelectedFarmer(farmer);
    setCurrentView('farmer-detail');
    // Could load farmer's orders here if needed
  };

  // Handle order selection  
  const handleSelectOrder = async (order: any) => {
    setSelectedOrder(order);
    // Find the farmer for this order
    const farmer = allFarmers.find(f => f.id === order.farmer_id);
    setSelectedFarmer(farmer || null);
    setCurrentView('order-detail');
  };

  // Handle back navigation from detail views
  const handleBackFromFarmerDetail = () => {
    setSelectedFarmer(null);
    setCurrentView('farmers');
  };

  const handleBackFromOrderDetail = () => {
    setSelectedOrder(null);
    setSelectedFarmer(null);
    setCurrentView('orders');
  };

  // Handle reprint receipt modal
  const handleReprintReceipt = (order: any) => {
    console.log('Reprint order data:', order);
    console.log('Selected farmer data:', selectedFarmer);
    
    // Ensure the order has all required fields for ThermalReceipt
    const enrichedOrder = {
      ...order,
      farmer_village: order.farmer_village || selectedFarmer?.village || '',
      farmer_contact: order.farmer_contact || selectedFarmer?.contact || ''
    };
    
    console.log('Enriched order for reprint:', enrichedOrder);
    setReprintOrder(enrichedOrder);
    setShowReprintModal(true);
  };

  const handleClosePrintModal = () => {
    setShowReprintModal(false);
    setReprintOrder(null);
  };

  const handlePrintReceipt = async () => {
    if (!reprintOrder) return;

    try {
      // Call thermal print API instead of browser print
      const response = await fetch('/api/print/thermal-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: reprintOrder.id, style: selectedReprintStyle })
      });
      
      const result = await response.json();
      
      if (result.success) {
        addToast({
          type: 'success',
          title: 'Receipt Printed',
          message: `Thermal receipt printed! Job ID: ${result.jobId}`
        });
      } else {
        throw new Error(result.message || 'Print failed');
      }
    } catch (error) {
      addToast({
        type: 'error', 
        title: 'Print Failed',
        message: (error as Error).message
      });
    }
    
    handleClosePrintModal();
  };

  // Loading state
  if (backendStatus === 'checking') {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Connecting to server...</p>
        </div>
      </div>
    );
  }

  // Offline state
  if (backendStatus === 'offline') {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-error-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-neutral-900 mb-2">Backend Server Offline</h1>
          <p className="text-neutral-600 mb-4">Please start the backend server:</p>
          <div className="bg-neutral-100 p-4 rounded-lg font-mono text-sm text-left">
            cd urea-pacs-app/server<br/>
            npm run dev
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Responsive Header */}
      <header className="bg-white border-b border-neutral-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between py-4">
            {/* Enhanced Logo and Branding */}
            <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
              <button 
                onClick={handleBackToDashboard}
                className="header-logo cursor-pointer flex-shrink-0"
              >
                <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </button>
              <div className="min-w-0 flex-1">
                <button 
                  onClick={handleBackToDashboard}
                  className="text-left cursor-pointer block w-full"
                >
                  <h1 className="text-lg sm:text-2xl font-extrabold text-neutral-900 tracking-tight hover:text-primary-600 transition-colors truncate">
                    <span className="hidden sm:inline">Urea PACS Distribution</span>
                    <span className="sm:hidden">PACS</span>
                  </h1>
                  <p className="text-xs sm:text-sm text-neutral-600 font-medium tracking-wide hidden sm:block">Agricultural Cooperative Society • Digital Distribution System</p>
                  <p className="text-xs text-neutral-600 font-medium sm:hidden">Distribution System</p>
                </button>
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="flex items-center space-x-2 sm:space-x-6">
              {/* Navigation Pills - Desktop */}
              <div className="hidden lg:flex items-center space-x-1 bg-neutral-100 rounded-lg p-1">
                <button
                  onClick={handleBackToDashboard}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    currentView === 'dashboard' 
                      ? 'bg-white text-neutral-900 shadow-sm' 
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-white'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => handleNavigate('new-order')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    currentView === 'new-order' 
                      ? 'bg-white text-neutral-900 shadow-sm' 
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-white'
                  }`}
                >
                  New Order
                </button>
                <button
                  onClick={() => handleNavigate('farmers')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    currentView === 'farmers' 
                      ? 'bg-white text-neutral-900 shadow-sm' 
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-white'
                  }`}
                >
                  Farmers
                </button>
                <button
                  onClick={() => handleNavigate('orders')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    currentView === 'orders' 
                      ? 'bg-white text-neutral-900 shadow-sm' 
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-white'
                  }`}
                >
                  Orders
                </button>
              </div>
              
              {/* System Status */}
              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="flex items-center space-x-1 sm:space-x-2 bg-success-50 px-2 sm:px-3 py-1 rounded-full border border-success-200">
                  <div className="bg-success-500 rounded-full animate-pulse" style={{width: '6px', height: '6px'}}></div>
                  <span className="text-xs font-semibold text-success-700 hidden sm:inline">Online</span>
                </div>
                <div className="text-right hidden sm:block">
                  <div className="text-xs text-neutral-500 font-medium">Session Active</div>
                  <div className="text-xs font-semibold text-neutral-700">{currentTime}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="lg:hidden border-t border-neutral-200 py-2 overflow-x-auto">
            <div className="flex space-x-1 min-w-max">
              <button
                onClick={handleBackToDashboard}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                  currentView === 'dashboard' 
                    ? 'bg-primary-100 text-primary-900' 
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => handleNavigate('new-order')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                  currentView === 'new-order' 
                    ? 'bg-primary-100 text-primary-900' 
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
              >
                New Order
              </button>
              <button
                onClick={() => handleNavigate('farmers')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                  currentView === 'farmers' 
                    ? 'bg-primary-100 text-primary-900' 
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
              >
                Farmers
              </button>
              <button
                onClick={() => handleNavigate('orders')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                  currentView === 'orders' 
                    ? 'bg-primary-100 text-primary-900' 
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
              >
                Orders
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Responsive Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Global Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
            <div className="flex items-start">
              <svg className="w-4 h-4 text-red-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <button 
                  onClick={() => setError(null)}
                  className="mt-1 text-sm text-red-600 hover:text-red-800 underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Global Loading Display */}
        {loading && (
          <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded">
            <div className="flex items-center">
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-3"></div>
              <span className="text-sm text-gray-600">Processing request...</span>
            </div>
          </div>
        )}

        {/* Render different views based on currentView */}
        {currentView === 'dashboard' && (
          <Dashboard 
            onNavigate={handleNavigate}
            stats={getDashboardStats()}
          />
        )}

        {currentView === 'farmers' && (
          <FarmersTable 
            farmers={allFarmers}
            onBack={handleBackToDashboard}
            onSelectFarmer={handleSelectFarmer}
          />
        )}

        {currentView === 'orders' && (
          <OrdersList 
            orders={allOrders}
            onBack={handleBackToDashboard}
            onSelectOrder={handleSelectOrder}
          />
        )}

        {currentView === 'farmer-detail' && selectedFarmer && (
          <FarmerDetail 
            farmer={selectedFarmer}
            orders={allOrders.filter(order => order.farmer_id === selectedFarmer.id)}
            onBack={handleBackFromFarmerDetail}
            onNewOrder={(_farmer) => {
              // Navigate to new order with pre-filled farmer data
              setCurrentView('new-order');
              // Could pre-populate Aadhaar in form here
            }}
          />
        )}

        {currentView === 'order-detail' && selectedOrder && (
          <OrderDetail 
            order={selectedOrder}
            farmer={selectedFarmer}
            relatedOrders={allOrders.filter(order => order.farmer_id === selectedOrder.farmer_id)}
            onBack={handleBackFromOrderDetail}
            onReprintReceipt={handleReprintReceipt}
            onViewFarmer={selectedFarmer ? () => {
              setCurrentView('farmer-detail');
            } : undefined}
          />
        )}

        {currentView === 'new-order' && (
          <div className="space-y-6">
            {/* Progress Indicator - Mobile Responsive */}
            <div className="flex justify-center">
              <div className="w-full max-w-4xl">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white rounded-lg p-3 sm:p-4 border border-neutral-200 shadow-sm space-y-2 sm:space-y-0">
                  {[
                    { key: 'aadhaar-entry', label: 'Farmer Information', icon: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z' },
                    { key: 'order-confirmation', label: 'Order Confirmation', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
                    { key: 'receipt', label: 'Payment Receipt', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' }
                  ].map((step, index) => {
                    const currentIndex = ['aadhaar-entry', 'order-confirmation', 'receipt'].indexOf(appState.step);
                    const isActive = currentIndex === index;
                    const isCompleted = currentIndex > index;
                    
                    return (
                      <div key={step.key} className="flex items-center flex-1">
                        <div className={`
                          w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-2 transition-all duration-200 mr-2 sm:mr-3 flex-shrink-0
                          ${isCompleted ? 'bg-primary-600 border-primary-600 text-white' :
                            isActive ? 'bg-primary-600 border-primary-600 text-white' :
                            'bg-white border-neutral-300 text-neutral-400'}
                        `}>
                          {isCompleted ? (
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={step.icon} />
                            </svg>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <span className={`
                            text-xs sm:text-sm font-semibold block truncate
                            ${isActive ? 'text-primary-600' : 
                              isCompleted ? 'text-primary-600' : 
                              'text-neutral-500'}
                          `}>
                            <span className="hidden sm:inline">{step.label}</span>
                            <span className="sm:hidden">{step.label.split(' ')[0]}</span>
                          </span>
                          {isActive && (
                            <div className="text-xs text-primary-500 mt-0.5 hidden sm:block">Current Step</div>
                          )}
                          {isCompleted && (
                            <div className="text-xs text-success-600 mt-0.5 hidden sm:block">Completed ✓</div>
                          )}
                        </div>
                        
                        {index < 2 && (
                          <div className={`w-6 sm:w-12 h-0.5 mx-2 sm:mx-4 rounded-full hidden sm:block ${
                            currentIndex > index ? 'bg-primary-600' : 'bg-neutral-300'
                          }`}></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Order Flow Content - Mobile Responsive */}
            <div className={`flex flex-col lg:flex-row justify-center items-start ${
              appState.step === 'receipt' ? 'gap-4 lg:gap-8' : 'gap-4'
            }`}>
              {/* Main Form */}
              <div className={`transition-all duration-300 w-full ${
                appState.step === 'receipt' 
                  ? 'lg:w-auto lg:flex-shrink-0' 
                  : appState.step === 'order-confirmation' ? 'lg:w-auto lg:max-w-lg max-w-full' : 'max-w-4xl'
              }`}>
                {/* Step Content */}
                {appState.step === 'aadhaar-entry' && (
                  <AadhaarFormV2 
                    onSubmit={handleAadhaarSubmit}
                    loading={loading}
                  />
                )}

                {appState.step === 'order-confirmation' && appState.farmer && (
                  <OrderConfirmationV2 
                    farmer={appState.farmer}
                    onConfirm={handleCreateOrder}
                    onBack={handleReset}
                    loading={loading}
                    dailyBagCount={appState.dailyBagCount}
                    todaysOrders={appState.todaysOrders}
                  />
                )}

                {appState.step === 'receipt' && appState.currentOrder && (
                  <ReceiptV2 
                    order={appState.currentOrder}
                    onNewOrder={handleReset}
                  />
                )}
              </div>
            
              {/* Sidebar - Responsive */}
              {((appState.step === 'order-confirmation' && appState.orderHistory.length > 0) ||
                (appState.step === 'receipt' && allOrders.length > 0)) && (
                <div className={`w-full lg:flex-shrink-0 ${
                  appState.step === 'receipt' 
                    ? 'lg:flex-1 lg:min-w-80 lg:max-w-xl' 
                    : 'lg:w-96'
                }`}>
                  <OrderHistoryV2 
                    orders={appState.step === 'receipt' ? allOrders : appState.orderHistory}
                    title={appState.step === 'receipt' ? 'Recent Orders (All Farmers)' : 'Farmer\'s Previous Orders'}
                    showFarmerInfo={appState.step === 'receipt'}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Reprint Modal - Mobile Responsive */}
      {showReprintModal && reprintOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Reprint Receipt</h3>
              </div>
              <button
                onClick={handleClosePrintModal}
                className="p-1 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-3 sm:p-6 overflow-y-auto" style={{maxHeight: 'calc(95vh - 180px)'}}>
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
                <p className="text-xs sm:text-sm text-gray-600 mb-2">
                  PACS2 thermal receipt will be printed for Order #{reprintOrder.id}:
                </p>
                <div className="bg-white rounded border-2 border-dashed border-gray-300 p-2 overflow-x-auto">
                  <div className="reprint-thermal-receipt min-w-max">
                    {reprintOrder ? (
                      <ThermalReceiptPreview order={reprintOrder} style={selectedReprintStyle} />
                    ) : (
                      <div>Loading receipt...</div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="text-xs text-gray-500 space-y-1">
                <p>• Receipt will be printed using PACS2 format</p>
                <p>• Printed to Posiflex PP8800 thermal printer</p>
                <p>• Uses 3-inch thermal paper (80mm)</p>
                <p>• Paper will be automatically cut after printing</p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-3 sm:p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={handleClosePrintModal}
                  className="order-2 sm:order-1 flex-1 py-2.5 px-4 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePrintReceipt}
                  className="order-1 sm:order-2 flex-1 py-2.5 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print Thermal Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
}

export default AppV2;