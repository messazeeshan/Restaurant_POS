import React, { useState } from 'react';
import { X, ChevronRight } from 'lucide-react';
import { MODIFIER_TYPE } from '../../data/constants.js';
import { formatCurrency, formatModifierPrice } from '../../utils/formatters.js';

/**
 * ModifierModal — overlay for selecting modifiers before adding item to order
 * @param {{
 *   item: object,
 *   onConfirm: (selectedModifiers: object[], specialRequest: string) => void,
 *   onClose: () => void
 * }} props
 */
export default function ModifierModal({ item, onConfirm, onClose }) {
  const [selections, setSelections] = useState(() => {
    // Pre-fill required groups with first option
    const initial = {};
    (item.modifierGroups || []).forEach((group) => {
      if (group.type === MODIFIER_TYPE.REQUIRED && group.options.length > 0) {
        initial[group.id] = [group.options[0].id];
      } else {
        initial[group.id] = [];
      }
    });
    return initial;
  });
  const [specialRequest, setSpecialRequest] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [errors, setErrors] = useState({});

  // Calculate total price with modifiers
  const selectedModifierObjects = [];
  Object.entries(selections).forEach(([groupId, selectedIds]) => {
    const group = item.modifierGroups.find((g) => g.id === groupId);
    if (!group) return;
    selectedIds.forEach((optId) => {
      const opt = group.options.find((o) => o.id === optId);
      if (opt) selectedModifierObjects.push({ name: opt.name, priceModifier: opt.priceModifier });
    });
  });

  const modifierTotal = selectedModifierObjects.reduce((s, m) => s + m.priceModifier, 0);
  const itemTotal = quantity * (item.price + modifierTotal);

  const handleToggle = (group, optionId) => {
    setSelections((prev) => {
      const current = prev[group.id] || [];
      if (group.type === MODIFIER_TYPE.REQUIRED) {
        // Radio: replace selection
        return { ...prev, [group.id]: [optionId] };
      } else {
        // Checkbox: toggle
        const next = current.includes(optionId)
          ? current.filter((id) => id !== optionId)
          : [...current, optionId];
        return { ...prev, [group.id]: next };
      }
    });
    // Clear error for this group
    setErrors((prev) => ({ ...prev, [group.id]: false }));
  };

  const handleConfirm = () => {
    // Validate required groups
    const newErrors = {};
    let hasError = false;
    item.modifierGroups.forEach((group) => {
      if (group.type === MODIFIER_TYPE.REQUIRED) {
        if (!selections[group.id] || selections[group.id].length === 0) {
          newErrors[group.id] = true;
          hasError = true;
        }
      }
    });
    if (hasError) {
      setErrors(newErrors);
      return;
    }
    onConfirm(selectedModifierObjects, specialRequest, quantity);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="modal"
        style={{ width: 480, maxHeight: '85vh' }}
        role="dialog"
        aria-modal="true"
        aria-label={`Customize ${item.name}`}
      >
        {/* Header */}
        <div className="modal-header">
          <div>
            <div className="modal-title">{item.name}</div>
            <div style={{ fontSize: 13, color: 'var(--accent)', marginTop: 2, fontFamily: 'var(--font-display)', fontWeight: 700 }}>
              {formatCurrency(item.price)} base price
            </div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Modifier Groups */}
          {item.modifierGroups.map((group) => (
            <div key={group.id}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
                    {group.name}
                  </div>
                  <div style={{ fontSize: 11, color: errors[group.id] ? 'var(--danger)' : 'var(--text-muted)', marginTop: 1 }}>
                    {group.type === MODIFIER_TYPE.REQUIRED ? '* Required — choose one' : 'Optional — select any'}
                  </div>
                </div>
                {group.type === MODIFIER_TYPE.REQUIRED && (
                  <span className="badge badge-accent" style={{ fontSize: 9 }}>Required</span>
                )}
              </div>

              <div
                style={{
                  background: errors[group.id] ? 'var(--danger-muted)' : 'var(--bg-surface)',
                  border: `1px solid ${errors[group.id] ? 'var(--danger)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden',
                }}
              >
                {group.options.map((option, idx) => {
                  const isSelected = (selections[group.id] || []).includes(option.id);
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleToggle(group, option.id)}
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: isSelected ? 'var(--accent-muted)' : 'transparent',
                        border: 'none',
                        borderBottom: idx < group.options.length - 1 ? '1px solid var(--border)' : 'none',
                        cursor: 'pointer',
                        transition: 'var(--transition)',
                        textAlign: 'left',
                      }}
                      aria-pressed={isSelected}
                      id={`modifier-${option.id}`}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {/* Radio / Checkbox visual */}
                        <div style={{
                          width: 18,
                          height: 18,
                          borderRadius: group.type === MODIFIER_TYPE.REQUIRED ? '50%' : '4px',
                          border: `2px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                          background: isSelected ? 'var(--accent)' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          transition: 'var(--transition)',
                        }}>
                          {isSelected && (
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />
                          )}
                        </div>
                        <span style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: isSelected ? 600 : 400 }}>
                          {option.name}
                        </span>
                      </div>
                      <span style={{
                        fontSize: 12,
                        fontFamily: 'var(--font-display)',
                        fontWeight: 600,
                        color: option.priceModifier > 0 ? 'var(--accent)' : 'var(--text-muted)',
                      }}>
                        {formatModifierPrice(option.priceModifier)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Special request */}
          <div className="form-group">
            <label className="form-label" htmlFor="special-request">Special Requests</label>
            <textarea
              id="special-request"
              className="form-textarea"
              placeholder="e.g. No onions, allergy note, extra sauce..."
              value={specialRequest}
              onChange={(e) => setSpecialRequest(e.target.value)}
              rows={2}
            />
          </div>

          {/* Quantity selector */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Quantity</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
              >—</button>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, minWidth: 24, textAlign: 'center' }}>
                {quantity}
              </span>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Increase quantity"
              >+</button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary btn-lg"
            onClick={handleConfirm}
            id="add-to-order-btn"
            style={{ minWidth: 200 }}
          >
            Add to Order — {formatCurrency(itemTotal)}
          </button>
        </div>
      </div>
    </div>
  );
}
