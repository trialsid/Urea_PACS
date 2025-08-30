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

// Memoized farmer row component
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
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
            <h2 className="text-2xl font-bold text-neutral-900">Farmers Directory</h2>
            <p className="text-neutral-600">Manage registered farmers and their information</p>
          </div>
        </div>
        <div className="bg-primary-50 px-4 py-2 rounded-lg border border-primary-200">
          <span className="text-primary-600 font-medium">{filteredAndSortedFarmers.length} farmers</span>
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
                placeholder="Search by name, village, Aadhaar, or contact..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Farmers Table */}
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

      {/* Summary */}
      {filteredAndSortedFarmers.length > 0 && (
        <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-neutral-600">Total Farmers:</span>
              <span className="ml-2 font-semibold text-neutral-900">{filteredAndSortedFarmers.length}</span>
            </div>
            <div>
              <span className="text-neutral-600">Total Orders:</span>
              <span className="ml-2 font-semibold text-neutral-900">
                {filteredAndSortedFarmers.reduce((sum, farmer) => sum + farmer.total_orders, 0)}
              </span>
            </div>
            <div>
              <span className="text-neutral-600">Total Revenue:</span>
              <span className="ml-2 font-semibold text-neutral-900">
                ₹{filteredAndSortedFarmers.reduce((sum, farmer) => sum + farmer.total_spent, 0).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-neutral-600">Active Farmers:</span>
              <span className="ml-2 font-semibold text-neutral-900">
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