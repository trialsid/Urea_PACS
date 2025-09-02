import { useState } from 'react';
import { OrderWithFarmer } from '../types';
import ThermalReceipt from './ThermalReceipt';

interface ReceiptV2Props {
  order: OrderWithFarmer;
  onNewOrder: () => void;
}

function ReceiptV2({ order, onNewOrder }: ReceiptV2Props) {
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = () => {
    setShowPrintModal(true);
  };

  const handleThermalPrint = async () => {
    try {
      setIsPrinting(true);
      
      // Call thermal print API instead of browser print
      const response = await fetch('/api/print/thermal-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Show success message
        alert(`✅ Receipt printed to thermal printer!\nJob ID: ${result.jobId}\nOrder #${result.order.id}`);
      } else {
        throw new Error(result.message || 'Print failed');
      }
    } catch (error) {
      alert(`❌ Thermal print failed: ${(error as Error).message}`);
    } finally {
      setIsPrinting(false);
      handleClosePrintModal();
    }
  };

  const handleClosePrintModal = () => {
    setShowPrintModal(false);
  };

  return (
    <>
      {/* Main receipt display */}
      <div className="card card-elevated max-w-3xl mx-auto">
        {/* Success Header */}
        <div className="text-center p-6 pb-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Order Confirmed</h2>
          <p className="text-sm text-gray-600">Payment successful • Receipt generated</p>
        </div>

        {/* Order Summary Card */}
        <div className="mx-6 mb-6 bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500">Order ID</span>
              <p className="font-mono font-medium">#{order.id}</p>
            </div>
            <div>
              <span className="text-gray-500">Date</span>
              <p className="font-medium">{new Date(order.created_at!).toLocaleDateString('en-IN', {
                day: '2-digit', month: '2-digit', year: 'numeric'
              })}</p>
            </div>
            <div>
              <span className="text-gray-500">Farmer</span>
              <p className="font-medium">{order.farmer_name}</p>
            </div>
            <div>
              <span className="text-gray-500">Aadhaar</span>
              <p className="font-mono text-xs">{order.farmer_aadhaar.replace(/(\d{4})/g, '$1 ').trim()}</p>
            </div>
          </div>
        </div>

        {/* Purchase Details */}
        <div className="px-6 pb-4">
          <div className="border rounded-lg p-4 bg-white">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Urea Fertilizer</p>
                  <p className="text-xs text-gray-500">50kg bags • Subsidized rate</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Qty: {order.quantity}</p>
                <p className="font-medium">₹{order.total_amount.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="border-t pt-3 flex justify-between items-center">
              <span className="font-medium text-gray-900">Total Paid</span>
              <span className="text-lg font-semibold text-blue-600">₹{order.total_amount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 pt-4 border-t bg-gray-50 rounded-b-xl">
          <div className="flex gap-3">
            <button
              onClick={onNewOrder}
              className="flex-1 py-2.5 px-4 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-sm font-medium"
            >
              New Order
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 py-2.5 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print
            </button>
          </div>
          
          <div className="text-center mt-3">
            <p className="text-xs text-gray-500">
              Receipt valid for 30 days • Keep for records
            </p>
          </div>
        </div>
      </div>

      {/* Print Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Print Receipt</h3>
              </div>
              <button
                onClick={handleClosePrintModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-96">
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  PACS2 thermal receipt will be printed to Posiflex PP8800:
                </p>
                <div className="bg-white rounded border-2 border-dashed border-gray-300 p-2">
                  <div className="print-thermal-receipt">
                    <ThermalReceipt order={order} />
                  </div>
                </div>
              </div>
              
              <div className="text-xs text-gray-500 space-y-1">
                <p>• Receipt will be printed using PACS2 format</p>
                <p>• Printed on 3-inch thermal paper (80mm)</p>
                <p>• Make sure Posiflex PP8800 is connected</p>
                <p>• Paper will be automatically cut after printing</p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <div className="flex gap-3">
                <button
                  onClick={handleClosePrintModal}
                  className="flex-1 py-2.5 px-4 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-sm font-medium"
                  disabled={isPrinting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleThermalPrint}
                  disabled={isPrinting}
                  className="flex-1 py-2.5 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isPrinting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Printing...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                      Print Thermal Receipt
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ReceiptV2;