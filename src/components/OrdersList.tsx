import React, { useState, useMemo } from 'react';

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

interface OrdersListProps {
  orders: Order[];
  onBack: () => void;
  onSelectOrder?: (order: Order) => void;
}

const OrdersList: React.FC<OrdersListProps> = ({ orders, onBack, onSelectOrder }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [sortBy, setSortBy] = useState<'created_at' | 'farmer_name' | 'total_amount' | 'farmer_village'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredAndSortedOrders = useMemo(() => {
    let filtered = orders.filter(order => {
      const matchesSearch = searchTerm === '' || 
        order.farmer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.farmer_village.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.farmer_aadhaar.includes(searchTerm);

      const matchesDate = selectedDate === '' || 
        new Date(order.created_at).toISOString().split('T')[0] === selectedDate;

      return matchesSearch && matchesDate;
    });

    return filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'farmer_name':
          comparison = a.farmer_name.localeCompare(b.farmer_name);
          break;
        case 'farmer_village':
          comparison = a.farmer_village.localeCompare(b.farmer_village);
          break;
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'total_amount':
          comparison = a.total_amount - b.total_amount;
          break;
        default:
          return 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [orders, searchTerm, selectedDate, sortBy, sortOrder]);

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    };
  };

  const todayTotal = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return orders
      .filter(order => new Date(order.created_at).toISOString().split('T')[0] === today)
      .reduce((sum, order) => sum + order.total_amount, 0);
  }, [orders]);

  const todayCount = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return orders.filter(order => new Date(order.created_at).toISOString().split('T')[0] === today).length;
  }, [orders]);

  const SortIcon = ({ column }: { column: typeof sortBy }) => {
    if (sortBy !== column) {
      return (
        <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }

    return sortOrder === 'asc' ? (
      <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
      </svg>
    );
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
            <h2 className="text-2xl font-bold text-neutral-900">Order History</h2>
            <p className="text-neutral-600">View and manage all distribution orders</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-200 text-center">
            <div className="text-blue-600 font-medium text-sm">Today's Orders</div>
            <div className="text-blue-900 font-bold text-lg">{todayCount}</div>
          </div>
          <div className="bg-success-50 px-4 py-2 rounded-lg border border-success-200 text-center">
            <div className="text-success-600 font-medium text-sm">Today's Revenue</div>
            <div className="text-success-900 font-bold text-lg">₹{todayTotal.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg border border-neutral-200 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by farmer name, village, or Aadhaar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          {selectedDate && (
            <button
              onClick={() => setSelectedDate('')}
              className="px-3 py-2 text-neutral-600 hover:text-neutral-900 border border-neutral-300 rounded-lg hover:border-neutral-400 transition-colors"
            >
              Clear Date
            </button>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th 
                  onClick={() => handleSort('farmer_name')}
                  className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider cursor-pointer hover:bg-neutral-100 transition-colors"
                >
                  <div className="flex items-center space-x-1">
                    <span>Farmer Details</span>
                    <SortIcon column="farmer_name" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('farmer_village')}
                  className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider cursor-pointer hover:bg-neutral-100 transition-colors"
                >
                  <div className="flex items-center space-x-1">
                    <span>Village</span>
                    <SortIcon column="farmer_village" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th 
                  onClick={() => handleSort('total_amount')}
                  className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider cursor-pointer hover:bg-neutral-100 transition-colors"
                >
                  <div className="flex items-center space-x-1">
                    <span>Amount</span>
                    <SortIcon column="total_amount" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('created_at')}
                  className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider cursor-pointer hover:bg-neutral-100 transition-colors"
                >
                  <div className="flex items-center space-x-1">
                    <span>Date & Time</span>
                    <SortIcon column="created_at" />
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {filteredAndSortedOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-neutral-500">
                    <div className="flex flex-col items-center">
                      <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p>No orders found</p>
                      {(searchTerm || selectedDate) && <p className="text-sm">Try adjusting your search criteria</p>}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAndSortedOrders.map((order) => {
                  const { date, time } = formatDateTime(order.created_at);
                  
                  return (
                    <tr key={order.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono font-medium text-neutral-900">#{order.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-neutral-900">{order.farmer_name}</div>
                          <div className="text-xs text-neutral-500">Aadhaar: ****-****-{order.farmer_aadhaar.slice(-4)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-900">{order.farmer_village}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-neutral-900">{order.quantity} bags</span>
                          <span className="ml-2 text-xs text-neutral-500">@ ₹{order.unit_price}/bag</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-neutral-900">
                        ₹{order.total_amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm text-neutral-900">{date}</div>
                          <div className="text-xs text-neutral-500">{time}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                            Paid
                          </span>
                          {onSelectOrder && (
                            <button
                              onClick={() => onSelectOrder(order)}
                              className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                            >
                              View Details
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      {filteredAndSortedOrders.length > 0 && (
        <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-neutral-600">Filtered Orders:</span>
              <span className="ml-2 font-semibold text-neutral-900">{filteredAndSortedOrders.length}</span>
            </div>
            <div>
              <span className="text-neutral-600">Total Quantity:</span>
              <span className="ml-2 font-semibold text-neutral-900">
                {filteredAndSortedOrders.reduce((sum, order) => sum + order.quantity, 0)} bags
              </span>
            </div>
            <div>
              <span className="text-neutral-600">Total Amount:</span>
              <span className="ml-2 font-semibold text-neutral-900">
                ₹{filteredAndSortedOrders.reduce((sum, order) => sum + order.total_amount, 0).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-neutral-600">Average per Order:</span>
              <span className="ml-2 font-semibold text-neutral-900">
                ₹{Math.round(filteredAndSortedOrders.reduce((sum, order) => sum + order.total_amount, 0) / filteredAndSortedOrders.length).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersList;