// ============================================================
// STORE — useCustomerStore (CRM)
// ============================================================

import { create } from 'zustand';
import { LOYALTY_TIER, LOYALTY_TIER_THRESHOLDS } from '../data/constants.js';
import { persist as persistStorage } from '../utils/persistence.js';

function computeTier(lifetimeSpend) {
  if (lifetimeSpend >= LOYALTY_TIER_THRESHOLDS[LOYALTY_TIER.GOLD]) return LOYALTY_TIER.GOLD;
  if (lifetimeSpend >= LOYALTY_TIER_THRESHOLDS[LOYALTY_TIER.SILVER]) return LOYALTY_TIER.SILVER;
  return LOYALTY_TIER.BRONZE;
}

const useCustomerStore = create((set, get) => ({
  customers: [],
  selectedCustomerId: null,

  initialize: (customers) => set({ customers }),

  setSelectedCustomer: (id) => set({ selectedCustomerId: id }),

  addCustomer: (customer) => {
    const newCustomer = {
      lifetimeSpend: 0,
      totalVisits: 0,
      lastVisit: null,
      visitHistory: [],
      ...customer,
      id: `cust-${Date.now()}`,
    };
    const customers = [...get().customers, newCustomer];
    set({ customers });
    persistStorage.customers(customers);
    return newCustomer.id;
  },

  updateCustomer: (id, updates) => {
    const customers = get().customers.map((c) => c.id === id ? { ...c, ...updates } : c);
    set({ customers });
    persistStorage.customers(customers);
  },

  deleteCustomer: (id) => {
    const customers = get().customers.filter((c) => c.id !== id);
    set({ customers });
    persistStorage.customers(customers);
  },

  addVisit: (customerId, { partySize, total, items }) => {
    const customer = get().customers.find((c) => c.id === customerId);
    if (!customer) return;
    const newLifetime = (customer.lifetimeSpend || 0) + total;
    const newPoints = (customer.loyaltyPoints || 0) + Math.floor(total);
    const customers = get().customers.map((c) => {
      if (c.id !== customerId) return c;
      return {
        ...c,
        lifetimeSpend: newLifetime,
        loyaltyPoints: newPoints,
        totalVisits: (c.totalVisits || 0) + 1,
        lastVisit: new Date().toISOString().split('T')[0],
        tier: computeTier(newLifetime),
        visitHistory: [
          { date: new Date().toISOString().split('T')[0], partySize, total, items },
          ...(c.visitHistory || []),
        ].slice(0, 20),
      };
    });
    set({ customers });
    persistStorage.customers(customers);
  },

  redeemPoints: (customerId, points) => {
    const customers = get().customers.map((c) =>
      c.id === customerId ? { ...c, loyaltyPoints: Math.max(0, c.loyaltyPoints - points) } : c
    );
    set({ customers });
    persistStorage.customers(customers);
  },

  addLoyaltyPoints: (customerId, points) => {
    const customers = get().customers.map((c) =>
      c.id === customerId ? { ...c, loyaltyPoints: c.loyaltyPoints + points } : c
    );
    set({ customers });
    persistStorage.customers(customers);
  },

  addNote: (customerId, note) => {
    const customers = get().customers.map((c) =>
      c.id === customerId ? { ...c, notes: note } : c
    );
    set({ customers });
    persistStorage.customers(customers);
  },

  // Search customers
  searchCustomers: (query) => {
    if (!query) return get().customers;
    const q = query.toLowerCase();
    return get().customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.phone && c.phone.includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q))
    );
  },

  getCustomerById: (id) => get().customers.find((c) => c.id === id),
  getSelectedCustomer: () => {
    const { selectedCustomerId, customers } = get();
    return customers.find((c) => c.id === selectedCustomerId) || null;
  },
}));

export default useCustomerStore;
