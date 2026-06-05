import React, { useState } from 'react';
import { Search, Plus, X, Star, Phone, Mail, Calendar } from 'lucide-react';
import useCustomerStore from '../../store/useCustomerStore.js';
import useAppStore from '../../store/useAppStore.js';
import { LOYALTY_TIER_COLORS } from '../../data/constants.js';
import { formatCurrency, formatDateString, getInitials } from '../../utils/formatters.js';
import LoyaltyWidget from './LoyaltyWidget.jsx';
import AddCustomerModal from './AddCustomerModal.jsx';

export default function CustomerManager() {
  const { customers, searchCustomers, getCustomerById, addLoyaltyPoints, redeemPoints, addNote } = useCustomerStore();
  const { addToast } = useAppStore();

  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [editingNote, setEditingNote] = useState(false);
  const [addPointsAmount, setAddPointsAmount] = useState('');
  const [showAddCustomer, setShowAddCustomer] = useState(false);

  const filtered = searchCustomers(query);
  const selected = selectedId ? getCustomerById(selectedId) : null;

  const handleSelectCustomer = (customer) => {
    setSelectedId(customer.id);
    setNoteText(customer.notes || '');
    setEditingNote(false);
  };

  const handleSaveNote = () => {
    if (!selected) return;
    addNote(selected.id, noteText);
    setEditingNote(false);
    addToast({ type: 'success', message: 'Note saved' });
  };

  const handleAddPoints = () => {
    const pts = parseInt(addPointsAmount);
    if (!pts || pts <= 0) return;
    addLoyaltyPoints(selected.id, pts);
    setAddPointsAmount('');
    addToast({ type: 'success', message: `${pts} points added to ${selected.name}` });
  };

  const handleRedeem = () => {
    if (!selected || selected.loyaltyPoints < 100) {
      addToast({ type: 'error', message: 'Minimum 100 points to redeem' });
      return;
    }
    redeemPoints(selected.id, 100);
    addToast({ type: 'success', message: '100 points redeemed for $10 discount' });
  };

  const tierBadgeStyle = (tier) => {
    const styles = {
      Gold:   { background: '#F59E0B', color: '#451a03' },
      Silver: { background: '#64748B', color: '#f8fafc' },
      Bronze: { background: '#92400E', color: '#fef3c7' },
    };
    return styles[tier] || { background: 'var(--bg-elevated)', color: 'var(--text-muted)' };
  };

  const tierColor = selected ? LOYALTY_TIER_COLORS[selected.tier] : 'var(--text-muted)';

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* ── Customer List ────────────────────────────────────── */}
      <div style={{ width: 340, flexShrink: 0, display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border)', background: 'var(--bg-surface)', overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>Guests</div>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddCustomer(true)} id="add-customer-btn">
              <Plus size={14} /> Add Customer
            </button>
          </div>
          <div className="search-bar">
            <Search size={16} className="search-icon" />
            <input type="text" className="search-input" placeholder="Search by name, phone, email..." value={query} onChange={(e) => setQuery(e.target.value)} id="customer-search" />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">👤</div>
              <div className="empty-state-title">No customers found</div>
            </div>
          ) : filtered.map((customer) => {
            const tColor = LOYALTY_TIER_COLORS[customer.tier];
            const isSelected = selectedId === customer.id;
            return (
              <button
                key={customer.id}
                onClick={() => handleSelectCustomer(customer)}
                id={`customer-row-${customer.id}`}
                style={{
                  width: '100%', textAlign: 'left', border: 'none', borderBottom: '1px solid var(--border)',
                  padding: '14px 16px', cursor: 'pointer', background: isSelected ? 'var(--accent-muted)' : 'transparent',
                  display: 'flex', alignItems: 'center', gap: 12, transition: 'var(--transition)',
                }}
              >
                {/* Avatar */}
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${tColor}18`, border: `2px solid ${tColor}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: tColor, flexShrink: 0 }}>
                  {getInitials(customer.name)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {customer.name}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                    {customer.totalVisits} visits · {formatCurrency(customer.lifetimeSpend)}
                  </div>
                </div>
                <span className="badge" style={{ ...tierBadgeStyle(customer.tier), border: 'none', fontSize: 9 }}>
                  {customer.tier}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Customer Profile ─────────────────────────────────── */}
      {selected ? (
        <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: `${tierColor}18`, border: `3px solid ${tierColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, color: tierColor, flexShrink: 0 }}>
              {getInitials(selected.name)}
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{selected.name}</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
                {selected.phone && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={12} />{selected.phone}</span>}
                {selected.email && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Mail size={12} />{selected.email}</span>}
                {selected.birthday && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={12} />Birthday: {formatDateString(selected.birthday)}</span>}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Loyalty */}
            <LoyaltyWidget customer={selected} />

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>Points Actions</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="form-input" type="number" min="1" placeholder="Points" value={addPointsAmount} onChange={(e) => setAddPointsAmount(e.target.value)} style={{ flex: 1 }} id="add-points-input" />
                <button className="btn btn-primary btn-sm" onClick={handleAddPoints} id="add-points-btn">Add</button>
              </div>
              <button className="btn btn-secondary" onClick={handleRedeem} disabled={selected.loyaltyPoints < 100} id="redeem-points-btn">
                <Star size={14} /> Redeem 100pts = $10
              </button>
            </div>
          </div>

          {/* Dietary / Allergens */}
          {(selected.dietaryPreferences?.length > 0 || selected.allergens?.length > 0) && (
            <div className="card">
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Dietary Profile</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {selected.dietaryPreferences?.map((p) => (
                  <span key={p} className="badge badge-success">{p}</span>
                ))}
                {selected.allergens?.map((a) => (
                  <span key={a} className="badge badge-danger">⚠️ {a}</span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700 }}>Notes</div>
              {!editingNote ? (
                <button className="btn btn-ghost btn-sm" onClick={() => setEditingNote(true)} id="edit-note-btn">Edit</button>
              ) : (
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-primary btn-sm" onClick={handleSaveNote} id="save-note-btn">Save</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditingNote(false)}>Cancel</button>
                </div>
              )}
            </div>
            {editingNote ? (
              <textarea className="form-textarea" value={noteText} onChange={(e) => setNoteText(e.target.value)} rows={3} id="note-textarea" />
            ) : (
              <div style={{ fontSize: 13, color: selected.notes ? 'var(--text-secondary)' : 'var(--text-muted)', fontStyle: selected.notes ? 'normal' : 'italic' }}>
                {selected.notes || 'No notes for this guest.'}
              </div>
            )}
          </div>

          {/* Visit history */}
          <div className="card">
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Visit History</div>
            {selected.visitHistory?.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Party</th>
                    <th>Items</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.visitHistory.map((visit, i) => (
                    <tr key={i}>
                      <td style={{ fontSize: 12 }}>{formatDateString(visit.date)}</td>
                      <td>{visit.partySize}</td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{visit.items}</td>
                      <td style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--accent)' }}>{formatCurrency(visit.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No visit history yet</div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="empty-state">
            <div className="empty-state-icon">👤</div>
            <div className="empty-state-title">Select a Customer</div>
            <div className="empty-state-subtitle">Click a name from the list to view their profile</div>
          </div>
        </div>
      )}

      {showAddCustomer && (
        <AddCustomerModal
          onClose={() => setShowAddCustomer(false)}
          onCreated={(id) => setSelectedId(id)}
        />
      )}
    </div>
  );
}
