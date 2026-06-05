import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { formatCurrency } from '../../utils/formatters.js';
import { aggregateHourlyRevenue, aggregateByPaymentMethod } from '../../utils/calculations.js';

const CHART_COLORS = ['#FF6B35', '#2ECC8A', '#4A9EFF', '#F0A500', '#A855F7'];

/**
 * SalesChart — hourly revenue line chart for the reports dashboard
 * @param {{ orders: Array }} props
 */
export function SalesChart({ orders }) {
  const data = aggregateHourlyRevenue(orders);
  const visibleData = data.filter((d) => d.revenue > 0 || d.hour <= new Date().getHours());

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px 14px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 13, color: 'var(--accent)' }}>{formatCurrency(payload[0]?.value || 0)}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{payload[1]?.value || 0} covers</div>
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={visibleData} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-muted)', fontFamily: 'var(--font-body)' }} />
        <YAxis tickFormatter={(v) => `$${v}`} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
        <Tooltip content={<CustomTooltip />} />
        <Line type="monotone" dataKey="revenue" stroke="var(--accent)" strokeWidth={2.5} dot={{ r: 3, fill: 'var(--accent)' }} activeDot={{ r: 5 }} />
        <Line type="monotone" dataKey="covers" stroke="var(--info)" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

/**
 * PaymentPieChart — donut chart for payment method breakdown
 * @param {{ orders: Array }} props
 */
export function PaymentPieChart({ orders }) {
  const data = aggregateByPaymentMethod(orders);
  const LABELS = { CASH: 'Cash', CARD: 'Card', MOBILE: 'Mobile', GIFT_CARD: 'Gift Card', HOUSE_ACCOUNT: 'House Acct' };

  if (data.length === 0) {
    return (
      <div className="empty-state" style={{ padding: 30 }}>
        <div style={{ fontSize: 28 }}>🥧</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>No payment data yet</div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={80}
          paddingAngle={3}
          dataKey="amount"
          nameKey="method"
        >
          {data.map((entry, index) => (
            <Cell key={entry.method} fill={CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Legend
          formatter={(value) => LABELS[value] || value}
          wrapperStyle={{ fontSize: 11, fontFamily: 'var(--font-body)' }}
        />
        <Tooltip
          formatter={(value) => [formatCurrency(value), 'Revenue']}
          contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

/**
 * TopItemsChart — horizontal bar chart of top items by revenue
 * @param {{ orders: Array }} props
 */
export function TopItemsChart({ orders }) {
  // Aggregate item revenues from closed orders
  const itemRevMap = {};
  orders.forEach((order) => {
    (order.items || []).forEach((item) => {
      if (!itemRevMap[item.name]) itemRevMap[item.name] = 0;
      const lineTotal = item.quantity * (item.price + (item.modifiers || []).reduce((s, m) => s + m.priceModifier, 0));
      itemRevMap[item.name] += lineTotal;
    });
  });

  const data = Object.entries(itemRevMap)
    .map(([name, revenue]) => ({ name: name.length > 20 ? name.slice(0, 18) + '…' : name, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);

  if (data.length === 0) {
    return (
      <div className="empty-state" style={{ padding: 30 }}>
        <div style={{ fontSize: 28 }}>📊</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>No item data yet</div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
        <XAxis type="number" tickFormatter={(v) => `$${v}`} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
        <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11, fill: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }} />
        <Tooltip
          formatter={(value) => [formatCurrency(value), 'Revenue']}
          contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
        />
        <Bar dataKey="revenue" fill="var(--accent)" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
