import { Users } from 'lucide-react';
import { ORDER_STATUS, TABLE_STATUS, TABLE_STATUS_LABELS, TABLE_STATUS_COLORS } from '../../data/constants.js';
import { getInitials } from '../../utils/formatters.js';
import useStaffStore from '../../store/useStaffStore.js';
import useOrderStore from '../../store/useOrderStore.js';

/**
 * Derive a display status from the live order store instead of stale table.status.
 * This ensures all UIs (waiter, customer, manager) are reflected immediately.
 */
function deriveTableStatus(table, orders) {
  const activeOrder = orders.find(
    (o) =>
      o.tableId === table.id &&
      o.status !== ORDER_STATUS.CLOSED &&
      o.status !== ORDER_STATUS.VOID &&
      o.status !== ORDER_STATUS.REJECTED
  );

  if (!activeOrder) {
    // 2-hour auto-release: if table says SEATED but no active order and >120 min, show Available
    return TABLE_STATUS.AVAILABLE;
  }

  switch (activeOrder.status) {
    case ORDER_STATUS.DRAFT:
    case ORDER_STATUS.PENDING_ADMIN:
      return TABLE_STATUS.SEATED;
    case ORDER_STATUS.IN_KITCHEN:
    case ORDER_STATUS.ACCEPTED:
    case ORDER_STATUS.PREP_STARTED:
      return TABLE_STATUS.IN_KITCHEN; // Ordered / Blue
    case ORDER_STATUS.PAID:
      return TABLE_STATUS.PAID; // Paid — Awaiting Food / Teal
    case ORDER_STATUS.READY:
      return TABLE_STATUS.READY; // Food Ready / Purple
    default:
      return table.status || TABLE_STATUS.AVAILABLE;
  }
}

const STATUS_LABELS_OVERRIDE = {
  [TABLE_STATUS.AVAILABLE]: 'Available',
  [TABLE_STATUS.SEATED]:    'Seated',
  [TABLE_STATUS.IN_KITCHEN]: 'Ordered',
  [TABLE_STATUS.PAID]:      'Paid — Awaiting Food',
  [TABLE_STATUS.READY]:     'Food Ready',
};

const STATUS_COLOR_OVERRIDE = {
  [TABLE_STATUS.AVAILABLE]:  'var(--status-available)',
  [TABLE_STATUS.SEATED]:     'var(--status-seated)',
  [TABLE_STATUS.IN_KITCHEN]: '#4A9EFF',
  [TABLE_STATUS.PAID]:       '#00C4B5',
  [TABLE_STATUS.READY]:      '#A855F7',
};

/**
 * TableCard — individual table with status derived from live orders
 */
export default function TableCard({ table, onClick, onContextMenu }) {
  const { getStaffById } = useStaffStore();
  const { orders } = useOrderStore();

  const derivedStatus = deriveTableStatus(table, orders);
  const server = table.serverId ? getStaffById(table.serverId) : null;

  const statusColor = STATUS_COLOR_OVERRIDE[derivedStatus] || TABLE_STATUS_COLORS[derivedStatus] || 'var(--text-muted)';
  const statusLabel = STATUS_LABELS_OVERRIDE[derivedStatus] || TABLE_STATUS_LABELS[derivedStatus] || derivedStatus;

  const isOccupied = derivedStatus !== TABLE_STATUS.AVAILABLE && derivedStatus !== TABLE_STATUS.RESERVED;
  const isReserved = table.status === TABLE_STATUS.RESERVED;

  const statusClass = {
    [TABLE_STATUS.AVAILABLE]: 'status-available',
    [TABLE_STATUS.SEATED]:    'status-seated',
    [TABLE_STATUS.IN_KITCHEN]: 'status-ordered',
    [TABLE_STATUS.PAID]:      'status-ordered',
    [TABLE_STATUS.READY]:     'status-ordered',
    [TABLE_STATUS.RESERVED]:  'status-reserved',
  }[derivedStatus] || '';

  return (
    <div
      className={`table-card ${statusClass}`}
      onClick={onClick}
      onContextMenu={onContextMenu}
      role="button"
      tabIndex={0}
      aria-label={`Table ${table.number}, ${statusLabel}`}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
    >
      {/* Table number */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div className="table-number">{table.number}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Users size={11} style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
            {table.capacity}
          </span>
        </div>
      </div>

      {/* Status badge */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4 }}>
        <div
          className="table-status-badge"
          style={{ background: `${statusColor}22`, color: statusColor, alignSelf: 'flex-start' }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: statusColor,
              display: 'inline-block',
              flexShrink: 0,
            }}
          />
          {statusLabel}
        </div>

        {isOccupied && table.partySize && (
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Users size={10} />
            <span>{table.partySize} guests</span>
          </div>
        )}

        {isReserved && table.reservationName && (
          <div style={{ fontSize: 11, color: 'var(--table-reserved)' }}>
            {table.reservationName}
            {table.reservationTime && (
              <span style={{ color: 'var(--text-muted)', marginLeft: 4 }}>{table.reservationTime}</span>
            )}
          </div>
        )}
      </div>

      {/* Server initials badge */}
      {server && (
        <div className="table-server-badge" title={`Server: ${server.name}`}>
          {getInitials(server.name)}
        </div>
      )}
    </div>
  );
}
