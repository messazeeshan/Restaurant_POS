import React, { useState, useEffect } from 'react';
import { LogOut, ChevronLeft } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore.js';
import useOrderStore from '../../store/useOrderStore.js';
import useSettingsStore from '../../store/useSettingsStore.js';
import useMenuStore from '../../store/useMenuStore.js';
import useTableStore from '../../store/useTableStore.js';
import { broadcast, onSync } from '../../utils/sync.js';
import { loadAllStorage } from '../../utils/persistence.js';
import {
  SEED_MENU, SEED_TABLES, SEED_SETTINGS,
} from '../../data/seedData.js';
import TableSelector from './TableSelector.jsx';
import WaiterCart from './WaiterCart.jsx';
import OrderSubmitted from './OrderSubmitted.jsx';
import KitchenDisplay from '../kitchen/KitchenDisplay.jsx';

export default function WaiterApp({ session }) {
  const { logout } = useAuthStore();
  const { orders, initialize: initOrders } = useOrderStore();
  const { getRestaurantName, initialize: initSettings } = useSettingsStore();
  const { initialize: initMenu } = useMenuStore();
  const { initialize: initTables } = useTableStore();

  // step: 'order_type' | 'table_select' | 'build_order' | 'submitted' | 'kitchen'
  const [step, setStep] = useState('order_type');
  const [selectedTable, setSelectedTable] = useState(null);
  const [isTakeaway, setIsTakeaway] = useState(false);
  const [submittedOrderId, setSubmittedOrderId] = useState(null);
  const [sessionOrders, setSessionOrders] = useState([]);

  // Bootstrap stores from localStorage (same keys as main POS)
  useEffect(() => {
    const stored = loadAllStorage();
    if (stored.menu)     initMenu(stored.menu);     else initMenu(SEED_MENU);
    if (stored.tables)   initTables(stored.tables); else initTables(SEED_TABLES);
    if (stored.settings) initSettings(stored.settings);
    if (stored.orders)   initOrders(stored.orders);
  }, []);

  // Cross-tab sync
  useEffect(() => {
    const cleanup = onSync(() => {
      const raw = localStorage.getItem('pos_orders');
      if (raw) {
        try { initOrders(JSON.parse(raw)); } catch {}
      }
    });
    return cleanup;
  }, []);

  const handleOrderTypeSelect = (type) => {
    if (type === 'takeaway') {
      setIsTakeaway(true);
      setSelectedTable(null);
      setStep('build_order');
    } else {
      setIsTakeaway(false);
      setStep('table_select');
    }
  };

  const handleTableSelect = (table) => {
    setSelectedTable(table);
    setStep('build_order');
  };

  const handleOrderSubmitted = (orderId) => {
    setSubmittedOrderId(orderId);
    setSessionOrders((prev) => [...prev, orderId]);
    setStep('submitted');
  };

  const handleNewOrder = () => {
    setStep('order_type');
    setSelectedTable(null);
    setIsTakeaway(false);
    setSubmittedOrderId(null);
  };

  return (
    <div style={{
      width: '100vw',
      height: '100dvh',
      background: 'var(--bg-app)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Top Bar */}
      <header style={{
        background: 'var(--sidebar-bg)',
        padding: '0 20px',
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {step === 'build_order' && (
            <button
              onClick={() => setStep('table_select')}
              style={{ background: 'transparent', border: 'none', color: 'var(--sidebar-text)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 'var(--radius-sm)' }}
            >
              <ChevronLeft size={18} /> Back
            </button>
          )}
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: 'var(--sidebar-text-active)' }}>
            {getRestaurantName() || 'Ember & Oak'}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Kitchen toggle */}
          <button
            onClick={() => setStep(step === 'kitchen' ? 'order_type' : 'kitchen')}
            style={{
              background: step === 'kitchen' ? 'rgba(76,175,120,0.2)' : 'rgba(255,255,255,0.07)',
              border: `1px solid ${step === 'kitchen' ? 'var(--accent)' : 'rgba(255,255,255,0.1)'}`,
              color: step === 'kitchen' ? 'var(--accent)' : 'var(--sidebar-text)',
              borderRadius: 'var(--radius-sm)',
              padding: '5px 12px',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
            }}
            id="waiter-kitchen-btn"
          >
            🍳 Kitchen
          </button>
          <div style={{ fontSize: 13, color: 'var(--sidebar-text)' }}>👤 {session.name}</div>
          <button
            className="btn btn-sm"
            onClick={logout}
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--sidebar-text)', gap: 6 }}
            id="waiter-logout-btn"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </header>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* STEP 0: Choose order type */}
        {step === 'order_type' && (
          <OrderTypeSelector onSelect={handleOrderTypeSelect} />
        )}

        {/* STEP 1: Choose table (Dine-In only) */}
        {step === 'table_select' && (
          <TableSelector onSelect={handleTableSelect} />
        )}

        {/* STEP 2: Build order */}
        {step === 'build_order' && (
          <WaiterCart
            table={selectedTable}
            isTakeaway={isTakeaway}
            session={session}
            onSubmitted={handleOrderSubmitted}
            onBack={() => setStep('order_type')}
          />
        )}

        {/* STEP 3: Submitted */}
        {step === 'submitted' && (
          <OrderSubmitted
            orderId={submittedOrderId}
            orders={orders}
            onNewOrder={handleNewOrder}
          />
        )}

        {/* Kitchen view */}
        {step === 'kitchen' && <KitchenDisplay />}
      </div>
    </div>
  );
}

// ── Inline sub-component: Step 0 — Order type selector ────────
function OrderTypeSelector({ onSelect }) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 32, gap: 20,
    }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
        New Order
      </div>
      <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16 }}>
        Choose order type to get started
      </div>

      <div style={{ display: 'flex', gap: 20, width: '100%', maxWidth: 480 }}>
        {/* Dine-In */}
        <button
          id="waiter-dine-in-btn"
          onClick={() => onSelect('dine_in')}
          style={{
            flex: 1, padding: '32px 20px', border: '2px solid var(--border)',
            borderRadius: 'var(--radius-xl)', background: 'var(--bg-surface)',
            cursor: 'pointer', display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 12,
            transition: 'border-color 0.15s, box-shadow 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-bg)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          <span style={{ fontSize: 40 }}>🪑</span>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: 'var(--text-primary)' }}>
            Dine-In
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
            Select a table
          </div>
        </button>

        {/* Takeaway */}
        <button
          id="waiter-takeaway-btn"
          onClick={() => onSelect('takeaway')}
          style={{
            flex: 1, padding: '32px 20px', border: '2px solid var(--border)',
            borderRadius: 'var(--radius-xl)', background: 'var(--bg-surface)',
            cursor: 'pointer', display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 12,
            transition: 'border-color 0.15s, box-shadow 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-bg)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          <span style={{ fontSize: 40 }}>🥡</span>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: 'var(--text-primary)' }}>
            Takeaway
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
            No table needed
          </div>
        </button>
      </div>
    </div>
  );
}
