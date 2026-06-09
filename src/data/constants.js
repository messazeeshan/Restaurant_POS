// ============================================================
// RESTAURANT POS — CONSTANTS & ENUMS
// ============================================================

// ── Order State Machine ──────────────────────────────────────
export const ORDER_STATUS = {
  DRAFT:         'DRAFT',
  PENDING_ADMIN: 'PENDING_ADMIN',
  IN_KITCHEN:    'IN_KITCHEN',
  ACCEPTED:      'ACCEPTED',
  READY:         'READY',
  PAID:          'PAID',
  CLOSED:        'CLOSED',
  VOID:          'VOID',
  REJECTED:      'REJECTED',
};

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.DRAFT]:         'Draft',
  [ORDER_STATUS.PENDING_ADMIN]: 'Pending Approval',
  [ORDER_STATUS.IN_KITCHEN]:    'In Kitchen',
  [ORDER_STATUS.ACCEPTED]:      'Accepted',
  [ORDER_STATUS.READY]:         'Ready',
  [ORDER_STATUS.PAID]:          'Paid',
  [ORDER_STATUS.CLOSED]:        'Closed',
  [ORDER_STATUS.VOID]:          'Void',
  [ORDER_STATUS.REJECTED]:      'Rejected',
};

export const ORDER_TYPE = {
  DINE_IN: 'DINE_IN',
  TAKEOUT: 'TAKEOUT',
  DELIVERY: 'DELIVERY',
  ONLINE: 'ONLINE',
};

// ── Table Statuses ────────────────────────────────────────────
export const TABLE_STATUS = {
  AVAILABLE: 'AVAILABLE',
  SEATED: 'SEATED',
  ORDERED: 'ORDERED',
  BILL_REQUESTED: 'BILL_REQUESTED',
  RESERVED: 'RESERVED',
  IN_KITCHEN: 'IN_KITCHEN',
  PAID: 'PAID',
  READY: 'READY',
  CLOSED: 'CLOSED',
};

export const TABLE_STATUS_LABELS = {
  [TABLE_STATUS.AVAILABLE]: 'Available',
  [TABLE_STATUS.SEATED]: 'Seated',
  [TABLE_STATUS.ORDERED]: 'Ordered',
  [TABLE_STATUS.BILL_REQUESTED]: 'Bill Requested',
  [TABLE_STATUS.RESERVED]: 'Reserved',
  [TABLE_STATUS.IN_KITCHEN]: 'Ordered',
  [TABLE_STATUS.PAID]: 'Paid — Awaiting Food',
  [TABLE_STATUS.READY]: 'Food Ready',
  [TABLE_STATUS.CLOSED]: 'Available',
};

export const TABLE_STATUS_COLORS = {
  [TABLE_STATUS.AVAILABLE]:      'var(--status-available)',
  [TABLE_STATUS.SEATED]:         'var(--status-seated)',
  [TABLE_STATUS.ORDERED]:        'var(--status-ordered)',
  [TABLE_STATUS.BILL_REQUESTED]: 'var(--status-bill)',
  [TABLE_STATUS.RESERVED]:       'var(--status-reserved)',
  [TABLE_STATUS.IN_KITCHEN]:     'var(--status-ordered)',
  [TABLE_STATUS.PAID]:           'var(--status-paid)',
  [TABLE_STATUS.READY]:          'var(--status-available)',
  [TABLE_STATUS.CLOSED]:         'var(--status-available)',
};

// ── Table Zones ───────────────────────────────────────────────
export const TABLE_ZONE = {
  INDOOR: 'Indoor',
  BAR: 'Bar',
  OUTDOOR: 'Outdoor',
  PRIVATE: 'Private',
};

// ── Payment Methods ───────────────────────────────────────────
export const PAYMENT_METHOD = {
  CASH: 'CASH',
  CARD: 'CARD',
  MOBILE: 'MOBILE',
  GIFT_CARD: 'GIFT_CARD',
  HOUSE_ACCOUNT: 'HOUSE_ACCOUNT',
};

export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHOD.CASH]: 'Cash',
  [PAYMENT_METHOD.CARD]: 'Card',
  [PAYMENT_METHOD.MOBILE]: 'Mobile Pay',
  [PAYMENT_METHOD.GIFT_CARD]: 'Gift Card',
  [PAYMENT_METHOD.HOUSE_ACCOUNT]: 'House Account',
};

export const PAYMENT_METHOD_ICONS = {
  [PAYMENT_METHOD.CASH]: '💵',
  [PAYMENT_METHOD.CARD]: '💳',
  [PAYMENT_METHOD.MOBILE]: '📱',
  [PAYMENT_METHOD.GIFT_CARD]: '🎁',
  [PAYMENT_METHOD.HOUSE_ACCOUNT]: '🏠',
};

// ── Staff Roles ───────────────────────────────────────────────
export const STAFF_ROLE = {
  OWNER: 'Owner',
  MANAGER: 'Manager',
  SERVER: 'Server',
  CASHIER: 'Cashier',
  BARTENDER: 'Bartender',
  KITCHEN: 'Kitchen',
};

export const STAFF_ROLE_COLORS = {
  [STAFF_ROLE.OWNER]: '#A855F7',
  [STAFF_ROLE.MANAGER]: '#4A9EFF',
  [STAFF_ROLE.SERVER]: '#2ECC8A',
  [STAFF_ROLE.CASHIER]: '#F0A500',
  [STAFF_ROLE.BARTENDER]: '#FF6B35',
  [STAFF_ROLE.KITCHEN]: '#E84545',
};

