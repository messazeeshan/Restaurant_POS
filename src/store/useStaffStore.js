// ============================================================
// STORE — useStaffStore (staff management + clock in/out)
// ============================================================

import { create } from 'zustand';
import { persist as persistStorage } from '../utils/persistence.js';

const useStaffStore = create((set, get) => ({
  staff: [],

  initialize: (staff) => set({ staff }),

  // ── Clock In ──────────────────────────────────────────────
  clockIn: (staffId) => {
    const staff = get().staff.map((s) =>
      s.id === staffId ? { ...s, clockedIn: true, clockInTime: Date.now() } : s
    );
    set({ staff });
    persistStorage.staff(staff);
  },

  // ── Clock Out ─────────────────────────────────────────────
  clockOut: (staffId) => {
    const staff = get().staff.map((s) => {
      if (s.id !== staffId) return s;
      const hoursWorked = s.clockInTime
        ? (Date.now() - s.clockInTime) / 1000 / 3600
        : 0;
      return {
        ...s,
        clockedIn: false,
        clockOutTime: Date.now(),
        hoursToday: (s.hoursToday || 0) + hoursWorked,
        clockInTime: null,
      };
    });
    set({ staff });
    persistStorage.staff(staff);
  },

  // ── Add staff member ──────────────────────────────────────
  addStaff: (member) => {
    const staff = [...get().staff, member];
    set({ staff });
    persistStorage.staff(staff);
  },

  // ── Update staff member ───────────────────────────────────
  updateStaff: (id, updates) => {
    const staff = get().staff.map((s) => s.id === id ? { ...s, ...updates } : s);
    set({ staff });
    persistStorage.staff(staff);
  },

  // ── Delete staff member ───────────────────────────────────
  deleteStaff: (id) => {
    const staff = get().staff.filter((s) => s.id !== id);
    set({ staff });
    persistStorage.staff(staff);
  },

  // ── Add tips to staff ─────────────────────────────────────
  addTip: (staffId, tipAmount) => {
    const staff = get().staff.map((s) =>
      s.id === staffId ? { ...s, tipsToday: (s.tipsToday || 0) + tipAmount } : s
    );
    set({ staff });
    persistStorage.staff(staff);
  },

  // ── Add sales to staff ────────────────────────────────────
  addSales: (staffId, saleAmount) => {
    const staff = get().staff.map((s) =>
      s.id === staffId ? { ...s, salesToday: (s.salesToday || 0) + saleAmount } : s
    );
    set({ staff });
    persistStorage.staff(staff);
  },

  // ── Getters ───────────────────────────────────────────────
  getStaffById: (id) => get().staff.find((s) => s.id === id),

  getClockedInStaff: () => get().staff.filter((s) => s.clockedIn),

  getServerStaff: () =>
    get().staff.filter((s) =>
      s.role === 'Server' || s.role === 'Bartender' || s.role === 'Manager'
    ),

  getTotalLaborCost: () => {
    return get().staff.reduce((sum, s) => {
      if (!s.clockedIn || !s.clockInTime) return sum + (s.hoursToday || 0) * s.hourlyRate;
      const hoursNow = (Date.now() - s.clockInTime) / 1000 / 3600;
      return sum + hoursNow * s.hourlyRate;
    }, 0);
  },
}));

export default useStaffStore;
