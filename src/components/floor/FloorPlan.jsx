import React, { useState, useEffect, useRef } from 'react';
import { Plus, TrendingUp, Users, Table } from 'lucide-react';
import useTableStore from '../../store/useTableStore.js';
import useOrderStore from '../../store/useOrderStore.js';
import useAppStore from '../../store/useAppStore.js';
import TableCard from './TableCard.jsx';
import TableModal from './TableModal.jsx';
import { TABLE_ZONE } from '../../data/constants.js';
import { formatCurrency } from '../../utils/formatters.js';

const ZONES = ['All', TABLE_ZONE.INDOOR, TABLE_ZONE.BAR, TABLE_ZONE.OUTDOOR, TABLE_ZONE.PRIVATE];

/**
 * FloorPlan — visual interactive table layout with zone tabs
 */
export default function FloorPlan() {
  const { tables, getTablesByZone, getTableStats } = useTableStore();
  const { getTodaysOrders } = useOrderStore();
  const { addToast } = useAppStore();

  const [activeZone, setActiveZone] = useState('All');
  const [selectedTable, setSelectedTable] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const contextMenuRef = useRef(null);

  const filteredTables = getTablesByZone(activeZone);
  const stats = getTableStats();
  const todaysOrders = getTodaysOrders();
  const todaysRevenue = todaysOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const todaysCovers = todaysOrders.reduce((sum, o) => sum + (o.partySize || 0), 0);

  // Close context menu on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target)) {
        setContextMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleContextMenu = (e, table) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, table });
  };

  const contextActions = [
    {
      label: 'Mark Reserved',
      icon: '🟣',
      action: (table) => {
        addToast({ type: 'info', message: `Table ${table.number} marked reserved` });
        setContextMenu(null);
      },
    },
    {
      label: 'Close Table',
      icon: '✖️',
      danger: true,
      action: (table) => {
        addToast({ type: 'warning', message: `Table ${table.number} closed` });
        setContextMenu(null);
      },
    },
  ];

  return (
    <div style={{ display: 'flex', height: '100%', gap: 0 }}>
      {/* ── Main Floor Area ──────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Zone Tabs */}
        <div style={{ padding: '16px 24px 0', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)', flexShrink: 0 }}>
          <div className="tabs-scroll" role="tablist" aria-label="Floor zones">
            {ZONES.map((zone) => {
              const count = zone === 'All' ? tables.length : tables.filter((t) => t.zone === zone).length;
              return (
                <button
                  key={zone}
                  className={`tab-pill ${activeZone === zone ? 'active' : ''}`}
                  onClick={() => setActiveZone(zone)}
                  role="tab"
                  aria-selected={activeZone === zone}
                  id={`zone-tab-${zone}`}
                >
                  {zone}
                  <span style={{ marginLeft: 6, opacity: 0.6, fontSize: 10 }}>({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Table Grid */}
        <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
          {filteredTables.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🪑</div>
              <div className="empty-state-title">No tables in {activeZone}</div>
              <div className="empty-state-subtitle">Add tables in Settings to get started</div>
            </div>
          ) : (
            <div
              className="table-grid"
              style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}
            >
              {filteredTables.map((table) => (
                <TableCard
                  key={table.id}
                  table={table}
                  onClick={() => setSelectedTable(table)}
                  onContextMenu={(e) => handleContextMenu(e, table)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Right Summary Panel ──────────────────────────────── */}
      <div style={{
        width: 260,
        flexShrink: 0,
        background: 'var(--bg-surface)',
        borderLeft: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
            Today's Summary
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: "Revenue Today", value: formatCurrency(todaysRevenue), icon: TrendingUp, color: 'var(--accent)' },
              { label: 'Covers Today', value: todaysCovers.toString(), icon: Users, color: 'var(--info)' },
              { label: 'Open Tables', value: `${stats.occupied}/${stats.total}`, icon: Table, color: 'var(--warning)' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={16} style={{ color }} />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 800, color: 'var(--text-primary)' }}>{value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Legend */}
        <div style={{ padding: '16px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
            Status Legend
          </div>
          {[
            { color: 'var(--table-available)', label: 'Available',         count: stats.available },
            { color: 'var(--table-seated)',    label: 'Seated',            count: tables.filter(t => t.status === 'SEATED').length },
            { color: '#4A9EFF',                label: 'Ordered',           count: tables.filter(t => t.status === 'IN_KITCHEN').length },
            { color: '#00C4B5',                label: 'Paid — Awaiting Food', count: tables.filter(t => t.status === 'PAID').length },
            { color: '#A855F7',                label: 'Food Ready',        count: tables.filter(t => t.status === 'READY').length },
            { color: 'var(--table-reserved)',  label: 'Reserved',          count: stats.reserved },
          ].map(({ color, label, count }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
              </div>
              <span style={{ fontSize: 12, fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-muted)' }}>{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Table Modal ──────────────────────────────────────── */}
      {selectedTable && (
        <TableModal
          table={selectedTable}
          onClose={() => setSelectedTable(null)}
        />
      )}

      {/* ── Context Menu ─────────────────────────────────────── */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          role="menu"
        >
          <div style={{ padding: '8px 14px 4px', fontSize: 11, fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Table {contextMenu.table.number}
          </div>
          <div className="context-menu-divider" />
          {contextActions.map((action) => (
            <button
              key={action.label}
              className={`context-menu-item ${action.danger ? 'danger' : ''}`}
              role="menuitem"
              onClick={() => action.action(contextMenu.table)}
            >
              <span>{action.icon}</span>
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
