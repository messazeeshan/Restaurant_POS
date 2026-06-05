import React, { useState } from 'react';
import { Save, RefreshCw, AlertTriangle } from 'lucide-react';
import useSettingsStore from '../../store/useSettingsStore.js';
import useAppStore from '../../store/useAppStore.js';
import { formatPercent } from '../../utils/formatters.js';
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

export default function SettingsPanel() {
  const { settings, updateSettings } = useSettingsStore();
  const { addToast, theme, toggleTheme } = useAppStore();

  const [localSettings, setLocalSettings] = useState(settings || {});

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

  if (!settings) return <div className="empty-state"><div className="empty-state-icon">⚙️</div><div className="empty-state-title">Loading settings...</div></div>;

  return (
    <div style={{ maxWidth: 720, padding: '0 0 40px' }}>
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

      {/* Tax Configuration */}
      <SettingSection title="💰 Tax Configuration">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="form-group">
            <label className="form-label" htmlFor="setting-tax-rate">Tax Rate (%)</label>
            <input
              id="setting-tax-rate"
              className="form-input"
              type="number"
              step="0.1"
              min="0"
              max="30"
              value={((localSettings.taxRate || 0.085) * 100).toFixed(2)}
              onChange={(e) => set('taxRate', parseFloat(e.target.value) / 100)}
            />
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
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Applied for groups of {localSettings.serviceChargeThreshold || 8}+</div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="setting-group-size">Group Size Threshold</label>
            <input id="setting-group-size" className="form-input" type="number" min="1" value={localSettings.serviceChargeThreshold || 8} onChange={(e) => set('serviceChargeThreshold', parseInt(e.target.value))} />
          </div>
        </div>
      </SettingSection>

      {/* Operations */}
      <SettingSection title="⚙️ Operations">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="form-group">
            <label className="form-label" htmlFor="setting-table-turn">Table Turn Target (mins)</label>
            <input id="setting-table-turn" className="form-input" type="number" value={localSettings.tableTurnTarget || 90} onChange={(e) => set('tableTurnTarget', parseInt(e.target.value))} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="setting-order-timeout">Order Timeout Alert (mins)</label>
            <input id="setting-order-timeout" className="form-input" type="number" value={localSettings.orderTimeoutAlert || 20} onChange={(e) => set('orderTimeoutAlert', parseInt(e.target.value))} />
          </div>
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

      {/* Theme */}
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

      {/* Save button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
        <button className="btn btn-primary btn-lg" onClick={handleSave} id="save-settings-btn">
          <Save size={18} /> Save Settings
        </button>
      </div>
    </div>
  );
}
