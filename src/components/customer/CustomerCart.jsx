import React, { useState } from 'react';
import { X, Minus, Plus } from 'lucide-react';
import useOrderStore from '../../store/useOrderStore.js';
import useSettingsStore from '../../store/useSettingsStore.js';
import useNotificationStore from '../../store/useNotificationStore.js';
import { broadcast, SYNC_EVENTS } from '../../utils/sync.js';
import { sendOrderConfirmation } from '../../utils/messaging.js';
import { ORDER_STATUS, DEFAULTS, PAYMENT_METHOD } from '../../data/constants.js';

const PAYMENT_METHODS = [
  { id: PAYMENT_METHOD.CARD,   label: 'Card',   emoji: '💳' },
  { id: PAYMENT_METHOD.CASH,   label: 'Cash',   emoji: '💵' },
  { id: PAYMENT_METHOD.MOBILE, label: 'Mobile', emoji: '📱' },
];

export default function CustomerCart({ cart, setCart, selectedTableId, isTakeaway, onClose, onOrderPlaced }) {
  const { createOrder, addItemToOrder, updateOrder, markSmsSent } = useOrderStore();
  const { settings } = useSettingsStore();
  const { addNotification } = useNotificationStore();

  // phase: review | pay | done
  const [phase, setPhase] = useState('review');
  const [payMethod, setPayMethod] = useState(null);
  const [processing, setProcessing] = useState(false);

  const taxRate = settings?.taxRate || DEFAULTS.TAX_RATE;
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  const changeQty = (key, delta) => {
    setCart((prev) =>
      prev.map((i) => i.key === key ? { ...i, quantity: i.quantity + delta } : i)
          .filter((i) => i.quantity > 0)
    );
  };

  const handleConfirmPayment = async () => {
    if (!payMethod) return;
    setProcessing(true);

    // Always start as PENDING_ADMIN so kitchen can track the full flow
    const orderId = createOrder({
      tableId:   isTakeaway ? null : selectedTableId || null,
      serverId:  null,
      partySize: 1,
      type:      isTakeaway ? 'TAKEOUT' : 'DINE_IN',
      source:    'CUSTOMER_UI',
      prePaid:   true,
      status:    ORDER_STATUS.PENDING_ADMIN,
    });

    cart.forEach((item) => {
      addItemToOrder(orderId, {
        id: item.id, itemId: item.itemId, name: item.name,
        price: item.price, quantity: item.quantity, modifiers: item.modifiers,
        seatNumber: null, specialRequest: '',
      });
    });

    // Stamp payment info now (for revenue tracking) but keep order alive in kitchen
    updateOrder(orderId, {
      paymentMethod: payMethod,
      paidAt:        Date.now(),
      total,
      subtotal,
      tax,
      tip:        0,
      tipPercent: 0,
    });

    // Leave as PENDING_ADMIN — manager must approve in Orders section before kitchen sees it

    sendOrderConfirmation({ id: orderId, tableId: selectedTableId, total, source: 'CUSTOMER_UI' });
    markSmsSent(orderId);
    broadcast(SYNC_EVENTS.ORDER_SUBMITTED, { orderId });
    addNotification({
      type: 'order',
      title: `Customer Order — ${isTakeaway ? 'Takeaway' : selectedTableId ? `Table ${selectedTableId}` : 'Dine-in'}`,
      body: `${cart.length} items · $${total.toFixed(2)}`,
    });

    setProcessing(false);
    setPhase('done');
    setTimeout(() => onOrderPlaced(orderId), 1000);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex' }}>
      {/* Backdrop */}
      <div style={{ flex: 1, background: 'rgba(0,0,0,0.4)' }} onClick={phase === 'review' ? onClose : undefined} />

      {/* Panel */}
      <div style={{ width: 420, maxWidth: '92vw', background: '#fff', height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 32px rgba(0,0,0,0.15)' }}>
        {/* Header */}
        <div style={{ padding: '18px 22px', borderBottom: '1px solid #E8E0D5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 17, color: '#1A1A1A' }}>
            {phase === 'review' ? 'Your Order' : phase === 'pay' ? 'Choose Payment' : '✅ Order Placed!'}
          </div>
          {phase === 'review' && (
            <button onClick={onClose} style={{ border: 'none', background: '#F3F4F6', borderRadius: 8, padding: 8, cursor: 'pointer', display: 'flex' }}>
              <X size={18} color="#6B7280" />
            </button>
          )}
        </div>

        {/* ── REVIEW ── */}
        {phase === 'review' && (
          <>
            <div style={{ flex: 1, overflowY: 'auto', padding: '14px 22px' }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#9CA3AF', fontSize: 14 }}>Your cart is empty</div>
              ) : cart.map((item) => (
                <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #F3F4F6' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>{item.name}</div>
                    {item.modifiers?.length > 0 && <div style={{ fontSize: 12, color: '#9CA3AF' }}>{item.modifiers.map((m) => m.name).join(', ')}</div>}
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1E5C3A', marginTop: 2 }}>${(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button onClick={() => changeQty(item.key, -1)} style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid #E8E0D5', background: '#F9FAFB', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>−</button>
                    <span style={{ fontWeight: 700, minWidth: 18, textAlign: 'center' }}>{item.quantity}</span>
                    <button onClick={() => changeQty(item.key, 1)} style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid #E8E0D5', background: '#F9FAFB', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>+</button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: '14px 22px', borderTop: '1px solid #E8E0D5', flexShrink: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6B7280', marginBottom: 5 }}><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6B7280', marginBottom: 12 }}><span>Tax</span><span>${tax.toFixed(2)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 19, color: '#1A1A1A', marginBottom: 14 }}><span>Total</span><span>${total.toFixed(2)}</span></div>
              <button
                onClick={() => setPhase('pay')}
                disabled={cart.length === 0 || (!isTakeaway && !selectedTableId)}
                id="customer-proceed-pay-btn"
                style={{ width: '100%', padding: 14, background: '#1E5C3A', color: '#fff', border: 'none', borderRadius: 12, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 15, cursor: 'pointer', opacity: (cart.length === 0 || (!isTakeaway && !selectedTableId)) ? 0.5 : 1 }}
              >
                Proceed to Payment →
              </button>
              {!isTakeaway && !selectedTableId && <div style={{ textAlign: 'center', fontSize: 12, color: '#EF4444', marginTop: 8 }}>Select a table or choose Takeaway first</div>}
            </div>
          </>
        )}

        {/* ── PAY ── */}
        {phase === 'pay' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px 22px', gap: 12 }}>
            <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 4 }}>Total due: <strong style={{ color: '#1E5C3A', fontSize: 16 }}>${total.toFixed(2)}</strong></div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', marginBottom: 4 }}>Choose payment method:</div>
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m.id}
                onClick={() => setPayMethod(m.id)}
                id={`customer-pay-${m.id}`}
                style={{
                  padding: '14px 18px',
                  border: payMethod === m.id ? '2px solid #1E5C3A' : '2px solid #E8E0D5',
                  borderRadius: 12,
                  background: payMethod === m.id ? '#F0FDF4' : '#fff',
                  display: 'flex', alignItems: 'center', gap: 12,
                  cursor: 'pointer', fontWeight: 600, fontSize: 15, color: '#1A1A1A',
                }}
              >
                <span style={{ fontSize: 22 }}>{m.emoji}</span> {m.label}
                {payMethod === m.id && <span style={{ marginLeft: 'auto', color: '#1E5C3A' }}>✓</span>}
              </button>
            ))}
            <div style={{ flex: 1 }} />
            <button
              onClick={handleConfirmPayment}
              disabled={!payMethod || processing}
              id="customer-confirm-pay-btn"
              style={{ padding: 14, background: payMethod ? '#1E5C3A' : '#D1D5DB', color: '#fff', border: 'none', borderRadius: 12, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 16, cursor: payMethod ? 'pointer' : 'not-allowed' }}
            >
              {processing ? 'Processing…' : `Pay $${total.toFixed(2)}`}
            </button>
            <button onClick={() => setPhase('review')} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 13 }}>← Back</button>
          </div>
        )}

        {/* ── DONE ── */}
        {phase === 'done' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: 32 }}>
            <span style={{ fontSize: 60 }}>✅</span>
            <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 20, color: '#1A1A1A', textAlign: 'center' }}>Payment Confirmed!</div>
            <div style={{ fontSize: 13, color: '#6B7280', textAlign: 'center' }}>Your order is being prepared. Track it on the next screen.</div>
          </div>
        )}
      </div>
    </div>
  );
}
