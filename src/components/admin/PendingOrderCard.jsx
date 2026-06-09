import React from 'react';
import { CheckCircle, XCircle, Clock, MessageSquare } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';

const SOURCE_BADGE = {
  'Uber Eats': { bg: '#000', color: '#06C167', label: '🛵 Uber Eats' },
  'Website':   { bg: '#2563EB', color: '#fff', label: '🌐 Website' },
  'WAITER':    { bg: 'var(--accent)', color: '#fff', label: '👤 Waiter' },
  'CUSTOMER_UI': { bg: '#7C3AED', color: '#fff', label: '📱 Customer' },
  'POS':       { bg: 'var(--bg-subtle)', color: 'var(--text-secondary)', label: '🖥 POS' },
};

function elapsed(ts) {
  if (!ts) return '—';
  const mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 1) return 'Just now';
  if (mins === 1) return '1 min ago';
  return `${mins} min ago`;
}

export default function PendingOrderCard({ order, onApprove, onReject }) {
  const badge = SOURCE_BADGE[order.source] || SOURCE_BADGE['POS'];

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 20px',
        background: 'var(--bg-subtle)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            background: badge.bg,
            color: badge.color,
            fontSize: 11,
            fontWeight: 700,
            padding: '3px 10px',
            borderRadius: 'var(--radius-full)',
          }}>
            {badge.label}
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>
            {order.tableId ? `Table ${order.tableId}` : order.customerName || 'Takeaway'}
          </span>
          {order.serverId && (
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              · Server: {order.serverId}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
          <Clock size={13} />
          {elapsed(order.submittedAt || order.createdAt)}
        </div>
      </div>

      {/* Items */}
      <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
        {order.items.length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No items yet</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {order.items.map((item, i) => (
              <div key={item.id || i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: 'var(--text-primary)' }}>
                  <strong style={{ fontFamily: 'var(--font-display)' }}>{item.quantity}×</strong> {item.name}
                  {item.modifiers?.length > 0 && (
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 6 }}>
                      ({item.modifiers.map((m) => m.name).join(', ')})
                    </span>
                  )}
                </span>
                <span style={{ color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
                  {formatCurrency((item.price || 0) * (item.quantity || 1))}
                </span>
              </div>
            ))}
          </div>
        )}
        {order.specialInstructions && (
          <div style={{
            marginTop: 10,
            padding: '8px 12px',
            background: 'var(--warning-bg)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 12,
            color: 'var(--warning)',
            display: 'flex',
            gap: 6,
            alignItems: 'flex-start',
          }}>
            <MessageSquare size={13} style={{ flexShrink: 0, marginTop: 1 }} />
            {order.specialInstructions}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 20px',
      }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--text-primary)' }}>
          {formatCurrency(order.total || order.subtotal || 0)}
          {order.smsConfirmationSent && (
            <span style={{ marginLeft: 10, fontSize: 11, color: 'var(--success)', fontWeight: 500 }}>📱 SMS sent</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="btn btn-danger btn-sm"
            onClick={onReject}
            id={`reject-order-${order.id}`}
          >
            <XCircle size={15} /> Reject
          </button>
          <button
            className="btn btn-primary"
            onClick={onApprove}
            id={`approve-order-${order.id}`}
          >
            <CheckCircle size={15} /> Approve →
          </button>
        </div>
      </div>
    </div>
  );
}
