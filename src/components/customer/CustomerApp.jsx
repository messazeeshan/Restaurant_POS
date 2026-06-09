import React, { useState, useEffect } from 'react';
import { ShoppingCart, Flame } from 'lucide-react';
import useMenuStore from '../../store/useMenuStore.js';
import useTableStore from '../../store/useTableStore.js';
import useOrderStore from '../../store/useOrderStore.js';
import useSettingsStore from '../../store/useSettingsStore.js';
import { onSync } from '../../utils/sync.js';
import { loadAllStorage } from '../../utils/persistence.js';
import { SEED_MENU, SEED_TABLES, SEED_SETTINGS } from '../../data/seedData.js';
import CustomerMenu from './CustomerMenu.jsx';
import CustomerCart from './CustomerCart.jsx';
import OrderTracking from './OrderTracking.jsx';

export default function CustomerApp() {
  const { initialize: initMenu } = useMenuStore();
  const { initialize: initTables, tables } = useTableStore();
  const { initialize: initOrders, orders } = useOrderStore();
  const { initialize: initSettings, getRestaurantName } = useSettingsStore();

  const [initialized, setInitialized] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState('');
  const [isTakeaway, setIsTakeaway] = useState(false);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState(null);

  // Bootstrap stores from localStorage (same keys as manager POS)
  useEffect(() => {
    const stored = loadAllStorage();
    if (stored.menu)     initMenu(stored.menu);     else initMenu(SEED_MENU);
    if (stored.tables)   initTables(stored.tables); else initTables(SEED_TABLES);
    if (stored.orders)   initOrders(stored.orders);
    if (stored.settings) initSettings(stored.settings); else initSettings(SEED_SETTINGS);
    setInitialized(true);
  }, []);

  // Cross-tab sync — keep orders fresh
  useEffect(() => {
    const cleanup = onSync(() => {
      const raw = localStorage.getItem('pos_orders');
      if (raw) { try { initOrders(JSON.parse(raw)); } catch {} }
    });
    return cleanup;
  }, []);

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const restaurantName = getRestaurantName() || 'Ember & Oak';

  if (!initialized) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FDFAF5' }}>
        <div style={{ fontSize: 14, color: '#6B7280' }}>Loading menu…</div>
      </div>
    );
  }

  if (placedOrderId) {
    return (
      <OrderTracking
        orderId={placedOrderId}
        orders={orders}
        onNewOrder={() => { setPlacedOrderId(null); setCart([]); }}
      />
    );
  }

  return (
    <div style={{ width: '100vw', height: '100dvh', background: '#FDFAF5', fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif", display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header — sticky */}
      <header style={{
        background: '#fff',
        borderBottom: '1px solid #E8E0D5',
        boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
        flexShrink: 0,
        zIndex: 100,
      }}>
        <div style={{ width: '100%', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, boxSizing: 'border-box' }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: '#1E5C3A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Flame size={18} color="#fff" />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 16, color: '#1A1A1A', letterSpacing: '-0.3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{restaurantName}</div>
              <div style={{ fontSize: 11, color: '#9CA3AF', whiteSpace: 'nowrap' }}>Self-Order</div>
            </div>
          </div>

          {/* Right controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            {/* Table / Takeaway selector */}
            <select
              value={isTakeaway ? 'takeaway' : selectedTableId}
              onChange={(e) => {
                if (e.target.value === 'takeaway') { setIsTakeaway(true); setSelectedTableId(''); }
                else { setIsTakeaway(false); setSelectedTableId(e.target.value); }
              }}
              style={{ border: '1px solid #E8E0D5', borderRadius: 8, padding: '7px 10px', fontSize: 13, color: '#1A1A1A', background: '#fff', cursor: 'pointer', maxWidth: 140 }}
              id="customer-table-select"
            >
              <option value="">Select Table</option>
              <option value="takeaway">🥡 Takeaway</option>
              {tables.filter((t) => t.status === 'AVAILABLE').map((t) => (
                <option key={t.id} value={t.id}>Table {t.number}</option>
              ))}
            </select>

            {/* Cart button */}
            <button
              onClick={() => setShowCart(true)}
              style={{ background: '#1E5C3A', color: '#fff', border: 'none', borderRadius: 10, padding: '9px 14px', display: 'flex', alignItems: 'center', gap: 7, fontWeight: 700, fontSize: 14, cursor: 'pointer', position: 'relative', flexShrink: 0 }}
              id="customer-cart-btn"
            >
              <ShoppingCart size={17} />
              <span style={{ display: 'none' }} className="cart-label-md">Cart</span>
              {cartCount > 0 && (
                <span style={{ position: 'absolute', top: -6, right: -6, background: '#EF4444', color: '#fff', width: 20, height: 20, borderRadius: '50%', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Menu — scrollable fill */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        <CustomerMenu cart={cart} setCart={setCart} />
      </div>

      {/* Cart drawer */}
      {showCart && (
        <CustomerCart
          cart={cart}
          setCart={setCart}
          selectedTableId={selectedTableId}
          isTakeaway={isTakeaway}
          onClose={() => setShowCart(false)}
          onOrderPlaced={(id) => { setShowCart(false); setPlacedOrderId(id); }}
        />
      )}
    </div>
  );
}
