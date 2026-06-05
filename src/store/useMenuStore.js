// ============================================================
// STORE — useMenuStore (categories + items CRUD)
// ============================================================

import { create } from 'zustand';
import { persist as persistStorage } from '../utils/persistence.js';

const useMenuStore = create((set, get) => ({
  categories: [],
  items: [],
  loading: false,

  initialize: ({ categories, items }) => {
    set({ categories, items });
  },

  // ── Categories ────────────────────────────────────────────
  addCategory: (category) => {
    const categories = [...get().categories, category];
    set({ categories });
    persistStorage.menu({ categories, items: get().items });
  },

  updateCategory: (id, updates) => {
    const categories = get().categories.map((c) => c.id === id ? { ...c, ...updates } : c);
    set({ categories });
    persistStorage.menu({ categories, items: get().items });
  },

  deleteCategory: (id) => {
    const categories = get().categories.filter((c) => c.id !== id);
    // Keep items but unassign category
    const items = get().items.map((item) =>
      item.categoryId === id ? { ...item, categoryId: null } : item
    );
    set({ categories, items });
    persistStorage.menu({ categories, items });
  },

  reorderCategories: (orderedIds) => {
    const categoryMap = {};
    get().categories.forEach((c) => { categoryMap[c.id] = c; });
    const categories = orderedIds.map((id, idx) => ({ ...categoryMap[id], sortOrder: idx }));
    set({ categories });
    persistStorage.menu({ categories, items: get().items });
  },

  // ── Items ─────────────────────────────────────────────────
  addItem: (item) => {
    const items = [...get().items, item];
    set({ items });
    persistStorage.menu({ categories: get().categories, items });
  },

  updateItem: (id, updates) => {
    const items = get().items.map((i) => i.id === id ? { ...i, ...updates } : i);
    set({ items });
    persistStorage.menu({ categories: get().categories, items });
  },

  deleteItem: (id) => {
    const items = get().items.filter((i) => i.id !== id);
    set({ items });
    persistStorage.menu({ categories: get().categories, items });
  },

  toggleItemStatus: (id) => {
    const item = get().items.find((i) => i.id === id);
    if (!item) return;
    const newStatus = item.status === 'active' ? '86d' : 'active';
    get().updateItem(id, { status: newStatus });
  },

  duplicateItem: (id) => {
    const original = get().items.find((i) => i.id === id);
    if (!original) return;
    const duplicate = {
      ...original,
      id: `item-${Math.random().toString(36).substr(2, 9)}`,
      name: `${original.name} (Copy)`,
    };
    get().addItem(duplicate);
  },

  // ── Getters ───────────────────────────────────────────────
  getItemById: (id) => get().items.find((i) => i.id === id),

  getItemsByCategory: (categoryId) => {
    const items = get().items.filter((i) => i.categoryId === categoryId);
    return items.sort((a, b) => a.sortOrder - b.sortOrder);
  },

  getActiveItems: () => get().items.filter((i) => i.status === 'active'),

  getSortedCategories: () => {
    return [...get().categories].sort((a, b) => a.sortOrder - b.sortOrder);
  },
}));

export default useMenuStore;
