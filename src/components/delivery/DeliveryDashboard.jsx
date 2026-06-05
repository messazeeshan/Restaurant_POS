import React from 'react';
import { Clock, ChefHat, CheckCircle, TrendingUp } from 'lucide-react';
import { ORDER_STATUS } from '../../data/constants.js';
import { formatCurrency } from '../../utils/formatters.js';

export default function DeliveryDashboard({ orders }) {
  const pendingCount = orders.filter(o => o.status === 'NEW' || o.status === 'CONFIRMED').length;
  const inKitchenCount = orders.filter(o => o.status === ORDER_STATUS.IN_KITCHEN).length;
  const readyCount = orders.filter(o => o.status === ORDER_STATUS.READY).length;
  
  // Calculate today's revenue from completed delivery orders
  const todayRevenue = orders
    .filter(o => o.status === 'COMPLETED' && o.completedAt && (Date.now() - o.completedAt < 86400000))
    .reduce((sum, o) => {
      const itemsTotal = o.items.reduce((s, i) => {
        const itemPrice = i.price || 0;
        const modsTotal = (i.modifiers || []).reduce((mSum, m) => mSum + (m.priceModifier || 0), 0);
        return s + (itemPrice + modsTotal) * i.quantity;
      }, 0);
      return sum + itemsTotal;
    }, 0);

  const stats = [
    { label: 'Pending', value: pendingCount, icon: Clock, color: 'var(--info)' },
    { label: 'In Kitchen', value: inKitchenCount, icon: ChefHat, color: 'var(--warning)' },
    { label: 'Ready for Pickup', value: readyCount, icon: CheckCircle, color: 'var(--success)' },
    { label: "Today's Revenue", value: formatCurrency(todayRevenue), icon: TrendingUp, color: 'var(--accent)' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
      {stats.map(({ label, value, icon: Icon, color }) => (
        <div key={label} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 'var(--radius)', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon size={24} style={{ color }} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>{value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
