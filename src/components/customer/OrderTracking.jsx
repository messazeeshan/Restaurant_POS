import React from 'react';
import { PlusCircle } from 'lucide-react';
import { ORDER_STATUS } from '../../data/constants.js';

const STEPS = [
  { key: ORDER_STATUS.PENDING_ADMIN, label: 'Order Received' },
  { key: ORDER_STATUS.IN_KITCHEN,    label: 'Sent to Kitchen' },
  { key: ORDER_STATUS.ACCEPTED,      label: 'Being Prepared' },
  { key: ORDER_STATUS.PREP_STARTED,  label: 'Cooking in Progress' },
  { key: ORDER_STATUS.READY,         label: 'Ready for Collection' },
];

function getStepIndex(status) {
  if (!status) return -1;
  const idx = STEPS.findIndex((s) => s.key === status);
  if (idx >= 0) return idx;
  if (status === ORDER_STATUS.CLOSED || status === ORDER_STATUS.PAID) return 4;
  return 0;
}

export default function OrderTracking({ orderId, orders, onNewOrder }) {
  const order = orders.find((o) => o.id === orderId);
  const currentStep = order ? getStepIndex(order.status) : 0;
  const shortId = orderId?.slice(-6).toUpperCase();

  if (order?.status === ORDER_STATUS.REJECTED) {
    return (
      <div style={{ width: '100vw', minHeight: '100dvh', background: '#FDFAF5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 }}>
        <div style={{ fontSize: 52 }}>❌</div>
        <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 22, color: '#1A1A1A' }}>Order Not Accepted</div>
        <div style={{ fontSize: 14, color: '#6B7280', textAlign: 'center', maxWidth: 320 }}>
          Your order was rejected: <strong>{order.rejectionReason}</strong>. Please speak to a staff member.
        </div>
        <button onClick={onNewOrder} style={{ marginTop: 8, padding: '12px 28px', background: '#1E5C3A', color: '#fff', border: 'none', borderRadius: 12, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
          Start New Order
        </button>
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', minHeight: '100dvh', background: '#FDFAF5', fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ background: '#1E5C3A', padding: '32px 24px 24px', color: '#fff', textAlign: 'center' }}>
        <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.7, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Order Confirmed</div>
        <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 28 }}>#{shortId}</div>
        <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>
          {order ? (order.tableId ? `Table ${order.tableId}` : 'Takeaway') : ''} · Est. {order?.estimatedMinutes || 25}–{(order?.estimatedMinutes || 25) + 5} min
        </div>
      </div>

      {/* Progress */}
      <div style={{ background: '#fff', margin: 20, borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', border: '1px solid #E8E0D5' }}>
        {STEPS.map((step, i) => {
          const done = i < currentStep;
          const active = i === currentStep;
          return (
            <div key={step.key} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: i < STEPS.length - 1 ? 0 : 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: done || active ? '#1E5C3A' : '#E8E0D5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  fontWeight: 700,
                  color: done || active ? '#fff' : '#9CA3AF',
                  flexShrink: 0,
                }}>
                  {done ? '✓' : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ width: 2, height: 28, background: done ? '#1E5C3A' : '#E8E0D5', margin: '4px 0' }} />
                )}
              </div>
              <div style={{ paddingTop: 4, paddingBottom: i < STEPS.length - 1 ? 28 : 0 }}>
                <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 15, color: active ? '#1E5C3A' : done ? '#1A1A1A' : '#9CA3AF' }}>
                  {step.label}
                  {active && <span style={{ marginLeft: 8, fontSize: 13, fontWeight: 500, color: '#6B7280' }}>← current</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Items */}
      {order && order.items.length > 0 && (
        <div style={{ background: '#fff', margin: '0 20px 20px', borderRadius: 16, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', border: '1px solid #E8E0D5' }}>
          <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 15, color: '#1A1A1A', marginBottom: 14 }}>Your Items</div>
          {order.items.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#4B5563', padding: '6px 0', borderBottom: '1px solid #F3F4F6' }}>
              <span>{item.quantity}× {item.name}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 17, color: '#1E5C3A', marginTop: 12, paddingTop: 12, borderTop: '1px solid #E8E0D5' }}>
            <span>Total</span>
            <span>${(order.total || 0).toFixed(2)}</span>
          </div>
        </div>
      )}

      <div style={{ textAlign: 'center', padding: '0 20px 40px' }}>
        <button
          onClick={onNewOrder}
          style={{ padding: '12px 28px', background: '#fff', color: '#1E5C3A', border: '2px solid #1E5C3A', borderRadius: 12, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          <PlusCircle size={16} /> Place Another Order
        </button>
      </div>
    </div>
  );
}
