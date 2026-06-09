// ============================================================
// UTILS — SYNC (BroadcastChannel + localStorage event fallback)
// ============================================================

let channel = null;

function getChannel() {
  if (!channel) {
    try {
      channel = new BroadcastChannel('pos_realtime');
    } catch {
      channel = null;
    }
  }
  return channel;
}

/**
 * Broadcast an event to all open POS windows/tabs.
 * @param {string} eventType
 * @param {*} payload
 */
export function broadcast(eventType, payload) {
  const event = { type: eventType, payload, ts: Date.now() };
  try {
    localStorage.setItem('pos_last_event', JSON.stringify(event));
  } catch {}
  try {
    getChannel()?.postMessage(event);
  } catch {}
}

/**
 * Subscribe to sync events from other windows/tabs.
 * Returns a cleanup function.
 * @param {(event: { type: string, payload: any, ts: number }) => void} handler
 * @returns {() => void} cleanup
 */
export function onSync(handler) {
  const ch = getChannel();

  const channelHandler = (e) => {
    if (e.data) handler(e.data);
  };

  const storageHandler = (e) => {
    if (e.key === 'pos_last_event' && e.newValue) {
      try { handler(JSON.parse(e.newValue)); } catch {}
    }
  };

  if (ch) ch.addEventListener('message', channelHandler);
  window.addEventListener('storage', storageHandler);

  return () => {
    if (ch) ch.removeEventListener('message', channelHandler);
    window.removeEventListener('storage', storageHandler);
  };
}

/**
 * Start a reconcile loop that calls onUpdate every 500ms with raw orders array.
 * Used as a safety net for missed events.
 * @param {(orders: any[]) => void} onUpdate
 * @returns {number} interval ID
 */
export function startReconcileLoop(onUpdate) {
  return setInterval(() => {
    try {
      const raw = localStorage.getItem('pos_orders');
      const orders = raw ? JSON.parse(raw) : [];
      onUpdate(orders);
    } catch {}
  }, 500);
}

// Sync event type constants
export const SYNC_EVENTS = {
  ORDER_SUBMITTED:  'ORDER_SUBMITTED',
  ORDER_APPROVED:   'ORDER_APPROVED',
  ORDER_REJECTED:   'ORDER_REJECTED',
  ORDER_IN_KITCHEN: 'ORDER_IN_KITCHEN',
  ORDER_ACCEPTED:   'ORDER_ACCEPTED',
  ORDER_READY:      'ORDER_READY',
  ORDER_CLOSED:     'ORDER_CLOSED',
  MENU_UPDATED:     'MENU_UPDATED',
};
