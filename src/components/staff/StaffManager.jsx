import React, { useState } from 'react';
import { Plus, X, Clock, Save } from 'lucide-react';
import useStaffStore from '../../store/useStaffStore.js';
import useAppStore from '../../store/useAppStore.js';
import { STAFF_ROLE, STAFF_ROLE_COLORS } from '../../data/constants.js';
import { getInitials, formatCurrency, formatTime } from '../../utils/formatters.js';
import StaffCard from './StaffCard.jsx';

export default function StaffManager() {
  const { staff, clockIn, clockOut, addStaff, updateStaff, deleteStaff } = useStaffStore();
  const { addToast } = useAppStore();

  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', role: STAFF_ROLE.SERVER, pin: '', hourlyRate: '8.50' });

  const handleClockToggle = (member) => {
    if (member.clockedIn) {
      clockOut(member.id);
      addToast({ type: 'info', message: `${member.name} clocked out` });
    } else {
      clockIn(member.id);
      addToast({ type: 'success', message: `${member.name} clocked in` });
    }
    // Refresh selected
    if (selectedStaff?.id === member.id) {
      setSelectedStaff({ ...member, clockedIn: !member.clockedIn });
    }
  };

  const handleAddStaff = () => {
    if (!newStaff.name.trim() || !newStaff.pin) {
      addToast({ type: 'error', message: 'Name and PIN are required' });
      return;
    }
    addStaff({
      ...newStaff,
      id: `staff-${Date.now()}`,
      hourlyRate: parseFloat(newStaff.hourlyRate) || 8.5,
      clockedIn: false,
      clockInTime: null,
      avatar: getInitials(newStaff.name),
      tablesActive: [],
      tipsToday: 0,
      salesToday: 0,
      hoursToday: 0,
    });
    setNewStaff({ name: '', role: STAFF_ROLE.SERVER, pin: '', hourlyRate: '8.50' });
    setShowAddForm(false);
    addToast({ type: 'success', message: `${newStaff.name} added to team` });
  };

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* ── Staff Grid ───────────────────────────────────────── */}
      <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20 }}>Team</h2>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              {staff.filter((s) => s.clockedIn).length} of {staff.length} clocked in
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => setShowAddForm(true)} id="add-staff-btn">
            <Plus size={16} /> Add Staff
          </button>
        </div>

        {/* Summary row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Total Tips Today', value: formatCurrency(staff.reduce((s, m) => s + (m.tipsToday || 0), 0)), color: 'var(--success)' },
            { label: 'Total Sales', value: formatCurrency(staff.reduce((s, m) => s + (m.salesToday || 0), 0)), color: 'var(--accent)' },
            { label: 'Staff Clocked In', value: `${staff.filter((s) => s.clockedIn).length}/${staff.length}`, color: 'var(--info)' },
          ].map(({ label, value, color }) => (
            <div key={label} className="kpi-card">
              <div className="kpi-label">{label}</div>
              <div className="kpi-value" style={{ color, fontSize: 22 }}>{value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(220px, 1fr))', gap: 20, alignItems: 'stretch' }}>
          {staff.map((member) => (
            <StaffCard key={member.id} staff={member} onClick={() => setSelectedStaff(member)} />
          ))}
        </div>
      </div>

      {/* ── Staff Detail Panel ───────────────────────────────── */}
      {selectedStaff && (
        <div style={{ width: 320, flexShrink: 0, background: 'var(--bg-surface)', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800 }}>{selectedStaff.name}</div>
              <span className="badge" style={{ background: `${STAFF_ROLE_COLORS[selectedStaff.role]}18`, color: STAFF_ROLE_COLORS[selectedStaff.role], marginTop: 4 }}>
                {selectedStaff.role}
              </span>
            </div>
            <button className="btn btn-ghost btn-icon" onClick={() => setSelectedStaff(null)} aria-label="Close">
              <X size={18} />
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Avatar */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: `${STAFF_ROLE_COLORS[selectedStaff.role]}20`,
                border: `3px solid ${STAFF_ROLE_COLORS[selectedStaff.role]}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24,
                color: STAFF_ROLE_COLORS[selectedStaff.role],
              }}>
                {getInitials(selectedStaff.name)}
              </div>
            </div>

            {/* Clock in/out */}
            <button
              className={`btn btn-lg ${selectedStaff.clockedIn ? 'btn-danger' : 'btn-success'}`}
              style={{ width: '100%' }}
              onClick={() => handleClockToggle(selectedStaff)}
              id={`clock-toggle-${selectedStaff.id}`}
            >
              <Clock size={18} />
              {selectedStaff.clockedIn ? 'Clock Out' : 'Clock In'}
            </button>

            {selectedStaff.clockedIn && selectedStaff.clockInTime && (
              <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
                Clocked in at {formatTime(selectedStaff.clockInTime)}
              </div>
            )}

            {/* Stats */}
            <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', overflow: 'hidden' }}>
              {[
                { label: "Today's Hours", value: selectedStaff.clockedIn && selectedStaff.clockInTime ? `${((Date.now() - selectedStaff.clockInTime) / 1000 / 3600).toFixed(1)}h` : `${(selectedStaff.hoursToday || 0).toFixed(1)}h` },
                { label: "Tips Today", value: formatCurrency(selectedStaff.tipsToday || 0) },
                { label: "Sales Today", value: formatCurrency(selectedStaff.salesToday || 0) },
                { label: "Hourly Rate", value: `${formatCurrency(selectedStaff.hourlyRate)}/hr` },
                { label: "Active Tables", value: selectedStaff.tablesActive?.length || 0 },
              ].map(({ label, value }, i, arr) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13 }}>{value}</span>
                </div>
              ))}
            </div>

            {/* PIN display */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, fontFamily: 'var(--font-display)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Clock-in PIN</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, letterSpacing: '0.3em', color: 'var(--text-secondary)' }}>
                {'●'.repeat(4)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Staff Modal ──────────────────────────────────── */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal" style={{ width: 420 }}>
            <div className="modal-header">
              <div className="modal-title">Add Staff Member</div>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowAddForm(false)} aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="new-staff-name">Full Name</label>
                <input id="new-staff-name" className="form-input" value={newStaff.name} onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })} placeholder="e.g. Jordan Smith" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="new-staff-role">Role</label>
                  <select id="new-staff-role" className="form-select" value={newStaff.role} onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}>
                    {Object.values(STAFF_ROLE).map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="new-staff-pin">4-Digit PIN</label>
                  <input id="new-staff-pin" className="form-input" type="password" maxLength={4} value={newStaff.pin} onChange={(e) => setNewStaff({ ...newStaff, pin: e.target.value })} placeholder="••••" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="new-staff-rate">Hourly Rate ($)</label>
                <input id="new-staff-rate" className="form-input" type="number" step="0.50" min="0" value={newStaff.hourlyRate} onChange={(e) => setNewStaff({ ...newStaff, hourlyRate: e.target.value })} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowAddForm(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAddStaff} id="save-staff-btn">
                <Save size={16} /> Add Staff Member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
