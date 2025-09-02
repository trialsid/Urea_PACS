import { useState, useEffect } from 'react';
import { OrderWithFarmer } from '../types';

interface ThermalReceiptPreviewProps {
  order: OrderWithFarmer;
}

// Component that fetches and displays the actual thermal printer preview from the backend
function ThermalReceiptPreview({ order }: ThermalReceiptPreviewProps) {
  const [preview, setPreview] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPreview = async () => {
      if (!order?.id) {
        setError('No order ID available');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/preview/thermal-receipt/${order.id}`);
        const data = await response.json();

        if (data.success) {
          setPreview(data.preview);
        } else {
          setError(data.message || 'Failed to load preview');
        }
      } catch (err) {
        setError(`Failed to fetch preview: ${(err as Error).message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [order?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2 text-gray-600">
          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading thermal receipt preview...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-2 text-red-700">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium">Preview Error</span>
        </div>
        <p className="text-red-600 text-sm mt-1">{error}</p>
      </div>
    );
  }

  const thermalStyle: React.CSSProperties = {
    fontFamily: '"Courier New", "Liberation Mono", "DejaVu Sans Mono", monospace',
    fontSize: '11px',
    lineHeight: '1.3',
    backgroundColor: '#fff',
    color: '#000',
    padding: '12px',
    border: '2px solid #333',
    borderRadius: '4px',
    maxWidth: '320px',
    margin: '0 auto',
    whiteSpace: 'pre-line' as const,
    textAlign: 'left' as const,
    overflow: 'hidden',
    letterSpacing: '0.5px'
  };

  return (
    <div style={thermalStyle}>
      {preview || 'No preview available'}
    </div>
  );
}

export default ThermalReceiptPreview;