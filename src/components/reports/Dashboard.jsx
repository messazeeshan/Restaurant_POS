import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Users, DollarSign, BarChart2, Download } from 'lucide-react';
import useOrderStore from '../../store/useOrderStore.js';
import useStaffStore from '../../store/useStaffStore.js';
import { formatCurrency, formatPercent } from '../../utils/formatters.js';
import { calcAverageCheck, calcLaborCostPercent } from '../../utils/calculations.js';
import { SalesChart, PaymentPieChart, TopItemsChart } from './SalesChart.jsx';
import ReportTable from './ReportTable.jsx';
import { downloadCSV, exportCSV } from '../../utils/persistence.js';

const DATE_RANGES = ['Today', 'Yesterday', 'This Week', 'This Month'];

export default function Dashboard() {
  const { getTodaysOrders, getClosedOrders, getPaidAndClosedOrders } = useOrderStore();
  const { getTotalLaborCost } = useStaffStore();

  const [dateRange, setDateRange] = useState('Today');
  const [activeTab, setActiveTab] = useState('transactions');

  const todaysOrders = getTodaysOrders();
  const allOrders = getPaidAndClosedOrders();

  // Filter based on date range
  const getFilteredOrders = () => {
    const now = Date.now();
    const day = 86400000;
    if (dateRange === 'Today') return todaysOrders;
    if (dateRange === 'Yesterday') {
      const start = new Date(); start.setDate(start.getDate() - 1); start.setHours(0, 0, 0, 0);
      const end = new Date(); end.setDate(end.getDate() - 1); end.setHours(23, 59, 59, 999);
      return allOrders.filter((o) => {
        const t = o.closedAt || o.createdAt;
        return t >= start.getTime() && t <= end.getTime();
      });
    }
    if (dateRange === 'This Week') return allOrders.filter((o) => (o.closedAt || o.createdAt) >= now - 7 * day);
    if (dateRange === 'This Month') return allOrders.filter((o) => (o.closedAt || o.createdAt) >= now - 30 * day);
    return allOrders;
  };

  const filteredOrders = getFilteredOrders();
  const revenue = filteredOrders.reduce((s, o) => s + (o.total || 0), 0);
  const covers = filteredOrders.reduce((s, o) => s + (o.partySize || 0), 0);
  const avgCheck = calcAverageCheck(revenue, filteredOrders.length);
  const laborCost = getTotalLaborCost();
  const laborPct = calcLaborCostPercent(laborCost, revenue);

  const handleExport = () => {
    const csv = exportCSV(filteredOrders.map((o) => ({
      id: o.id,
      table: o.tableId,
      total: o.total?.toFixed(2),
      tax: o.tax?.toFixed(2),
      tip: o.tip?.toFixed(2),
      payment: o.paymentMethod,
      covers: o.partySize,
      time: new Date(o.closedAt || o.paidAt || o.createdAt).toLocaleString(),
    })), ['id', 'table', 'total', 'tax', 'tip', 'payment', 'covers', 'time']);
    downloadCSV(csv, `sales-${dateRange.toLowerCase().replace(' ', '-')}.csv`);
  };

  const kpiData = [
    {
      label: 'Revenue',
      value: formatCurrency(revenue),
      icon: DollarSign,
      color: 'var(--accent)',
      delta: '+12.4%',
      deltaUp: true,
    },
    {
      label: 'Covers',
      value: covers.toString(),
      icon: Users,
      color: 'var(--info)',
      delta: '+8.2%',
      deltaUp: true,
    },
    {
      label: 'Avg Check',
      value: formatCurrency(avgCheck),
      icon: BarChart2,
      color: 'var(--success)',
      delta: '+3.1%',
      deltaUp: true,
    },
    {
      label: 'Labor Cost %',
      value: `${laborPct.toFixed(1)}%`,
      icon: TrendingDown,
      color: laborPct > 35 ? 'var(--danger)' : laborPct > 25 ? 'var(--warning)' : 'var(--success)',
      delta: revenue > 0 ? `${formatCurrency(laborCost)}` : '—',
      deltaUp: laborPct < 30,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, height: '100%', overflowY: 'auto', padding: 0 }}>
      {/* Top bar: date range + export */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div className="tabs">
          {DATE_RANGES.map((r) => (
            <button
              key={r}
              className={`tab-btn ${dateRange === r ? 'active' : ''}`}
              onClick={() => setDateRange(r)}
              id={`range-${r.replace(' ', '-')}`}
            >
              {r}
            </button>
          ))}
        </div>
        <button className="btn btn-secondary" onClick={handleExport} id="export-csv-btn">
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, flexShrink: 0 }}>
        {kpiData.map(({ label, value, icon: Icon, color, delta, deltaUp }) => (
          <div key={label} className="kpi-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div className="kpi-label">{label}</div>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={18} style={{ color }} />
              </div>
            </div>
            <div className="kpi-value" style={{ color, fontSize: 24 }}>{value}</div>
            <div className={`kpi-delta ${deltaUp ? 'kpi-delta-up' : 'kpi-delta-down'}`}>
              {deltaUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {delta} vs yesterday
            </div>
          </div>
        ))}
      </div>

      {/* Charts grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, flexShrink: 0 }}>
        {/* Revenue chart */}
        <div className="card">
          <div className="section-header" style={{ marginBottom: 14 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>Hourly Revenue</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Today's performance</div>
          </div>
          {filteredOrders.length === 0 ? (
            <div className="empty-state" style={{ padding: 30 }}>
              <div style={{ fontSize: 28 }}>📈</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Start taking orders to see analytics</div>
            </div>
          ) : (
            <SalesChart orders={filteredOrders} />
          )}
        </div>

        {/* Payment breakdown */}
        <div className="card">
          <div className="section-header" style={{ marginBottom: 14 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>Payment Methods</div>
          </div>
          <PaymentPieChart orders={filteredOrders} />
        </div>
      </div>

      {/* Top items */}
      <div className="card" style={{ flexShrink: 0 }}>
        <div className="section-header" style={{ marginBottom: 14 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>Top Items by Revenue</div>
        </div>
        <TopItemsChart orders={filteredOrders} />
      </div>

      {/* Tables section */}
      <div className="card">
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {[{ label: 'Transactions', key: 'transactions' }, { label: 'By Server', key: 'servers' }].map(({ label, key }) => (
            <button
              key={key}
              className={`tab-pill ${activeTab === key ? 'active' : ''}`}
              onClick={() => setActiveTab(key)}
              id={`report-tab-${key}`}
            >
              {label}
            </button>
          ))}
        </div>
        <ReportTable orders={filteredOrders} type={activeTab} />
      </div>
    </div>
  );
}
