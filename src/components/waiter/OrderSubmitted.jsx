import React, { useState } from 'react';
import { CheckCircle, PlusCircle, CreditCard } from 'lucide-react';
import { ORDER_STATUS, ORDER_STATUS_LABELS } from '../../data/constants.js';
import { formatCurrency } from '../../utils/formatters.js';
import PaymentModal from '../pos/PaymentModal.jsx';

const STATUS_DOT = {
  [ORDER_STATUS.PENDING_ADMIN]: { color: 'var(--warning)',   label: 'Pending Approval' },
  [ORDER_STATUS.IN_KITCHEN]:    { color: 'var(--info)',      label: 'In Kitchen' },
  [ORDER_STATUS.ACCEPTED]:      { color: 'var(--success)',   label: 'Being Prepared' },
  [ORDER_STATUS.PREP_STARTED]:  { color: 'var(--warning)',   label: '👨‍🍳 Cooking...' },
  [ORDER_STATUS.READY]:         { color: 'var(--success)',   label: '🍽 Ready!' },
  [ORDER_STATUS.PAID]:          { color: 'var(--info)',      label: 'Paid' },
  [ORDER_STATUS.REJECTED]:      { color: 'var(--danger)',    label: 'Rejected' },
  [ORDER_STATUS.CLOSED]:        { color: 'var(--text-muted)', label: 'Closed' },
};

export default function OrderSubmitted({ orderId, orders, onNewOrder }) {
  const order = orders.find((o) => o.id === orderId);
  const statusInfo = order ? (STATUS_DOT[order.status] || { color: 'var(--text-muted)', label: order.status }) : null;
  const [showPayment, setShowPayment] = useState(false);

  const isReady = order?.status === ORDER_STATUS.READY;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '40px 24px', gap: 24 }}>
      <div style={{ textAlign: 'center' }}>
        <CheckCircle size={56} style={{ color: 'var(--success)' }} />
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginTop: 12 }}>
          Order Submitted!
        </div>
        <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
          Waiting for manager approval
        </div>
      </div>

      {/* Order status card */}
      {order && (
        <div className="card" style={{ width: '100%', maxWidth: 480 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>
              {order.tableId ? `Table ${order.tableId}` : 'Takeaway'}
            </div>
            {statusInfo && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: statusInfo.color }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: statusInfo.color, display: 'inline-block' }} />
                {statusInfo.label}
              </div>
            )}
          </div>

          {order.items.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)', padding: '4px 0' }}>
              <span>{item.quantity}× {item.name}</span>
              <span>{formatCurrency(item.price * item.quantity)}</span>
            </div>
          ))}

          {order.rejectionReason && (
            <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--danger-bg)', borderRadius: 'var(--radius-sm)', fontSize: 13, color: 'var(--danger)' }}>
              ❌ Rejected: {order.rejectionReason}
            </div>
          )}

          <div style={{ borderTop: '1px solid var(--border)', marginTop: 12, paddingTop: 12, display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: 'var(--text-primary)' }}>
            <span>Total</span>
            <span>{formatCurrency(order.total || 0)}</span>
          </div>

          {/* Take Payment — only when READY and not yet paid */}
          {isReady && (
            <button
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: 14 }}
              onClick={() => setShowPayment(true)}
              id="waiter-take-payment-btn"
            >
              <CreditCard size={16} /> Take Payment
            </button>
          )}
        </div>
      )}

      <button
        className="btn btn-primary btn-lg"
        onClick={onNewOrder}
        id="waiter-new-order-btn"
      >
        <PlusCircle size={18} /> Start New Order
      </button>

      {/* Reuse the manager PaymentModal */}
      {showPayment && order && (
        <PaymentModal
          orderId={order.id}
          tableId={order.tableId}
          onClose={() => setShowPayment(false)}
        />
      )}
    </div>
  );
}
