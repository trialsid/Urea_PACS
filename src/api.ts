import { Farmer, OrderWithFarmer } from './types';

// Use relative URLs so it works in both development and production/hotspot
const API_BASE = '/api';

export const api = {
  // Get farmer by Aadhaar number
  getFarmer: async (aadhaar: string): Promise<{ farmer: Farmer | null }> => {
    const response = await fetch(`${API_BASE}/farmer/${aadhaar}`);
    if (!response.ok) {
      throw new Error('Failed to fetch farmer');
    }
    return response.json();
  },

  // Create new farmer
  createFarmer: async (farmer: { aadhaar: string; name: string; village: string; contact?: string }): Promise<{ farmer: Farmer }> => {
    const response = await fetch(`${API_BASE}/farmer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(farmer),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create farmer');
    }
    return response.json();
  },

  // Get order history for farmer
  getOrderHistory: async (aadhaar: string): Promise<{ orders: OrderWithFarmer[] }> => {
    const response = await fetch(`${API_BASE}/orders/${aadhaar}`);
    if (!response.ok) {
      throw new Error('Failed to fetch order history');
    }
    return response.json();
  },

  // Get all orders (for receipt stage)
  getAllOrders: async (): Promise<{ orders: OrderWithFarmer[] }> => {
    const response = await fetch(`${API_BASE}/orders`);
    if (!response.ok) {
      throw new Error('Failed to fetch all orders');
    }
    return response.json();
  },

  // Create new order
  createOrder: async (order: { farmer_id: number; quantity?: number; unit_price?: number }): Promise<{ order: OrderWithFarmer }> => {
    const response = await fetch(`${API_BASE}/order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(order),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create order');
    }
    return response.json();
  },

  // Get all farmers
  getAllFarmers: async (): Promise<{ farmers: any[] }> => {
    const response = await fetch(`${API_BASE}/farmers`);
    if (!response.ok) {
      throw new Error('Failed to fetch farmers');
    }
    return response.json();
  },

  // Health check
  healthCheck: async (): Promise<{ status: string; timestamp: string }> => {
    const response = await fetch(`${API_BASE}/health`);
    if (!response.ok) {
      throw new Error('Backend not available');
    }
    return response.json();
  },

  // Get counts for change detection
  getCounts: async (): Promise<{ farmers: number; orders: number; lastOrderId?: number }> => {
    const response = await fetch(`${API_BASE}/counts`);
    if (!response.ok) {
      throw new Error('Failed to fetch counts');
    }
    return response.json();
  },

  // Get only new orders since a specific ID
  getOrdersSince: async (lastOrderId: number): Promise<{ orders: OrderWithFarmer[] }> => {
    const response = await fetch(`${API_BASE}/orders/since/${lastOrderId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch new orders');
    }
    return response.json();
  },

  // Get only new farmers since a specific count
  getFarmersSince: async (lastCount: number): Promise<{ farmers: any[] }> => {
    const response = await fetch(`${API_BASE}/farmers/since/${lastCount}`);
    if (!response.ok) {
      throw new Error('Failed to fetch new farmers');
    }
    return response.json();
  }
};