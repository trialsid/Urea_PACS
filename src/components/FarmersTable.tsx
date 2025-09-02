import React, { useState, useMemo, memo } from 'react';
import Pagination from './Pagination';

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

interface FarmersTableProps {
  farmers: Farmer[];
  onBack: () => void;
  onSelectFarmer?: (farmer: Farmer) => void;
}

// Memoized farmer row component for desktop table
const FarmerRow = memo(({ farmer, onSelectFarmer }: { farmer: Farmer, onSelectFarmer?: (farmer: Farmer) => void }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <tr key={farmer.id} className="hover:bg-neutral-50 transition-colors">
      <td className="px-6 py-4">
        <div>
          <div className="text-sm font-medium text-neutral-900">{farmer.name}</div>
          <div className="text-xs text-neutral-500">Aadhaar: ****-****-{farmer.aadhaar.slice(-4)}</div>
          {farmer.contact && (
            <div className="text-xs text-neutral-500">Contact: {farmer.contact}</div>
          )}
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-neutral-900">{farmer.village}</td>
      <td className="px-6 py-4">
        <div className="flex items-center">
          <span className="text-sm font-medium text-neutral-900">{farmer.total_orders}</span>
          {farmer.total_orders > 0 && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-success-100 text-success-800">
              Active
            </span>
          )}
        </div>
      </td>
      <td className="px-6 py-4 text-sm font-medium text-neutral-900">
        ₹{farmer.total_spent.toLocaleString()}
      </td>
      <td className="px-6 py-4">
        <div>
          <div className="text-sm text-neutral-900">{formatDate(farmer.created_at)}</div>
          {farmer.last_order_date && (
            <div className="text-xs text-neutral-500">
              Last order: {formatDate(farmer.last_order_date)}
            </div>
          )}
        </div>
      </td>
      <td className="px-6 py-4 text-right">
        {onSelectFarmer && (
          <button
            onClick={() => onSelectFarmer(farmer)}
            className="text-primary-600 hover:text-primary-900 text-sm font-medium"
          >
            View Details
          </button>
        )}
      </td>
    </tr>
  );
});

// Mobile card component for farmers
const FarmerCard = memo(({ farmer, onSelectFarmer }: { farmer: Farmer, onSelectFarmer?: (farmer: Farmer) => void }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-neutral-900 truncate">{farmer.name}</h3>
          <p className="text-sm text-neutral-600">{farmer.village}</p>
          <p className="text-xs text-neutral-500">Aadhaar: ****-****-{farmer.aadhaar.slice(-4)}</p>
          {farmer.contact && (
            <p className="text-xs text-neutral-500">Contact: {farmer.contact}</p>
          )}
        </div>
        {farmer.total_orders > 0 && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success-100 text-success-800 flex-shrink-0">
            Active
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
        <div>
          <span className="text-neutral-500">Orders:</span>
          <span className="ml-1 font-medium text-neutral-900">{farmer.total_orders}</span>
        </div>
        <div>
          <span className="text-neutral-500">Spent:</span>
          <span className="ml-1 font-medium text-neutral-900">₹{farmer.total_spent.toLocaleString()}</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-xs text-neutral-500 mb-3">
        <span>Registered: {formatDate(farmer.created_at)}</span>
        {farmer.last_order_date && (
          <span>Last order: {formatDate(farmer.last_order_date)}</span>
        )}
      </div>
      
      {onSelectFarmer && (
        <button
          onClick={() => onSelectFarmer(farmer)}
          className="w-full bg-primary-50 hover:bg-primary-100 text-primary-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors"
        >
          View Details
        </button>
      )}
    </div>
  );
});

