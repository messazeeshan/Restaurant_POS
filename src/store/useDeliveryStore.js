import { create } from 'zustand';
import { ORDER_TYPE, ORDER_STATUS } from '../data/constants.js';

// Setup local storage persistence for delivery orders
const STORAGE_KEY = 'pos_delivery_orders_v1';

const getInitialOrders = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error('Failed to load delivery orders from local storage', e);
  }

  // Seed Data
  return [
    {
      id: 'DEL-001',
      type: ORDER_TYPE.DELIVERY,
      source: 'Uber Eats',
      status: ORDER_STATUS.IN_KITCHEN,
      customerName: 'Alex Johnson',
      items: [
        { id: 'item-1', quantity: 2, name: 'Truffle Burger', price: 18, modifiers: [], specialRequest: '' }
      ],
      etaAt: Date.now() + 15 * 60000,
      sentAt: Date.now() - 5 * 60000,
      createdAt: Date.now() - 6 * 60000,
    },
    {
      id: 'DEL-002',
      type: ORDER_TYPE.ONLINE,
      source: 'Direct',
      status: 'NEW', // Not an official order status in constants.js for dine-in, but valid for delivery
      customerName: 'Sam Smith',
      items: [
        { id: 'item-2', quantity: 1, name: 'Caesar Salad', price: 12, modifiers: [], specialRequest: '' }
      ],
      createdAt: Date.now() - 2 * 60000,
    },
    {
      id: 'DEL-003',
      type: ORDER_TYPE.DELIVERY,
      source: 'DoorDash',
      status: ORDER_STATUS.READY,
      customerName: 'Jamie Lee',
      items: [
        { id: 'item-3', quantity: 3, name: 'Ribeye Steak', price: 42, modifiers: [{name: 'Medium Rare', priceModifier: 0}], specialRequest: '' }
      ],
      createdAt: Date.now() - 40 * 60000,
      etaAt: Date.now() + 5 * 60000,
    }
  ];
};

const saveOrders = (orders) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch (e) {
    console.error('Failed to save delivery orders to local storage', e);
  }
};

const useDeliveryStore = create((set, get) => ({
  orders: getInitialOrders(),

  // Create a new delivery/online order
  createOrder: (orderData) => {
    const newOrder = {
      id: `DEL-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      status: 'NEW',
      createdAt: Date.now(),
      ...orderData,
    };
    const orders = [newOrder, ...get().orders];
    set({ orders });
    saveOrders(orders);
    return newOrder.id;
  },

  // State Machine transitions
  acceptOrder: (orderId, prepTimeMins = 20) => {
    const orders = get().orders.map(o => {
      if (o.id !== orderId) return o;
      return { 
        ...o, 
        status: 'CONFIRMED',
        etaAt: Date.now() + prepTimeMins * 60000
      };
    });
    set({ orders });
    saveOrders(orders);
  },

  rejectOrder: (orderId, reason) => {
    const orders = get().orders.map(o => {
      if (o.id !== orderId) return o;
      return { ...o, status: 'REJECTED', rejectReason: reason };
    });
    set({ orders });
    saveOrders(orders);
  },

  sendToKitchen: (orderId) => {
    const orders = get().orders.map(o => {
      if (o.id !== orderId) return o;
      return { 
        ...o, 
        status: ORDER_STATUS.IN_KITCHEN, 
        sentAt: Date.now() 
      };
    });
    set({ orders });
    saveOrders(orders);
  },

  markReady: (orderId) => {
    const orders = get().orders.map(o => {
      if (o.id !== orderId) return o;
      return { ...o, status: ORDER_STATUS.READY };
    });
    set({ orders });
    saveOrders(orders);
  },

  markComplete: (orderId) => {
    const orders = get().orders.map(o => {
      if (o.id !== orderId) return o;
      return { ...o, status: 'COMPLETED', completedAt: Date.now() };
    });
    set({ orders });
    saveOrders(orders);
  },

  // Selector for KDS integration
  getKitchenOrders: () => {
    return get().orders.filter(
      (o) => o.status === ORDER_STATUS.IN_KITCHEN || o.status === ORDER_STATUS.PAID
    );
  },

  getActiveOrders: () => {
    return get().orders.filter(
      (o) => !['COMPLETED', 'REJECTED'].includes(o.status)
    );
  },

  getCompletedOrders: () => {
    return get().orders
      .filter((o) => o.status === 'COMPLETED')
      .map((o) => {
        const itemsTotal = o.items.reduce((s, i) => {
          const itemPrice = i.price || 0;
          const modsTotal = (i.modifiers || []).reduce((sum, m) => sum + (m.priceModifier || 0), 0);
          return s + (itemPrice + modsTotal) * i.quantity;
        }, 0);
        
        return {
          ...o,
          closedAt: o.completedAt || o.createdAt,
          total: itemsTotal,
          partySize: 1, // count as 1 cover for delivery
          paymentMethod: o.source,
        };
      });
  }
}));

export default useDeliveryStore;
