import React, { useState, useEffect } from 'react';
import { X, Check, DollarSign, CreditCard, Smartphone, Gift, Building2, Split } from 'lucide-react';
import useOrderStore from '../../store/useOrderStore.js';
import useTableStore from '../../store/useTableStore.js';
import useStaffStore from '../../store/useStaffStore.js';
import useAppStore from '../../store/useAppStore.js';
import { TIP_PRESETS, PAYMENT_METHOD, PAYMENT_METHOD_LABELS, SPLIT_METHOD, ORDER_STATUS, TABLE_STATUS } from '../../data/constants.js';
import { formatCurrency } from '../../utils/formatters.js';
import { calcOrderTotals, calcChange, calcEqualSplit } from '../../utils/calculations.js';
import NumPad from './NumPad.jsx';

const PAYMENT_ICONS = {
  [PAYMENT_METHOD.CASH]:          DollarSign,
  [PAYMENT_METHOD.CARD]:          CreditCard,
  [PAYMENT_METHOD.MOBILE]:        Smartphone,
  [PAYMENT_METHOD.GIFT_CARD]:     Gift,
  [PAYMENT_METHOD.HOUSE_ACCOUNT]: Building2,
};

/**
 * PaymentModal — full payment flow: bill summary → tip → method → confirmation
 */
