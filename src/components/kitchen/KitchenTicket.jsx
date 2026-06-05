import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { ORDER_STATUS, ORDER_TYPE } from '../../data/constants.js';
import { formatKDSTimer, elapsedMinutes, getKDSTimerColor } from '../../utils/formatters.js';
import useStaffStore from '../../store/useStaffStore.js';

/**
 * KitchenTicket — single KDS ticket card with live timer
 * @param {{ order: object, onBump: () => void }} props
 */
export default function KitchenTicket({ order, onBump }) {
  const { getStaffById } = useStaffStore();
  const [timerKey, setTimerKey] = useState(0);
  const [bumping, setBumping] = useState(false);

  const server = order.serverId ? getStaffById(order.serverId) : null;
  const timerColorClass = getKDSTimerColor(order.sentAt, 8, 12);

  // Update timer every second
  useEffect(() => {
    const interval = setInterval(() => setTimerKey((k) => k + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleBump = async () => {
    setBumping(true);
    await new Promise((r) => setTimeout(r, 300));
    onBump();
  };

  const elapsedMins = elapsedMinutes(order.sentAt);

  const isDelivery = order.type === ORDER_TYPE.DELIVERY;
  const isOnline = order.type === ORDER_TYPE.ONLINE;
  const isTakeaway = order.type === ORDER_TYPE.TAKEOUT || !order.tableId; // legacy support

  let typeBadge = null;
  if (isDelivery) {
    typeBadge = <span className="badge badge-warning" style={{ borderRadius: 4 }}>🛵 DELIVERY {order.source ? `· ${order.source.toUpperCase()}` : ''}</span>;
  } else if (isOnline) {
    typeBadge = <span className="badge badge-info" style={{ borderRadius: 4 }}>🌐 ONLINE</span>;
  } else if (isTakeaway && !isDelivery && !isOnline) {
    typeBadge = <span className="badge badge-muted" style={{ borderRadius: 4 }}>🥡 TAKEAWAY</span>;
  }

  // Delivery ETA logic
  let etaMins = null;
  let etaWarning = false;
  if ((isDelivery || isOnline) && order.etaAt) {
    etaMins = Math.round((order.etaAt - Date.now()) / 60000);
    etaWarning = etaMins <= 5;
  }

  const isPaid = order.status === ORDER_STATUS.PAID;
  const isPrepaid = isDelivery || isOnline; // Delivery/Online are always pre-paid

  return (
    <div
      className={`kds-ticket ${timerColorClass} ${bumping ? 'animate-slide-out' : ''}`}
      role="article"
      aria-label={`Kitchen ticket for ${order.tableId ? 'Table ' + order.tableId : (order.customerName || 'Takeaway')}`}
    >
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

        {/* Timer / ETA */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <div
            className={`kds-timer ${timerColorClass}`}
            key={timerKey}
            aria-label={`Time elapsed: ${formatKDSTimer(order.sentAt)}`}
          >
            {formatKDSTimer(order.sentAt)}
          </div>
          {(etaMins !== null) && (
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
              <div className="kds-item-mods">
                {item.modifiers.map((m) => m.name).join(' · ')}
              </div>
            )}
            {item.specialRequest && (
              <div className="kds-item-request">
                📝 {item.specialRequest}
              </div>
            )}
            {/* Allergen flags from modifier names */}
            {item.modifiers.some((m) => m.name.toLowerCase().includes('allerg')) && (
              <div style={{ fontSize: 10, color: 'var(--danger)', marginLeft: 12, marginTop: 2 }}>
                ⚠️ ALLERGY NOTED
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bump button */}
      <button
        className="kds-bump-btn"
        style={isPaid ? { background: 'var(--success)', color: '#fff' } : {}}
        onClick={handleBump}
        disabled={bumping}
        aria-label={`Bump ticket for ${order.tableId ? 'Table ' + order.tableId : 'Takeaway'}`}
        id={`kds-bump-${order.id}`}
      >
        <Check size={18} />
        {isPrepaid || isPaid ? 'COMPLETE ✓' : 'READY ✓'}
      </button>
    </div>
  );
}
