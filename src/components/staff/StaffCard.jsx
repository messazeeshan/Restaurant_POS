import React from 'react';
import { Clock, DollarSign, Table } from 'lucide-react';
import { getInitials, formatCurrency } from '../../utils/formatters.js';
import { STAFF_ROLE_COLORS } from '../../data/constants.js';

/**
 * StaffCard — individual staff member card
 * @param {{ staff: object, onClick: () => void }} props
 */
export default function StaffCard({ staff, onClick }) {
  const hoursToday = staff.clockedIn && staff.clockInTime
    ? ((Date.now() - staff.clockInTime) / 1000 / 3600).toFixed(1)
    : (staff.hoursToday || 0).toFixed(1);

  const roleColor = STAFF_ROLE_COLORS[staff.role] || 'var(--text-muted)';

  return (
    <div
      className="card card-hover"
      style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 14, minWidth: 220, height: '100%' }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      aria-label={`${staff.name}, ${staff.role}`}
      id={`staff-card-${staff.id}`}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: `${roleColor}20`,
          border: `2px solid ${roleColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: 15,
          color: roleColor,
          flexShrink: 0,
        }}>
          {getInitials(staff.name)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {staff.name}
          </div>
          <div style={{ marginTop: 2 }}>
            <div style={{ marginBottom: 4 }}>
              <span className="badge" style={{ background: `${roleColor}18`, color: roleColor, fontSize: 10 }}>
                {staff.role}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: staff.clockedIn ? 'var(--success)' : 'var(--text-muted)', display: 'inline-block', flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: staff.clockedIn ? 'var(--success)' : 'var(--text-muted)' }}>
                {staff.clockedIn ? 'Clocked In' : 'Clocked Out'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginTop: 'auto' }}>
        {[
          { icon: Clock, label: 'Hours', value: `${hoursToday}h` },
          { icon: DollarSign, label: 'Tips', value: formatCurrency(staff.tipsToday || 0) },
          { icon: Table, label: 'Tables', value: staff.tablesActive?.length || 0 },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} style={{ minWidth: 0, textAlign: 'center', padding: '8px 4px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border)', overflow: 'hidden' }}>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
