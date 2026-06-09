import React, { useState, useEffect, useRef } from 'react';
import { Check, AlertTriangle, X } from 'lucide-react';
import { ORDER_STATUS, ORDER_TYPE } from '../../data/constants.js';
import { formatKDSTimer, elapsedMinutes, getKDSTimerColor } from '../../utils/formatters.js';
import { playSLAAlertTone } from '../../utils/audio.js';
import useStaffStore from '../../store/useStaffStore.js';
import useOrderStore from '../../store/useOrderStore.js';
import useNotificationStore from '../../store/useNotificationStore.js';

const FIFTY_MIN_MS = 50 * 60 * 1000;

/**
 * KitchenTicket — single KDS ticket card
 * Flow: IN_KITCHEN → (Accept) → ACCEPTED → (Prep Started) → PREP_STARTED → (Ready) → READY
 */
export default function KitchenTicket({ order, onBump, onAccept, onPrepStarted, onVoid }) {
  const { getStaffById } = useStaffStore();
  const [timerKey, setTimerKey] = useState(0);
  const [bumping, setBumping] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const alertFiredRef = useRef(false);

  const server = order.serverId ? getStaffById(order.serverId) : null;
  const timerBase = order.sentAt || order.sentToKitchenAt || order.createdAt;
  const timerColorClass = getKDSTimerColor(timerBase, 8, 12);

  // Update timer every second
  useEffect(() => {
    const interval = setInterval(() => setTimerKey((k) => k + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // 50-minute alert — fires once per ticket
  useEffect(() => {
    if (alertFiredRef.current) return;
    if (!timerBase) return;
    const elapsed = Date.now() - timerBase;
    if (
      elapsed >= FIFTY_MIN_MS &&
      order.status !== ORDER_STATUS.READY &&
      order.status !== ORDER_STATUS.CLOSED &&
      order.status !== ORDER_STATUS.PAID
    ) {
      playSLAAlertTone();
      alertFiredRef.current = true;
    }
    // Check again in 1 min if not yet 50 min
    const remaining = FIFTY_MIN_MS - elapsed;
    if (remaining > 0) {
      const t = setTimeout(() => {
        if (!alertFiredRef.current) {
          playSLAAlertTone();
          alertFiredRef.current = true;
        }
      }, remaining);
      return () => clearTimeout(t);
    }
  }, [timerBase, order.status]);

  const handleBump = async () => {
    setBumping(true);
    await new Promise((r) => setTimeout(r, 300));
    if (onBump) onBump();
  };

  const handleVoid = () => {
    setShowCancelModal(false);
    if (onVoid) onVoid();
  };

  const elapsedMins = elapsedMinutes(timerBase);
  const isOver50 = timerBase && (Date.now() - timerBase) >= FIFTY_MIN_MS &&
    order.status !== ORDER_STATUS.READY && order.status !== ORDER_STATUS.CLOSED;

  const isDelivery = order.type === ORDER_TYPE.DELIVERY;
  const isOnline   = order.type === ORDER_TYPE.ONLINE;
  const isTakeaway = order.type === ORDER_TYPE.TAKEOUT || !order.tableId;

  let typeBadge = null;
  if (isDelivery) {
    typeBadge = <span className="badge badge-warning" style={{ borderRadius: 4 }}>🛵 DELIVERY {order.source ? `· ${order.source.toUpperCase()}` : ''}</span>;
  } else if (isOnline) {
    typeBadge = <span className="badge badge-info" style={{ borderRadius: 4 }}>🌐 ONLINE</span>;
  } else if (isTakeaway && !isDelivery && !isOnline) {
    typeBadge = <span className="badge badge-muted" style={{ borderRadius: 4 }}>🥡 TAKEAWAY</span>;
  }

  let etaMins = null;
  let etaWarning = false;
  if ((isDelivery || isOnline) && order.etaAt) {
    etaMins = Math.round((order.etaAt - Date.now()) / 60000);
    etaWarning = etaMins <= 5;
  }

  const isPaid     = order.status === ORDER_STATUS.PAID;
  const isPrepaid  = isDelivery || isOnline || order.prePaid;

  // Determine which action button to show based on status
  const statusFlow = {
    [ORDER_STATUS.IN_KITCHEN]:   { label: '✅ Accept Order',  action: onAccept,     style: { background: 'var(--info)', color: '#fff' } },
    [ORDER_STATUS.ACCEPTED]:     { label: '👨‍🍳 Prep Started',  action: onPrepStarted, style: { background: 'var(--warning)', color: '#fff' } },
    [ORDER_STATUS.PREP_STARTED]: { label: '🍽 Mark Ready',    action: handleBump,    style: { background: 'var(--success)', color: '#fff' } },
    [ORDER_STATUS.PAID]:         { label: '✅ Complete',       action: handleBump,    style: { background: 'var(--success)', color: '#fff' } },
  };
  const currentAction = statusFlow[order.status];

  return (
    <>
      <div
        className={`kds-ticket ${timerColorClass} ${bumping ? 'animate-slide-out' : ''}`}
        role="article"
        aria-label={`Kitchen ticket for ${order.tableId ? 'Table ' + order.tableId : (order.customerName || 'Takeaway')}`}
      >
        {/* 50-min warning banner */}
        {isOver50 && (
          <div style={{
            background: 'var(--danger)',
            color: '#fff',
            padding: '4px 14px',
            fontSize: 11,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <AlertTriangle size={12} />⚠ 50 MIN EXCEEDED
          </div>
        )}

        {/* Ticket Header */}
        <div className={`kds-ticket-header ${timerColorClass}`} style={{ position: 'relative' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              {order.tableId ? `Table ${order.tableId}` : (order.customerName || 'Takeaway')}
              {typeBadge}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
              {server ? server.name : '—'} · {order.partySize || 1} covers
            </div>
          </div>

          {/* Timer */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <div
              className={`kds-timer ${timerColorClass}`}
              key={timerKey}
              aria-label={`Time elapsed: ${formatKDSTimer(timerBase)}`}
            >
              {formatKDSTimer(timerBase)}
            </div>
            {etaMins !== null && (
              <div style={{ fontSize: 11, marginTop: 4, fontWeight: 700, color: etaWarning ? 'var(--danger)' : 'var(--text-muted)' }}>
                {etaWarning ? `⚠ ETA in ${Math.max(0, etaMins)} min` : `ETA: ${etaMins} min`}
              </div>
            )}
          </div>
        </div>

        {/* Status badge */}
        <div style={{ padding: '6px 14px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            {!isPrepaid && (
              <span className={`badge ${isPaid ? 'badge-success' : 'badge-warning'}`}>
                {isPaid ? '✅ Paid' : '💳 Awaiting Payment'}
              </span>
            )}
            {order.prePaid && !isDelivery && !isOnline && (
              <span className="badge badge-success">✅ Pre-Paid</span>
            )}
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {elapsedMins < 1 ? 'Just sent' : `${elapsedMins} min ago`}
          </span>
        </div>

        {/* Items */}
        <div className="kds-ticket-items">
          {order.items.map((item) => (
            <div key={item.id}>
              <div className="kds-item">
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, marginRight: 6 }}>
                  {item.quantity}×
                </span>
                {item.name}
                {item.seatNumber && (
                  <span style={{ marginLeft: 6, fontSize: 11, color: 'var(--info)', background: 'var(--info-bg)', padding: '1px 6px', borderRadius: 999 }}>
                    Seat {item.seatNumber}
                  </span>
                )}
              </div>
              {item.modifiers.length > 0 && (
                <div className="kds-item-mods">{item.modifiers.map((m) => m.name).join(' · ')}</div>
              )}
              {item.specialRequest && (
                <div className="kds-item-request">📝 {item.specialRequest}</div>
              )}
            </div>
          ))}
        </div>

        {/* Action Button */}
        {currentAction && (
          <button
            className="kds-bump-btn"
            style={currentAction.style}
            onClick={currentAction.action}
            disabled={bumping}
            id={`kds-bump-${order.id}`}
          >
            {currentAction.label}
          </button>
        )}

        {/* Cancel button */}
        {order.status !== ORDER_STATUS.READY && order.status !== ORDER_STATUS.PAID && (
          <button
            onClick={() => setShowCancelModal(true)}
            style={{
              display: 'block',
              width: '100%',
              background: 'transparent',
              border: 'none',
              color: 'var(--danger)',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              padding: '6px 14px 10px',
              textAlign: 'center',
              letterSpacing: '0.02em',
            }}
            id={`kds-cancel-${order.id}`}
          >
            Cancel ✕
          </button>
        )}
      </div>

      {/* Cancel Confirm Modal */}
      {showCancelModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24,
        }}>
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
            padding: 28,
            maxWidth: 380,
            width: '100%',
            boxShadow: 'var(--shadow-xl)',
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, color: 'var(--text-primary)', marginBottom: 10 }}>
              Cancel Order?
            </div>
            {order.prePaid && (
              <div style={{ background: 'var(--warning-bg)', border: '1px solid var(--warning)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', fontSize: 12, color: 'var(--warning)', fontWeight: 600, marginBottom: 12 }}>
                ⚠ This order was pre-paid — issue refund manually.
              </div>
            )}
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>
              Cancel this order? This cannot be undone.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowCancelModal(false)}>
                Keep Order
              </button>
              <button
                className="btn"
                style={{ flex: 1, justifyContent: 'center', background: 'var(--danger)', color: '#fff', border: 'none' }}
                onClick={handleVoid}
              >
                <X size={14} /> Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