// ── Loyalty Tiers ─────────────────────────────────────────────
export const LOYALTY_TIER = {
  BRONZE: 'Bronze',
  SILVER: 'Silver',
  GOLD: 'Gold',
};

export const LOYALTY_TIER_THRESHOLDS = {
  [LOYALTY_TIER.BRONZE]: 0,
  [LOYALTY_TIER.SILVER]: 500,
  [LOYALTY_TIER.GOLD]: 1500,
};

export const LOYALTY_TIER_COLORS = {
  [LOYALTY_TIER.BRONZE]: '#CD7F32',
  [LOYALTY_TIER.SILVER]: '#A8A9AD',
  [LOYALTY_TIER.GOLD]: '#FFD700',
};

// ── Tax Classes ───────────────────────────────────────────────
export const TAX_CLASS = {
  FOOD: 'Food',
  ALCOHOL: 'Alcohol',
  NON_TAXABLE: 'Non-taxable',
};

// ── Dietary Flags ─────────────────────────────────────────────
export const DIETARY_FLAGS = ['Vegan', 'Vegetarian', 'Gluten-Free', 'Halal', 'Spicy'];

// ── Allergens ─────────────────────────────────────────────────
export const ALLERGENS = ['Nuts', 'Dairy', 'Gluten', 'Shellfish', 'Eggs', 'Soy'];

// ── Kitchen Stations ──────────────────────────────────────────
export const KITCHEN_STATION = {
  ALL: 'All',
  GRILL: 'Grill',
  COLD: 'Cold',
  BAR: 'Bar',
  EXPEDITER: 'Expediter',
};

// ── Modifier Types ────────────────────────────────────────────
export const MODIFIER_TYPE = {
  REQUIRED: 'REQUIRED',   // radio — must select one
  OPTIONAL: 'OPTIONAL',   // checkbox — select 0 or more
};

// ── Tip Presets ───────────────────────────────────────────────
export const TIP_PRESETS = [15, 18, 20, 22];

// ── Split Methods ─────────────────────────────────────────────
export const SPLIT_METHOD = {
  EQUAL: 'EQUAL',
  BY_ITEM: 'BY_ITEM',
  CUSTOM: 'CUSTOM',
};

// ── Navigation Views ─────────────────────────────────────────
export const VIEW = {
  FLOOR:     'floor',
  ORDERS:    'orders',
  ORDER:     'order',
  KITCHEN:   'kitchen',
  DELIVERY:  'delivery',
  MENU:      'menu',
  STAFF:     'staff',
  REPORTS:   'reports',
  CUSTOMERS: 'customers',
  SETTINGS:  'settings',
};

// ── localStorage Keys ─────────────────────────────────────────
export const STORAGE_KEYS = {
  VERSION:       'pos_data_v1',
  INITIALIZED:   'pos_initialized',
  THEME:         'pos_theme',
  ORDERS:        'pos_orders',
  MENU:          'pos_menu',
  TABLES:        'pos_tables',
  STAFF:         'pos_staff',
  CUSTOMERS:     'pos_customers',
  SETTINGS:      'pos_settings',
  ACTIVE_ORDER:  'pos_active_order',
  SESSION:       'pos_session',
  AUDIO_ENABLED: 'pos_audio_enabled',
  MESSAGES:      'pos_messages',
  NOTIFICATIONS: 'pos_notifications',
};

// ── Auth Users (hardcoded — no backend needed) ────────────────
export const AUTH_USERS = [
  { username: 'manager', password: 'ember2025', role: 'manager', name: 'Alex Rivera', staffId: 'staff-alex' },
  { username: 'sarah',   password: 'server123', role: 'waiter',  name: 'Sarah Chen',  staffId: 'staff-sarah' },
  { username: 'marcus',  password: 'server123', role: 'waiter',  name: 'Marcus Williams', staffId: 'staff-marcus' },
  { username: 'jamie',   password: 'bar123',    role: 'waiter',  name: 'Jamie Lee',   staffId: 'staff-jamie' },
];

// ── SLA Thresholds ─────────────────────────────────────────────
export const SLA = {
  ACCEPT_SECONDS:      120,   // 2 minutes to accept a ticket
  ALERT_REPEAT_MS:     30000, // repeat SLA tone every 30s
};

// ── KDS Timer Thresholds (minutes) ────────────────────────────
export const KDS_TIMER = {
  WARNING: 8,
  CRITICAL: 12,
};

// ── Business Defaults ─────────────────────────────────────────
export const DEFAULTS = {
  TAX_RATE: 0.085,          // 8.5%
  SERVICE_CHARGE: 0,
  TABLE_TURN_TARGET: 90,    // minutes
  MAX_TOASTS: 3,
  TOAST_DURATION: 3000,
  ORDER_HISTORY_LIMIT: 500,
};

// ── Category Colors (for placeholder UI) ─────────────────────
export const CATEGORY_COLORS = {
  Starters:    '#FF6B35',
  Salads:      '#2ECC8A',
  Mains:       '#4A9EFF',
  Sides:       '#F0A500',
  Desserts:    '#A855F7',
  Cocktails:   '#E84545',
  Wine:        '#CD7F32',
  Beer:        '#F0A500',
  'Soft Drinks': '#2ECC8A',
  Coffee:      '#8B6914',
};

// ── Hourly Revenue Seed Keys ──────────────────────────────────
export const HOURS_OF_DAY = Array.from({ length: 18 }, (_, i) => {
  const hour = i + 7; // 7am to 12am
  const period = hour < 12 ? 'AM' : 'PM';
  const displayHour = hour <= 12 ? hour : hour - 12;
  return { hour, label: `${displayHour}${period}` };
});
