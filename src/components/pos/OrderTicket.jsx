import React, { useState } from 'react';
import { Trash2, ChevronDown, ChevronUp, Users } from 'lucide-react';
import useOrderStore from '../../store/useOrderStore.js';
import useStaffStore from '../../store/useStaffStore.js';
import { ORDER_STATUS } from '../../data/constants.js';
import { formatCurrency } from '../../utils/formatters.js';
import { calcOrderTotals, calcItemTotal } from '../../utils/calculations.js';

/**
 * OrderTicket — left panel showing current order items, totals, and actions
 * @param {{
 *   orderId: string,
 *   tableId: string,
 *   onSendToKitchen: () => void,
 *   onPayNow: () => void,
 *   onHold: () => void,
 *   seatMode: boolean,
 *   onToggleSeatMode: () => void,
 *   activeSeat: number,
 *   onSetActiveSeat: (n: number) => void,
 *   partySize: number
 * }} props
 */
export default function OrderTicket({
  orderId,
  tableId,
  onSendToKitchen,
  onPayNow,
  onHold,
  seatMode,
  onToggleSeatMode,
  activeSeat,
  onSetActiveSeat,
  partySize = 4,
}) {
  const { getOrderById, updateItemQuantity, removeItemFromOrder } = useOrderStore();
  const { getStaffById } = useStaffStore();

  const [expandedItemId, setExpandedItemId] = useState(null);
  const [sendingState, setSendingState] = useState(null); // null | 'loading' | 'sent'

  const order = getOrderById(orderId);
  if (!order) return null;

  const server = order.serverId ? getStaffById(order.serverId) : null;
  const totals = calcOrderTotals(order.items, { taxRate: 0.085, tipPercent: order.tipPercent || 0 });

  const isSent = order.status !== ORDER_STATUS.DRAFT;
  const isPendingApproval = order.status === ORDER_STATUS.PENDING_ADMIN;
  // Can only pay once order is in kitchen or beyond (not while waiting for approval)
  const canPay = [
    ORDER_STATUS.IN_KITCHEN,
    ORDER_STATUS.ACCEPTED,
    ORDER_STATUS.READY,
  ].includes(order.status);

  const handleSendToKitchen = async () => {
    if (order.items.length === 0) return;
    setSendingState('loading');
    await new Promise((r) => setTimeout(r, 800));
    setSendingState('sent');
    onSendToKitchen();
    setTimeout(() => setSendingState(null), 2000);
  };

  // Seat buttons
  const seatNumbers = Array.from({ length: partySize }, (_, i) => i + 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div className="ticket-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>
              {tableId ? `Table ${tableId}` : 'Takeout Order'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              {server ? `${server.name}` : ''}
              {partySize ? ` · ${partySize} covers` : ''}
            </div>
          </div>
          <span className={`badge ${isSent ? 'badge-info' : 'badge-muted'}`}>
            {isSent ? order.status.replace('_', ' ') : 'Draft'}
          </span>
        </div>

        {/* Seat mode toggle */}
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            className={`btn btn-sm ${seatMode ? 'btn-primary' : 'btn-secondary'}`}
            onClick={onToggleSeatMode}
            id="seat-mode-toggle"
          >
            <Users size={14} />
            {seatMode ? 'Seat Mode ON' : 'Seat Mode'}
          </button>
          {seatMode && (
            <div style={{ display: 'flex', gap: 4 }}>
              {seatNumbers.map((s) => (
                <button
                  key={s}
                  onClick={() => onSetActiveSeat(s)}
                  style={{
                    width: 28,
                    height: 28,
                    border: `2px solid ${activeSeat === s ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-xs)',
                    background: activeSeat === s ? 'var(--accent-muted)' : 'transparent',
                    color: activeSeat === s ? 'var(--accent)' : 'var(--text-secondary)',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                  }}
                  aria-label={`Seat ${s}`}
                  id={`seat-btn-${s}`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="ticket-items">
        {order.items.length === 0 ? (
          <div className="empty-state" style={{ padding: '40px 20px' }}>
            <div style={{ fontSize: 36 }}>🛒</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8, textAlign: 'center' }}>
              Tap a menu item<br />to start the order
            </div>
          </div>
        ) : (
          order.items.map((item) => {
            const isExpanded = expandedItemId === item.id;
            const itemPrice = calcItemTotal(item);
            return (
              <div key={item.id} className="ticket-item" onClick={() => setExpandedItemId(isExpanded ? null : item.id)}>
                {/* Qty controls */}
                <div className="ticket-item-qty">
                  <button
                    className="qty-btn"
                    onClick={(e) => { e.stopPropagation(); updateItemQuantity(orderId, item.id, item.quantity - 1); }}
                    aria-label="Decrease quantity"
                    id={`qty-dec-${item.id}`}
                  >−</button>
                  <span className="qty-num">{item.quantity}</span>
                  <button
                    className="qty-btn"
                    onClick={(e) => { e.stopPropagation(); updateItemQuantity(orderId, item.id, item.quantity + 1); }}
                    aria-label="Increase quantity"
                    id={`qty-inc-${item.id}`}
                  >+</button>
                </div>

                {/* Details */}
                <div className="ticket-item-details">
                  <div className="ticket-item-name">{item.name}</div>
                  {item.modifiers.length > 0 && (
                    <div className="ticket-item-mods">
                      {item.modifiers.map((m) => m.name).join(', ')}
                    </div>
                  )}
                  {item.specialRequest && (
                    <div style={{ fontSize: 10, color: 'var(--warning)', marginTop: 1 }}>📝 {item.specialRequest}</div>
                  )}
                  {seatMode && item.seatNumber && (
                    <div style={{ fontSize: 10, color: 'var(--info)', marginTop: 1 }}>Seat {item.seatNumber}</div>
                  )}

                  {/* Expanded: remove button */}
                  {isExpanded && (
                    <button
                      className="btn btn-danger btn-sm"
                      style={{ marginTop: 6 }}
                      onClick={(e) => { e.stopPropagation(); removeItemFromOrder(orderId, item.id); setExpandedItemId(null); }}
                      id={`remove-item-${item.id}`}
                    >
                      <Trash2 size={12} /> Remove
                    </button>
                  )}
                </div>

                {/* Price + expand icon */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                  <span className="ticket-item-price">{formatCurrency(itemPrice)}</span>
                  {isExpanded ? <ChevronUp size={14} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Totals */}
      <div className="ticket-totals">
        <div className="ticket-total-row">
          <span>Subtotal</span>
          <span>{formatCurrency(totals.subtotal)}</span>
        </div>
        <div className="ticket-total-row">
          <span>Tax (8.5%)</span>
          <span>{formatCurrency(totals.tax)}</span>
        </div>
        {totals.tip > 0 && (
          <div className="ticket-total-row">
            <span>Tip ({totals.tipPercent}%)</span>
            <span>{formatCurrency(totals.tip)}</span>
          </div>
        )}
        <div className="ticket-total-row grand-total">
          <span>Total</span>
          <span style={{ color: 'var(--accent)' }}>{formatCurrency(totals.total)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="ticket-actions">
        <button
          className="btn btn-secondary btn-sm"
          style={{ flex: 1 }}
          onClick={onHold}
          id="hold-order-btn"
          disabled={order.items.length === 0}
        >
          Hold
        </button>
        <button
          className={`btn btn-sm ${sendingState === 'sent' ? 'btn-success' : 'btn-secondary'}`}
          style={{
            flex: 2,
            background: sendingState === 'sent' ? 'var(--success)' : undefined,
            color: sendingState === 'sent' ? '#fff' : undefined,
          }}
          onClick={handleSendToKitchen}
          disabled={order.items.length === 0 || isSent}
          id="send-kitchen-btn"
        >
          {sendingState === 'loading' ? (
            <><span className="animate-spin" style={{ display: 'inline-block', fontSize: 14 }}>⌛</span> Submitting...</>
          ) : sendingState === 'sent' ? (
            '✅ Submitted!'
          ) : (
            <>📋 Submit Order</>
          )}
        </button>
        <button
          className="btn btn-primary btn-sm"
          style={{ flex: 2, opacity: canPay ? 1 : 0.45, cursor: canPay ? 'pointer' : 'not-allowed' }}
          onClick={canPay ? onPayNow : undefined}
          disabled={order.items.length === 0 || !canPay}
          id="pay-now-btn"
          title={isPendingApproval ? 'Order must be approved first' : !canPay ? 'Submit order first' : ''}
        >
          💳 Pay Now
        </button>
      </div>
      {isPendingApproval && (
        <div style={{ padding: '6px 16px 10px', fontSize: 11, color: 'var(--warning)', fontWeight: 600, textAlign: 'center' }}>
          ⏳ Awaiting approval in Orders section
        </div>
      )}
    </div>
  );
}
