export interface Farmer {
  id?: number;
  aadhaar: string;
  name: string;
  village: string;
  contact?: string;
  created_at?: string;
}

export interface Order {
  id?: number;
  farmer_id: number;
  quantity: number;
  unit_price: number;
  total_amount: number;
  created_at?: string;
}

export interface OrderWithFarmer extends Order {
  farmer_name: string;
  farmer_aadhaar: string;
  farmer_village?: string;
  farmer_contact?: string;
}

export interface AppState {
  step: 'aadhaar-entry' | 'farmer-details' | 'order-confirmation' | 'receipt';
  aadhaar: string;
  aadhaarConfirm: string;
  farmer: Farmer | null;
  currentOrder: OrderWithFarmer | null;
  orderHistory: OrderWithFarmer[];
  dailyBagCount: number;
  todaysOrders: OrderWithFarmer[];
}