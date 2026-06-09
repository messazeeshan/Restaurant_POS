import React, { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import useOrderStore from '../../store/useOrderStore.js';
import useAppStore from '../../store/useAppStore.js';
import useAuthStore from '../../store/useAuthStore.js';
import useNotificationStore from '../../store/useNotificationStore.js';
import useSettingsStore from '../../store/useSettingsStore.js';
import { broadcast, SYNC_EVENTS } from '../../utils/sync.js';
import { sendOrderConfirmation } from '../../utils/messaging.js';
import { playNewOrderTone } from '../../utils/audio.js';
import { formatCurrency } from '../../utils/formatters.js';
import PendingOrderCard from './PendingOrderCard.jsx';
import RejectModal from './RejectModal.jsx';

export default function OrdersDashboard() {
  const { getPendingAdminOrders, approvePendingOrder, rejectOrder, markSmsSent } = useOrderStore();
  const { addToast } = useAppStore();
  const { session } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const { settings } = useSettingsStore();

  const [rejectingOrderId, setRejectingOrderId] = useState(null);

  const pendingOrders = getPendingAdminOrders();

  const handleApprove = (order) => {
    approvePendingOrder(order.id, session?.staffId);

    // Send simulated SMS
    const msg = sendOrderConfirmation(order);
    markSmsSent(order.id);

    // Broadcast to all tabs (KDS will pick it up)
    broadcast(SYNC_EVENTS.ORDER_APPROVED, { orderId: order.id });

    // Play tone
    playNewOrderTone();

    // Notification
    addNotification({
      type:  'order',
      title: `Order Approved — ${order.tableId ? `Table ${order.tableId}` : order.customerName || 'Takeaway'}`,
      body:  `Sent to kitchen · ${formatCurrency(order.total || 0)}`,
    });

    addToast({ type: 'success', message: `Order approved — sent to kitchen!` });
  };

  const handleRejectConfirm = (reason) => {
    if (!rejectingOrderId) return;
    rejectOrder(rejectingOrderId, reason, session?.staffId);
    broadcast(SYNC_EVENTS.ORDER_REJECTED, { orderId: rejectingOrderId, reason });
    addToast({ type: 'warning', message: `Order rejected — ${reason}` });
    setRejectingOrderId(null);
  };

  return (
    <div style={{ maxWidth: 760, padding: '0 0 48px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {pendingOrders.length === 0
              ? 'All orders approved'
              : `${pendingOrders.length} order${pendingOrders.length !== 1 ? 's' : ''} awaiting your approval`}
          </div>
        </div>
        {settings?.autoApproveWaiterOrders && (
          <div style={{
            padding: '4px 12px',
            background: 'var(--success-bg)',
            border: '1px solid var(--success)',
            borderRadius: 'var(--radius-full)',
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--success)',
          }}>
            ⚡ Auto-approve ON
          </div>
        )}
      </div>

      {/* Empty state */}
      {pendingOrders.length === 0 ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 0',
          gap: 12,
        }}>
          <CheckCircle size={56} style={{ color: 'var(--success)', opacity: 0.5 }} />
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--text-secondary)' }}>
            All clear!
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            No pending orders. New orders from waiters and customers will appear here.
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {pendingOrders.map((order) => (
            <PendingOrderCard
              key={order.id}
              order={order}
              onApprove={() => handleApprove(order)}
              onReject={() => setRejectingOrderId(order.id)}
            />
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {rejectingOrderId && (
        <RejectModal
          onConfirm={handleRejectConfirm}
          onCancel={() => setRejectingOrderId(null)}
        />
      )}
    </div>
  );
}
