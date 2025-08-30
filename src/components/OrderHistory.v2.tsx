import React, { useState, useMemo } from 'react';
import { OrderWithFarmer } from '../types';
import { formatIndianDateShort, formatIndianTime } from '../utils/dateTime';
import Pagination from './Pagination';

interface OrderHistoryV2Props {
  orders: OrderWithFarmer[];
  title?: string;
  showFarmerInfo?: boolean;
}

function OrderHistoryV2({ orders, title = "Order History", showFarmerInfo = false }: OrderHistoryV2Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; // 10 orders per page for sidebar

  // Paginated orders
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return orders.slice(startIndex, startIndex + pageSize);
  }, [orders, currentPage, pageSize]);

  if (orders.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg border border-neutral-200 h-full">
        <h3 className="text-lg font-bold text-neutral-800 mb-4">{title}</h3>
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-sm text-neutral-500">No orders to display.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-neutral-200 h-full">
      <h3 className="text-lg font-bold text-neutral-800 mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-neutral-500 table-auto">
          <thead className="text-xs text-neutral-700 uppercase bg-neutral-50">
            <tr>
              <th scope="col" className="px-2 py-3 w-16">Order ID</th>
              {showFarmerInfo && <th scope="col" className="px-2 py-3 w-32">Farmer</th>}
              <th scope="col" className="px-2 py-3 w-20">Date</th>
              <th scope="col" className="px-2 py-3 w-12">Time</th>
              {showFarmerInfo && <th scope="col" className="px-2 py-3 w-6 text-center">Qty</th>}
              <th scope="col" className="px-2 py-3 text-right w-16">Amount</th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrders.map((order) => {
              return (
              <tr key={order.id} className="border-b hover:bg-neutral-50 bg-white">
                <th scope="row" className="px-2 py-3 font-medium text-neutral-900 whitespace-nowrap">
                  #{order.id}
                </th>
                {showFarmerInfo && (
                  <td className="px-2 py-3 truncate">
                    {order.farmer_name}
                  </td>
                )}
                <td className="px-2 py-3 text-xs">
                  {formatIndianDateShort(order.created_at!)}
                </td>
                <td className="px-2 py-3 text-xs">
                  {formatIndianTime(order.created_at!)}
                </td>
                {showFarmerInfo && (
                  <td className="px-2 py-3 text-center">
                    {order.quantity}
                  </td>
                )}
                <td className="px-2 py-3 text-right font-semibold text-neutral-800">
                  ₹{order.total_amount.toFixed(0)}
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Pagination - only show if more than pageSize items */}
      {orders.length > pageSize && (
        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalItems={orders.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            showInfo={false} // Compact for sidebar
          />
        </div>
      )}
    </div>
  );
}

export default OrderHistoryV2;
