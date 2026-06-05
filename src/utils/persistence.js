// ============================================================
// UTILS — PERSISTENCE (localStorage helpers)
// ============================================================

import { STORAGE_KEYS } from '../data/constants.js';

/**
 * Read a value from localStorage. Returns defaultValue on error or miss.
 * @template T
 * @param {string} key
 * @param {T} defaultValue
 * @returns {T}
 */
export function readStorage(key, defaultValue = null) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return defaultValue;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`[POS] Failed to read localStorage key "${key}":`, err);
    return defaultValue;
  }
}

/**
 * Write a value to localStorage.
 * @param {string} key
 * @param {*} value
 */
export function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`[POS] Failed to write localStorage key "${key}":`, err);
  }
}

/**
 * Remove a key from localStorage.
 */
export function removeStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.warn(`[POS] Failed to remove localStorage key "${key}":`, err);
  }
}

/**
 * Check if the app has been initialized already.
 */
export function isInitialized() {
  return readStorage(STORAGE_KEYS.INITIALIZED, false) === STORAGE_KEYS.VERSION;
}

/**
 * Mark the app as initialized.
 */
export function markInitialized() {
  writeStorage(STORAGE_KEYS.INITIALIZED, STORAGE_KEYS.VERSION);
}

/**
 * Clear all POS data (for reset/migration).
 */
export function clearAllStorage() {
  Object.values(STORAGE_KEYS).forEach((key) => {
    removeStorage(key);
  });
}

/**
 * Persist a collection (orders, tables, etc.)
 */
export const persist = {
  menu: (data) => writeStorage(STORAGE_KEYS.MENU, data),
  tables: (data) => writeStorage(STORAGE_KEYS.TABLES, data),
  orders: (data) => writeStorage(STORAGE_KEYS.ORDERS, data),
  staff: (data) => writeStorage(STORAGE_KEYS.STAFF, data),
  customers: (data) => writeStorage(STORAGE_KEYS.CUSTOMERS, data),
  settings: (data) => writeStorage(STORAGE_KEYS.SETTINGS, data),
  theme: (theme) => writeStorage(STORAGE_KEYS.THEME, theme),
  activeOrder: (data) => writeStorage(STORAGE_KEYS.ACTIVE_ORDER, data),
};

/**
 * Load all stored data at startup.
 */
export function loadAllStorage() {
  return {
    menu: readStorage(STORAGE_KEYS.MENU, null),
    tables: readStorage(STORAGE_KEYS.TABLES, null),
    orders: readStorage(STORAGE_KEYS.ORDERS, null),
    staff: readStorage(STORAGE_KEYS.STAFF, null),
    customers: readStorage(STORAGE_KEYS.CUSTOMERS, null),
    settings: readStorage(STORAGE_KEYS.SETTINGS, null),
    theme: readStorage(STORAGE_KEYS.THEME, 'dark'),
    activeOrder: readStorage(STORAGE_KEYS.ACTIVE_ORDER, null),
  };
}

/**
 * Export current state as CSV string (for Reports)
 * @param {Array<object>} data
 * @param {Array<string>} columns
 */
export function exportCSV(data, columns) {
  const header = columns.join(',');
  const rows = data.map((row) =>
    columns.map((col) => {
      const val = row[col] ?? '';
      // Escape commas and quotes
      const str = String(val).replace(/"/g, '""');
      return str.includes(',') || str.includes('"') ? `"${str}"` : str;
    }).join(',')
  );
  return [header, ...rows].join('\n');
}

/**
 * Trigger a CSV download in the browser
 * @param {string} csvContent
 * @param {string} filename
 */
export function downloadCSV(csvContent, filename = 'pos-export.csv') {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
