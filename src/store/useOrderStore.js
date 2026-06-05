// ============================================================
// STORE — useOrderStore (all orders: active + history)
// ============================================================

import { create } from 'zustand';
import { ORDER_STATUS } from '../data/constants.js';
import { persist as persistStorage } from '../utils/persistence.js';

const useOrderStore = create((set, get) => ({
  orders: [],         // all orders (active + closed, capped at 500)
  activeOrderId: null,

  initialize: (orders) => set({ orders }),

  // ── Create a new order ────────────────────────────────────
  createOrder: ({ tableId, serverId, partySize }) => {
    const id = `order-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const order = {
      id,
      tableId,
      serverId,
      partySize,
      status: ORDER_STATUS.DRAFT,
      items: [],
      tipPercent: 0,
      discountAmount: 0,
      discount: null,
      paymentMethod: null,
      createdAt: Date.now(),
      sentAt: null,
      closedAt: null,
      total: 0,
      subtotal: 0,
      tax: 0,
      tip: 0,
      statusHistory: [{ status: ORDER_STATUS.DRAFT, timestamp: Date.now(), staffId: null }],
    };
    const orders = [order, ...get().orders].slice(0, 500);
    set({ orders, activeOrderId: id });
    persistStorage.orders(orders);
    return id;
  },

  // ── Set active order (for editing) ────────────────────────
  setActiveOrderId: (id) => set({ activeOrderId: id }),

  // ── Add item to an order ──────────────────────────────────
  addItemToOrder: (orderId, item) => {
    const orders = get().orders.map((o) => {
      if (o.id !== orderId) return o;
      // Check if same item + modifiers already exists (merge qty)
      const existingIdx = o.items.findIndex(
        (i) => i.itemId === item.itemId &&
          JSON.stringify(i.modifiers) === JSON.stringify(item.modifiers) &&
          i.seatNumber === item.seatNumber &&
          !item.specialRequest
      );
      let items;
      if (existingIdx >= 0 && !item.specialRequest) {
        items = o.items.map((i, idx) =>
          idx === existingIdx ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      } else {
        items = [...o.items, item];
      }
      return { ...o, items };
    });
    set({ orders });
    persistStorage.orders(orders);
  },

  // ── Remove item from order ────────────────────────────────
  removeItemFromOrder: (orderId, itemId) => {
    const orders = get().orders.map((o) => {
      if (o.id !== orderId) return o;
      return { ...o, items: o.items.filter((i) => i.id !== itemId) };
    });
    set({ orders });
    persistStorage.orders(orders);
  },

  // ── Update item quantity ──────────────────────────────────
  updateItemQuantity: (orderId, itemId, quantity) => {
    if (quantity <= 0) {
      get().removeItemFromOrder(orderId, itemId);
      return;
    }
    const orders = get().orders.map((o) => {
      if (o.id !== orderId) return o;
      return { ...o, items: o.items.map((i) => i.id === itemId ? { ...i, quantity } : i) };
    });
    set({ orders });
    persistStorage.orders(orders);
  },

  // ── Update order (tip, discount, etc.) ───────────────────
  updateOrder: (orderId, updates) => {
    const orders = get().orders.map((o) => o.id === orderId ? { ...o, ...updates } : o);
    set({ orders });
    persistStorage.orders(orders);
  },

  // ── Transition order status ───────────────────────────────
  transitionOrderStatus: (orderId, newStatus, staffId) => {
    const orders = get().orders.map((o) => {
      if (o.id !== orderId) return o;
      
      let finalStatus = newStatus;
      let closedAt = o.closedAt;

      // Auto-close logic
      if (newStatus === ORDER_STATUS.PAID && o.status === ORDER_STATUS.READY) {
        finalStatus = ORDER_STATUS.CLOSED;
        closedAt = Date.now();
      }
      if (newStatus === ORDER_STATUS.READY && o.status === ORDER_STATUS.PAID) {
        finalStatus = ORDER_STATUS.CLOSED;
        closedAt = Date.now();
      }

      const statusHistory = [
        ...o.statusHistory,
        { status: finalStatus, timestamp: Date.now(), staffId },
      ];
      const updates = { status: finalStatus, statusHistory, closedAt };
      if (finalStatus === ORDER_STATUS.IN_KITCHEN) updates.sentAt = Date.now();
      
      return { ...o, ...updates };
    });
    set({ orders });
    persistStorage.orders(orders);
  },

  // ── Close / pay an order ──────────────────────────────────
  closeOrder: (orderId, { paymentMethod, total, subtotal, tax, tip, tipPercent }) => {
    const now = Date.now();
    const orders = get().orders.map((o) => {
      if (o.id !== orderId) return o;

      // If food is already READY when paying: close immediately
      // If food is still IN_KITCHEN (or DRAFT): mark PAID so kitchen still sees it
      const isReadyForClose = o.status === ORDER_STATUS.READY;
      const finalStatus = isReadyForClose ? ORDER_STATUS.CLOSED : ORDER_STATUS.PAID;

      return {
        ...o,
        status: finalStatus,
        paymentMethod,
        total,
        subtotal,
        tax,
        tip,
        tipPercent,
        // Always stamp paidAt so revenue is captured immediately in both paths
        paidAt: now,
        // closedAt only set when actually fully closed
        closedAt: isReadyForClose ? now : o.closedAt,
        statusHistory: [
          ...o.statusHistory,
          { status: finalStatus, timestamp: now, staffId: null },
        ],
      };
    });
    set({ orders, activeOrderId: null });
    persistStorage.orders(orders);
  },

  // ── Void an order ─────────────────────────────────────────
  voidOrder: (orderId, staffId) => {
    get().transitionOrderStatus(orderId, ORDER_STATUS.VOID, staffId);
    set({ activeOrderId: null });
  },

  // ── Getters ───────────────────────────────────────────────
  getOrderById: (id) => get().orders.find((o) => o.id === id),

  getOrderByTableId: (tableId) =>
    get().orders.find(
      (o) => o.tableId === tableId && o.status !== ORDER_STATUS.CLOSED && o.status !== ORDER_STATUS.VOID
    ),

  getActiveOrders: () =>
    get().orders.filter(
      (o) => o.status !== ORDER_STATUS.CLOSED && o.status !== ORDER_STATUS.VOID
    ),

  getKitchenOrders: () =>
    get().orders.filter(
      (o) => o.status === ORDER_STATUS.IN_KITCHEN || o.status === ORDER_STATUS.PAID
    ),

  getClosedOrders: () =>
    get().orders.filter((o) => o.status === ORDER_STATUS.CLOSED),

  // Revenue selectors: include both CLOSED and PAID (paid early, still in kitchen)
  getPaidAndClosedOrders: () =>
    get().orders.filter((o) => o.status === ORDER_STATUS.CLOSED || o.status === ORDER_STATUS.PAID),

  getTodaysOrders: () => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    return get()
      .getPaidAndClosedOrders()
      .filter((o) => (o.closedAt || o.paidAt) >= startOfDay.getTime());
  },

  getActiveOrder: () => {
    const { activeOrderId, orders } = get();
    if (!activeOrderId) return null;
    return orders.find((o) => o.id === activeOrderId) || null;
  },
}));

export default useOrderStore;
