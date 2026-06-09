import React, { useState } from 'react';
import { Save, RefreshCw, AlertTriangle, ExternalLink } from 'lucide-react';
import useSettingsStore from '../../store/useSettingsStore.js';
import useAppStore from '../../store/useAppStore.js';
import useMenuStore from '../../store/useMenuStore.js';
import useOrderStore from '../../store/useOrderStore.js';
import useNotificationStore from '../../store/useNotificationStore.js';
import { formatPercent } from '../../utils/formatters.js';
import { getMessages, clearMessages } from '../../utils/messaging.js';
import { broadcast, SYNC_EVENTS } from '../../utils/sync.js';
import { DEFAULTS, ORDER_STATUS } from '../../data/constants.js';
import ThemeToggle from '../layout/ThemeToggle.jsx';

function SettingSection({ title, children }) {
  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {children}
      </div>
    </div>
  );
}

function SimBadge() {
  return (
    <span style={{
      background: 'var(--warning-bg)',
      color: 'var(--warning)',
      border: '1px solid var(--warning)',
      fontSize: 10,
      fontWeight: 800,
      padding: '2px 8px',
      borderRadius: 'var(--radius-full)',
      letterSpacing: '0.05em',
    }}>
      SIMULATION MODE
    </span>
  );
}

export default function SettingsPanel() {
  const { settings, updateSettings } = useSettingsStore();
  const { addToast, theme } = useAppStore();
  const { categories, getItemsByCategory } = useMenuStore();
  const { createOrder, addItemToOrder, updateOrder } = useOrderStore();
  const { addNotification } = useNotificationStore();

  const [localSettings, setLocalSettings] = useState(settings || {});
  const [activeTab, setActiveTab] = useState('general');
  const [messages, setMessages] = useState(() => getMessages());
  const [uberCustomer, setUberCustomer] = useState('Alex Johnson');
  const [uberCategory, setUberCategory] = useState(categories[0]?.name || '');
  const [simulating, setSimulating] = useState(false);

  const set = (key, value) => setLocalSettings((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    updateSettings(localSettings);
    addToast({ type: 'success', message: 'Settings saved!' });
  };

  const handleReset = () => {
    if (window.confirm('Reset all data and start fresh? This cannot be undone.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleSimulateUberEats = () => {
    if (!uberCustomer.trim()) return;
    setSimulating(true);
    setTimeout(() => {
      const catItems = getItemsByCategory(uberCategory).filter((i) => i.available !== false).slice(0, 2);
      if (catItems.length === 0) { setSimulating(false); addToast({ type: 'error', message: 'No items in that category.' }); return; }
      const taxRate = settings?.taxRate || DEFAULTS.TAX_RATE;
      const orderId = createOrder({
        type:            'DELIVERY',
        source:          'Uber Eats',
        customerName:    uberCustomer,
        prePaid:         true,
        status:          ORDER_STATUS.PENDING_ADMIN,
        estimatedMinutes: 35,
        externalOrderId: `UE-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      });
      catItems.forEach((item) => {
        addItemToOrder(orderId, {
          id: `ue-${Date.now()}-${Math.random().toString(36).substr(2,5)}`,
          itemId: item.id, name: item.name, price: item.price, quantity: 1,
          modifiers: [], seatNumber: null, specialRequest: '',
        });
      });
      const subtotal = catItems.reduce((s, i) => s + i.price, 0);
      const tax = subtotal * taxRate;
      updateOrder(orderId, { subtotal, tax, total: subtotal + tax });
      broadcast(SYNC_EVENTS.ORDER_SUBMITTED, { orderId, source: 'Uber Eats' });
      addNotification({
        type: 'uber',
        title: `Uber Eats — ${uberCustomer}`,
        body: `${catItems.length} items · $${(subtotal + tax).toFixed(2)}`,
      });
      addToast({ type: 'success', message: `🛵 Uber Eats order simulated!` });
      setSimulating(false);
    }, 800);
  };

  if (!settings) return <div className="empty-state"><div className="empty-state-icon">⚙️</div><div className="empty-state-title">Loading settings...</div></div>;

  const TABS = [
    { id: 'general',      label: '⚙️ General' },
    { id: 'ordering',     label: '📋 Ordering' },
    { id: 'integrations', label: '🔗 Integrations' },
    { id: 'messages',     label: '📱 Message Log' },
  ];

  return (
    <div style={{ maxWidth: 720, padding: '0 0 40px' }}>
      {/* Tab bar */}
      <div className="tabs" style={{ marginBottom: 20 }}>
        {TABS.map((t) => (
          <button key={t.id} className={`tab-btn ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── GENERAL TAB ── */}
      {activeTab === 'general' && (
        <>
          {/* Restaurant Info */}
          <SettingSection title="🏪 Restaurant Information">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label" htmlFor="setting-name">Restaurant Name</label>
                <input id="setting-name" className="form-input" value={localSettings.restaurantName || ''} onChange={(e) => set('restaurantName', e.target.value)} />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label" htmlFor="setting-tagline">Tagline</label>
                <input id="setting-tagline" className="form-input" value={localSettings.tagline || ''} onChange={(e) => set('tagline', e.target.value)} />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label" htmlFor="setting-address">Address</label>
                <input id="setting-address" className="form-input" value={localSettings.address || ''} onChange={(e) => set('address', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="setting-phone">Phone</label>
                <input id="setting-phone" className="form-input" value={localSettings.phone || ''} onChange={(e) => set('phone', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="setting-tax-id">Tax ID</label>
                <input id="setting-tax-id" className="form-input" value={localSettings.taxId || ''} onChange={(e) => set('taxId', e.target.value)} />
              </div>
            </div>
          </SettingSection>

          {/* Tax */}
          <SettingSection title="💰 Tax Configuration">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="setting-tax-rate">Tax Rate (%)</label>
                <input id="setting-tax-rate" className="form-input" type="number" step="0.1" min="0" max="30"
                  value={((localSettings.taxRate || 0.085) * 100).toFixed(2)}
                  onChange={(e) => set('taxRate', parseFloat(e.target.value) / 100)} />
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                  Currently: {formatPercent(localSettings.taxRate || 0.085)}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Tax-Inclusive Pricing</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                  <label className="toggle">
                    <input type="checkbox" checked={localSettings.taxInclusive || false} onChange={(e) => set('taxInclusive', e.target.checked)} id="setting-tax-inclusive" />
                    <div className="toggle-track"><div className="toggle-thumb" /></div>
                  </label>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Prices include tax</span>
                </div>
              </div>
            </div>
          </SettingSection>

          {/* Receipt */}
          <SettingSection title="🧾 Receipt Customization">
            <div className="form-group">
              <label className="form-label" htmlFor="setting-receipt-header">Header Message</label>
              <textarea id="setting-receipt-header" className="form-textarea" rows={2} value={localSettings.receiptHeader || ''} onChange={(e) => set('receiptHeader', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="setting-receipt-footer">Footer Message</label>
              <textarea id="setting-receipt-footer" className="form-textarea" rows={2} value={localSettings.receiptFooter || ''} onChange={(e) => set('receiptFooter', e.target.value)} />
            </div>
          </SettingSection>

          {/* Payment */}
          <SettingSection title="💳 Payment Settings">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="setting-service-charge">Service Charge (%)</label>
                <input id="setting-service-charge" className="form-input" type="number" step="0.5" min="0" max="30" value={(localSettings.serviceChargePercent || 0)} onChange={(e) => set('serviceChargePercent', parseFloat(e.target.value) || 0)} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="setting-group-size">Group Size Threshold</label>
                <input id="setting-group-size" className="form-input" type="number" min="1" value={localSettings.serviceChargeThreshold || 8} onChange={(e) => set('serviceChargeThreshold', parseInt(e.target.value))} />
              </div>
            </div>
          </SettingSection>

          {/* Appearance */}
          <SettingSection title="🎨 Appearance">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>Color Theme</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Currently: {theme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}</div>
              </div>
              <ThemeToggle />
            </div>
          </SettingSection>

          {/* Danger zone */}
          <SettingSection title="⚠️ Danger Zone">
            <div style={{ padding: '16px', background: 'var(--danger-muted)', border: '1px solid rgba(232,69,69,0.3)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <AlertTriangle size={20} style={{ color: 'var(--danger)', flexShrink: 0, marginTop: 1 }} />
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--danger)', marginBottom: 4 }}>Reset All Data</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>
                    This will permanently delete all orders, menu items, staff, and customers. This action cannot be undone.
                  </div>
                  <button className="btn btn-danger btn-sm" onClick={handleReset} id="reset-all-btn">
                    <RefreshCw size={14} /> Reset to Factory Defaults
                  </button>
                </div>
              </div>
            </div>
          </SettingSection>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <button className="btn btn-primary btn-lg" onClick={handleSave} id="save-settings-btn">
              <Save size={18} /> Save Settings
            </button>
          </div>
        </>
      )}

      {/* ── ORDERING TAB ── */}
      {activeTab === 'ordering' && (
        <>
          <SettingSection title="📋 Order Approval">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Auto-approve waiter orders</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  When ON, waiter and customer orders skip admin review and go directly to kitchen.
                </div>
              </div>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={localSettings.autoApproveWaiterOrders || false}
                  onChange={(e) => set('autoApproveWaiterOrders', e.target.checked)}
                  id="setting-auto-approve"
                />
                <div className="toggle-track"><div className="toggle-thumb" /></div>
              </label>
            </div>
          </SettingSection>

          <SettingSection title="⚙️ KDS Thresholds">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="setting-kds-warning">KDS Warning (mins)</label>
                <input id="setting-kds-warning" className="form-input" type="number" value={localSettings.kdsWarningMinutes || 8} onChange={(e) => set('kdsWarningMinutes', parseInt(e.target.value))} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="setting-kds-critical">KDS Critical (mins)</label>
                <input id="setting-kds-critical" className="form-input" type="number" value={localSettings.kdsCriticalMinutes || 12} onChange={(e) => set('kdsCriticalMinutes', parseInt(e.target.value))} />
              </div>
            </div>
          </SettingSection>

          <SettingSection title="📱 Customer View">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Customer Ordering Portal</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Opens a consumer-facing menu in a new tab. No login required.</div>
              </div>
              <button
                className="btn btn-secondary"
                onClick={() => window.open(`${window.location.origin}${window.location.pathname}?view=customer`, '_blank')}
                id="open-customer-view-btn"
              >
                <ExternalLink size={15} /> Open Customer View ↗
              </button>
            </div>
          </SettingSection>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <button className="btn btn-primary btn-lg" onClick={handleSave} id="save-settings-ordering-btn">
              <Save size={18} /> Save Settings
            </button>
          </div>
        </>
      )}

      {/* ── INTEGRATIONS TAB ── */}
      {activeTab === 'integrations' && (
        <>
          {/* Telnyx */}
          <SettingSection title={<span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>Telnyx Integration <SimBadge /></span>}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">API Key</label>
                <input className="form-input" type="password" placeholder="KEY●●●●●●●●●●●●●●●●" readOnly />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input className="form-input" placeholder="+1 (555) 000-0000" readOnly />
              </div>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" disabled>📨 Test Send</button>
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              ● Simulated — no real API calls are made. All messages are logged in Message Log.
            </div>
          </SettingSection>

          {/* Twilio */}
          <SettingSection title={<span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>Twilio Integration <SimBadge /></span>}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Account SID</label>
                <input className="form-input" type="password" placeholder="AC●●●●●●●●●●●●●●●●" readOnly />
              </div>
              <div className="form-group">
                <label className="form-label">Auth Token</label>
                <input className="form-input" type="password" placeholder="●●●●●●●●●●●●●●●●" readOnly />
              </div>
              <div className="form-group">
                <label className="form-label">From Number</label>
                <input className="form-input" placeholder="+1 (555) 000-0001" readOnly />
              </div>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" disabled>📨 Test Send</button>
              </div>
            </div>
          </SettingSection>

          {/* Uber Eats */}
          <SettingSection title={<span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>🛵 Uber Eats Integration <SimBadge /></span>}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Webhook URL</label>
                <input className="form-input" value={`${window.location.origin}/webhook/ubereats`} readOnly style={{ color: 'var(--text-muted)' }} />
              </div>
            </div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, marginTop: 4 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', marginBottom: 10 }}>
                Simulate Incoming Order
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Customer Name</label>
                  <input className="form-input" value={uberCustomer} onChange={(e) => setUberCustomer(e.target.value)} placeholder="Customer name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Item Category</label>
                  <select className="form-input" value={uberCategory} onChange={(e) => setUberCategory(e.target.value)}>
                    {categories.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <button
                className="btn btn-primary"
                onClick={handleSimulateUberEats}
                disabled={simulating || !uberCustomer.trim()}
                id="simulate-uber-eats-btn"
                style={{ marginTop: 8 }}
              >
                {simulating ? '⏳ Simulating…' : '🛵 Simulate Uber Eats Order'}
              </button>
            </div>
          </SettingSection>
        </>
      )}

      {/* ── MESSAGE LOG TAB ── */}
      {activeTab === 'messages' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>
              Outbound Messages <SimBadge />
            </div>
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => { clearMessages(); setMessages([]); }}
              id="clear-messages-btn"
            >
              Clear Log
            </button>
          </div>

          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', fontSize: 14 }}>
              No messages sent yet. Messages are logged when orders are confirmed.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {messages.map((msg) => (
                <div key={msg.id} className="card" style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--radius-full)', background: 'var(--bg-subtle)', color: 'var(--text-secondary)' }}>
                        {msg.provider?.toUpperCase() || 'TELNYX'}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{msg.to}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: 'var(--success)', fontWeight: 600 }}>● {msg.status}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {new Date(msg.sentAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>{msg.body}</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
