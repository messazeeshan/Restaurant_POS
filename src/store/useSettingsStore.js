// ============================================================
// STORE — useSettingsStore (restaurant configuration)
// ============================================================

import { create } from 'zustand';
import { persist as persistStorage } from '../utils/persistence.js';

const useSettingsStore = create((set, get) => ({
  settings: null, // loaded from persistence

  initialize: (settings) => set({ settings }),

  updateSettings: (updates) => {
    const settings = { ...get().settings, ...updates };
    set({ settings });
    persistStorage.settings(settings);
  },

  updateNestedSettings: (key, updates) => {
    const settings = {
      ...get().settings,
      [key]: { ...get().settings[key], ...updates },
    };
    set({ settings });
    persistStorage.settings(settings);
  },

  getSettings: () => get().settings,

  getTaxRate: () => get().settings?.taxRate ?? 0.085,
  getRestaurantName: () => get().settings?.restaurantName ?? 'Ember & Oak',
}));

export default useSettingsStore;
