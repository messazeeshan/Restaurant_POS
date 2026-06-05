import { Users } from 'lucide-react';
import { TABLE_STATUS, TABLE_STATUS_LABELS, TABLE_STATUS_COLORS } from '../../data/constants.js';
import { getInitials } from '../../utils/formatters.js';
import useStaffStore from '../../store/useStaffStore.js';

/**
 * TableCard — individual table with status color + interactions
 * @param {{ table: object, onClick: function, onContextMenu: function }} props
 */
export default function TableCard({ table, onClick, onContextMenu }) {
  const { getStaffById } = useStaffStore();
  const server = table.serverId ? getStaffById(table.serverId) : null;

  const statusClass = {
    [TABLE_STATUS.AVAILABLE]:       'status-available',
    [TABLE_STATUS.SEATED]:          'status-seated',
    [TABLE_STATUS.IN_KITCHEN]:      'status-ordered',
    [TABLE_STATUS.PAID]:            'status-ordered',
    [TABLE_STATUS.READY]:           'status-ordered',
    [TABLE_STATUS.BILL_REQUESTED]:  'status-bill',
    [TABLE_STATUS.RESERVED]:        'status-reserved',
  }[table.status] || '';

  const statusColor = TABLE_STATUS_COLORS[table.status] || 'var(--text-muted)';

  const isBillRequested = table.status === TABLE_STATUS.BILL_REQUESTED;
  const isOccupied = table.status !== TABLE_STATUS.AVAILABLE && table.status !== TABLE_STATUS.RESERVED;
  const isReserved  = table.status === TABLE_STATUS.RESERVED;

  return (
    <div
      className={`table-card ${statusClass} ${isBillRequested ? 'pulse-ring' : ''}`}
      onClick={onClick}
      onContextMenu={onContextMenu}
      role="button"
      tabIndex={0}
      aria-label={`Table ${table.number}, ${TABLE_STATUS_LABELS[table.status]}`}
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
          style={{ background: `${statusColor}18`, color: statusColor, alignSelf: 'flex-start' }}
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
          {TABLE_STATUS_LABELS[table.status]}
        </div>

        {/* Seated info */}
        {isOccupied && table.partySize && (
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Users size={10} />
            <span>{table.partySize} guests</span>
          </div>
        )}

        {/* Reservation info */}
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
