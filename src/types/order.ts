export type OrderStatus = 'new' | 'confirmed' | 'dispatched' | 'delivered';

export interface OrderCustomer {
  name: string;
  phone: string;
  city: string;
  state?: string;
  address: string;
  pincode: string;
  businessName?: string;
  gstin?: string;
  transportName?: string;
  notes?: string;
}

export interface OrderItem {
  modelName: string;
  category: string;
  styleName: string;
  styleTagline?: string;
  colorName: string;
  quantity: number;
}

export interface DispatchOrder {
  id: string; // e.g. TQM-1009-0001
  createdAt: string; // ISO string
  customer: OrderCustomer;
  customerEmail?: string;
  customerUid?: string;
  items: OrderItem[];
  totalItems: number;
  totalUnits: number;
  status: OrderStatus;
  trackingNumber?: string;
  transportName?: string;
  dispatchDate?: string;
}
