import { useEffect, useRef, useCallback } from 'react';
import { api } from '../api';

interface UseRealTimeUpdatesProps {
  onNewFarmer: (farmer: any) => void;
  onNewOrder: (order: any) => void;
  enabled: boolean;
  intervalMs?: number;
}

export const useRealTimeUpdates = ({
  onNewFarmer,
  onNewOrder,
  enabled,
  intervalMs = 3000 // Check every 3 seconds for local Pi
}: UseRealTimeUpdatesProps) => {
  const lastCountsRef = useRef<{ farmers: number; orders: number; lastOrderId?: number } | null>(null);
  const intervalRef = useRef<number | null>(null);

  const checkForUpdates = useCallback(async () => {
    try {
      const counts = await api.getCounts();
      
      if (lastCountsRef.current) {
        const prev = lastCountsRef.current;
        
        // Check for new farmers
        if (counts.farmers > prev.farmers) {
          const { farmers: newFarmers } = await api.getFarmersSince(prev.farmers);
          newFarmers.forEach(onNewFarmer);
        }
        
        // Check for new orders
        if (counts.lastOrderId && prev.lastOrderId && counts.lastOrderId > prev.lastOrderId) {
          const { orders: newOrders } = await api.getOrdersSince(prev.lastOrderId);
          newOrders.forEach(onNewOrder);
        }
      }
      
      lastCountsRef.current = counts;
    } catch (error) {
      console.error('Real-time updates failed:', error);
    }
  }, [onNewFarmer, onNewOrder]);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Initial load
    checkForUpdates();

    // Set up polling
    intervalRef.current = setInterval(checkForUpdates, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, intervalMs, checkForUpdates]);

  return {
    forceCheck: checkForUpdates
  };
};