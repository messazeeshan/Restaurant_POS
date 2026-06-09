import React, { useState, useEffect } from 'react';
import { Plus, Minus, Trash2, FileText, Send } from 'lucide-react';
import useMenuStore from '../../store/useMenuStore.js';
import useOrderStore from '../../store/useOrderStore.js';
import useSettingsStore from '../../store/useSettingsStore.js';
import useNotificationStore from '../../store/useNotificationStore.js';
import { broadcast, SYNC_EVENTS } from '../../utils/sync.js';
import { playNewOrderTone } from '../../utils/audio.js';
import { sendOrderConfirmation } from '../../utils/messaging.js';
import { ORDER_STATUS, DEFAULTS } from '../../data/constants.js';
import { formatCurrency } from '../../utils/formatters.js';
import ModifierModal from '../pos/ModifierModal.jsx';

export default function WaiterCart({ table, isTakeaway, session, onSubmitted }) {
  const { categories, getItemsByCategory } = useMenuStore();
  const { createOrder, addItemToOrder, updateOrder, approvePendingOrder, markSmsSent } = useOrderStore();
  const { settings } = useSettingsStore();
  const { addNotification } = useNotificationStore();

  // Use category ID (not name) — getItemsByCategory filters by item.categoryId
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id || '');
  const [cart, setCart] = useState([]);
  const [note, setNote] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [modifierItem, setModifierItem] = useState(null);

  // Once categories load after parent bootstraps stores, set the first active
  useEffect(() => {
    if (!activeCategory && categories.length > 0) {
      setActiveCategory(categories[0].id);
    }
  }, [categories]);

  const taxRate = settings?.taxRate || DEFAULTS.TAX_RATE;
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  // Filter active items by categoryId. Also exclude status='86d' (menu manager marks them 86d)
  const menuItems = getItemsByCategory(activeCategory).filter(
    (i) => i.status === 'active' && i.available !== false
  );

  const addToCart = (menuItem, modifiers = []) => {
    const key = `${menuItem.id}-${JSON.stringify(modifiers)}`;
    setCart((prev) => {
      const idx = prev.findIndex((i) => i.key === key);
      if (idx >= 0) {
        return prev.map((i, x) => x === idx ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, {
        key,
        id:        `ci-${Date.now()}-${Math.random().toString(36).substr(2,5)}`,
        itemId:    menuItem.id,
        name:      menuItem.name,
        price:     menuItem.price,
        quantity:  1,
        modifiers,
      }];
    });
  };

  const handleItemTap = (menuItem) => {
    const hasRequired = menuItem.modifierGroups?.some((g) => g.required || g.type === 'REQUIRED');
    if (hasRequired) {
      setModifierItem(menuItem);
    } else {
      addToCart(menuItem);
    }
  };

  const changeQty = (key, delta) => {
    setCart((prev) => prev
      .map((i) => i.key === key ? { ...i, quantity: i.quantity + delta } : i)
      .filter((i) => i.quantity > 0)
    );
  };

  const handleSubmit = () => {
    if (cart.length === 0) return;
    const autoApprove = settings?.autoApproveWaiterOrders;
    const startStatus = autoApprove ? ORDER_STATUS.IN_KITCHEN : ORDER_STATUS.PENDING_ADMIN;

    const orderId = createOrder({
      tableId:             table?.id || null,
      serverId:            session.staffId,
      partySize:           1,
      type:                isTakeaway ? 'TAKEOUT' : 'DINE_IN',
      source:              'WAITER',
      specialInstructions: note,
      status:              startStatus,
    });

    // Add items
    cart.forEach((item) => {
      addItemToOrder(orderId, {
        id:        item.id,
        itemId:    item.itemId,
        name:      item.name,
        price:     item.price,
        quantity:  item.quantity,
        modifiers: item.modifiers,
        seatNumber: null,
        specialRequest: '',
      });
    });

    // Update totals
    updateOrder(orderId, { subtotal, tax, total });

    const order = { id: orderId, tableId: table?.id, total, source: 'WAITER', type: isTakeaway ? 'TAKEOUT' : 'DINE_IN' };

    // Send SMS
    sendOrderConfirmation(order);
    markSmsSent(orderId);

    // If auto-approve, also update sentToKitchenAt
    if (autoApprove) {
      approvePendingOrder(orderId, session.staffId);
    }

    broadcast(SYNC_EVENTS.ORDER_SUBMITTED, { orderId, autoApproved: autoApprove });

    addNotification({
      type:  'order',
      title: `New Waiter Order — ${table ? `Table ${table.number}` : 'Takeaway'}`,
      body:  `${session.name} · ${cart.length} item${cart.length !== 1 ? 's' : ''} · ${formatCurrency(total)}`,
    });

    onSubmitted(orderId);
  };

  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
      {/* Left: Menu */}
      <div style={{ flex: '0 0 55%', display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border)', overflow: 'hidden' }}>
        {/* Category tabs — use cat.id (matches item.categoryId) */}
        <div className="tabs-scroll" style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`tab-pill ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Items grid */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, alignContent: 'start' }}>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemTap(item)}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: 14,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'var(--transition)',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
                {item.name}
              </div>
              {item.description && (
                <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {item.description}
                </div>
              )}
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--accent)', marginTop: 4 }}>
                {formatCurrency(item.price)}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right: Cart */}
      <div style={{ flex: '0 0 45%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Cart header */}
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)', flexShrink: 0 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>
            {isTakeaway ? '🥡 Takeaway' : table ? `Table ${table.number}` : 'Order'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{cart.length} item{cart.length !== 1 ? 's' : ''}</div>
        </div>

        {/* Cart items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: 13 }}>
              Tap items on the left to add them
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</div>
                  {item.modifiers.length > 0 && (
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.modifiers.map((m) => m.name).join(', ')}</div>
                  )}
                  <div style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>{formatCurrency(item.price * item.quantity)}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button onClick={() => changeQty(item.key, -1)} style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--bg-subtle)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.quantity === 1 ? <Trash2 size={12} style={{ color: 'var(--danger)' }} /> : <Minus size={12} />}
                  </button>
                  <span style={{ fontSize: 14, fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{item.quantity}</span>
                  <button onClick={() => changeQty(item.key, 1)} style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--bg-subtle)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totals + actions */}
        <div style={{ borderTop: '1px solid var(--border)', padding: 16, flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>
            <span>Subtotal</span><span>{formatCurrency(subtotal)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-muted)', marginBottom: 10 }}>
            <span>Tax</span><span>{formatCurrency(tax)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: 'var(--text-primary)', marginBottom: 14 }}>
            <span>Total</span><span>{formatCurrency(total)}</span>
          </div>
          <button
            className="btn btn-sm btn-secondary"
            style={{ width: '100%', justifyContent: 'center', marginBottom: 10 }}
            onClick={() => setShowNoteModal(true)}
          >
            <FileText size={14} /> {note ? 'Edit Note' : 'Add Note'}
            {note && <span style={{ fontSize: 11, color: 'var(--warning)' }}> (added)</span>}
          </button>
          <button
            className="btn btn-primary btn-lg"
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={cart.length === 0}
            onClick={handleSubmit}
            id="waiter-submit-order-btn"
          >
            <Send size={16} /> Submit Order →
          </button>
        </div>
      </div>

      {/* Note modal */}
      {showNoteModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={() => setShowNoteModal(false)}
        >
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 24, width: '100%', maxWidth: 400 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 12, color: 'var(--text-primary)' }}>
              Special Instructions
            </div>
            <textarea
              className="form-textarea"
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Allergies, preferences, chef instructions…"
              autoFocus
              style={{ marginBottom: 14 }}
            />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowNoteModal(false)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* Modifier modal */}
      {modifierItem && (
        <ModifierModal
          item={modifierItem}
          onConfirm={(item, modifiers) => { addToCart(item, modifiers); setModifierItem(null); }}
          onClose={() => setModifierItem(null)}
        />
      )}
    </div>
  );
}
