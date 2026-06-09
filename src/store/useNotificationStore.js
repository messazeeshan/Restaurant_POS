// ============================================================
// STORE — useNotificationStore (in-memory notification feed)
// ============================================================

import { create } from 'zustand';

let notifId = 0;

const useNotificationStore = create((set, get) => ({
  notifications: [],

  addNotification: ({ type, title, body }) => {
    const n = {
      id:      ++notifId,
      type,    // 'order' | 'sla' | 'payment' | 'uber' | 'sms'
      title,
      body,
      read:    false,
      ts:      Date.now(),
    };
    set((s) => ({ notifications: [n, ...s.notifications].slice(0, 100) }));
  },

  markRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) => n.id === id ? { ...n, read: true } : n),
    })),

  markAllRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
    })),

  clearAll: () => set({ notifications: [] }),

  getUnreadCount: () => get().notifications.filter((n) => !n.read).length,
}));

export default useNotificationStore;
