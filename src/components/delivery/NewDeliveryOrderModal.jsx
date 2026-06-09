import React, { useState } from 'react';
import { X, ShoppingBag } from 'lucide-react';
import MenuGrid from '../pos/MenuGrid.jsx';
import ModifierModal from '../pos/ModifierModal.jsx';
import useOrderStore from '../../store/useOrderStore.js';
import { ORDER_TYPE, ORDER_STATUS } from '../../data/constants.js';
import { formatCurrency } from '../../utils/formatters.js';
import { broadcast, SYNC_EVENTS } from '../../utils/sync.js';

const SOURCES = ['Direct / Phone', 'Uber Eats', 'DoorDash', 'Talabat', 'Website', 'Manual'];

export default function NewDeliveryOrderModal({ onClose }) {
  const { createOrder, addItemToOrder, updateOrder } = useOrderStore();
  const [items, setItems] = useState([]);
  const [modifierModalItem, setModifierModalItem] = useState(null);

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [orderType, setOrderType] = useState(ORDER_TYPE.DELIVERY);
  const [source, setSource] = useState('Direct / Phone');
  const [address, setAddress] = useState('');
  const [estTime, setEstTime] = useState('20');
  const [instructions, setInstructions] = useState('');

  const handleItemSelect = (item) => {
    if (item.modifierGroups?.length > 0) {
      setModifierModalItem({ ...item, internalId: Date.now().toString() });
    } else {
      handleAddItem(item, [], '', 1);
    }
  };

  const handleAddItem = (item, selectedModifiers, specialRequest, quantity = 1) => {
    const newItem = {
      id: `${item.id}-${Date.now()}`,
      itemId: item.id,
      name: item.name,
      price: item.price,
      quantity,
      modifiers: selectedModifiers,
      specialRequest,
    };
    setItems((prev) => [...prev, newItem]);
    setModifierModalItem(null);
  };

  const removeItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!customerName.trim()) {
      alert('Please enter a customer name.');
      return;
    }
    if (items.length === 0) {
      alert('Please add at least one item.');
      return;
    }

    const orderId = createOrder({
      type:                orderType,
      source:              source.replace(' / Phone', ''),
      customerName:        customerName.trim(),
      phone:               phone.trim(),
      address:             address.trim(),
      specialInstructions: instructions.trim(),
      status:              ORDER_STATUS.PENDING_ADMIN,
      prePaid:             false,
    });

    // Add items
    items.forEach((item) => {
      addItemToOrder(orderId, {
        id:             item.id,
        itemId:         item.itemId,
        name:           item.name,
        price:          item.price,
        quantity:       item.quantity,
        modifiers:      item.modifiers || [],
        specialRequest: item.specialRequest || '',
        seatNumber:     null,
      });
    });

    // Write totals
    updateOrder(orderId, { subtotal, tax, total });

    // Broadcast so the Orders section badge updates immediately
    broadcast(SYNC_EVENTS.ORDER_SUBMITTED, { orderId });

    onClose();
  };

  const subtotal = items.reduce((sum, item) => {
    const modsTotal = (item.modifiers || []).reduce((s, m) => s + (m.priceModifier || 0), 0);
    return sum + (item.price + modsTotal) * item.quantity;
  }, 0);
  const tax = subtotal * 0.085;
  const total = subtotal + tax;

  const labelStyle = {
    display: 'block',
    fontSize: 10,
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--text-muted)',
    marginBottom: 5,
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid var(--border)',
    borderRadius: 8,
    background: 'var(--bg-elevated)',
    color: 'var(--text-primary)',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <>
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 999,
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: '92vw',
            maxWidth: 1100,
            height: '88vh',
            maxHeight: 800,
            background: 'var(--bg-base)',
            borderRadius: 16,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
          }}
        >
          {/* Header */}
          <div style={{ flexShrink: 0, padding: '20px 24px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, margin: 0 }}>
              Create Delivery / Online Order
            </h2>
            <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close"><X size={20} /></button>
          </div>

          {/* Body */}
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>

            {/* Left: Menu Grid */}
            <div style={{ flex: '1 1 60%', minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRight: '1px solid var(--border)', background: 'var(--bg-base)' }}>
              <MenuGrid onItemSelect={handleItemSelect} />
            </div>

            {/* Right: Order Form */}
            <div style={{ flex: '0 0 340px', minWidth: 340, maxWidth: 340, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg-surface)' }}>

              {/* Scrollable fields */}
              <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>

                {/* Order Type */}
                <div>
                  <label style={labelStyle}>Order Type</label>
                  <select style={inputStyle} value={orderType} onChange={e => setOrderType(e.target.value)}>
                    <option value={ORDER_TYPE.DELIVERY}>Delivery</option>
                    <option value={ORDER_TYPE.ONLINE}>Pickup (Online)</option>
                  </select>
                </div>

                {/* Platform / Source */}
                {orderType === ORDER_TYPE.DELIVERY && (
                  <div>
                    <label style={labelStyle}>Platform / Source</label>
                    <select style={inputStyle} value={source} onChange={e => setSource(e.target.value)}>
                      {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                )}

                {/* Customer Name */}
                <div>
                  <label style={labelStyle}>Customer Name</label>
                  <input
                    style={inputStyle}
                    type="text"
                    placeholder="John Doe"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label style={labelStyle}>Phone</label>
                  <input
                    style={inputStyle}
                    type="text"
                    placeholder="(555) 123-4567"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                  />
                </div>

                {/* Delivery Address */}
                {orderType === ORDER_TYPE.DELIVERY && (
                  <div>
                    <label style={labelStyle}>Delivery Address</label>
                    <textarea
                      style={{ ...inputStyle, resize: 'none' }}
                      rows={3}
                      placeholder="123 Main St, Apt 4B..."
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                    />
                  </div>
                )}

                {/* Estimated Time */}
                <div>
                  <label style={labelStyle}>Estimated Time</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      style={{ ...inputStyle, width: 'auto', flex: 1 }}
                      type="number"
                      min="5"
                      max="120"
                      value={estTime}
                      onChange={e => setEstTime(e.target.value)}
                    />
                    <span style={{ fontSize: 13, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>minutes</span>
                  </div>
                </div>

                {/* Special Instructions */}
                <div>
                  <label style={labelStyle}>Special Instructions</label>
                  <textarea
                    style={{ ...inputStyle, resize: 'none' }}
                    rows={2}
                    placeholder="e.g. Ring doorbell, extra napkins..."
                    value={instructions}
                    onChange={e => setInstructions(e.target.value)}
                  />
                </div>

                {/* Order Items */}
                <div>
                  <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ShoppingBag size={13} /> Order Items
                  </label>

                  {items.length === 0 ? (
                    <div style={{ minHeight: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--border)', borderRadius: 8, padding: 16, gap: 6 }}>
                      <ShoppingBag size={24} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>No items yet</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>Tap a menu item on the left to add it</div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {items.map((item, idx) => (
                        <div key={idx} style={{ padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--bg-elevated)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: 13, wordBreak: 'break-word' }}>{item.quantity}× {item.name}</div>
                            {(item.modifiers || []).map((m, midx) => (
                              <div key={midx} style={{ fontSize: 11, color: 'var(--text-muted)' }}>· {m.name}</div>
                            ))}
                            {item.specialRequest && <div style={{ fontSize: 11, color: 'var(--warning)', marginTop: 2 }}>📝 {item.specialRequest}</div>}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                            <span style={{ fontWeight: 700, fontSize: 13 }}>
                              {formatCurrency((item.price + (item.modifiers || []).reduce((s, m) => s + (m.priceModifier || 0), 0)) * item.quantity)}
                            </span>
                            <button
                              style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: 11, cursor: 'pointer', padding: 0 }}
                              onClick={() => removeItem(idx)}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Totals */}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)' }}>
                    <span>Subtotal</span><span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)' }}>
                    <span>Tax (8.5%)</span><span>{formatCurrency(tax)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: 'var(--text-primary)', marginTop: 4 }}>
                    <span>Total</span><span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>

              {/* Sticky Create button */}
              <div style={{ flexShrink: 0, padding: '12px 16px', borderTop: '1px solid var(--border)', background: 'var(--bg-base)' }}>
                <button
                  style={{ width: '100%', height: 48, background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}
                  onClick={handleSubmit}
                >
                  Create Order
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {modifierModalItem && (
        <ModifierModal
          item={modifierModalItem}
          onClose={() => setModifierModalItem(null)}
          onConfirm={(mods, req, qty) => handleAddItem(modifierModalItem, mods, req, qty)}
        />
      )}
    </>
  );
}
