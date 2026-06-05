import React, { useState } from 'react';
import useDeliveryStore from '../../store/useDeliveryStore.js';
import useAppStore from '../../store/useAppStore.js';
import { ORDER_STATUS } from '../../data/constants.js';
import DeliveryDashboard from './DeliveryDashboard.jsx';
import DeliveryOrderCard from './DeliveryOrderCard.jsx';
import NewDeliveryOrderModal from './NewDeliveryOrderModal.jsx';

const TABS = ['All', 'New', 'In Kitchen', 'Ready', 'Completed'];

export default function DeliveryScreen() {
  const { orders } = useDeliveryStore();
  const [activeTab, setActiveTab] = useState('All');
  const [showNewOrder, setShowNewOrder] = useState(false);

  // Filter orders
  const filteredOrders = orders.filter(o => {
    if (activeTab === 'All') return true;
    if (activeTab === 'New') return o.status === 'NEW';
    if (activeTab === 'In Kitchen') return o.status === ORDER_STATUS.IN_KITCHEN;
    if (activeTab === 'Ready') return o.status === ORDER_STATUS.READY;
    if (activeTab === 'Completed') return o.status === 'COMPLETED';
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '24px 24px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, margin: 0 }}>Delivery & Orders</h1>
          <button className="btn btn-primary" onClick={() => setShowNewOrder(true)}>
            + New Delivery
          </button>
        </div>
        
        <DeliveryDashboard orders={orders} />
        
        <div className="tabs" style={{ marginTop: 24 }}>
          {TABS.map(tab => {
            const count = tab === 'All' ? orders.length : orders.filter(o => {
              if (tab === 'New') return o.status === 'NEW';
              if (tab === 'In Kitchen') return o.status === ORDER_STATUS.IN_KITCHEN;
              if (tab === 'Ready') return o.status === ORDER_STATUS.READY;
              if (tab === 'Completed') return o.status === 'COMPLETED';
              return false;
            }).length;

            return (
              <button
                key={tab}
                className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
                <span className="badge badge-info" style={{ marginLeft: 8, fontSize: 11, padding: '2px 6px' }}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
        {filteredOrders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🛵</div>
            <div className="empty-state-title">No orders found</div>
            <div className="empty-state-subtitle">There are no {activeTab.toLowerCase()} orders at the moment.</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {filteredOrders.map(order => (
              <DeliveryOrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>

      {showNewOrder && (
        <NewDeliveryOrderModal onClose={() => setShowNewOrder(false)} />
      )}
    </div>
  );
}
