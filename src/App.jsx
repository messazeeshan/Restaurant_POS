import React, { useEffect, useRef } from 'react';
import useAppStore from './store/useAppStore.js';
import useAuthStore from './store/useAuthStore.js';
import useMenuStore from './store/useMenuStore.js';
import useOrderStore from './store/useOrderStore.js';
import useTableStore from './store/useTableStore.js';
import useStaffStore from './store/useStaffStore.js';
import useCustomerStore from './store/useCustomerStore.js';
import useSettingsStore from './store/useSettingsStore.js';
import {
  SEED_MENU, SEED_TABLES, SEED_STAFF, SEED_CUSTOMERS,
  SEED_SETTINGS, buildSeedOrders, buildHistoricalOrders,
} from './data/seedData.js';
import { isInitialized, markInitialized, loadAllStorage } from './utils/persistence.js';
import { onSync } from './utils/sync.js';
import { VIEW } from './data/constants.js';

import Sidebar from './components/layout/Sidebar.jsx';
import TopBar from './components/layout/TopBar.jsx';
import FloorPlan from './components/floor/FloorPlan.jsx';
import OrderScreen from './components/pos/OrderScreen.jsx';
import KitchenDisplay from './components/kitchen/KitchenDisplay.jsx';
import DeliveryScreen from './components/delivery/DeliveryScreen.jsx';
import MenuManager from './components/menu/MenuManager.jsx';
import StaffManager from './components/staff/StaffManager.jsx';
import Dashboard from './components/reports/Dashboard.jsx';
import CustomerManager from './components/customers/CustomerManager.jsx';
import SettingsPanel from './components/settings/SettingsPanel.jsx';
import LoginScreen from './components/auth/LoginScreen.jsx';
import WaiterApp from './components/waiter/WaiterApp.jsx';
import OrdersDashboard from './components/admin/OrdersDashboard.jsx';

// ── Toast Notification System ─────────────────────────────────
function ToastContainer() {
  const { toasts, removeToast } = useAppStore();

  const TOAST_ICONS = {
    success: '✅',
    error:   '❌',
    warning: '⚠️',
    info:    'ℹ️',
  };

  return (
    <div className="toast-container" aria-live="polite" aria-label="Notifications">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type}`}
          role="alert"
        >
          <span className="toast-icon" aria-hidden="true">
            {TOAST_ICONS[toast.type] || 'ℹ️'}
          </span>
          <div className="toast-body">
            <div className="toast-message">{toast.message}</div>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 14, lineHeight: 1, padding: 0, marginLeft: 8 }}
            aria-label="Dismiss notification"
          >
            ✕
          </button>
          <div
            className="toast-progress"
            style={{ animationDuration: `${toast.duration}ms` }}
          />
        </div>
      ))}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────
export default function App() {
  const { currentView, theme, setTheme } = useAppStore();
  const { session } = useAuthStore();
  const { initialize: initMenu } = useMenuStore();
  const { initialize: initOrders } = useOrderStore();
  const { initialize: initTables } = useTableStore();
  const { initialize: initStaff } = useStaffStore();
  const { initialize: initCustomers } = useCustomerStore();
  const { initialize: initSettings } = useSettingsStore();
  const initialized = useRef(false);

  // ── Initialize data ─────────────────────────────────────────
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const stored = loadAllStorage();

    // Apply saved theme immediately
    const savedTheme = stored.theme || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    setTheme(savedTheme);

    if (!isInitialized()) {
      // First run — seed everything
      initMenu(SEED_MENU);
      initTables(SEED_TABLES);
      initStaff(SEED_STAFF);
      initCustomers(SEED_CUSTOMERS);
      initSettings(SEED_SETTINGS);

      const seedOrders = buildSeedOrders(SEED_TABLES, SEED_MENU, SEED_STAFF);
      const historicalOrders = buildHistoricalOrders();
      initOrders([...seedOrders, ...historicalOrders]);

      // Link orders to tables
      const { setTableOrder } = useTableStore.getState();
      setTableOrder('T3', seedOrders[0].id);
      setTableOrder('T5', seedOrders[1].id);
      setTableOrder('B2', seedOrders[2].id);

      markInitialized();
    } else {
      // Restore from localStorage
      if (stored.menu)      initMenu(stored.menu);
      if (stored.tables)    initTables(stored.tables);
      if (stored.staff)     initStaff(stored.staff);
      if (stored.customers) initCustomers(stored.customers);
      if (stored.settings)  initSettings(stored.settings);
      if (stored.orders)    initOrders(stored.orders);

      // If no data was stored, seed anyway
      if (!stored.menu)      initMenu(SEED_MENU);
      if (!stored.tables)    initTables(SEED_TABLES);
      if (!stored.staff)     initStaff(SEED_STAFF);
      if (!stored.customers) initCustomers(SEED_CUSTOMERS);
      if (!stored.settings)  initSettings(SEED_SETTINGS);
    }
  }, []);

  // ── Cross-tab sync listener ─────────────────────────────────
  useEffect(() => {
    const cleanup = onSync(() => {
      // Re-read orders from localStorage on any sync event
      const raw = localStorage.getItem('pos_orders');
      if (raw) {
        try {
          const orders = JSON.parse(raw);
          useOrderStore.getState().initialize(orders);
        } catch {}
      }
    });
    return cleanup;
  }, []);

  // ── No session → show login ─────────────────────────────────
  if (!session) {
    return (
      <>
        <LoginScreen />
        <ToastContainer />
      </>
    );
  }

  // ── Waiter session → show Waiter UI ─────────────────────────
  if (session.role === 'waiter') {
    return (
      <>
        <WaiterApp session={session} />
        <ToastContainer />
      </>
    );
  }

  // ── Manager session → full POS ───────────────────────────────
  const renderView = () => {
    switch (currentView) {
      case VIEW.FLOOR:     return <FloorPlan />;
      case VIEW.ORDERS:    return <OrdersDashboard />;
      case VIEW.ORDER:     return <OrderScreen />;
      case VIEW.KITCHEN:   return <KitchenDisplay />;
      case VIEW.DELIVERY:  return <DeliveryScreen />;
      case VIEW.MENU:      return <MenuManager />;
      case VIEW.STAFF:     return <StaffManager />;
      case VIEW.REPORTS:   return <Dashboard />;
      case VIEW.CUSTOMERS: return <CustomerManager />;
      case VIEW.SETTINGS:  return <SettingsPanel />;
      default:             return <FloorPlan />;
    }
  };

  const needsTopBar = ![VIEW.ORDER, VIEW.KITCHEN].includes(currentView);
  const needsPadding = [VIEW.REPORTS, VIEW.SETTINGS, VIEW.ORDERS].includes(currentView);

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <Sidebar />

      {/* Main area */}
      <div className="main-area">
        {needsTopBar && <TopBar />}

        <main
          className={`main-content ${needsPadding ? '' : 'no-pad'}`}
          role="main"
          id="main-content"
        >
          {renderView()}
        </main>
      </div>

      {/* Toast system */}
      <ToastContainer />
    </div>
  );
}
