import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Clock, Layers } from 'lucide-react';
import useOrderStore from '../../store/useOrderStore.js';
import useDeliveryStore from '../../store/useDeliveryStore.js';
import useAppStore from '../../store/useAppStore.js';
import { ORDER_STATUS, KITCHEN_STATION } from '../../data/constants.js';
import KitchenTicket from './KitchenTicket.jsx';

/**
 * KitchenDisplay — fullscreen KDS view with live timers
 */
export default function KitchenDisplay() {
  const { getKitchenOrders: getDineInOrders, transitionOrderStatus } = useOrderStore();
  const { getKitchenOrders: getDeliveryOrders, markReady: markDeliveryReady } = useDeliveryStore();
  const { addToast } = useAppStore();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [station, setStation] = useState(KITCHEN_STATION.ALL);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [recalledTickets, setRecalledTickets] = useState([]);

  // Live clock
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Combine orders from both stores
  const dineInOrders = getDineInOrders();
  const deliveryOrders = getDeliveryOrders();
  const allKitchenOrders = [...dineInOrders, ...deliveryOrders].sort((a, b) => (a.sentAt || 0) - (b.sentAt || 0));

  // Filter by station (based on item stations)
  const filteredOrders = station === KITCHEN_STATION.ALL
    ? allKitchenOrders
    : allKitchenOrders.filter((order) =>
        order.items.some((item) => (item.station || '').toUpperCase() === station.toUpperCase())
      );

  // Separate rush tickets (>12 min)
  const now = Date.now();
  const rushOrders = filteredOrders.filter((o) => o.sentAt && (now - o.sentAt) > 12 * 60 * 1000);
  const normalOrders = filteredOrders.filter((o) => !rushOrders.includes(o));

  const handleBump = (order) => {
    if (order.id.startsWith('DEL-')) {
      markDeliveryReady(order.id);
      addToast({ type: 'success', message: `${order.source || 'Delivery'} order ${order.id} bumped — ready!` });
    } else {
      const isPaid = order.status === ORDER_STATUS.PAID;
      const nextStatus = isPaid ? ORDER_STATUS.CLOSED : ORDER_STATUS.READY;
      transitionOrderStatus(order.id, nextStatus, null);
      addToast({ type: 'success', message: `Table ${order.tableId} bumped — ${isPaid ? 'completed' : 'ready'}!` });
    }
    setRecalledTickets((prev) => [order, ...prev.slice(0, 4)]); // Keep last 5 bumped
  };

  const STATIONS = Object.values(KITCHEN_STATION);

  return (
    <div className="kds-screen">
      {/* KDS Header */}
      <div className="kds-header">
        {/* Left: Clock */}
        <div className="kds-clock" aria-label={`Current time: ${currentTime.toLocaleTimeString()}`}>
          {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
        </div>

        {/* Center: Stats */}
        <div style={{ display: 'flex', gap: 20 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>
              {allKitchenOrders.length}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Pending
            </div>
          </div>
          {rushOrders.length > 0 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--danger)' }}>
                {rushOrders.length}
              </div>
              <div style={{ fontSize: 11, color: 'var(--danger)', fontFamily: 'var(--font-display)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Rush
              </div>
            </div>
          )}
        </div>

        {/* Right: Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Station filter */}
          <div className="tabs" style={{ background: 'var(--bg-base)' }}>
            {STATIONS.map((s) => (
              <button
                key={s}
                className={`tab-btn ${station === s ? 'active' : ''}`}
                onClick={() => setStation(s)}
                id={`kds-station-${s}`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Sound toggle */}
          <button
            className="btn btn-secondary btn-icon"
            onClick={() => setSoundEnabled((v) => !v)}
            aria-label={soundEnabled ? 'Mute alerts' : 'Enable alerts'}
            id="kds-sound-toggle"
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} style={{ color: 'var(--text-muted)' }} />}
          </button>

          {/* Recall last bumped */}
          {recalledTickets.length > 0 && (
            <button
              className="btn btn-secondary"
              onClick={() => addToast({ type: 'info', message: `Last bumped: Table ${recalledTickets[0]?.tableId}` })}
              id="kds-recall-btn"
              title="Recall last bumped tickets"
            >
              <Layers size={16} /> Recall
            </button>
          )}
        </div>
      </div>

      {/* KDS Grid */}
      <div className="kds-grid">
        {/* Empty state */}
        {filteredOrders.length === 0 ? (
          <div
            style={{
              gridColumn: '1 / -1',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: 16,
              padding: 60,
            }}
          >
            <Clock size={64} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--text-secondary)' }}>
              All caught up! ✓
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              No pending kitchen tickets
            </div>
          </div>
        ) : (
          <>
            {/* Rush tickets section */}
            {rushOrders.length > 0 && (
              <>
                <div style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 4 }}>
                  <div style={{ height: 2, flex: 1, background: 'var(--danger)' }} />
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    🚨 Rush Tickets
                  </span>
                  <div style={{ height: 2, flex: 1, background: 'var(--danger)' }} />
                </div>
                {rushOrders.map((order) => (
                  <KitchenTicket key={order.id} order={order} onBump={() => handleBump(order)} />
                ))}
                {normalOrders.length > 0 && (
                  <div style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                    <div style={{ height: 1, flex: 1, background: 'var(--border)' }} />
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Incoming
                    </span>
                    <div style={{ height: 1, flex: 1, background: 'var(--border)' }} />
                  </div>
                )}
              </>
            )}

            {/* Normal tickets */}
            {normalOrders.map((order) => (
              <KitchenTicket key={order.id} order={order} onBump={() => handleBump(order)} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