const FarmersTable: React.FC<FarmersTableProps> = ({ farmers, onBack, onSelectFarmer }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'village' | 'created_at' | 'total_orders' | 'total_spent'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20; // 20 farmers per page

  const filteredAndSortedFarmers = useMemo(() => {
    const filtered = farmers.filter(farmer => 
      farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      farmer.village.toLowerCase().includes(searchTerm.toLowerCase()) ||
      farmer.aadhaar.includes(searchTerm) ||
      (farmer.contact && farmer.contact.includes(searchTerm))
    );

    return filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'village':
          comparison = a.village.localeCompare(b.village);
          break;
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'total_orders':
          comparison = a.total_orders - b.total_orders;
          break;
        case 'total_spent':
          comparison = a.total_spent - b.total_spent;
          break;
        default:
          return 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [farmers, searchTerm, sortBy, sortOrder]);

  // Paginated data
  const paginatedFarmers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAndSortedFarmers.slice(startIndex, startIndex + pageSize);
  }, [filteredAndSortedFarmers, currentPage, pageSize]);

  // Reset to first page when search changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

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
      {/* Header - Mobile Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button
            onClick={onBack}
            className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900">Farmers Directory</h2>
            <p className="text-sm sm:text-base text-neutral-600 hidden sm:block">Manage registered farmers and their information</p>
          </div>
        </div>
        <div className="bg-primary-50 px-3 sm:px-4 py-2 rounded-lg border border-primary-200 self-start sm:self-auto">
          <span className="text-primary-600 font-medium text-sm sm:text-base">{filteredAndSortedFarmers.length} farmers</span>
        </div>
      </div>

      {/* Search and Filter - Mobile Responsive */}
      <div className="bg-white rounded-lg border border-neutral-200 p-3 sm:p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by name, village, Aadhaar, or contact..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th 
                    onClick={() => handleSort('name')}
                    className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider cursor-pointer hover:bg-neutral-100 transition-colors"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Farmer Details</span>
                      <SortIcon column="name" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('village')}
                    className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider cursor-pointer hover:bg-neutral-100 transition-colors"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Village</span>
                      <SortIcon column="village" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('total_orders')}
                    className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider cursor-pointer hover:bg-neutral-100 transition-colors"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Orders</span>
                      <SortIcon column="total_orders" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('total_spent')}
                    className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider cursor-pointer hover:bg-neutral-100 transition-colors"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Total Spent</span>
                      <SortIcon column="total_spent" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('created_at')}
                    className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider cursor-pointer hover:bg-neutral-100 transition-colors"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Registered</span>
                      <SortIcon column="created_at" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {paginatedFarmers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-neutral-500">
                      <div className="flex flex-col items-center">
                        <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p>No farmers found</p>
                        {searchTerm && <p className="text-sm">Try adjusting your search criteria</p>}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedFarmers.map((farmer) => (
                    <FarmerRow key={farmer.id} farmer={farmer} onSelectFarmer={onSelectFarmer} />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalItems={filteredAndSortedFarmers.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Mobile/Tablet Card View */}
      <div className="lg:hidden">
        {/* Sort Options for Mobile */}
        <div className="bg-white rounded-lg border border-neutral-200 p-3 mb-4 shadow-sm">
          <label className="block text-sm font-medium text-neutral-700 mb-2">Sort by:</label>
          <select 
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [column, order] = e.target.value.split('-') as [typeof sortBy, 'asc' | 'desc'];
              setSortBy(column);
              setSortOrder(order);
            }}
            className="w-full p-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="village-asc">Village (A-Z)</option>
            <option value="village-desc">Village (Z-A)</option>
            <option value="total_orders-desc">Most Orders</option>
            <option value="total_orders-asc">Least Orders</option>
            <option value="total_spent-desc">Highest Spent</option>
            <option value="total_spent-asc">Lowest Spent</option>
            <option value="created_at-desc">Recently Registered</option>
            <option value="created_at-asc">Oldest Registered</option>
          </select>
        </div>

        {/* Mobile Cards */}
        {paginatedFarmers.length === 0 ? (
          <div className="bg-white rounded-lg border border-neutral-200 p-8 text-center text-neutral-500">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p>No farmers found</p>
            {searchTerm && <p className="text-sm mt-1">Try adjusting your search criteria</p>}
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {paginatedFarmers.map((farmer) => (
                <FarmerCard key={farmer.id} farmer={farmer} onSelectFarmer={onSelectFarmer} />
              ))}
            </div>
            
            {/* Mobile Pagination */}
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalItems={filteredAndSortedFarmers.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        )}
      </div>

      {/* Summary - Mobile Responsive */}
      {filteredAndSortedFarmers.length > 0 && (
        <div className="bg-neutral-50 rounded-lg p-3 sm:p-4 border border-neutral-200">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-sm">
            <div>
              <span className="text-neutral-600 block sm:inline">Total Farmers:</span>
              <span className="sm:ml-2 font-semibold text-neutral-900 block sm:inline">{filteredAndSortedFarmers.length}</span>
            </div>
            <div>
              <span className="text-neutral-600 block sm:inline">Total Orders:</span>
              <span className="sm:ml-2 font-semibold text-neutral-900 block sm:inline">
                {filteredAndSortedFarmers.reduce((sum, farmer) => sum + farmer.total_orders, 0)}
              </span>
            </div>
            <div>
              <span className="text-neutral-600 block sm:inline">Total Revenue:</span>
              <span className="sm:ml-2 font-semibold text-neutral-900 block sm:inline">
                ₹{filteredAndSortedFarmers.reduce((sum, farmer) => sum + farmer.total_spent, 0).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-neutral-600 block sm:inline">Active Farmers:</span>
              <span className="sm:ml-2 font-semibold text-neutral-900 block sm:inline">
                {filteredAndSortedFarmers.filter(farmer => farmer.total_orders > 0).length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmersTable;