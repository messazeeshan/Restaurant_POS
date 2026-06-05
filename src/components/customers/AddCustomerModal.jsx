import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import useCustomerStore from '../../store/useCustomerStore.js';
import useAppStore from '../../store/useAppStore.js';
import { LOYALTY_TIER } from '../../data/constants.js';

const DIETARY_OPTIONS = ['Vegan', 'Vegetarian', 'Gluten-Free', 'Halal', 'Kosher', 'Dairy-Free'];
const ALLERGEN_OPTIONS = ['Nuts', 'Dairy', 'Gluten', 'Shellfish', 'Eggs', 'Soy'];

function computeTierFromPoints(points) {
  if (points >= 2500) return LOYALTY_TIER.GOLD;
  if (points >= 1000) return LOYALTY_TIER.SILVER;
  return LOYALTY_TIER.BRONZE;
}

export default function AddCustomerModal({ onClose, onCreated }) {
  const { addCustomer } = useCustomerStore();
  const { addToast } = useAppStore();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    birthday: '',
    dietaryPreferences: [],
    allergens: [],
    notes: '',
    loyaltyPoints: 0,
  });
  const [errors, setErrors] = useState({});

  const setField = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const toggleList = (field, value) => {
    setForm(f => ({
      ...f,
      [field]: f[field].includes(value)
        ? f[field].filter(v => v !== value)
        : [...f[field], value],
    }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const points = parseInt(form.loyaltyPoints) || 0;
    const tier = computeTierFromPoints(points);

    const id = addCustomer({
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      birthday: form.birthday || null,
      dietaryPreferences: form.dietaryPreferences,
      allergens: form.allergens,
      notes: form.notes.trim(),
      loyaltyPoints: points,
      tier,
      visits: 0,
      lifetimeSpend: 0,
      visitHistory: [],
      createdAt: Date.now(),
    });

    addToast({ type: 'success', message: 'Customer added successfully' });
    onCreated?.(id);
    onClose();
  };

  return (
    <div className="modal-overlay" style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}>
      <div className="modal" style={{ width: 520, maxHeight: '90vh', display: 'flex', flexDirection: 'column', padding: 0 }}>
        {/* Header */}
        <div className="modal-header" style={{ flexShrink: 0 }}>
          <div className="modal-title">Add Customer</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="cust-name">Full Name <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input
              id="cust-name"
              className="form-input"
              value={form.name}
              onChange={e => setField('name', e.target.value)}
              placeholder="e.g. Jane Smith"
              style={{ borderColor: errors.name ? 'var(--danger)' : undefined }}
            />
            {errors.name && <div style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4 }}>{errors.name}</div>}
          </div>

          {/* Phone + Email */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="cust-phone">Phone Number</label>
              <input id="cust-phone" className="form-input" value={form.phone} onChange={e => setField('phone', e.target.value)} placeholder="(555) 123-4567" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="cust-email">Email Address</label>
              <input id="cust-email" className="form-input" type="email" value={form.email} onChange={e => setField('email', e.target.value)} placeholder="jane@email.com" />
            </div>
          </div>

          {/* Birthday */}
          <div className="form-group">
            <label className="form-label" htmlFor="cust-birthday">Birthday <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
            <input id="cust-birthday" className="form-input" type="date" value={form.birthday} onChange={e => setField('birthday', e.target.value)} />
          </div>

          {/* Dietary */}
          <div>
            <div className="form-label" style={{ marginBottom: 8 }}>Dietary Preferences</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {DIETARY_OPTIONS.map(opt => (
                <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
                  <input
                    type="checkbox"
                    checked={form.dietaryPreferences.includes(opt)}
                    onChange={() => toggleList('dietaryPreferences', opt)}
                    style={{ accentColor: 'var(--accent)' }}
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          {/* Allergens */}
          <div>
            <div className="form-label" style={{ marginBottom: 8 }}>Allergens</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {ALLERGEN_OPTIONS.map(opt => (
                <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
                  <input
                    type="checkbox"
                    checked={form.allergens.includes(opt)}
                    onChange={() => toggleList('allergens', opt)}
                    style={{ accentColor: 'var(--danger)' }}
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="form-group">
            <label className="form-label" htmlFor="cust-notes">Notes</label>
            <textarea
              id="cust-notes"
              className="form-textarea"
              rows={2}
              value={form.notes}
              onChange={e => setField('notes', e.target.value)}
              placeholder="Seating preferences, special occasions..."
            />
          </div>

          {/* Loyalty Points */}
          <div className="form-group">
            <label className="form-label" htmlFor="cust-points">Initial Loyalty Points</label>
            <input
              id="cust-points"
              className="form-input"
              type="number"
              min="0"
              value={form.loyaltyPoints}
              onChange={e => setField('loyaltyPoints', e.target.value)}
              placeholder="0"
            />
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
              Tier: <strong>{computeTierFromPoints(parseInt(form.loyaltyPoints) || 0)}</strong>
              {' '}(0–999 = Bronze · 1000–2499 = Silver · 2500+ = Gold)
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ flexShrink: 0 }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} id="save-customer-btn">
            <Save size={16} /> Save Customer
          </button>
        </div>
      </div>
    </div>
  );
}
