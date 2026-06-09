// ============================================================
// UTILS — MESSAGING (simulated Twilio / Telnyx)
// ============================================================

import { STORAGE_KEYS } from '../data/constants.js';

function readMessages() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES) || '[]');
  } catch { return []; }
}

function saveMessages(msgs) {
  try {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(msgs));
  } catch {}
}

/**
 * Build the SMS body for an order confirmation.
 */
function buildConfirmationMessage(order) {
  const type = order.type === 'DELIVERY'
    ? `delivery via ${order.source || 'delivery'}`
    : order.tableId
      ? `Table ${order.tableId}`
      : 'takeaway';
  const id = order.id?.slice(-6).toUpperCase();
  const total = typeof order.total === 'number' ? `$${order.total.toFixed(2)}` : '';
  const eta = order.estimatedMinutes || (order.type === 'DELIVERY' ? 35 : 20);
  return `Hi! Your order at Ember & Oak (${type}) is confirmed. Order #${id} · ${total} · Est. ${eta} min. Thank you! 🍽️`;
}

/**
 * Simulate sending an order confirmation SMS.
 * Logs to localStorage. No real API call.
 */
export function sendOrderConfirmation(order, customerPhone = '') {
  const body = buildConfirmationMessage(order);
  const msg = {
    id:        `msg-${Date.now()}`,
    to:        customerPhone || '+1 (555) ***-****',
    body,
    provider:  'telnyx',
    status:    'delivered',
    sentAt:    Date.now(),
    orderId:   order.id,
    simulated: true,
  };
  const msgs = [msg, ...readMessages()].slice(0, 200);
  saveMessages(msgs);
  return msg;
}

/**
 * Get all simulated messages (newest first).
 */
export function getMessages() {
  return readMessages();
}

/**
 * Clear message log.
 */
export function clearMessages() {
  saveMessages([]);
}
