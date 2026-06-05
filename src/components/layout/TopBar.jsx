import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import useAppStore from '../../store/useAppStore.js';
import useOrderStore from '../../store/useOrderStore.js';
import { VIEW } from '../../data/constants.js';

const VIEW_TITLES = {
  [VIEW.FLOOR]:     'Floor Plan',
  [VIEW.ORDER]:     'Order Entry',
  [VIEW.KITCHEN]:   'Kitchen Display',
  [VIEW.MENU]:      'Menu Manager',
  [VIEW.STAFF]:     'Staff Manager',
  [VIEW.REPORTS]:   'Reports & Analytics',
  [VIEW.CUSTOMERS]: 'Customers',
  [VIEW.SETTINGS]:  'Settings',
};

const VIEW_SUBTITLES = {
  [VIEW.FLOOR]:     'Manage tables and reservations',
  [VIEW.ORDER]:     'Take and manage orders',
  [VIEW.KITCHEN]:   'Active kitchen tickets',
  [VIEW.MENU]:      'Categories, items, and modifiers',
  [VIEW.STAFF]:     'Clock in/out and manage team',
  [VIEW.REPORTS]:   'Sales and performance analytics',
  [VIEW.CUSTOMERS]: 'Guest profiles and loyalty',
  [VIEW.SETTINGS]:  'Restaurant configuration',
};

/**
 * TopBar — current view title and quick action buttons
 */
export default function TopBar({ actions }) {
  const { currentView } = useAppStore();
  const { getKitchenOrders } = useOrderStore();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const kitchenCount = getKitchenOrders().length;

  return (
    <header className="topbar" role="banner">
      {/* Left: title */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 16,
            fontWeight: 700,
            color: 'var(--text-primary)',
            lineHeight: 1.2,
          }}
        >
          {VIEW_TITLES[currentView]}
        </h1>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>
          {VIEW_SUBTITLES[currentView]}
        </div>
      </div>

      {/* Middle: injected actions from pages */}
      {actions && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {actions}
        </div>
      )}

      {/* Right: quick status + time */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        {/* Kitchen alert */}
        {kitchenCount > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 10px',
              background: 'var(--warning-bg)',
              border: '1px solid var(--warning)',
              borderRadius: 'var(--radius-full)',
              fontSize: 12,
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              color: 'var(--warning)',
              opacity: 0.9,
            }}
          >
            <Bell size={12} />
            {kitchenCount} {kitchenCount === 1 ? 'ticket' : 'tickets'} pending
          </div>
        )}

        {/* Time */}
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 14,
            fontWeight: 700,
            color: 'var(--text-secondary)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {currentTime.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          })}
        </div>
      </div>
    </header>
  );
}
