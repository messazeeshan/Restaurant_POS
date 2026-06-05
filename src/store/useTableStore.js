// ============================================================
// STORE — useTableStore (floor plan state)
// ============================================================

import { create } from 'zustand';
import { TABLE_STATUS } from '../data/constants.js';
import { persist as persistStorage } from '../utils/persistence.js';

const useTableStore = create((set, get) => ({
  tables: [],

  initialize: (tables) => set({ tables }),

  // ── Update a table ────────────────────────────────────────
  updateTable: (id, updates) => {
    const tables = get().tables.map((t) => t.id === id ? { ...t, ...updates } : t);
    set({ tables });
    persistStorage.tables(tables);
  },

  // ── Seat guests at a table ────────────────────────────────
  seatTable: (tableId, { partySize, serverId, reservationName = null }) => {
    get().updateTable(tableId, {
      status: TABLE_STATUS.SEATED,
      partySize,
      serverId,
      seatedAt: Date.now(),
      reservationName,
      currentOrderId: null,
    });
  },

  // ── Assign an order to a table ────────────────────────────
  setTableOrder: (tableId, orderId) => {
    get().updateTable(tableId, {
      status: TABLE_STATUS.IN_KITCHEN,
      currentOrderId: orderId,
    });
  },

  // ── Mark bill requested ───────────────────────────────────
  requestBill: (tableId) => {
    get().updateTable(tableId, { status: TABLE_STATUS.BILL_REQUESTED });
  },

  // ── Close table (reset) ───────────────────────────────────
  closeTable: (tableId) => {
    get().updateTable(tableId, {
      status: TABLE_STATUS.AVAILABLE,
      partySize: null,
      serverId: null,
      seatedAt: null,
      currentOrderId: null,
      reservationName: null,
      reservationTime: null,
    });
  },

  // ── Reserve table ─────────────────────────────────────────
  reserveTable: (tableId, { reservationName, reservationTime }) => {
    get().updateTable(tableId, {
      status: TABLE_STATUS.RESERVED,
      reservationName,
      reservationTime,
      partySize: null,
      serverId: null,
    });
  },

  // ── Transfer table ────────────────────────────────────────
  transferTable: (fromTableId, toTableId) => {
    const from = get().tables.find((t) => t.id === fromTableId);
    if (!from) return;
    // Copy state to destination table
    get().updateTable(toTableId, {
      status: from.status,
      partySize: from.partySize,
      serverId: from.serverId,
      seatedAt: from.seatedAt,
      currentOrderId: from.currentOrderId,
    });
    // Reset source table
    get().closeTable(fromTableId);
  },

  // ── Getters ───────────────────────────────────────────────
  getTableById: (id) => get().tables.find((t) => t.id === id),

  getTablesByZone: (zone) => {
    if (!zone || zone === 'All') return get().tables;
    return get().tables.filter((t) => t.zone === zone);
  },

  getTableStats: () => {
    const tables = get().tables;
    const total = tables.length;
    const available = tables.filter((t) => t.status === TABLE_STATUS.AVAILABLE).length;
    const occupied = tables.filter((t) => t.status !== TABLE_STATUS.AVAILABLE && t.status !== TABLE_STATUS.RESERVED).length;
    const reserved = tables.filter((t) => t.status === TABLE_STATUS.RESERVED).length;
    const totalCovers = tables.reduce((sum, t) => sum + (t.partySize || 0), 0);
    return { total, available, occupied, reserved, totalCovers };
  },
}));

export default useTableStore;
