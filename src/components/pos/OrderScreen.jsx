import React, { useState, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import useOrderStore from '../../store/useOrderStore.js';
import useTableStore from '../../store/useTableStore.js';
import useStaffStore from '../../store/useStaffStore.js';
import useAppStore from '../../store/useAppStore.js';
import { ORDER_STATUS, MODIFIER_TYPE, VIEW } from '../../data/constants.js';
import MenuGrid from './MenuGrid.jsx';
import OrderTicket from './OrderTicket.jsx';
import ModifierModal from './ModifierModal.jsx';
import PaymentModal from './PaymentModal.jsx';

/**
 * OrderScreen — main order entry: split panel (ticket | menu grid)
 */
export default function OrderScreen() {
  const { activeTableId, currentStaffId, setView, addToast } = useAppStore();
  const { createOrder, getOrderByTableId, addItemToOrder, transitionOrderStatus, getOrderById } = useOrderStore();
  const { getTableById, setTableOrder } = useTableStore();
  const { getStaffById } = useStaffStore();

  const table = activeTableId ? getTableById(activeTableId) : null;

  // Get or create active order
  const [localOrderId, setLocalOrderId] = useState(() => {
    if (activeTableId) {
      const existing = getOrderByTableId(activeTableId);
      if (existing) return existing.id;
      // If coming from floor plan, create order immediately
      const id = createOrder({
        tableId: activeTableId,
        serverId: currentStaffId,
        partySize: table?.partySize || 1,
      });
      setTableOrder(activeTableId, id);
      return id;
    }
    return null;
  });

  const [showSetupModal, setShowSetupModal] = useState(!localOrderId);

  const [addedItemId, setAddedItemId] = useState(null);
  const [modifierItem, setModifierItem] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [seatMode, setSeatMode] = useState(false);
  const [activeSeat, setActiveSeat] = useState(1);

  const order = getOrderById(localOrderId);

  // ── Handle item tap from menu grid ───────────────────────────
  const handleItemSelect = useCallback((menuItem) => {
    // If modifiers exist, open modifier modal
    if (menuItem.modifierGroups && menuItem.modifierGroups.length > 0) {
      setModifierItem(menuItem);
    } else {
      // Add directly
      addItemToOrderHelper(menuItem, [], '', 1);
    }
  }, [localOrderId, seatMode, activeSeat]);

  const addItemToOrderHelper = (menuItem, modifiers, specialRequest, quantity) => {
    const newItem = {
      id: `oi-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      itemId: menuItem.id,
      name: menuItem.name,
      price: menuItem.price,
      quantity,
      modifiers,
      specialRequest,
      seatNumber: seatMode ? activeSeat : null,
    };
    addItemToOrder(localOrderId, newItem);

    // Flash animation on card
    setAddedItemId(menuItem.id);
    setTimeout(() => setAddedItemId(null), 500);

    addToast({ type: 'success', message: `${menuItem.name} added`, duration: 1500 });
  };

  // ── Modifier confirmed ────────────────────────────────────────
  const handleModifierConfirm = (selectedModifiers, specialRequest, quantity) => {
    addItemToOrderHelper(modifierItem, selectedModifiers, specialRequest, quantity);
    setModifierItem(null);
  };

  // ── Send to kitchen (via Orders approval section) ───────────────
  const handleSendToKitchen = () => {
    if (!order || order.items.length === 0) return;
    transitionOrderStatus(localOrderId, ORDER_STATUS.PENDING_ADMIN, currentStaffId);
    if (activeTableId) setTableOrder(activeTableId, localOrderId);
    addToast({ type: 'success', message: '📋 Order submitted — approve it in Orders section.' });
  };

  // ── Hold order ────────────────────────────────────────────────
  const handleHold = () => {
    addToast({ type: 'info', message: 'Order held' });
  };

  const handleStartOrder = (setupData) => {
    const id = createOrder({
      tableId: setupData.tableId,
      serverId: setupData.serverId,
      partySize: setupData.partySize,
    });
    if (setupData.tableId) {
      setTableOrder(setupData.tableId, id);
    }
    setLocalOrderId(id);
    setShowSetupModal(false);
  };

  if (showSetupModal) {
    return (
      <div className="order-screen" style={{ height: '100%', position: 'relative' }}>
        <OrderSetupModal 
          onStartOrder={handleStartOrder} 
          onCancel={() => setView(VIEW.FLOOR)} 
        />
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="order-screen" style={{ height: '100%' }}>
      {/* Back to floor button */}
      {activeTableId && (
        <button
          className="btn btn-ghost btn-sm"
          style={{ position: 'absolute', top: 60, left: 8, zIndex: 10 }}
          onClick={() => setView(VIEW.FLOOR)}
          id="back-to-floor-btn"
        >
          <ArrowLeft size={14} />
        </button>
      )}

      {/* LEFT: Order Ticket */}
      <div className="order-ticket-panel">
        <OrderTicket
          orderId={localOrderId}
          tableId={order.tableId}
          onSendToKitchen={handleSendToKitchen}
          onPayNow={() => setShowPayment(true)}
          onHold={handleHold}
          seatMode={seatMode}
          onToggleSeatMode={() => setSeatMode((s) => !s)}
          activeSeat={activeSeat}
          onSetActiveSeat={setActiveSeat}
          partySize={order.partySize || 1}
        />
      </div>

      {/* RIGHT: Menu Grid */}
      <div className="menu-grid-panel">
        <MenuGrid
          onItemSelect={handleItemSelect}
          addedItemId={addedItemId}
        />
      </div>

      {/* Modifier Modal */}
      {modifierItem && (
        <ModifierModal
          item={modifierItem}
          onConfirm={handleModifierConfirm}
          onClose={() => setModifierItem(null)}
        />
      )}

      {/* Payment Modal */}
      {showPayment && (
        <PaymentModal
          orderId={localOrderId}
          tableId={order.tableId}
          onClose={() => {
            setShowPayment(false);
            setView(VIEW.FLOOR);
          }}
        />
      )}
    </div>
  );
}

function OrderSetupModal({ onStartOrder, onCancel }) {
  const { tables } = useTableStore();
  const { staff } = useStaffStore();
  
  const [orderType, setOrderType] = useState('DINE_IN');
  const [selectedTable, setSelectedTable] = useState('');
  const [selectedServer, setSelectedServer] = useState('');
  const [partySize, setPartySize] = useState(1);

  const availableTables = tables.filter(t => t.status === 'AVAILABLE');
  const availableStaff = staff.filter(s => s.clockedIn);

  const isComplete = orderType === 'TAKEOUT'
    ? true
    : (selectedTable && selectedServer);

  const handleStart = () => {
    onStartOrder({
      orderType,
      tableId:   orderType === 'DINE_IN' ? selectedTable : null,
      serverId:  orderType === 'DINE_IN' ? selectedServer : null,
      partySize: orderType === 'DINE_IN' ? partySize : 1,
    });
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1000, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="modal" style={{ width: 400, maxWidth: '90%', background: 'var(--bg-surface)', padding: 24, borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-lg)' }}>
        <h2 style={{ marginBottom: 20, fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800 }}>New Order</h2>
        
        {/* Order Type */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <button 
            className={`btn ${orderType === 'DINE_IN' ? 'btn-primary' : 'btn-secondary'}`} 
            style={{ flex: 1 }} 
            onClick={() => setOrderType('DINE_IN')}
          >
            🍽️ Dine In
          </button>
          <button 
            className={`btn ${orderType === 'TAKEOUT' ? 'btn-primary' : 'btn-secondary'}`} 
            style={{ flex: 1 }} 
            onClick={() => setOrderType('TAKEOUT')}
          >
            🥡 Takeaway
          </button>
        </div>

        {/* Server Selection — Dine-In only */}
        {orderType === 'DINE_IN' && (
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Assign Staff</label>
            <select
              className="input"
              style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}
              value={selectedServer}
              onChange={(e) => setSelectedServer(e.target.value)}
            >
              <option value="" disabled>Select Staff Member...</option>
              {availableStaff.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
              ))}
            </select>
          </div>
        )}

        {/* Dine In specifics */}
        {orderType === 'DINE_IN' && (
          <>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Select Table</label>
              <select 
                className="input" 
                style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)' }} 
                value={selectedTable} 
                onChange={(e) => setSelectedTable(e.target.value)}
              >
                <option value="" disabled>Select Available Table...</option>
                {availableTables.map(t => (
                  <option key={t.id} value={t.id}>Table {t.id} (Capacity: {t.capacity})</option>
                ))}
              </select>
            </div>
            
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Party Size: {partySize}</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button className="btn btn-secondary" style={{ padding: '8px 16px' }} onClick={() => setPartySize(Math.max(1, partySize - 1))}>−</button>
                <span style={{ fontSize: 18, fontWeight: 700, width: 30, textAlign: 'center' }}>{partySize}</span>
                <button className="btn btn-secondary" style={{ padding: '8px 16px' }} onClick={() => setPartySize(partySize + 1)}>+</button>
              </div>
            </div>
          </>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, marginTop: 30 }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onCancel}>Cancel</button>
          <button className="btn btn-primary" style={{ flex: 2 }} disabled={!isComplete} onClick={handleStart}>
            Start Order
          </button>
        </div>
      </div>
    </div>
  );
}
