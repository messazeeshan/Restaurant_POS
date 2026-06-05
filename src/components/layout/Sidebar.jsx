import React from 'react';
import {
  LayoutGrid, ShoppingCart, Monitor, BookOpen,
  Users, BarChart2, UserCircle, Settings, ChevronLeft, ChevronRight, Flame, Truck
} from 'lucide-react';
import useAppStore from '../../store/useAppStore.js';
import useStaffStore from '../../store/useStaffStore.js';
import useSettingsStore from '../../store/useSettingsStore.js';
import useDeliveryStore from '../../store/useDeliveryStore.js';
import { VIEW } from '../../data/constants.js';
import { getInitials } from '../../utils/formatters.js';
import ThemeToggle from './ThemeToggle.jsx';

const NAV_ITEMS = [
  { view: VIEW.FLOOR,     label: 'Floor Plan',  icon: LayoutGrid },
  { view: VIEW.ORDER,     label: 'New Order',   icon: ShoppingCart },
  { view: VIEW.KITCHEN,   label: 'Kitchen',     icon: Monitor },
  { view: VIEW.DELIVERY,  label: 'Delivery & Orders', icon: Truck },
  { view: VIEW.MENU,      label: 'Menu',        icon: BookOpen },
  { view: VIEW.STAFF,     label: 'Staff',       icon: Users },
  { view: VIEW.REPORTS,   label: 'Reports',     icon: BarChart2 },
  { view: VIEW.CUSTOMERS, label: 'Customers',   icon: UserCircle },
  { view: VIEW.SETTINGS,  label: 'Settings',    icon: Settings },
];

/**
 * Sidebar — main navigation with collapsible state
 */
export default function Sidebar() {
  const { currentView, setView, sidebarExpanded, toggleSidebar, currentStaffId } = useAppStore();
  const { getStaffById } = useStaffStore();
  const { getRestaurantName } = useSettingsStore();
  const { getActiveOrders } = useDeliveryStore();

  const currentStaff = getStaffById(currentStaffId);
  const restaurantName = getRestaurantName();
  
  const pendingDeliveryCount = getActiveOrders().filter(o => o.status === 'IN_KITCHEN' || o.status === 'READY').length;

  return (
    <aside className={`sidebar ${sidebarExpanded ? '' : 'collapsed'}`} aria-label="Main navigation">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon" aria-hidden="true">
          <Flame size={18} color="#fff" />
        </div>
        <div className="sidebar-logo-text">
          <div className="sidebar-logo-name">{restaurantName}</div>
          <div className="sidebar-logo-tagline">POS System</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav" role="navigation">
        {NAV_ITEMS.map(({ view, label, icon: Icon }) => (
          <button
            key={view}
            className={`nav-item ${currentView === view ? 'active' : ''}`}
            onClick={() => setView(view)}
            aria-label={label}
            aria-current={currentView === view ? 'page' : undefined}
            title={!sidebarExpanded ? label : undefined}
          >
            <span className="nav-icon" style={{ position: 'relative' }}>
              <Icon size={18} />
              {view === VIEW.DELIVERY && pendingDeliveryCount > 0 && (
                <span style={{ position: 'absolute', top: -6, right: -8, background: 'var(--sidebar-accent)', color: '#0A0F0C', fontSize: 9, fontWeight: 'bold', padding: '1px 4px', borderRadius: 8, minWidth: 16, textAlign: 'center' }}>
                  {pendingDeliveryCount}
                </span>
              )}
            </span>
            <span className="nav-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              {label}
              {view === VIEW.DELIVERY && pendingDeliveryCount > 0 && sidebarExpanded && (
                <span style={{ background: 'var(--sidebar-accent)', color: '#0A0F0C', fontSize: 10, fontWeight: 'bold', padding: '2px 7px', borderRadius: 10 }}>
                  {pendingDeliveryCount}
                </span>
              )}
            </span>
          </button>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="sidebar-bottom">
        <ThemeToggle />

        {/* Collapse toggle */}
        <button
          className="nav-item"
          onClick={toggleSidebar}
          aria-label={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          title={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <span className="nav-icon">
            {sidebarExpanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </span>
          <span className="nav-label">Collapse</span>
        </button>

        {/* Current user */}
        {currentStaff && (
          <div
            className="nav-item"
            style={{ cursor: 'default', marginTop: 4 }}
            title={`${currentStaff.name} — ${currentStaff.role}`}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'rgba(76, 175, 120, 0.2)',
                border: '2px solid var(--sidebar-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                color: 'var(--sidebar-accent)',
                flexShrink: 0,
              }}
            >
              {getInitials(currentStaff.name)}
            </div>
            <div className="nav-label" style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-display)', color: 'var(--sidebar-text-active)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentStaff.name}
              </div>
              <div style={{ fontSize: 10, color: 'var(--sidebar-text)' }}>
                {currentStaff.role}
                {currentStaff.clockedIn && (
                  <span style={{ color: 'var(--sidebar-accent)', marginLeft: 4 }}>● Active</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
