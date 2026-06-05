// ============================================================
// STORE — usePOSStore (active order entry session state)
// ============================================================

import { create } from 'zustand';

/**
 * Manages the transient state of the active order-entry session:
 * - Which table / order is being worked on
 * - Seat mode
 * - Active seat number
 * - Modifier modal state
 * - Payment modal state
 */
const usePOSStore = create((set, get) => ({
  // ── Session ───────────────────────────────────────────────
  sessionTableId: null,
  sessionOrderId: null,

  startSession: ({ tableId, orderId }) => {
    set({ sessionTableId: tableId, sessionOrderId: orderId });
  },

  endSession: () => {
    set({
      sessionTableId: null,
      sessionOrderId: null,
      seatMode: false,
      activeSeat: 1,
      pendingItem: null,
      showModifierModal: false,
      showPaymentModal: false,
      paymentStep: 1,
    });
  },

  // ── Seat Mode ─────────────────────────────────────────────
  seatMode: false,
  activeSeat: 1,

  toggleSeatMode: () => set((s) => ({ seatMode: !s.seatMode })),
  setActiveSeat: (seat) => set({ activeSeat: seat }),

  // ── Modifier Modal ────────────────────────────────────────
  showModifierModal: false,
  pendingItem: null,     // { menuItem, preSelectedModifiers }

  openModifierModal: (menuItem) => {
    set({ showModifierModal: true, pendingItem: menuItem });
  },
  closeModifierModal: () => {
    set({ showModifierModal: false, pendingItem: null });
  },

  // ── Payment Modal ─────────────────────────────────────────
  showPaymentModal: false,
  paymentStep: 1,        // 1: summary, 2: tip, 3: method, 4: confirmation
  tipPercent: 0,
  tipAmount: 0,
  selectedPaymentMethod: null,
  cashTendered: 0,
  splitCount: 1,
  splitMethod: 'EQUAL',
  splitsPaid: 0,

  openPaymentModal: () => set({ showPaymentModal: true, paymentStep: 1 }),
  closePaymentModal: () => set({ showPaymentModal: false, paymentStep: 1, tipPercent: 0, tipAmount: 0, selectedPaymentMethod: null, cashTendered: 0, splitsPaid: 0 }),

  setPaymentStep: (step) => set({ paymentStep: step }),
  setTipPercent: (pct) => set({ tipPercent: pct }),
  setTipAmount: (amt) => set({ tipAmount: amt }),
  setPaymentMethod: (method) => set({ selectedPaymentMethod: method }),
  setCashTendered: (amount) => set({ cashTendered: amount }),
  setSplitCount: (count) => set({ splitCount: count }),
  setSplitMethod: (method) => set({ splitMethod: method }),
  incrementSplitPaid: () => set((s) => ({ splitsPaid: s.splitsPaid + 1 })),

  // ── Category filter (menu grid) ───────────────────────────
  selectedCategoryId: null,
  menuSearch: '',
  setSelectedCategory: (id) => set({ selectedCategoryId: id }),
  setMenuSearch: (q) => set({ menuSearch: q }),

  // ── KDS state ─────────────────────────────────────────────
  kdsStation: 'All',
  kdsSoundEnabled: true,
  setKDSStation: (station) => set({ kdsStation: station }),
  toggleKDSSound: () => set((s) => ({ kdsSoundEnabled: !s.kdsSoundEnabled })),
}));

export default usePOSStore;
