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
  createOrder: ({ tableId, serverId, partySize, type, source, specialInstructions, prePaid, externalOrderId, customerName, status: initialStatus }) => {
    const id = `order-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const startStatus = initialStatus || ORDER_STATUS.DRAFT;
    const order = {
      id,
      tableId:             tableId || null,
      serverId:            serverId || null,
      partySize:           partySize || 1,
      type:                type || 'DINE_IN',
      source:              source || 'POS',
      customerName:        customerName || null,
      specialInstructions: specialInstructions || '',
      prePaid:             prePaid || false,
      externalOrderId:     externalOrderId || null,
      status:              startStatus,
      items:               [],
      tipPercent:          0,
      discountAmount:      0,
      discount:            null,
      paymentMethod:       null,
      createdAt:           Date.now(),
      submittedAt:         startStatus === ORDER_STATUS.PENDING_ADMIN ? Date.now() : null,
      approvedAt:          null,
      sentAt:              null,
      sentToKitchenAt:     null,
      acceptedAt:          null,
      readyAt:             null,
      paidAt:              null,
      closedAt:            null,
      rejectedAt:          null,
      rejectionReason:     null,
      smsConfirmationSent: false,
      total:               0,
      subtotal:            0,
      tax:                 0,
      tip:                 0,
      statusHistory:       [{ status: startStatus, timestamp: Date.now(), staffId: null }],
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

      const now = Date.now();
      const statusHistory = [
        ...o.statusHistory,
        { status: finalStatus, timestamp: now, staffId },
      ];
      const updates = { status: finalStatus, statusHistory, closedAt };
      if (finalStatus === ORDER_STATUS.IN_KITCHEN) {
        updates.sentAt = now;
        updates.sentToKitchenAt = now;
      }
      if (finalStatus === ORDER_STATUS.ACCEPTED) updates.acceptedAt = now;
      if (finalStatus === ORDER_STATUS.READY)     updates.readyAt    = now;
      if (finalStatus === ORDER_STATUS.PENDING_ADMIN) updates.submittedAt = now;
      
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

  // ── Approve a PENDING_ADMIN order ───────────────────────────────────
approvePendingOrder: (orderId, staffId) => {
    const now = Date.now();
    const orders = get().orders.map((o) => {
      if (o.id !== orderId) return o;
      return {
        ...o,
        status:          ORDER_STATUS.IN_KITCHEN,
        approvedAt:      now,
        sentAt:          now,
        sentToKitchenAt: now,
        statusHistory:   [...o.statusHistory, { status: ORDER_STATUS.IN_KITCHEN, timestamp: now, staffId }],
      };
    });
    set({ orders });
    persistStorage.orders(orders);
  },

  // ── Reject a PENDING_ADMIN order ───────────────────────────────────
  rejectOrder: (orderId, reason, staffId) => {
    const now = Date.now();
    const orders = get().orders.map((o) => {
      if (o.id !== orderId) return o;
      return {
        ...o,
        status:          ORDER_STATUS.REJECTED,
        rejectedAt:      now,
        rejectionReason: reason,
        statusHistory:   [...o.statusHistory, { status: ORDER_STATUS.REJECTED, timestamp: now, staffId }],
      };
    });
    set({ orders });
    persistStorage.orders(orders);
  },

  // ── Accept a ticket on the KDS (clears SLA timer) ──────────────────
  acceptOrder: (orderId) => {
    const now = Date.now();
    const orders = get().orders.map((o) => {
      if (o.id !== orderId) return o;
      return {
        ...o,
        status:      ORDER_STATUS.ACCEPTED,
        acceptedAt:  now,
        statusHistory: [...o.statusHistory, { status: ORDER_STATUS.ACCEPTED, timestamp: now, staffId: null }],
      };
    });
    set({ orders });
    persistStorage.orders(orders);
  },

  // ── Mark SMS sent ────────────────────────────────────────────────
  markSmsSent: (orderId) => {
    const orders = get().orders.map((o) =>
      o.id === orderId ? { ...o, smsConfirmationSent: true } : o
    );
    set({ orders });
    persistStorage.orders(orders);
  },

  // ── Getters ───────────────────────────────────────────────
  getOrderById: (id) => get().orders.find((o) => o.id === id),

  getOrderByTableId: (tableId) =>
    get().orders.find(
      (o) => o.tableId === tableId &&
        o.status !== ORDER_STATUS.CLOSED &&
        o.status !== ORDER_STATUS.VOID &&
        o.status !== ORDER_STATUS.REJECTED
    ),

  getActiveOrders: () =>
    get().orders.filter(
      (o) => o.status !== ORDER_STATUS.CLOSED &&
        o.status !== ORDER_STATUS.VOID &&
        o.status !== ORDER_STATUS.REJECTED
    ),

  // Kitchen shows IN_KITCHEN, ACCEPTED, and PAID orders
  getKitchenOrders: () =>
    get().orders.filter(
      (o) => o.status === ORDER_STATUS.IN_KITCHEN ||
             o.status === ORDER_STATUS.ACCEPTED ||
             o.status === ORDER_STATUS.PAID
    ),

  // Orders waiting for manager approval
  getPendingAdminOrders: () =>
    get().orders.filter((o) => o.status === ORDER_STATUS.PENDING_ADMIN),

  // Tickets in IN_KITCHEN state not yet accepted and past 2-minute SLA
  getSLABreachedOrders: () => {
    const threshold = Date.now() - 120000;
    return get().orders.filter(
      (o) => o.status === ORDER_STATUS.IN_KITCHEN &&
        !o.acceptedAt &&
        o.sentToKitchenAt &&
        o.sentToKitchenAt < threshold
    );
  },

  getClosedOrders: () =>
    get().orders.filter((o) => o.status === ORDER_STATUS.CLOSED),

  getPaidAndClosedOrders: () =>
    get().orders.filter((o) => o.status === ORDER_STATUS.CLOSED || o.status === ORDER_STATUS.PAID),

  getTodaysOrders: () => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const start = startOfDay.getTime();
    return get().orders.filter((o) => {
      const ts = o.paidAt || o.closedAt || 0;
      if (ts < start) return false;
      // Fully closed/paid orders
      if (o.status === ORDER_STATUS.CLOSED || o.status === ORDER_STATUS.PAID) return true;
      // Pre-paid customer orders still in kitchen
      if (o.prePaid && o.paidAt) return true;
      return false;
    });
  },

  getActiveOrder: () => {
    const { activeOrderId, orders } = get();
    if (!activeOrderId) return null;
    return orders.find((o) => o.id === activeOrderId) || null;
  },
}));

export default useOrderStore;
