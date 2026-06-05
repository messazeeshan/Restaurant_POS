import React, { useState } from 'react';
import { X, Save, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import useMenuStore from '../../store/useMenuStore.js';
import useAppStore from '../../store/useAppStore.js';
import { TAX_CLASS, DIETARY_FLAGS, ALLERGENS, MODIFIER_TYPE } from '../../data/constants.js';
import { formatCurrency, formatPercent } from '../../utils/formatters.js';

/**
 * ItemForm — slide-over panel for creating/editing menu items
 * @param {{ item: object|null, onClose: () => void }} props
 */
export default function ItemForm({ item, onClose }) {
  const { addItem, updateItem } = useMenuStore();
  const { addToast } = useAppStore();

  const isEdit = !!item;

  const [form, setForm] = useState({
    name: item?.name || '',
    description: item?.description || '',
    categoryId: item?.categoryId || '',
    price: item?.price?.toString() || '',
    cost: item?.cost?.toString() || '',
    taxClass: item?.taxClass || TAX_CLASS.FOOD,
    dietaryFlags: item?.dietaryFlags || [],
    allergens: item?.allergens || [],
    modifierGroups: item?.modifierGroups || [],
    status: item?.status || 'active',
    station: item?.station || 'Cold',
  });

  const { categories } = useMenuStore();

  const marginPercent = form.price && form.cost
    ? ((parseFloat(form.price) - parseFloat(form.cost)) / parseFloat(form.price)) * 100
    : null;

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const toggleFlag = (arr, key, val) => {
    set(key, arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
  };

  const addModifierGroup = () => {
    set('modifierGroups', [
      ...form.modifierGroups,
      {
        id: `mg-${Date.now()}`,
        name: 'New Group',
        type: MODIFIER_TYPE.OPTIONAL,
        options: [{ id: `opt-${Date.now()}`, name: 'Option', priceModifier: 0 }],
      },
    ]);
  };

  const updateModGroup = (groupId, updates) => {
    set('modifierGroups', form.modifierGroups.map((g) => g.id === groupId ? { ...g, ...updates } : g));
  };

  const addModOption = (groupId) => {
    set('modifierGroups', form.modifierGroups.map((g) =>
      g.id === groupId
        ? { ...g, options: [...g.options, { id: `opt-${Date.now()}`, name: '', priceModifier: 0 }] }
        : g
    ));
  };

  const updateModOption = (groupId, optId, updates) => {
    set('modifierGroups', form.modifierGroups.map((g) =>
      g.id === groupId
        ? { ...g, options: g.options.map((o) => o.id === optId ? { ...o, ...updates } : o) }
        : g
    ));
  };

  const removeModOption = (groupId, optId) => {
    set('modifierGroups', form.modifierGroups.map((g) =>
      g.id === groupId ? { ...g, options: g.options.filter((o) => o.id !== optId) } : g
    ));
  };

  const removeModGroup = (groupId) => {
    set('modifierGroups', form.modifierGroups.filter((g) => g.id !== groupId));
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.price) {
      addToast({ type: 'error', message: 'Name and price are required' });
      return;
    }
    const data = {
      ...form,
      price: parseFloat(form.price),
      cost: parseFloat(form.cost) || 0,
      sortOrder: item?.sortOrder ?? 999,
    };
    if (isEdit) {
      updateItem(item.id, data);
      addToast({ type: 'success', message: `${form.name} updated!` });
    } else {
      addItem({ ...data, id: `item-${Date.now()}` });
      addToast({ type: 'success', message: `${form.name} added to menu!` });
    }
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 500, display: 'flex', justifyContent: 'flex-end' }}>
      <div className="slide-over" style={{ width: 520 }}>
        <div className="slide-over-header">
          <h2 className="modal-title">{isEdit ? 'Edit Item' : 'New Menu Item'}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close form">
            <X size={18} />
          </button>
        </div>

        <div className="slide-over-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Basic info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label" htmlFor="item-name">Item Name *</label>
              <input id="item-name" className="form-input" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Ribeye Steak 12oz" />
            </div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label" htmlFor="item-desc">Description</label>
              <textarea id="item-desc" className="form-textarea" value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Brief, appetizing description..." rows={2} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="item-category">Category</label>
              <select id="item-category" className="form-select" value={form.categoryId} onChange={(e) => set('categoryId', e.target.value)}>
                <option value="">Select category...</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="item-station">Kitchen Station</label>
              <select id="item-station" className="form-select" value={form.station} onChange={(e) => set('station', e.target.value)}>
                {['Grill', 'Cold', 'Bar', 'Expediter'].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="item-price">Price ($) *</label>
              <input id="item-price" className="form-input" type="number" min="0" step="0.50" value={form.price} onChange={(e) => set('price', e.target.value)} placeholder="0.00" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="item-cost">
                Cost ($)
                {marginPercent !== null && (
                  <span style={{ marginLeft: 8, color: marginPercent > 60 ? 'var(--success)' : marginPercent > 30 ? 'var(--warning)' : 'var(--danger)', fontWeight: 700 }}>
                    {marginPercent.toFixed(0)}% margin
                  </span>
                )}
              </label>
              <input id="item-cost" className="form-input" type="number" min="0" step="0.25" value={form.cost} onChange={(e) => set('cost', e.target.value)} placeholder="0.00" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="item-tax">Tax Class</label>
              <select id="item-tax" className="form-select" value={form.taxClass} onChange={(e) => set('taxClass', e.target.value)}>
                {Object.values(TAX_CLASS).map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="item-status">Status</label>
              <select id="item-status" className="form-select" value={form.status} onChange={(e) => set('status', e.target.value)}>
                <option value="active">Active</option>
                <option value="86d">86'd (Unavailable)</option>
              </select>
            </div>
          </div>

          {/* Dietary flags */}
          <div className="form-group">
            <label className="form-label">Dietary Flags</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {DIETARY_FLAGS.map((flag) => (
                <label key={flag} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', padding: '6px 10px', border: `1px solid ${form.dietaryFlags.includes(flag) ? 'var(--success)' : 'var(--border)'}`, borderRadius: 'var(--radius-full)', background: form.dietaryFlags.includes(flag) ? 'var(--success-muted)' : 'transparent', fontSize: 12 }}>
                  <input type="checkbox" checked={form.dietaryFlags.includes(flag)} onChange={() => toggleFlag(form.dietaryFlags, 'dietaryFlags', flag)} style={{ display: 'none' }} />
                  <span>{form.dietaryFlags.includes(flag) ? '✓ ' : ''}{flag}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Allergens */}
          <div className="form-group">
            <label className="form-label">Allergens</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {ALLERGENS.map((allergen) => (
                <label key={allergen} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', padding: '6px 10px', border: `1px solid ${form.allergens.includes(allergen) ? 'var(--danger)' : 'var(--border)'}`, borderRadius: 'var(--radius-full)', background: form.allergens.includes(allergen) ? 'var(--danger-muted)' : 'transparent', fontSize: 12 }}>
                  <input type="checkbox" checked={form.allergens.includes(allergen)} onChange={() => toggleFlag(form.allergens, 'allergens', allergen)} style={{ display: 'none' }} />
                  <span style={{ color: form.allergens.includes(allergen) ? 'var(--danger)' : undefined }}>
                    {form.allergens.includes(allergen) ? '⚠️ ' : ''}{allergen}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Modifier groups */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <label className="form-label">Modifier Groups</label>
              <button className="btn btn-secondary btn-sm" onClick={addModifierGroup} id="add-modifier-group">
                <Plus size={14} /> Add Group
              </button>
            </div>
            {form.modifierGroups.map((group) => (
              <div key={group.id} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', marginBottom: 10, overflow: 'hidden' }}>
                <div style={{ padding: '10px 14px', display: 'flex', gap: 8, alignItems: 'center', borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
                  <input className="form-input" style={{ flex: 1, height: 36 }} value={group.name} onChange={(e) => updateModGroup(group.id, { name: e.target.value })} placeholder="Group name" />
                  <select className="form-select" style={{ width: 120, height: 36 }} value={group.type} onChange={(e) => updateModGroup(group.id, { type: e.target.value })}>
                    <option value={MODIFIER_TYPE.REQUIRED}>Required</option>
                    <option value={MODIFIER_TYPE.OPTIONAL}>Optional</option>
                  </select>
                  <button className="btn btn-ghost btn-icon btn-sm" onClick={() => removeModGroup(group.id)} aria-label="Remove group">
                    <Trash2 size={14} style={{ color: 'var(--danger)' }} />
                  </button>
                </div>
                <div style={{ padding: '10px 14px' }}>
                  {group.options.map((opt) => (
                    <div key={opt.id} style={{ display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center' }}>
                      <input className="form-input" style={{ flex: 1, height: 34, fontSize: 13 }} value={opt.name} onChange={(e) => updateModOption(group.id, opt.id, { name: e.target.value })} placeholder="Option name" />
                      <input className="form-input" style={{ width: 70, height: 34, fontSize: 13 }} type="number" step="0.50" value={opt.priceModifier} onChange={(e) => updateModOption(group.id, opt.id, { priceModifier: parseFloat(e.target.value) || 0 })} placeholder="+$" />
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => removeModOption(group.id, opt.id)}>
                        <X size={12} style={{ color: 'var(--text-muted)' }} />
                      </button>
                    </div>
                  ))}
                  <button className="btn btn-ghost btn-sm" style={{ marginTop: 4 }} onClick={() => addModOption(group.id)}>
                    <Plus size={12} /> Add option
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="slide-over-footer">
          <button className="btn btn-secondary" onClick={onClose}>Discard</button>
          <button className="btn btn-primary" onClick={handleSave} id="save-item-btn">
            <Save size={16} /> {isEdit ? 'Save Changes' : 'Add Item'}
          </button>
        </div>
      </div>
    </div>
  );
}