export default function PaymentModal({ orderId, tableId, onClose }) {
  const { getOrderById, closeOrder, transitionOrderStatus } = useOrderStore();
  const { closeTable, updateTable } = useTableStore();
  const { addTip, addSales } = useStaffStore();
  const { addToast, setView } = useAppStore();

  const [step, setStep] = useState(1);
  const [tipPercent, setTipPercent] = useState(18);
  const [customTip, setCustomTip] = useState('');
  const [isCustomTip, setIsCustomTip] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [cashValue, setCashValue] = useState('');
  const [splitCount, setSplitCount] = useState(1);
  const [showSplit, setShowSplit] = useState(false);
  const [splitsPaid, setSplitsPaid] = useState(0);
  const [confetti, setConfetti] = useState(false);
  
  const [showReceiptPreview, setShowReceiptPreview] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printSuccess, setPrintSuccess] = useState(false);

  const order = getOrderById(orderId);
  if (!order) return null;

  const effectiveTipPct = isCustomTip ? (parseFloat(customTip) || 0) : tipPercent;
  const totals = calcOrderTotals(order.items, { taxRate: 0.085, tipPercent: effectiveTipPct, discount: order.discount });

  const cashTendered = parseFloat(cashValue) || 0;
  const { change, isValid: cashIsValid } = calcChange(cashTendered, totals.total);
  const splitAmounts = calcEqualSplit(totals.total, splitCount);

  const handlePayment = () => {
    if (!paymentMethod) return;
    if (paymentMethod === PAYMENT_METHOD.CASH && !cashIsValid) return;

    // Close order
    closeOrder(orderId, {
      paymentMethod,
      total: totals.total,
      subtotal: totals.subtotal,
      tax: totals.tax,
      tip: totals.tip,
      tipPercent: effectiveTipPct,
    });

    // Update staff
    if (order.serverId) {
      addTip(order.serverId, totals.tip);
      addSales(order.serverId, totals.total);
    }

    // Handle table
    if (tableId) {
      if (order.status === ORDER_STATUS.READY) {
        closeTable(tableId);
      } else {
        updateTable(tableId, { status: TABLE_STATUS.PAID });
      }
    }

    setConfetti(true);
    setStep(4);
    addToast({ type: 'success', message: `Payment of ${formatCurrency(totals.total)} processed!` });
  };

  const handleDone = () => {
    onClose();
  };

  const CONFETTI_COLORS = ['#FF6B35', '#2ECC8A', '#4A9EFF', '#F0A500', '#A855F7', '#E84545'];

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ width: 520, maxHeight: '90vh' }}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            {step === 1 && '💰 Bill Summary'}
            {step === 2 && '🎉 Select Tip'}
            {step === 3 && '💳 Payment Method'}
            {step === 4 && '✅ Payment Complete'}
          </div>
          {step < 4 && (
            <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close payment">
              <X size={18} />
            </button>
          )}
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* ── Step 1: Bill Summary ─────────────────────────── */}
          {step === 1 && (
            <>
              {/* Itemized */}
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                {order.items.map((item) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 14px', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                    <div>
                      <span style={{ fontWeight: 500 }}>{item.quantity}× {item.name}</span>
                      {item.modifiers.length > 0 && (
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {item.modifiers.map((m) => m.name).join(', ')}
                        </div>
                      )}
                    </div>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                      {formatCurrency(item.quantity * (item.price + item.modifiers.reduce((s, m) => s + m.priceModifier, 0)))}
                    </span>
                  </div>
                ))}

                {/* Totals */}
                {[
                  { label: 'Subtotal', value: totals.subtotal },
                  { label: 'Tax (8.5%)', value: totals.tax },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 14px', fontSize: 13, color: 'var(--text-secondary)' }}>
                    <span>{label}</span>
                    <span>{formatCurrency(value)}</span>
                  </div>
                ))}

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, borderTop: '1px solid var(--border)' }}>
                  <span>Total</span>
                  <span style={{ color: 'var(--accent)' }}>{formatCurrency(totals.total)}</span>
                </div>
              </div>

              {/* Split button */}
              <button
                className="btn btn-secondary"
                onClick={() => setShowSplit(!showSplit)}
                id="split-bill-btn"
                style={{ width: '100%' }}
              >
                <Split size={16} /> {showSplit ? 'Cancel Split' : 'Split Bill'}
              </button>

              {showSplit && (
                <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: 16 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, marginBottom: 12 }}>Split Equally</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => setSplitCount(Math.max(1, splitCount - 1))}>−</button>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, minWidth: 30, textAlign: 'center' }}>{splitCount}</span>
                    <button className="btn btn-secondary btn-sm" onClick={() => setSplitCount(Math.min(20, splitCount + 1))}>+</button>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>people</span>
                  </div>
                  {splitAmounts.map((amt, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < splitAmounts.length - 1 ? '1px solid var(--border)' : 'none', fontSize: 13 }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Person {i + 1}</span>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{formatCurrency(amt)}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── Step 2: Tip Selection ────────────────────────── */}
          {step === 2 && (
            <>
              <div style={{ textAlign: 'center', marginBottom: 8 }}>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Subtotal before tip</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>
                  {formatCurrency(totals.subtotal)}
                </div>
              </div>

              {/* Tip presets */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {TIP_PRESETS.map((pct) => (
                  <button
                    key={pct}
                    onClick={() => { setTipPercent(pct); setIsCustomTip(false); }}
                    style={{
                      padding: '16px 8px',
                      border: `2px solid ${!isCustomTip && tipPercent === pct ? 'var(--accent)' : 'var(--border)'}`,
                      borderRadius: 'var(--radius)',
                      background: !isCustomTip && tipPercent === pct ? 'var(--accent-muted)' : 'var(--bg-surface)',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'var(--transition)',
                    }}
                    id={`tip-${pct}`}
                    aria-pressed={!isCustomTip && tipPercent === pct}
                  >
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: !isCustomTip && tipPercent === pct ? 'var(--accent)' : 'var(--text-primary)' }}>{pct}%</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                      {formatCurrency(totals.subtotal * pct / 100)}
                    </div>
                  </button>
                ))}
                <button
                  onClick={() => { setIsCustomTip(true); setCustomTip(''); }}
                  style={{
                    padding: '16px 8px',
                    border: `2px solid ${isCustomTip ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius)',
                    background: isCustomTip ? 'var(--accent-muted)' : 'var(--bg-surface)',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'var(--transition)',
                  }}
                  id="tip-custom"
                  aria-pressed={isCustomTip}
                >
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700 }}>Custom</div>
                </button>
                <button
                  onClick={() => { setTipPercent(0); setIsCustomTip(false); }}
                  style={{
                    padding: '16px 8px',
                    border: `2px solid ${!isCustomTip && tipPercent === 0 ? 'var(--border-strong)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius)',
                    background: 'var(--bg-surface)',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'var(--transition)',
                    gridColumn: isCustomTip ? 'span 1' : undefined,
                  }}
                  id="tip-none"
                >
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text-muted)' }}>No Tip</div>
                </button>
              </div>

              {/* Custom tip input */}
              {isCustomTip && (
                <div className="form-group">
                  <label className="form-label">Custom Tip %</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Enter tip %"
                    value={customTip}
                    onChange={(e) => setCustomTip(e.target.value)}
                    min="0"
                    max="100"
                    id="custom-tip-input"
                  />
                </div>
              )}

              {/* Summary line */}
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total with {effectiveTipPct}% tip</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--accent)' }}>
                    {formatCurrency(totals.total)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Tip amount</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--success)' }}>
                    {formatCurrency(totals.tip)}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── Step 3: Payment Method ───────────────────────── */}
          {step === 3 && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                {Object.values(PAYMENT_METHOD).map((method) => {
                  const Icon = PAYMENT_ICONS[method];
                  const isSelected = paymentMethod === method;
                  return (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      style={{
                        padding: '18px 16px',
                        border: `2px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                        borderRadius: 'var(--radius)',
                        background: isSelected ? 'var(--accent-muted)' : 'var(--bg-surface)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 8,
                        transition: 'var(--transition)',
                      }}
                      id={`payment-method-${method}`}
                      aria-pressed={isSelected}
                    >
                      <Icon size={24} style={{ color: isSelected ? 'var(--accent)' : 'var(--text-secondary)' }} />
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: isSelected ? 'var(--accent)' : 'var(--text-primary)' }}>
                        {PAYMENT_METHOD_LABELS[method]}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Cash NumPad */}
              {paymentMethod === PAYMENT_METHOD.CASH && (
                <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 16 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, marginBottom: 12 }}>
                    Cash Amount — Due: <span style={{ color: 'var(--accent)' }}>{formatCurrency(totals.total)}</span>
                  </div>
                  <NumPad value={cashValue} onChange={setCashValue} />
                  {cashValue && (
                    <div style={{
                      marginTop: 12,
                      padding: '12px 16px',
                      background: cashIsValid ? 'var(--success-muted)' : 'var(--danger-muted)',
                      border: `1px solid ${cashIsValid ? 'rgba(46,204,138,0.3)' : 'rgba(232,69,69,0.3)'}`,
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                        {cashIsValid ? 'Change due:' : 'Short by:'}
                      </span>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: cashIsValid ? 'var(--success)' : 'var(--danger)' }}>
                        {cashIsValid ? formatCurrency(change) : formatCurrency(totals.total - cashTendered)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Card processing animation */}
              {paymentMethod === PAYMENT_METHOD.CARD && (
                <div style={{ textAlign: 'center', padding: '24px', background: 'var(--bg-surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>💳</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 4 }}>Tap card or insert chip</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    Amount: <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{formatCurrency(totals.total)}</span>
                  </div>
                </div>
              )}

              {/* Total due */}
              {paymentMethod && paymentMethod !== PAYMENT_METHOD.CASH && (
                <div style={{ background: 'var(--accent-muted)', border: '1px solid rgba(255,107,53,0.3)', borderRadius: 'var(--radius-sm)', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>Amount to charge</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: 'var(--accent)' }}>
                    {formatCurrency(totals.total)}
                  </span>
                </div>
              )}
            </>
          )}

          {/* ── Step 4: Success ──────────────────────────────── */}
          {step === 4 && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              {/* Animated checkmark */}
              <div style={{ marginBottom: 20 }}>
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'var(--success-muted)',
                    border: '3px solid var(--success)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                    animation: 'scale-up 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
                  }}
                >
                  <Check size={40} style={{ color: 'var(--success)', strokeWidth: 3 }} />
                </div>
              </div>

              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, marginBottom: 6 }}>
                Payment Complete!
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
                {formatCurrency(totals.total)} charged via {PAYMENT_METHOD_LABELS[paymentMethod]}
                {paymentMethod === PAYMENT_METHOD.CASH && change > 0 && (
                  <><br />Change: <span style={{ color: 'var(--success)', fontWeight: 700 }}>{formatCurrency(change)}</span></>
                )}
              </p>

              {/* Receipt options */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, maxWidth: 320, margin: '0 auto 20px' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowReceiptPreview(true)}
                  id="receipt-print"
                >
                  🖨️ Print Receipt
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={handleDone}
                  id="receipt-no"
                >
                  🚫 No Receipt
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer navigation */}
        <div className="modal-footer">
          {step === 1 && (
            <>
              <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button className="btn btn-primary btn-lg" onClick={() => setStep(2)} id="proceed-to-tip">
                Continue to Tip →
              </button>
            </>
          )}
          {step === 2 && (
            <>
              <button className="btn btn-secondary" onClick={() => setStep(1)}>← Back</button>
              <button className="btn btn-primary btn-lg" onClick={() => setStep(3)} id="proceed-to-payment">
                Select Payment →
              </button>
            </>
          )}
          {step === 3 && (
            <>
              <button className="btn btn-secondary" onClick={() => setStep(2)}>← Back</button>
              <button
                className="btn btn-success btn-lg"
                onClick={handlePayment}
                disabled={!paymentMethod || (paymentMethod === PAYMENT_METHOD.CASH && !cashIsValid)}
                id="confirm-payment-btn"
                style={{ minWidth: 160 }}
              >
                <Check size={18} /> Confirm Payment
              </button>
            </>
          )}
          {step === 4 && (
            <>
              <button className="btn btn-secondary" onClick={handleDone} id="return-floor-btn">
                Return to Floor
              </button>
              <button
                className="btn btn-primary btn-lg"
                onClick={() => { onClose(); }}
                id="new-order-btn"
              >
                Open New Order
              </button>
            </>
          )}
        </div>
      </div>

      {/* Receipt Preview Modal */}
      {showReceiptPreview && (
        <div className="modal-overlay" style={{ zIndex: 1010 }}>
          <div className="modal" style={{ width: 320, background: '#fff', color: '#000', fontFamily: 'monospace', padding: 0 }}>
            <div style={{ padding: '24px 24px 16px', maxHeight: '70vh', overflowY: 'auto' }}>
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <div style={{ fontSize: 20, fontWeight: 'bold' }}>Ember &amp; Oak</div>
                <div style={{ fontSize: 12 }}>Contemporary American Kitchen</div>
                <div style={{ borderBottom: '1px dashed #ccc', margin: '12px 0' }}></div>
                <div style={{ fontSize: 12 }}>142 Hearth Street, San Francisco, CA 94103</div>
                <div style={{ fontSize: 12 }}>(415) 555-0192</div>
                <div style={{ borderBottom: '1px dashed #ccc', margin: '12px 0' }}></div>
              </div>
              
              <div style={{ fontSize: 12, display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span>Receipt #: RCP-{orderId.split('-')[1] || Math.floor(Math.random() * 10000)}</span>
              </div>
              <div style={{ fontSize: 12, display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span>Date: {new Date().toLocaleDateString()}</span>
                <span>Time: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
              <div style={{ fontSize: 12, display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span>Table: {order.tableId}</span>
                <span>Server: {order.serverId ? useStaffStore.getState().getStaffById(order.serverId)?.name || order.serverId : '—'}</span>
              </div>
              <div style={{ fontSize: 12, marginBottom: 12 }}>
                Guests: {order.partySize}
              </div>
              <div style={{ borderBottom: '1px dashed #ccc', margin: '12px 0' }}></div>
              
              <div style={{ fontSize: 12, display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: 8 }}>
                <span>ITEM NAME</span>
                <span>QTY PRICE</span>
              </div>
              
              {order.items.map((item, idx) => {
                const itemPrice = item.price + item.modifiers.reduce((s, m) => s + m.priceModifier, 0);
                return (
                  <div key={idx} style={{ fontSize: 12, marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ maxWidth: 180 }}>{item.name}</span>
                      <span>{item.quantity} {formatCurrency(itemPrice * item.quantity)}</span>
                    </div>
                    {item.modifiers.map((m, midx) => (
                      <div key={midx} style={{ paddingLeft: 12, color: '#555' }}>  - {m.name}</div>
                    ))}
                    {item.specialRequest && (
                      <div style={{ paddingLeft: 12, fontStyle: 'italic', color: '#555' }}>  * {item.specialRequest}</div>
                    )}
                  </div>
                );
              })}
              
              <div style={{ borderBottom: '1px dashed #ccc', margin: '12px 0' }}></div>
              <div style={{ fontSize: 12, display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span>Subtotal:</span>
                <span>{formatCurrency(totals.subtotal)}</span>
              </div>
              {totals.discountAmount > 0 && (
                <div style={{ fontSize: 12, display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span>Discount:</span>
                  <span>-{formatCurrency(totals.discountAmount)}</span>
                </div>
              )}
              <div style={{ fontSize: 12, display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span>Tax (8.5%):</span>
                <span>{formatCurrency(totals.tax)}</span>
              </div>
              <div style={{ borderBottom: '1px dashed #ccc', margin: '12px 0' }}></div>
              {totals.tip > 0 && (
                <div style={{ fontSize: 12, display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span>TIP:</span>
                  <span>{formatCurrency(totals.tip)}</span>
                </div>
              )}
              <div style={{ borderBottom: '1px dashed #ccc', margin: '12px 0' }}></div>
              <div style={{ fontSize: 16, display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: 12 }}>
                <span>TOTAL:</span>
                <span>{formatCurrency(totals.total)}</span>
              </div>
              <div style={{ borderBottom: '1px dashed #ccc', margin: '12px 0' }}></div>
              
              <div style={{ fontSize: 12, marginBottom: 4 }}>
                Payment: {PAYMENT_METHOD_LABELS[paymentMethod]}
              </div>
              {paymentMethod === PAYMENT_METHOD.CASH && (
                <div style={{ fontSize: 12 }}>
                  Tendered: {formatCurrency(cashTendered)} / Change: {formatCurrency(change)}
                </div>
              )}
              <div style={{ borderBottom: '1px dashed #ccc', margin: '12px 0' }}></div>
              
              <div style={{ textAlign: 'center', fontSize: 12, marginTop: 16 }}>
                <div>Thank you for dining with us!</div>
                <div>We hope to see you again soon.</div>
                <div style={{ marginTop: 16, fontSize: 10 }}>Please retain for your records</div>
              </div>
            </div>
            
            <div style={{ display: 'flex', padding: 16, borderTop: '1px solid #ddd', background: '#f9f9f9', gap: 8 }}>
              <button 
                style={{ flex: 1, padding: '12px', border: '1px solid #ccc', background: '#fff', borderRadius: 4, cursor: 'pointer', color: '#000', fontSize: 14 }}
                onClick={() => setShowReceiptPreview(false)}
                disabled={isPrinting || printSuccess}
              >
                ← Back
              </button>
              <button 
                style={{ 
                  flex: 2, padding: '12px', border: 'none', borderRadius: 4, cursor: 'pointer', 
                  background: printSuccess ? '#2ECC8A' : '#0D0F14', color: '#fff', 
                  fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 14
                }}
                onClick={async () => {
                  setIsPrinting(true);
                  await new Promise(resolve => setTimeout(resolve, 2000));
                  setIsPrinting(false);
                  setPrintSuccess(true);
                  addToast({ type: 'success', message: 'Receipt printed successfully' });
                  setTimeout(() => {
                    setShowReceiptPreview(false);
                    handleDone();
                  }, 1000);
                }}
                disabled={isPrinting || printSuccess}
              >
                {isPrinting ? 'Printing... ⏳' : printSuccess ? '✅ Printed Successfully' : '🖨️ Confirm & Print'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confetti */}
      {confetti && (
        <div className="confetti-wrapper" aria-hidden="true">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="confetti-piece"
              style={{
                left: `${Math.random() * 100}%`,
                background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
                width: `${6 + Math.random() * 8}px`,
                height: `${6 + Math.random() * 8}px`,
                animationDuration: `${1.5 + Math.random() * 2}s`,
                animationDelay: `${Math.random() * 0.5}s`,
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
