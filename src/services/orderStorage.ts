import type { DispatchOrder, OrderStatus } from '../types/order';

const STORAGE_KEY = 'torqmax_orders_v1';

export const generateOrderId = (): string => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `TQM-${day}${month}-${randomSuffix}`;
};

export const getLocalOrders = (): DispatchOrder[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultSampleOrders();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : getDefaultSampleOrders();
  } catch (err) {
    console.error('Failed to read local orders:', err);
    return getDefaultSampleOrders();
  }
};

export const saveLocalOrder = (order: DispatchOrder): void => {
  try {
    const existing = getLocalOrders();
    // Prepend so newest is first
    const updated = [order, ...existing.filter(o => o.id !== order.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save local order:', err);
  }
};

export const updateLocalOrderStatus = (orderId: string, status: OrderStatus): DispatchOrder[] => {
  try {
    const existing = getLocalOrders();
    const updated = existing.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          status,
          dispatchDate: status === 'dispatched' ? new Date().toISOString() : order.dispatchDate,
        };
      }
      return order;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to update local order status:', err);
    return getLocalOrders();
  }
};

const getDefaultSampleOrders = (): DispatchOrder[] => {
  const samples: DispatchOrder[] = [
    {
      id: 'TQM-1009-8421',
      createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      customer: {
        name: 'Apex Car Accessories (Rajesh Patel)',
        phone: '+91 98250 12345',
        city: 'Ahmedabad',
        state: 'Gujarat',
        address: 'Shop 14, Auto Market, Near Subhash Bridge, RTO Circle',
        pincode: '380027',
        businessName: 'Apex Car Decor & Accessories',
        gstin: '24AABCA1234F1Z8',
        transportName: 'Shree Anjani Courier / V-Trans',
        notes: 'Dispatch urgently before 5 PM via transport',
      },
      items: [
        {
          modelName: 'MARUTI SUZUKI SWIFT / DZIRE 2018 (ONWARDS)',
          category: 'Small',
          styleName: 'Checkmate Series',
          colorName: 'CM Black',
          quantity: 10,
        },
        {
          modelName: 'HYUNDAI CRETA 2020 (ONWARDS)',
          category: 'Medium',
          styleName: 'Exotic Series',
          colorName: 'Tan / Brown',
          quantity: 5,
        },
      ],
      totalItems: 2,
      totalUnits: 15,
      status: 'confirmed',
      transportName: 'V-Trans Express',
    },
    {
      id: 'TQM-0909-5192',
      createdAt: new Date(Date.now() - 3600000 * 26).toISOString(),
      customer: {
        name: 'Royal Auto Spares (Sunil Verma)',
        phone: '+91 94280 87654',
        city: 'Surat',
        state: 'Gujarat',
        address: '201, Shreenathji Complex, Ring Road, Varachha',
        pincode: '395006',
        businessName: 'Royal Auto Spares & Mats',
        transportName: 'Navchetan Transport',
      },
      items: [
        {
          modelName: 'MAHINDRA SCORPIO-N 2022 (ONWARDS)',
          category: 'Large',
          styleName: 'Diamond Matrix',
          colorName: 'Carbon Black',
          quantity: 8,
        },
        {
          modelName: 'TOYOTA FORTUNER 2016 (ONWARDS)',
          category: 'Large',
          styleName: 'Checkmate Series',
          colorName: 'Black with Red Stitch',
          quantity: 6,
        },
      ],
      totalItems: 2,
      totalUnits: 14,
      status: 'dispatched',
      trackingNumber: 'NV-SRT-99824',
      transportName: 'Navchetan Cargo',
      dispatchDate: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
  ];
  return samples;
};
