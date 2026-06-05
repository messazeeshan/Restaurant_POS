// ============================================================
// UTILS — FORMATTERS
// ============================================================

/**
 * Format a number as USD currency
 * @param {number} amount
 * @param {boolean} showSign - show + prefix for positive
 */
export function formatCurrency(amount, showSign = false) {
  if (amount == null || isNaN(amount)) return '$0.00';
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(Math.abs(amount));
  if (showSign && amount > 0) return `+${formatted}`;
  if (amount < 0) return `-${formatted}`;
  return formatted;
}

/**
 * Format a price modifier for display (e.g. "+$1.50", "Free")
 */
export function formatModifierPrice(priceModifier) {
  if (!priceModifier || priceModifier === 0) return 'Free';
  return `+${formatCurrency(priceModifier)}`;
}

/**
 * Format a percentage
 * @param {number} value - decimal (0.085 = 8.5%)
 * @param {number} decimals
 */
export function formatPercent(value, decimals = 1) {
  if (value == null || isNaN(value)) return '0%';
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format a timestamp as a time string (e.g. "2:34 PM")
 */
export function formatTime(timestamp) {
  if (!timestamp) return '—';
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(timestamp));
}

/**
 * Format a timestamp as a full date string
 */
export function formatDate(timestamp) {
  if (!timestamp) return '—';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(timestamp));
}

/**
 * Format elapsed minutes into a human readable duration
 * @param {number} startTimestamp - epoch ms
 * @returns {string} e.g. "47 min"
 */
export function formatElapsed(startTimestamp) {
  if (!startTimestamp) return '—';
  const elapsed = Math.floor((Date.now() - startTimestamp) / 1000 / 60);
  if (elapsed < 1) return '< 1 min';
  if (elapsed < 60) return `${elapsed} min`;
  const hours = Math.floor(elapsed / 60);
  const mins = elapsed % 60;
  return `${hours}h ${mins}m`;
}

/**
 * Format elapsed seconds into MM:SS for KDS timer
 */
export function formatKDSTimer(startTimestamp) {
  if (!startTimestamp) return '00:00';
  const elapsed = Math.floor((Date.now() - startTimestamp) / 1000);
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Get elapsed minutes from a timestamp
 */
export function elapsedMinutes(startTimestamp) {
  if (!startTimestamp) return 0;
  return Math.floor((Date.now() - startTimestamp) / 1000 / 60);
}

/**
 * Get elapsed seconds from a timestamp
 */
export function elapsedSeconds(startTimestamp) {
  if (!startTimestamp) return 0;
  return Math.floor((Date.now() - startTimestamp) / 1000);
}

/**
 * Get initials from a name
 */
export function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Format a change amount (for cash payments)
 */
export function formatChange(cashTendered, total) {
  const change = cashTendered - total;
  if (change < 0) return { change: 0, owedMore: Math.abs(change) };
  return { change, owedMore: 0 };
}

/**
 * Truncate text to maxLen with ellipsis
 */
export function truncate(str, maxLen = 40) {
  if (!str) return '';
  return str.length > maxLen ? `${str.slice(0, maxLen - 3)}...` : str;
}

/**
 * Get a color class string for KDS timer
 */
export function getKDSTimerColor(startTimestamp, warningMins = 8, criticalMins = 12) {
  const elapsed = elapsedMinutes(startTimestamp);
  if (elapsed >= criticalMins) return 'kds-critical';
  if (elapsed >= warningMins) return 'kds-warning';
  return 'kds-ok';
}

/**
 * Format a date string (ISO) to display format
 */
export function formatDateString(dateStr) {
  if (!dateStr) return '—';
  const [year, month, day] = dateStr.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`;
}

/**
 * Format a loyalty tier with its color
 */
export function formatTierLabel(tier) {
  const colors = { Bronze: '#CD7F32', Silver: '#A8A9AD', Gold: '#FFD700' };
  return { label: tier, color: colors[tier] || '#888' };
}

/**
 * Convert cents to dollars for display
 */
export function centsToDisplay(cents) {
  return formatCurrency(cents / 100);
}
