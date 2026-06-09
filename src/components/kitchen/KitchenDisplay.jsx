import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Clock, Layers, AlertTriangle } from 'lucide-react';
import useOrderStore from '../../store/useOrderStore.js';
import useAppStore from '../../store/useAppStore.js';
import useNotificationStore from '../../store/useNotificationStore.js';
import { ORDER_STATUS, KITCHEN_STATION, SLA } from '../../data/constants.js';
import { broadcast, onSync, SYNC_EVENTS } from '../../utils/sync.js';
import {
  initAudio, isAudioInitialized, isAudioEnabled, setAudioEnabled,
  playNewOrderTone, playSLAAlertTone,
} from '../../utils/audio.js';
import KitchenTicket from './KitchenTicket.jsx';
import NotificationBell from '../notifications/NotificationBell.jsx';

/**
 * KitchenDisplay — fullscreen KDS with ACCEPT flow, SLA alerts, audio, and cross-tab sync
 */
export default function KitchenDisplay() {
  const { getKitchenOrders, transitionOrderStatus, acceptOrder, voidOrder, initialize: initOrders } = useOrderStore();
  const { addToast } = useAppStore();
  const { addNotification } = useNotificationStore();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [station, setStation] = useState(KITCHEN_STATION.ALL);
  const [soundEnabled, setSoundEnabled] = useState(isAudioEnabled());
  const [audioReady, setAudioReady] = useState(isAudioInitialized());
  const [recalledTickets, setRecalledTickets] = useState([]);
  const [prevOrderIds, setPrevOrderIds] = useState(new Set());
  const [slaAlertFired, setSlaAlertFired] = useState(new Set()); // track which SLA alerts played

  // Live clock
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Unlock audio on first tap
  const handleAudioUnlock = () => {
    if (!audioReady) {
      initAudio();
      setAudioReady(true);
    }
  };

  // Toggle sound
  const handleSoundToggle = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    setAudioEnabled(next);
  };

  // Cross-tab sync
  useEffect(() => {
    const cleanup = onSync((event) => {
      const raw = localStorage.getItem('pos_orders');
      if (raw) {
        try { initOrders(JSON.parse(raw)); } catch {}
      }
      // Play tone when a new order arrives
      if (event.type === SYNC_EVENTS.ORDER_APPROVED || event.type === SYNC_EVENTS.ORDER_SUBMITTED) {
        if (soundEnabled && audioReady) playNewOrderTone();
      }
    });
    return cleanup;
  }, [soundEnabled, audioReady]);

  // Detect new orders arriving and play tone
  const allKitchenOrders = getKitchenOrders().sort((a, b) => (a.sentAt || 0) - (b.sentAt || 0));

  useEffect(() => {
    const currentIds = new Set(allKitchenOrders.map((o) => o.id));
    const newArrivals = [...currentIds].filter((id) => !prevOrderIds.has(id));
    if (newArrivals.length > 0 && prevOrderIds.size > 0) {
      if (soundEnabled && audioReady) playNewOrderTone();
      newArrivals.forEach((id) => {
        const order = allKitchenOrders.find((o) => o.id === id);
        if (order) {
          addNotification({
            type: 'order',
            title: `New Ticket — ${order.tableId ? `Table ${order.tableId}` : order.source || 'Delivery'}`,
            body: `${order.items?.length || 0} items`,
          });
        }
      });
    }
    setPrevOrderIds(currentIds);
  }, [allKitchenOrders.length]);

  // SLA breach detection: check every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      allKitchenOrders.forEach((order) => {
        const isBreached = order.status === ORDER_STATUS.IN_KITCHEN &&
          !order.acceptedAt &&
          order.sentToKitchenAt &&
          (now - order.sentToKitchenAt) > SLA.ACCEPT_SECONDS * 1000;

        if (isBreached && !slaAlertFired.has(order.id)) {
          setSlaAlertFired((prev) => new Set([...prev, order.id]));
          if (soundEnabled && audioReady) playSLAAlertTone();
          addNotification({
            type: 'sla',
            title: `SLA BREACH — ${order.tableId ? `Table ${order.tableId}` : order.id}`,
            body: 'Order not accepted within 2 minutes — action required!',
          });
        }
      });

      // Clear SLA fired state for orders that are now accepted
      setSlaAlertFired((prev) => {
        const cleaned = new Set(prev);
        allKitchenOrders.forEach((o) => {
          if (o.acceptedAt) cleaned.delete(o.id);
        });
        return cleaned;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [allKitchenOrders, soundEnabled, audioReady, slaAlertFired]);

  // Filter by station
  const filteredOrders = station === KITCHEN_STATION.ALL
    ? allKitchenOrders
    : allKitchenOrders.filter((order) =>
        order.items.some((item) => (item.station || '').toUpperCase() === station.toUpperCase())
      );

  // Separate SLA-breached / rush / normal
  const now = Date.now();
  const slaBreached = filteredOrders.filter(
    (o) => o.status === ORDER_STATUS.IN_KITCHEN && !o.acceptedAt &&
      o.sentToKitchenAt && (now - o.sentToKitchenAt) > SLA.ACCEPT_SECONDS * 1000
  );
  const rushOrders = filteredOrders.filter(
    (o) => !slaBreached.includes(o) && o.sentAt && (now - o.sentAt) > 12 * 60 * 1000
  );
  const normalOrders = filteredOrders.filter(
    (o) => !slaBreached.includes(o) && !rushOrders.includes(o)
  );


  const handleBump = (order) => {
    if (order.type === ORDER_TYPE.DELIVERY || order.type === ORDER_TYPE.ONLINE) {
      transitionOrderStatus(order.id, ORDER_STATUS.READY, null);
      broadcast(SYNC_EVENTS.ORDER_READY, { orderId: order.id });
      addToast({ type: 'success', message: `${order.source || 'Delivery'} order ${order.id} bumped — ready!` });
    } else {
      const isPaid = order.status === ORDER_STATUS.PAID;
      const nextStatus = isPaid ? ORDER_STATUS.CLOSED : ORDER_STATUS.READY;
      transitionOrderStatus(order.id, nextStatus, null);
      broadcast(SYNC_EVENTS.ORDER_READY, { orderId: order.id });
      addToast({ type: 'success', message: `${order.tableId ? `Table ${order.tableId}` : 'Order'} — ${isPaid ? 'completed' : 'ready'}!` });
    }
    setRecalledTickets((prev) => [order, ...prev.slice(0, 4)]);
  };

  const handleAccept = (order) => {
    acceptOrder(order.id);
    broadcast(SYNC_EVENTS.ORDER_ACCEPTED, { orderId: order.id });
    addToast({ type: 'success', message: `${order.tableId ? `Table ${order.tableId}` : 'Order'} accepted.` });
  };

  const handlePrepStarted = (order) => {
    transitionOrderStatus(order.id, ORDER_STATUS.PREP_STARTED, null);
    broadcast(SYNC_EVENTS.ORDER_ACCEPTED, { orderId: order.id });
    addToast({ type: 'info', message: `Prep started — ${order.tableId ? `Table ${order.tableId}` : 'Order'}.` });
  };

  const handleVoid = (order) => {
    voidOrder(order.id, null);
    broadcast(SYNC_EVENTS.ORDER_READY, { orderId: order.id });
    addToast({ type: 'warning', message: `Order ${order.tableId ? `Table ${order.tableId}` : order.id} cancelled.` });
  };

  const STATIONS = Object.values(KITCHEN_STATION);

  return (
    <div className="kds-screen" onClick={handleAudioUnlock}>

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
          {slaBreached.length > 0 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--danger)' }}>
                {slaBreached.length}
              </div>
              <div style={{ fontSize: 11, color: 'var(--danger)', fontFamily: 'var(--font-display)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                SLA
              </div>
            </div>
          )}
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

          {/* Notification bell */}
          <NotificationBell />

          {/* Sound toggle */}
          <button
            className="btn btn-secondary btn-icon"
            onClick={handleSoundToggle}
            aria-label={soundEnabled ? 'Mute alerts' : 'Enable alerts'}
            id="kds-sound-toggle"
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} style={{ color: 'var(--text-muted)' }} />}
          </button>

          {/* Audio hint */}
          {!audioReady && (
            <span style={{ fontSize: 11, color: 'var(--text-muted)', cursor: 'pointer' }}>
              🔔 Tap to enable audio
            </span>
          )}

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
            {/* SLA Breached section */}
            {slaBreached.length > 0 && (
              <>
                <div style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 4 }}>
                  <div style={{ height: 2, flex: 1, background: 'var(--danger)' }} />
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    🚨 SLA Breach
                  </span>
                  <div style={{ height: 2, flex: 1, background: 'var(--danger)' }} />
                </div>
                {slaBreached.map((order) => (
                  <KitchenTicket
                    key={order.id}
                    order={order}
                    onBump={() => handleBump(order)}
                    onAccept={() => handleAccept(order)}
                    onPrepStarted={() => handlePrepStarted(order)}
                    onVoid={() => handleVoid(order)}
                  />
                ))}
                {(rushOrders.length > 0 || normalOrders.length > 0) && (
                  <div style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                    <div style={{ height: 1, flex: 1, background: 'var(--border)' }} />
                  </div>
                )}
              </>
            )}

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
                  <KitchenTicket
                    key={order.id}
                    order={order}
                    onBump={() => handleBump(order)}
                    onAccept={() => handleAccept(order)}
                    onPrepStarted={() => handlePrepStarted(order)}
                    onVoid={() => handleVoid(order)}
                  />
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
              <KitchenTicket
                key={order.id}
                order={order}
                onBump={() => handleBump(order)}
                onAccept={() => handleAccept(order)}
                onPrepStarted={() => handlePrepStarted(order)}
                onVoid={() => handleVoid(order)}
              />
            ))}
          </>
        )}
      </div>

      <style>{`
        @keyframes slaPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.75; }
        }
      `}</style>
    </div>
  );
}
