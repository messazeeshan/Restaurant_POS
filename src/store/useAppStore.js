// ============================================================
// STORE — useAppStore (global app state: theme, view, toasts, current user)
// ============================================================

import { create } from 'zustand';
import { VIEW } from '../data/constants.js';
import { persist as persistStorage } from '../utils/persistence.js';

let toastId = 0;

const useAppStore = create((set, get) => ({
  // ── Current View ─────────────────────────────────────────
  currentView: VIEW.FLOOR,
  setView: (view) => set({ currentView: view }),

  // ── Active Order Context (for floor → order handoff) ──────
  activeTableId: null,
  setActiveTableId: (tableId) => set({ activeTableId: tableId }),

  // ── Sidebar ───────────────────────────────────────────────
  sidebarExpanded: true,
  toggleSidebar: () => set((s) => ({ sidebarExpanded: !s.sidebarExpanded })),

  // ── Theme ─────────────────────────────────────────────────
  theme: 'dark',
  setTheme: (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    persistStorage.theme(theme);
    set({ theme });
  },
  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    get().setTheme(next);
  },

  // ── Current Staff (logged-in user) ────────────────────────
  currentStaffId: 'staff-alex', // Default to manager for demo
  setCurrentStaffId: (id) => set({ currentStaffId: id }),

  // ── Toast Notifications ───────────────────────────────────
  toasts: [],
  addToast: ({ message, type = 'info', duration = 3000 }) => {
    const id = ++toastId;
    set((s) => {
      const toasts = [...s.toasts, { id, message, type, duration, createdAt: Date.now() }];
      // Cap at 3 visible toasts
      return { toasts: toasts.slice(-3) };
    });
    // Auto-dismiss
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, duration + 300);
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  // ── Modal State ───────────────────────────────────────────
  modalStack: [],
  openModal: (modalData) => set((s) => ({ modalStack: [...s.modalStack, modalData] })),
  closeModal: () => set((s) => ({ modalStack: s.modalStack.slice(0, -1) })),
  closeAllModals: () => set({ modalStack: [] }),
}));

export default useAppStore;
