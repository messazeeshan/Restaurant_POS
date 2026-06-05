// ============================================================
// UTILS — CALCULATIONS
// ============================================================

/**
 * Calculate the total price of a single order item (qty × (base + modifiers))
 * @param {object} item - order item with price, quantity, modifiers[]
 */
export function calcItemTotal(item) {
  const modifierSum = (item.modifiers || []).reduce(
    (sum, mod) => sum + (mod.priceModifier || 0),
    0
  );
  return item.quantity * (item.price + modifierSum);
}

/**
 * Calculate order subtotal (sum of all item totals)
 * @param {Array} items - order items
 */
export function calcSubtotal(items) {
  return (items || []).reduce((sum, item) => sum + calcItemTotal(item), 0);
}

/**
 * Calculate discount amount
 * @param {number} subtotal
 * @param {object} discount - { type: 'flat'|'percent', value: number }
 */
export function calcDiscount(subtotal, discount) {
  if (!discount || !discount.value) return 0;
  if (discount.type === 'percent') {
    return Math.min(subtotal * (discount.value / 100), subtotal);
  }
  return Math.min(discount.value, subtotal);
}

/**
 * Calculate tax amount
 * @param {number} taxableAmount
 * @param {number} taxRate - decimal (e.g. 0.085)
 */
export function calcTax(taxableAmount, taxRate = 0.085) {
  return taxableAmount * taxRate;
}

/**
 * Calculate tip amount
 * Note: tip is calculated on pre-tax subtotal (after discount)
 * @param {number} subtotalAfterDiscount
 * @param {number} tipPercent - as integer (e.g. 18 for 18%)
 */
export function calcTip(subtotalAfterDiscount, tipPercent) {
  if (!tipPercent || tipPercent === 0) return 0;
  return subtotalAfterDiscount * (tipPercent / 100);
}

/**
 * Full order calculation
 * @param {Array} items - order items
 * @param {object} options - { taxRate, tipPercent, discount }
 * @returns {object} - all calculated values
 */
export function calcOrderTotals(items, options = {}) {
  const { taxRate = 0.085, tipPercent = 0, discount = null } = options;

  const subtotal = calcSubtotal(items);
  const discountAmount = calcDiscount(subtotal, discount);
  const taxableAmount = subtotal - discountAmount;
  const tax = calcTax(taxableAmount, taxRate);
  const tip = calcTip(taxableAmount, tipPercent);
  const total = taxableAmount + tax + tip;

  return {
    subtotal,
    discountAmount,
    taxableAmount,
    tax,
    tip,
    total,
    taxRate,
    tipPercent,
  };
}

/**
 * Calculate change for cash payment
 * @param {number} cashTendered
 * @param {number} total
 * @returns {{ change: number, isValid: boolean }}
 */
export function calcChange(cashTendered, total) {
  const change = parseFloat((cashTendered - total).toFixed(2));
  return {
    change: Math.max(change, 0),
    isValid: cashTendered >= total,
    shortfall: change < 0 ? Math.abs(change) : 0,
  };
}

/**
 * Calculate equal split amounts
 * Rounds up the first person's share to account for rounding
 * @param {number} total
 * @param {number} numPeople
 * @returns {Array<number>} - array of amounts per person
 */
export function calcEqualSplit(total, numPeople) {
  if (numPeople <= 1) return [total];
  const base = Math.floor((total / numPeople) * 100) / 100;
  const remainder = parseFloat((total - base * numPeople).toFixed(2));
  const splits = Array(numPeople).fill(base);
  splits[0] = parseFloat((splits[0] + remainder).toFixed(2));
  return splits;
}

/**
 * Calculate labor cost percentage
 * @param {number} totalWages - total wage cost
 * @param {number} totalRevenue
 */
export function calcLaborCostPercent(totalWages, totalRevenue) {
  if (!totalRevenue) return 0;
  return (totalWages / totalRevenue) * 100;
}

/**
 * Calculate average check size
 * @param {number} totalRevenue
 * @param {number} numOrders
 */
export function calcAverageCheck(totalRevenue, numOrders) {
  if (!numOrders) return 0;
  return totalRevenue / numOrders;
}

/**
 * Calculate margin percentage for a menu item
 * @param {number} price - selling price
 * @param {number} cost - cost of goods sold
 */
export function calcMarginPercent(price, cost) {
  if (!price) return 0;
  return ((price - cost) / price) * 100;
}

/**
 * Round to nearest cent
 */
export function roundCents(amount) {
  return Math.round(amount * 100) / 100;
}

/**
 * Aggregate hourly revenue from a list of closed orders
 * @param {Array} orders - closed orders with total and createdAt
 * @returns {Array<{hour: number, label: string, revenue: number, covers: number}>}
 */
export function aggregateHourlyRevenue(orders) {
  const hourMap = {};
  for (let h = 7; h <= 23; h++) {
    const period = h < 12 ? 'AM' : 'PM';
    const display = h <= 12 ? h : h - 12;
    hourMap[h] = { hour: h, label: `${display}${period}`, revenue: 0, covers: 0, orders: 0 };
  }

  orders.forEach((order) => {
    if (!order.createdAt) return;
    const hour = new Date(order.createdAt).getHours();
    if (hourMap[hour]) {
      hourMap[hour].revenue += order.total || 0;
      hourMap[hour].covers += order.partySize || 0;
      hourMap[hour].orders += 1;
    }
  });

  return Object.values(hourMap).filter((h) => h.hour >= 7);
}

/**
 * Aggregate revenue by server
 * @param {Array} orders
 * @param {Array} staff
 */
export function aggregateByServer(orders, staff) {
  const staffMap = {};
  staff.forEach((s) => {
    staffMap[s.id] = { id: s.id, name: s.name, role: s.role, revenue: 0, covers: 0, orders: 0, tips: 0 };
  });

  orders.forEach((order) => {
    if (!order.serverId || !staffMap[order.serverId]) return;
    staffMap[order.serverId].revenue += order.total || 0;
    staffMap[order.serverId].covers += order.partySize || 0;
    staffMap[order.serverId].orders += 1;
    staffMap[order.serverId].tips += order.tip || 0;
  });

  return Object.values(staffMap).sort((a, b) => b.revenue - a.revenue);
}

/**
 * Aggregate payment method breakdown
 * @param {Array} orders
 * @returns {Array<{method: string, amount: number, count: number}>}
 */
export function aggregateByPaymentMethod(orders) {
  const methods = {};
  orders.forEach((order) => {
    if (!order.paymentMethod) return;
    if (!methods[order.paymentMethod]) {
      methods[order.paymentMethod] = { method: order.paymentMethod, amount: 0, count: 0 };
    }
    methods[order.paymentMethod].amount += order.total || 0;
    methods[order.paymentMethod].count += 1;
  });
  return Object.values(methods).sort((a, b) => b.amount - a.amount);
}
