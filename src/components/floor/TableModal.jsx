import React, { useState } from 'react';
import { X, Users, Plus, CreditCard, Printer, ArrowRightLeft, LogOut } from 'lucide-react';
import { TABLE_STATUS } from '../../data/constants.js';
import useTableStore from '../../store/useTableStore.js';
import useOrderStore from '../../store/useOrderStore.js';
import useStaffStore from '../../store/useStaffStore.js';
import useAppStore from '../../store/useAppStore.js';
import { VIEW } from '../../data/constants.js';
import { formatCurrency, formatElapsed, getInitials } from '../../utils/formatters.js';
import { calcOrderTotals } from '../../utils/calculations.js';

/**
 * TableModal — modal shown when clicking an occupied table
 * @param {{ table: object, onClose: function }} props
 */
export default function TableModal({ table, onClose }) {
  const { seatTable, closeTable, requestBill } = useTableStore();
  const { getOrderByTableId, createOrder } = useOrderStore();
  const { getStaffById, getServerStaff } = useStaffStore();
  const { setView, setActiveTableId, addToast } = useAppStore();

  const [mode, setMode] = useState(table.status === TABLE_STATUS.AVAILABLE ? 'seat' : 'view');
  const [partySize, setPartySize] = useState(table.partySize || 2);
  const [selectedServerId, setSelectedServerId] = useState(table.serverId || '');

  const order = getOrderByTableId(table.id);
  const server = table.serverId ? getStaffById(table.serverId) : null;
  const serverStaff = getServerStaff();

  const orderTotals = order
    ? calcOrderTotals(order.items, { taxRate: 0.085, tipPercent: order.tipPercent || 0 })
    : null;

  // ── Seat guests ─────────────────────────────────────────────
  const handleSeat = () => {
    if (!selectedServerId) {
      addToast({ type: 'error', message: 'Please select a server' });
      return;
    }
    seatTable(table.id, { partySize, serverId: selectedServerId });
    addToast({ type: 'success', message: `Table ${table.number} seated — ${partySize} guests` });
    onClose();
  };

  // ── Open order entry ────────────────────────────────────────
  const handleAddItems = () => {
    setActiveTableId(table.id);
    setView(VIEW.ORDER);
    onClose();
  };

  // ── Request bill ────────────────────────────────────────────
  const handleRequestBill = () => {
    requestBill(table.id);
    addToast({ type: 'info', message: `Bill requested for Table ${table.number}` });
    onClose();
  };

  // ── Close table ─────────────────────────────────────────────
  const handleCloseTable = () => {
    closeTable(table.id);
    addToast({ type: 'success', message: `Table ${table.number} closed` });
    onClose();
  };

  const isAvailable = table.status === TABLE_STATUS.AVAILABLE;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ width: 560, maxHeight: '80vh' }}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <div className="modal-title">Table {table.number}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              {table.zone} · Capacity {table.capacity}
              {table.seatedAt && <span> · {formatElapsed(table.seatedAt)}</span>}
            </div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* ── Seat Guests Form (Available tables) ─────────────── */}
          {isAvailable && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {/* Party size */}
                <div className="form-group">
                  <label className="form-label">Party Size</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setPartySize(Math.max(1, partySize - 1))}
                    >—</button>
                    <div style={{
                      flex: 1, textAlign: 'center', fontFamily: 'var(--font-display)',
                      fontWeight: 700, fontSize: 20, color: 'var(--text-primary)',
                    }}>
                      {partySize}
                    </div>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setPartySize(Math.min(table.capacity, partySize + 1))}
                    >+</button>
                  </div>
                </div>

                {/* Server assignment */}
                <div className="form-group">
                  <label className="form-label">Server</label>
                  <select
                    className="form-select"
                    value={selectedServerId}
                    onChange={(e) => setSelectedServerId(e.target.value)}
                    aria-label="Select server"
                  >
                    <option value="">Select server...</option>
                    {serverStaff.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ── Occupied Table View ──────────────────────────────── */}
          {!isAvailable && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Table meta */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {[
                  { label: 'Party Size', value: `${table.partySize || '—'} guests` },
                  { label: 'Server', value: server ? getInitials(server.name) + ' ' + server.name.split(' ')[0] : '—' },
                  { label: 'Time Seated', value: table.seatedAt ? formatElapsed(table.seatedAt) : '—' },
                ].map(({ label, value }) => (
                  <div key={label} style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', padding: '12px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 15, fontFamily: 'var(--font-display)', fontWeight: 700 }}>{value}</div>
                  </div>
                ))}
              </div>

              {/* Order summary */}
              {order && order.items.length > 0 ? (
                <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden' }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700 }}>Current Order</span>
                    <span className="badge badge-info">{order.items.length} items</span>
                  </div>
                  <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                    {order.items.map((item) => (
                      <div key={item.id} style={{ padding: '8px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>{item.quantity}× {item.name}</div>
                          {item.modifiers.length > 0 && (
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                              {item.modifiers.map((m) => m.name).join(', ')}
                            </div>
                          )}
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-display)', flexShrink: 0 }}>
                          {formatCurrency(item.quantity * (item.price + item.modifiers.reduce((s, m) => s + m.priceModifier, 0)))}
                        </div>
                      </div>
                    ))}
                  </div>
                  {orderTotals && (
                    <div style={{ padding: '12px 16px', background: 'var(--bg-elevated)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                        <span>Subtotal</span>
                        <span>{formatCurrency(orderTotals.subtotal)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>
                        <span>Total</span>
                        <span style={{ color: 'var(--accent)' }}>{formatCurrency(orderTotals.total)}</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: '24px', textAlign: 'center' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🍽️</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No items ordered yet</div>
                </div>
              )}

              {/* Action buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                <button className="btn btn-primary" onClick={handleAddItems} id={`add-items-${table.id}`}>
                  <Plus size={16} /> Add Items
                </button>
                <button className="btn btn-secondary" onClick={handleRequestBill} id={`request-bill-${table.id}`}>
                  <Printer size={16} /> Print / Request Bill
                </button>
                <button className="btn btn-secondary" id={`transfer-${table.id}`} onClick={() => addToast({ type: 'info', message: 'Transfer: select destination table' })}>
                  <ArrowRightLeft size={16} /> Transfer Table
                </button>
                <button className="btn btn-danger" onClick={handleCloseTable} id={`close-table-${table.id}`}>
                  <LogOut size={16} /> Close Table
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {isAvailable && (
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary btn-lg" onClick={handleSeat} id={`seat-table-${table.id}`}>
              <Users size={16} /> Seat {partySize} Guests
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
