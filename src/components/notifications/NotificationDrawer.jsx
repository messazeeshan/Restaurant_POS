import React from 'react';
import { X, Trash2 } from 'lucide-react';
import useNotificationStore from '../../store/useNotificationStore.js';

const TYPE_CONFIG = {
  sla:     { icon: '🔴', label: 'SLA Breach' },
  order:   { icon: '🟢', label: 'New Order' },
  uber:    { icon: '🛵', label: 'Uber Eats' },
  payment: { icon: '💳', label: 'Payment' },
  sms:     { icon: '📱', label: 'SMS Sent' },
};

function relTime(ts) {
  const mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 1) return 'Just now';
  if (mins === 1) return '1 min ago';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ago`;
}

export default function NotificationDrawer({ onClose }) {
  const { notifications, markRead, markAllRead, clearAll } = useNotificationStore();

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex' }}>
      {/* Backdrop */}
      <div style={{ flex: 1 }} onClick={onClose} />

      {/* Drawer */}
      <div style={{
        width: 360,
        maxWidth: '90vw',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRight: 'none',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>
              Notifications
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {notifications.filter((n) => !n.read).length} unread
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => { markAllRead(); clearAll(); }}
              className="btn btn-sm btn-secondary"
              style={{ gap: 4 }}
              id="notif-clear-btn"
            >
              <Trash2 size={13} /> Clear all
            </button>
            <button
              onClick={onClose}
              className="btn btn-secondary btn-icon"
              style={{ width: 32, height: 32 }}
              aria-label="Close notifications"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-muted)', fontSize: 14 }}>
              No notifications yet
            </div>
          ) : (
            notifications.map((n) => {
              const cfg = TYPE_CONFIG[n.type] || { icon: 'ℹ️', label: '' };
              return (
                <div
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  style={{
                    padding: '14px 20px',
                    borderBottom: '1px solid var(--border)',
                    background: n.read ? 'transparent' : 'var(--accent-bg)',
                    cursor: 'pointer',
                    display: 'flex',
                    gap: 12,
                    alignItems: 'flex-start',
                  }}
                >
                  <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1.2 }}>{cfg.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', marginBottom: 2 }}>
                      {n.title}
                    </div>
                    {n.body && (
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        {n.body}
                      </div>
                    )}
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                      {relTime(n.ts)}
                    </div>
                  </div>
                  {!n.read && (
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0, marginTop: 4 }} />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
