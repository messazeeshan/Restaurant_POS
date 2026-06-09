import React, { useState } from 'react';
import useOrderStore from '../../store/useOrderStore.js';
import { ORDER_STATUS } from '../../data/constants.js';

export default function DeliveryOrderCard({ order }) {
  const { transitionOrderStatus, rejectOrder, closeOrder } = useOrderStore();
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Source colors
  let sourceColor = '#6b7280'; // gray
  const lowerSource = (order.source || '').toLowerCase();
  if (lowerSource.includes('uber')) sourceColor = '#22c55e'; // green
  if (lowerSource.includes('door')) sourceColor = '#ef4444'; // red
  if (lowerSource.includes('direct') || lowerSource.includes('online')) sourceColor = '#3b82f6'; // blue

  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <div style={{ padding: '16px', background: sourceColor, color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {order.source || 'Delivery'}
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.9 }}>
          {order.id}
        </div>
      </div>

      <div style={{ padding: 16, flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>
              {order.customerName || 'Guest'}
            </div>
            {order.phone && <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{order.phone}</div>}
          </div>
          <div style={{ background: 'var(--bg-elevated)', padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>
            {order.status}
          </div>
        </div>

        {/* Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {order.items.map((item, idx) => (
            <div key={idx}>
              <div style={{ display: 'flex', gap: 8, fontSize: 14, color: 'var(--text-primary)' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>{item.quantity}×</span>
                <span>{item.name}</span>
              </div>
              {item.modifiers?.map((m, midx) => (
                <div key={midx} style={{ marginLeft: 24, fontSize: 12, color: 'var(--text-muted)' }}>
                  · {m.name}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Footer Actions */}
      <div style={{ padding: 16, background: 'var(--bg-base)', borderTop: '1px solid var(--border)' }}>
        {rejecting ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <input 
              type="text" 
              placeholder="Reason for rejection..." 
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="form-input"
              style={{ flex: 1 }}
            />
            <button className="btn btn-secondary" onClick={() => setRejecting(false)}>Cancel</button>
            <button className="btn btn-danger" onClick={() => {
              if (!rejectReason.trim()) {
                alert('Please provide a reason');
                return;
              }
              rejectOrder(order.id, rejectReason, null);
              setRejecting(false);
            }}>Confirm</button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            {order.status === ORDER_STATUS.PENDING_ADMIN && (
              <div style={{ flex: 1, textAlign: 'center', fontSize: 13, color: 'var(--warning)', padding: '8px 0', fontWeight: 600 }}>
                ⏳ Awaiting Manager Approval in Orders Tab
              </div>
            )}

            {(order.status === ORDER_STATUS.IN_KITCHEN || order.status === ORDER_STATUS.ACCEPTED || order.status === ORDER_STATUS.PREP_STARTED) && (
              <div style={{ flex: 1, textAlign: 'center', fontSize: 13, color: 'var(--info)', padding: '8px 0', fontWeight: 600 }}>
                👨‍🍳 Being prepared in Kitchen
              </div>
            )}

            {order.status === ORDER_STATUS.READY && (
              <button 
                className="btn btn-success" 
                style={{ flex: 1 }} 
                onClick={() => closeOrder(order.id)}
              >
                Complete Delivery
              </button>
            )}

            {(order.status === ORDER_STATUS.CLOSED || order.status === ORDER_STATUS.PAID || order.status === ORDER_STATUS.REJECTED || order.status === ORDER_STATUS.VOID) && (
              <div style={{ flex: 1, textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', padding: '8px 0' }}>
                Order {order.status === ORDER_STATUS.REJECTED ? 'Rejected' : order.status === ORDER_STATUS.VOID ? 'Voided' : 'Completed'}
                {order.rejectionReason && ` - ${order.rejectionReason}`}
              </div>
            )}
            
            {/* Allow rejecting if it's pending */}
            {order.status === ORDER_STATUS.PENDING_ADMIN && (
              <button 
                className="btn btn-secondary btn-sm" 
                style={{ color: 'var(--danger)' }}
                onClick={() => setRejecting(true)}
              >
                Reject
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
