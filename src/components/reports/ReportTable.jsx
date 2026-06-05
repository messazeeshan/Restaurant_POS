import React from 'react';
import { formatCurrency, formatDate, formatTime } from '../../utils/formatters.js';
import { PAYMENT_METHOD_LABELS, ORDER_STATUS } from '../../data/constants.js';
import useStaffStore from '../../store/useStaffStore.js';
import { aggregateByServer } from '../../utils/calculations.js';

/**
 * ReportTable — tabular data view for sales and server reports
 * @param {{ orders: Array, type: 'transactions'|'servers' }} props
 */
export default function ReportTable({ orders, type = 'transactions' }) {
  const { staff } = useStaffStore();

  if (type === 'servers') {
    const serverData = aggregateByServer(orders, staff);
    return (
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Server</th>
              <th>Role</th>
              <th>Orders</th>
              <th>Covers</th>
              <th>Revenue</th>
              <th>Tips</th>
              <th>Avg Check</th>
            </tr>
          </thead>
          <tbody>
            {serverData.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>No server data yet</td></tr>
            ) : serverData.map((row) => (
              <tr key={row.id}>
                <td style={{ fontWeight: 600 }}>{row.name}</td>
                <td><span className="badge badge-muted">{row.role}</span></td>
                <td>{row.orders}</td>
                <td>{row.covers}</td>
                <td style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--accent)' }}>{formatCurrency(row.revenue)}</td>
                <td style={{ color: 'var(--success)' }}>{formatCurrency(row.tips)}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{formatCurrency(row.orders > 0 ? row.revenue / row.orders : 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Transactions table
  const sorted = [...orders].sort((a, b) => b.closedAt - a.closedAt).slice(0, 20);

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="data-table">
        <thead>
          <tr>
            <th>Order #</th>
            <th>Table</th>
            <th>Time</th>
            <th>Covers</th>
            <th>Server</th>
            <th>Payment</th>
            <th>Total</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>No transactions yet</td></tr>
          ) : sorted.map((order) => {
            const serverName = staff.find((s) => s.id === order.serverId)?.name || '—';
            return (
              <tr key={order.id}>
                <td style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
                  #{order.id.slice(-6).toUpperCase()}
                </td>
                <td style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{order.tableId || 'Takeout'}</td>
                <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{formatTime(order.closedAt)}</td>
                <td>{order.partySize}</td>
                <td style={{ fontSize: 13 }}>{serverName}</td>
                <td>
                  <span className="badge badge-muted">
                    {PAYMENT_METHOD_LABELS[order.paymentMethod] || '—'}
                  </span>
                </td>
                <td style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--accent)' }}>
                  {formatCurrency(order.total)}
                </td>
                <td>
                  <span className={`badge ${order.status === ORDER_STATUS.CLOSED ? 'badge-success' : 'badge-danger'}`}>
                    {order.status}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
