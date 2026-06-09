import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import useNotificationStore from '../../store/useNotificationStore.js';
import NotificationDrawer from './NotificationDrawer.jsx';

export default function NotificationBell() {
  const { getUnreadCount } = useNotificationStore();
  const [open, setOpen] = useState(false);
  const unread = getUnreadCount();

  return (
    <>
      <button
        className="btn btn-secondary btn-icon"
        onClick={() => setOpen(true)}
        aria-label={`Notifications — ${unread} unread`}
        id="notification-bell-btn"
        style={{ position: 'relative' }}
      >
        <Bell size={18} />
        {unread > 0 && (
          <span style={{
            position: 'absolute',
            top: -5,
            right: -5,
            background: 'var(--danger)',
            color: '#fff',
            width: 18,
            height: 18,
            borderRadius: '50%',
            fontSize: 10,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && <NotificationDrawer onClose={() => setOpen(false)} />}
    </>
  );
}
