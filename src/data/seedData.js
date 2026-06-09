// ============================================================
// RESTAURANT POS — SEED DATA
// "Ember & Oak" — Contemporary American Kitchen
// ============================================================

import { TABLE_STATUS, TABLE_ZONE, STAFF_ROLE, LOYALTY_TIER, ORDER_STATUS, MODIFIER_TYPE } from './constants.js';

// ── Helpers ───────────────────────────────────────────────────
const now = Date.now();
const mins = (m) => now - m * 60 * 1000;
const uid = () => Math.random().toString(36).substr(2, 9);

// ── Menu Seed Data ────────────────────────────────────────────
export const SEED_MENU = {
  categories: [
    { id: 'cat-starters', name: 'Starters', color: '#FF6B35', sortOrder: 0 },
    { id: 'cat-salads', name: 'Salads', color: '#2ECC8A', sortOrder: 1 },
    { id: 'cat-mains', name: 'Mains', color: '#4A9EFF', sortOrder: 2 },
    { id: 'cat-sides', name: 'Sides', color: '#F0A500', sortOrder: 3 },
    { id: 'cat-desserts', name: 'Desserts', color: '#A855F7', sortOrder: 4 },
    { id: 'cat-cocktails', name: 'Cocktails', color: '#E84545', sortOrder: 5 },
    { id: 'cat-wine', name: 'Wine', color: '#CD7F32', sortOrder: 6 },
    { id: 'cat-beer', name: 'Beer', color: '#F0A500', sortOrder: 7 },
    { id: 'cat-soft-drinks', name: 'Soft Drinks', color: '#2ECC8A', sortOrder: 8 },
    { id: 'cat-coffee', name: 'Coffee', color: '#8B6914', sortOrder: 9 },
  ],
  items: [
    // ── Starters ─────────────────────────────────────────────
    {
      id: 'item-001', categoryId: 'cat-starters', name: 'Truffle Arancini',
      description: 'Crispy risotto balls with black truffle, parmesan, and truffle aioli', price: 14,
      cost: 4.5, taxClass: 'Food', dietaryFlags: ['Vegetarian'], allergens: ['Dairy', 'Gluten'],
      modifierGroups: [], station: 'Cold', status: 'active', sortOrder: 0,
    },
    {
      id: 'item-002', categoryId: 'cat-starters', name: 'Burrata & Heirloom Tomatoes',
      description: 'Fresh burrata, heirloom tomatoes, basil oil, aged balsamic', price: 16,
      cost: 5.5, taxClass: 'Food', dietaryFlags: ['Vegetarian', 'Gluten-Free'], allergens: ['Dairy'],
      modifierGroups: [], station: 'Cold', status: 'active', sortOrder: 1,
    },
    {
      id: 'item-003', categoryId: 'cat-starters', name: 'Wagyu Beef Sliders',
      description: 'Three mini wagyu burgers, pickled jalapeño, smoked cheddar, brioche', price: 18,
      cost: 7, taxClass: 'Food', dietaryFlags: [], allergens: ['Dairy', 'Gluten'],
      modifierGroups: [], station: 'Grill', status: 'active', sortOrder: 2,
    },
    {
      id: 'item-004', categoryId: 'cat-starters', name: 'Charred Octopus',
      description: 'Spanish octopus, romesco, fingerling potatoes, smoked paprika aioli', price: 19,
      cost: 8, taxClass: 'Food', dietaryFlags: ['Gluten-Free'], allergens: ['Shellfish'],
      modifierGroups: [], station: 'Grill', status: 'active', sortOrder: 3,
    },
    {
      id: 'item-005', categoryId: 'cat-starters', name: 'Soup of the Day',
      description: 'Ask your server for today\'s selection', price: 9,
      cost: 2.5, taxClass: 'Food', dietaryFlags: [], allergens: ['Dairy'],
      modifierGroups: [], station: 'Cold', status: 'active', sortOrder: 4,
    },
    // ── Salads ────────────────────────────────────────────────
    {
      id: 'item-006', categoryId: 'cat-salads', name: 'Caesar Salad',
      description: 'Romaine hearts, house caesar dressing, parmesan crisp, anchovy', price: 15,
      cost: 4, taxClass: 'Food', dietaryFlags: [], allergens: ['Dairy', 'Eggs'],
      modifierGroups: [
        {
          id: 'mg-dressing', name: 'Dressing', type: MODIFIER_TYPE.REQUIRED, options: [
            { id: 'mod-caesar', name: 'Caesar', priceModifier: 0 },
            { id: 'mod-ranch', name: 'Ranch', priceModifier: 0 },
            { id: 'mod-balsamic', name: 'Balsamic', priceModifier: 0 },
            { id: 'mod-vinaigrette', name: 'Vinaigrette', priceModifier: 0 },
          ],
        },
        {
          id: 'mg-salad-add', name: 'Add-ons', type: MODIFIER_TYPE.OPTIONAL, options: [
            { id: 'mod-add-chicken', name: 'Add Chicken', priceModifier: 8 },
            { id: 'mod-add-shrimp', name: 'Add Shrimp', priceModifier: 10 },
          ],
        },
      ],
      station: 'Cold', status: 'active', sortOrder: 0,
    },
    {
      id: 'item-007', categoryId: 'cat-salads', name: 'Ember Chopped Salad',
      description: 'Grilled corn, avocado, cherry tomato, feta, pepitas, honey lime', price: 14,
      cost: 4.5, taxClass: 'Food', dietaryFlags: ['Vegetarian', 'Gluten-Free'], allergens: ['Dairy'],
      modifierGroups: [
        {
          id: 'mg-dressing-2', name: 'Dressing', type: MODIFIER_TYPE.REQUIRED, options: [
            { id: 'mod-ranch-2', name: 'Ranch', priceModifier: 0 },
            { id: 'mod-balsamic-2', name: 'Balsamic', priceModifier: 0 },
            { id: 'mod-vinaigrette-2', name: 'Vinaigrette', priceModifier: 0 },
          ],
        },
        {
          id: 'mg-salad-add-2', name: 'Add-ons', type: MODIFIER_TYPE.OPTIONAL, options: [
            { id: 'mod-add-chicken-2', name: 'Add Chicken', priceModifier: 8 },
            { id: 'mod-add-shrimp-2', name: 'Add Shrimp', priceModifier: 10 },
          ],
        },
      ],
      station: 'Cold', status: 'active', sortOrder: 1,
    },
    {
      id: 'item-008', categoryId: 'cat-salads', name: 'Wedge Salad',
      description: 'Iceberg wedge, candied bacon, blue cheese crumble, cherry tomato', price: 13,
      cost: 3.5, taxClass: 'Food', dietaryFlags: ['Gluten-Free'], allergens: ['Dairy'],
      modifierGroups: [
        {
          id: 'mg-dressing-3', name: 'Dressing', type: MODIFIER_TYPE.REQUIRED, options: [
            { id: 'mod-ranch-3', name: 'Ranch', priceModifier: 0 },
            { id: 'mod-balsamic-3', name: 'Balsamic', priceModifier: 0 },
          ],
        },
      ],
      station: 'Cold', status: 'active', sortOrder: 2,
    },
    // ── Mains ─────────────────────────────────────────────────
    {
      id: 'item-009', categoryId: 'cat-mains', name: 'Ribeye Steak 12oz',
      description: 'Prime USDA ribeye, compound butter, roasted garlic, seasonal vegetable', price: 52,
      cost: 22, taxClass: 'Food', dietaryFlags: ['Gluten-Free'], allergens: ['Dairy'],
      modifierGroups: [
        {
          id: 'mg-steak-done', name: 'Doneness', type: MODIFIER_TYPE.REQUIRED, options: [
            { id: 'mod-rare', name: 'Rare', priceModifier: 0 },
            { id: 'mod-med-rare', name: 'Med-Rare', priceModifier: 0 },
            { id: 'mod-medium', name: 'Medium', priceModifier: 0 },
            { id: 'mod-med-well', name: 'Med-Well', priceModifier: 0 },
            { id: 'mod-well-done', name: 'Well-Done', priceModifier: 0 },
          ],
        },
        {
          id: 'mg-steak-add', name: 'Add-ons', type: MODIFIER_TYPE.OPTIONAL, options: [
            { id: 'mod-blue-cheese', name: 'Blue Cheese', priceModifier: 3 },
            { id: 'mod-peppercorn', name: 'Peppercorn Sauce', priceModifier: 3 },
          ],
        },
      ],
      station: 'Grill', status: 'active', sortOrder: 0,
    },
    {
      id: 'item-010', categoryId: 'cat-mains', name: 'Pan-Seared Salmon',
      description: 'Atlantic salmon, lemon caper beurre blanc, asparagus, roasted tomato', price: 34,
      cost: 13, taxClass: 'Food', dietaryFlags: ['Gluten-Free'], allergens: ['Dairy', 'Shellfish'],
      modifierGroups: [], station: 'Grill', status: 'active', sortOrder: 1,
    },
    {
      id: 'item-011', categoryId: 'cat-mains', name: 'Half Roast Chicken',
      description: 'Free-range half chicken, herb jus, roasted root vegetables', price: 29,
      cost: 10, taxClass: 'Food', dietaryFlags: ['Gluten-Free'], allergens: [],
      modifierGroups: [], station: 'Grill', status: 'active', sortOrder: 2,
    },
    {
      id: 'item-012', categoryId: 'cat-mains', name: 'Linguine Alle Vongole',
      description: 'Fresh clams, white wine, garlic, chili, parsley, bronze-die linguine', price: 28,
      cost: 9, taxClass: 'Food', dietaryFlags: [], allergens: ['Shellfish', 'Gluten'],
      modifierGroups: [], station: 'Cold', status: 'active', sortOrder: 3,
    },
    {
      id: 'item-013', categoryId: 'cat-mains', name: 'Mushroom Risotto',
      description: 'Wild mushroom blend, truffle oil, parmesan, crispy sage', price: 26,
      cost: 7, taxClass: 'Food', dietaryFlags: ['Vegetarian', 'Gluten-Free'], allergens: ['Dairy'],
      modifierGroups: [], station: 'Cold', status: 'active', sortOrder: 4,
    },
    {
      id: 'item-014', categoryId: 'cat-mains', name: 'Chicken Burger',
      description: 'Crispy fried chicken thigh, pickles, slaw, sriracha mayo, brioche bun', price: 22,
      cost: 7.5, taxClass: 'Food', dietaryFlags: [], allergens: ['Gluten', 'Eggs'],
      modifierGroups: [
        {
          id: 'mg-burger-done', name: 'Cooking', type: MODIFIER_TYPE.REQUIRED, options: [
            { id: 'mod-burg-mdr', name: 'Med-Rare', priceModifier: 0 },
            { id: 'mod-burg-med', name: 'Medium', priceModifier: 0 },
            { id: 'mod-burg-wd', name: 'Well-Done', priceModifier: 0 },
          ],
        },
        {
          id: 'mg-burger-add', name: 'Add-ons', type: MODIFIER_TYPE.OPTIONAL, options: [
            { id: 'mod-bacon', name: 'Bacon', priceModifier: 3 },
            { id: 'mod-avocado', name: 'Avocado', priceModifier: 3 },
            { id: 'mod-extra-cheese', name: 'Extra Cheese', priceModifier: 2 },
          ],
        },
      ],
      station: 'Grill', status: 'active', sortOrder: 5,
    },
    {
      id: 'item-015', categoryId: 'cat-mains', name: 'Smash Burger',
      description: 'Double smashed beef patty, American cheese, special sauce, pickles', price: 21,
      cost: 7, taxClass: 'Food', dietaryFlags: [], allergens: ['Gluten', 'Dairy'],
      modifierGroups: [
        {
          id: 'mg-smash-done', name: 'Cooking', type: MODIFIER_TYPE.REQUIRED, options: [
            { id: 'mod-smash-mdr', name: 'Med-Rare', priceModifier: 0 },
            { id: 'mod-smash-med', name: 'Medium', priceModifier: 0 },
            { id: 'mod-smash-wd', name: 'Well-Done', priceModifier: 0 },
          ],
        },
        {
          id: 'mg-smash-add', name: 'Add-ons', type: MODIFIER_TYPE.OPTIONAL, options: [
            { id: 'mod-smash-bacon', name: 'Bacon', priceModifier: 3 },
            { id: 'mod-smash-avo', name: 'Avocado', priceModifier: 3 },
            { id: 'mod-smash-cheese', name: 'Extra Cheese', priceModifier: 2 },
          ],
        },
      ],
      station: 'Grill', status: 'active', sortOrder: 6,
    },
    // ── Sides ─────────────────────────────────────────────────
    {
      id: 'item-016', categoryId: 'cat-sides', name: 'Truffle Fries',
      description: 'Crispy shoestring fries, parmesan, truffle oil, herbs', price: 10,
      cost: 2.5, taxClass: 'Food', dietaryFlags: ['Vegan', 'Gluten-Free'], allergens: [],
      modifierGroups: [], station: 'Grill', status: 'active', sortOrder: 0,
    },
    {
      id: 'item-017', categoryId: 'cat-sides', name: 'Roasted Broccolini',
      description: 'Charred broccolini, garlic, chili flakes, lemon', price: 9,
      cost: 2, taxClass: 'Food', dietaryFlags: ['Vegan', 'Gluten-Free'], allergens: [],
      modifierGroups: [], station: 'Grill', status: 'active', sortOrder: 1,
    },
    {
      id: 'item-018', categoryId: 'cat-sides', name: 'Mac & Cheese',
      description: 'Four cheese blend, crispy panko topping, chives', price: 11,
      cost: 3, taxClass: 'Food', dietaryFlags: ['Vegetarian'], allergens: ['Dairy', 'Gluten'],
      modifierGroups: [], station: 'Cold', status: 'active', sortOrder: 2,
    },
    {
      id: 'item-019', categoryId: 'cat-sides', name: 'Crispy Potatoes',
      description: 'Duck fat roasted potatoes, herbs, aioli', price: 9,
      cost: 2, taxClass: 'Food', dietaryFlags: ['Vegan', 'Gluten-Free'], allergens: [],
      modifierGroups: [], station: 'Grill', status: 'active', sortOrder: 3,
    },
    {
      id: 'item-020', categoryId: 'cat-sides', name: 'Side Salad',
      description: 'Mixed greens, house vinaigrette, radish, cucumber', price: 8,
      cost: 2, taxClass: 'Food', dietaryFlags: ['Vegan', 'Gluten-Free'], allergens: [],
      modifierGroups: [], station: 'Cold', status: 'active', sortOrder: 4,
    },
    // ── Desserts ──────────────────────────────────────────────
    {
      id: 'item-021', categoryId: 'cat-desserts', name: 'Crème Brûlée',
      description: 'Classic vanilla bean custard, torched sugar crust, seasonal berry', price: 12,
      cost: 3, taxClass: 'Food', dietaryFlags: ['Vegetarian', 'Gluten-Free'], allergens: ['Dairy', 'Eggs'],
      modifierGroups: [], station: 'Cold', status: 'active', sortOrder: 0,
    },
    {
      id: 'item-022', categoryId: 'cat-desserts', name: 'Chocolate Lava Cake',
      description: 'Warm dark chocolate fondant, vanilla gelato, cocoa tuile', price: 14,
      cost: 4, taxClass: 'Food', dietaryFlags: ['Vegetarian'], allergens: ['Dairy', 'Gluten', 'Eggs'],
      modifierGroups: [], station: 'Cold', status: 'active', sortOrder: 1,
    },
    {
      id: 'item-023', categoryId: 'cat-desserts', name: 'Seasonal Sorbet',
      description: 'Three scoops, chef\'s daily selection, almond tuile', price: 10,
      cost: 2.5, taxClass: 'Food', dietaryFlags: ['Vegan'], allergens: [],
      modifierGroups: [], station: 'Cold', status: 'active', sortOrder: 2,
    },
    // ── Cocktails ─────────────────────────────────────────────
    {
      id: 'item-024', categoryId: 'cat-cocktails', name: 'Old Fashioned',
      description: 'Bulleit Rye, Demerara, Angostura bitters, orange peel', price: 16,
      cost: 5, taxClass: 'Alcohol', dietaryFlags: [], allergens: [],
      modifierGroups: [
        {
          id: 'mg-cocktail-style', name: 'Style', type: MODIFIER_TYPE.OPTIONAL, options: [
            { id: 'mod-rocks', name: 'On the Rocks', priceModifier: 0 },
            { id: 'mod-up', name: 'Up', priceModifier: 0 },
            { id: 'mod-extra-shot', name: 'Add a Shot', priceModifier: 6 },
          ],
        },
      ],
      station: 'Bar', status: 'active', sortOrder: 0,
    },
    {
      id: 'item-025', categoryId: 'cat-cocktails', name: 'Espresso Martini',
      description: 'Vodka, Kahlúa, fresh espresso, vanilla sugar', price: 17,
      cost: 5.5, taxClass: 'Alcohol', dietaryFlags: [], allergens: [],
      modifierGroups: [], station: 'Bar', status: 'active', sortOrder: 1,
    },
    {
      id: 'item-026', categoryId: 'cat-cocktails', name: 'Negroni',
      description: 'Hendrick\'s Gin, Campari, Cocchi Torino vermouth, orange', price: 15,
      cost: 4.5, taxClass: 'Alcohol', dietaryFlags: [], allergens: [],
      modifierGroups: [], station: 'Bar', status: 'active', sortOrder: 2,
    },
    {
      id: 'item-027', categoryId: 'cat-cocktails', name: 'Aperol Spritz',
      description: 'Aperol, Prosecco, soda water, orange slice', price: 14,
      cost: 4, taxClass: 'Alcohol', dietaryFlags: [], allergens: [],
      modifierGroups: [], station: 'Bar', status: 'active', sortOrder: 3,
    },
    {
      id: 'item-028', categoryId: 'cat-cocktails', name: 'Margarita',
      description: 'Patrón Silver, Cointreau, fresh lime, agave, tajín rim', price: 15,
      cost: 4.5, taxClass: 'Alcohol', dietaryFlags: [], allergens: [],
      modifierGroups: [], station: 'Bar', status: 'active', sortOrder: 4,
    },
    {
      id: 'item-029', categoryId: 'cat-cocktails', name: 'Moscow Mule',
      description: 'Tito\'s Vodka, Fever-Tree ginger beer, lime, mint', price: 14,
      cost: 4, taxClass: 'Alcohol', dietaryFlags: [], allergens: [],
      modifierGroups: [], station: 'Bar', status: 'active', sortOrder: 5,
    },
    // ── Wine ──────────────────────────────────────────────────
    { id: 'item-030', categoryId: 'cat-wine', name: 'Chardonnay Glass', description: 'Sonoma Coast, buttery with notes of apple and vanilla', price: 14, cost: 4.5, taxClass: 'Alcohol', dietaryFlags: [], allergens: [], modifierGroups: [], station: 'Bar', status: 'active', sortOrder: 0 },
    { id: 'item-031', categoryId: 'cat-wine', name: 'Cabernet Glass', description: 'Napa Valley, dark fruit, cedar, full-bodied', price: 16, cost: 5.5, taxClass: 'Alcohol', dietaryFlags: [], allergens: [], modifierGroups: [], station: 'Bar', status: 'active', sortOrder: 1 },
    { id: 'item-032', categoryId: 'cat-wine', name: 'Pinot Noir Glass', description: 'Willamette Valley, cherry, earth, silky tannins', price: 15, cost: 5, taxClass: 'Alcohol', dietaryFlags: [], allergens: [], modifierGroups: [], station: 'Bar', status: 'active', sortOrder: 2 },
    { id: 'item-033', categoryId: 'cat-wine', name: 'Prosecco Glass', description: 'Italian sparkling, crisp, pear and citrus', price: 12, cost: 3.5, taxClass: 'Alcohol', dietaryFlags: [], allergens: [], modifierGroups: [], station: 'Bar', status: 'active', sortOrder: 3 },
    // ── Beer ──────────────────────────────────────────────────
    { id: 'item-034', categoryId: 'cat-beer', name: 'Draft Lager', description: 'Crisp and refreshing, locally brewed', price: 8, cost: 2.5, taxClass: 'Alcohol', dietaryFlags: [], allergens: ['Gluten'], modifierGroups: [], station: 'Bar', status: 'active', sortOrder: 0 },
    { id: 'item-035', categoryId: 'cat-beer', name: 'IPA', description: 'Hoppy West Coast IPA, citrus and pine notes', price: 9, cost: 3, taxClass: 'Alcohol', dietaryFlags: [], allergens: ['Gluten'], modifierGroups: [], station: 'Bar', status: 'active', sortOrder: 1 },
    { id: 'item-036', categoryId: 'cat-beer', name: 'Craft Pale Ale', description: 'Session pale ale, balanced bitterness, light body', price: 9, cost: 3, taxClass: 'Alcohol', dietaryFlags: [], allergens: ['Gluten'], modifierGroups: [], station: 'Bar', status: 'active', sortOrder: 2 },
    // ── Soft Drinks ───────────────────────────────────────────
    { id: 'item-037', categoryId: 'cat-soft-drinks', name: 'Coke', description: 'Classic Coca-Cola', price: 4, cost: 0.75, taxClass: 'Food', dietaryFlags: ['Vegan'], allergens: [], modifierGroups: [], station: 'Bar', status: 'active', sortOrder: 0 },
    { id: 'item-038', categoryId: 'cat-soft-drinks', name: 'Diet Coke', description: 'Diet Coca-Cola', price: 4, cost: 0.75, taxClass: 'Food', dietaryFlags: ['Vegan'], allergens: [], modifierGroups: [], station: 'Bar', status: 'active', sortOrder: 1 },
    { id: 'item-039', categoryId: 'cat-soft-drinks', name: 'Sparkling Water', description: 'San Pellegrino', price: 5, cost: 1.5, taxClass: 'Food', dietaryFlags: ['Vegan'], allergens: [], modifierGroups: [], station: 'Bar', status: 'active', sortOrder: 2 },
    { id: 'item-040', categoryId: 'cat-soft-drinks', name: 'Still Water', description: 'Acqua Panna', price: 4, cost: 1, taxClass: 'Food', dietaryFlags: ['Vegan'], allergens: [], modifierGroups: [], station: 'Bar', status: 'active', sortOrder: 3 },
    { id: 'item-041', categoryId: 'cat-soft-drinks', name: 'Fresh OJ', description: 'Freshly squeezed orange juice', price: 6, cost: 2, taxClass: 'Food', dietaryFlags: ['Vegan'], allergens: [], modifierGroups: [], station: 'Bar', status: 'active', sortOrder: 4 },
    { id: 'item-042', categoryId: 'cat-soft-drinks', name: 'Lemonade', description: 'House-made lemonade with fresh mint', price: 6, cost: 1.5, taxClass: 'Food', dietaryFlags: ['Vegan'], allergens: [], modifierGroups: [], station: 'Bar', status: 'active', sortOrder: 5 },
    // ── Coffee ────────────────────────────────────────────────
    { id: 'item-043', categoryId: 'cat-coffee', name: 'Espresso', description: 'Double shot, single origin blend', price: 4, cost: 1, taxClass: 'Food', dietaryFlags: ['Vegan'], allergens: [], modifierGroups: [], station: 'Bar', status: 'active', sortOrder: 0 },
    { id: 'item-044', categoryId: 'cat-coffee', name: 'Americano', description: 'Double espresso, hot water', price: 5, cost: 1.2, taxClass: 'Food', dietaryFlags: ['Vegan'], allergens: [], modifierGroups: [], station: 'Bar', status: 'active', sortOrder: 1 },
    { id: 'item-045', categoryId: 'cat-coffee', name: 'Flat White', description: 'Double ristretto, micro-foam steamed milk', price: 6, cost: 1.5, taxClass: 'Food', dietaryFlags: ['Vegetarian'], allergens: ['Dairy'], modifierGroups: [], station: 'Bar', status: 'active', sortOrder: 2 },
    { id: 'item-046', categoryId: 'cat-coffee', name: 'Cappuccino', description: 'Double espresso, steamed milk, thick froth', price: 6, cost: 1.5, taxClass: 'Food', dietaryFlags: ['Vegetarian'], allergens: ['Dairy'], modifierGroups: [], station: 'Bar', status: 'active', sortOrder: 3 },
  ],
};

// ── Tables Seed Data ──────────────────────────────────────────
export const SEED_TABLES = [
  // Indoor
  { id: 'T1', number: 'T1', zone: TABLE_ZONE.INDOOR, capacity: 2, status: TABLE_STATUS.AVAILABLE, position: { x: 0, y: 0 } },
  { id: 'T2', number: 'T2', zone: TABLE_ZONE.INDOOR, capacity: 2, status: TABLE_STATUS.AVAILABLE, position: { x: 1, y: 0 } },
  { id: 'T3', number: 'T3', zone: TABLE_ZONE.INDOOR, capacity: 4, status: TABLE_STATUS.ORDERED, position: { x: 2, y: 0 }, partySize: 3, serverId: 'staff-sarah', seatedAt: mins(47) },
  { id: 'T4', number: 'T4', zone: TABLE_ZONE.INDOOR, capacity: 4, status: TABLE_STATUS.AVAILABLE, position: { x: 3, y: 0 } },
  { id: 'T5', number: 'T5', zone: TABLE_ZONE.INDOOR, capacity: 6, status: TABLE_STATUS.ORDERED, position: { x: 0, y: 1 }, partySize: 4, serverId: 'staff-marcus', seatedAt: mins(12) },
  { id: 'T6', number: 'T6', zone: TABLE_ZONE.INDOOR, capacity: 6, status: TABLE_STATUS.RESERVED, position: { x: 1, y: 1 }, reservationName: 'Johnson Party', reservationTime: '7:30 PM' },
  { id: 'T7', number: 'T7', zone: TABLE_ZONE.INDOOR, capacity: 8, status: TABLE_STATUS.AVAILABLE, position: { x: 2, y: 1 } },
  { id: 'T8', number: 'T8', zone: TABLE_ZONE.INDOOR, capacity: 4, status: TABLE_STATUS.BILL_REQUESTED, position: { x: 3, y: 1 }, partySize: 2, serverId: 'staff-sarah', seatedAt: mins(68) },
  { id: 'T9', number: 'T9', zone: TABLE_ZONE.INDOOR, capacity: 4, status: TABLE_STATUS.SEATED, position: { x: 0, y: 2 }, partySize: 3, serverId: 'staff-marcus', seatedAt: mins(8) },
  { id: 'T10', number: 'T10', zone: TABLE_ZONE.INDOOR, capacity: 2, status: TABLE_STATUS.AVAILABLE, position: { x: 1, y: 2 } },
  // Bar
  { id: 'B1', number: 'B1', zone: TABLE_ZONE.BAR, capacity: 2, status: TABLE_STATUS.AVAILABLE, position: { x: 0, y: 0 } },
  { id: 'B2', number: 'B2', zone: TABLE_ZONE.BAR, capacity: 2, status: TABLE_STATUS.ORDERED, position: { x: 1, y: 0 }, partySize: 1, serverId: 'staff-jamie', seatedAt: mins(22) },
  { id: 'B3', number: 'B3', zone: TABLE_ZONE.BAR, capacity: 4, status: TABLE_STATUS.AVAILABLE, position: { x: 2, y: 0 } },
  // Outdoor
  { id: 'O1', number: 'O1', zone: TABLE_ZONE.OUTDOOR, capacity: 4, status: TABLE_STATUS.AVAILABLE, position: { x: 0, y: 0 } },
  { id: 'O2', number: 'O2', zone: TABLE_ZONE.OUTDOOR, capacity: 4, status: TABLE_STATUS.SEATED, position: { x: 1, y: 0 }, partySize: 2, serverId: 'staff-sarah', seatedAt: mins(5) },
  { id: 'O3', number: 'O3', zone: TABLE_ZONE.OUTDOOR, capacity: 6, status: TABLE_STATUS.AVAILABLE, position: { x: 0, y: 1 } },
  { id: 'O4', number: 'O4', zone: TABLE_ZONE.OUTDOOR, capacity: 6, status: TABLE_STATUS.RESERVED, position: { x: 1, y: 1 }, reservationName: 'Davis Birthday', reservationTime: '8:00 PM' },
  { id: 'O5', number: 'O5', zone: TABLE_ZONE.OUTDOOR, capacity: 2, status: TABLE_STATUS.AVAILABLE, position: { x: 2, y: 0 } },
];

// ── Staff Seed Data ───────────────────────────────────────────
export const SEED_STAFF = [
  {
    id: 'staff-sarah', name: 'Sarah Chen', role: STAFF_ROLE.SERVER, pin: '1234',
    hourlyRate: 8.5, clockedIn: true, clockInTime: mins(240),
    avatar: 'SC', tablesActive: ['T3', 'T8', 'O2'], tipsToday: 142, salesToday: 1240,
  },
  {
    id: 'staff-marcus', name: 'Marcus Williams', role: STAFF_ROLE.SERVER, pin: '2345',
    hourlyRate: 8.5, clockedIn: true, clockInTime: mins(240),
    avatar: 'MW', tablesActive: ['T5', 'T9'], tipsToday: 98, salesToday: 890,
  },
  {
    id: 'staff-jamie', name: 'Jamie Lee', role: STAFF_ROLE.BARTENDER, pin: '3456',
    hourlyRate: 10, clockedIn: true, clockInTime: mins(180),
    avatar: 'JL', tablesActive: ['B2'], tipsToday: 210, salesToday: 760,
  },
  {
    id: 'staff-alex', name: 'Alex Rivera', role: STAFF_ROLE.MANAGER, pin: '4567',
    hourlyRate: 18, clockedIn: true, clockInTime: mins(300),
    avatar: 'AR', tablesActive: [], tipsToday: 0, salesToday: 0,
  },
  {
    id: 'staff-kitchen', name: 'Kitchen Staff', role: STAFF_ROLE.KITCHEN, pin: '5678',
    hourlyRate: 14, clockedIn: true, clockInTime: mins(300),
    avatar: 'KS', tablesActive: [], tipsToday: 0, salesToday: 0,
  },
];

// ── Customer Seed Data ────────────────────────────────────────
export const SEED_CUSTOMERS = [
  {
    id: 'cust-001', name: 'Emily Harrison', phone: '(555) 234-5678', email: 'emily@email.com',
    birthday: '1988-03-15', loyaltyPoints: 2840, lifetimeSpend: 3240, totalVisits: 28,
    lastVisit: '2026-05-28', tier: LOYALTY_TIER.GOLD, notes: 'Prefers window seating. Allergic to shellfish.',
    dietaryPreferences: ['Gluten-Free'], allergens: ['Shellfish'],
    visitHistory: [
      { date: '2026-05-28', partySize: 2, total: 142, items: 'Ribeye Steak, Espresso Martini x2' },
      { date: '2026-05-10', partySize: 4, total: 280, items: 'Various mains, cocktails' },
      { date: '2026-04-22', partySize: 2, total: 118, items: 'Salmon, Caesar, Wine' },
    ],
  },
  {
    id: 'cust-002', name: 'James Okafor', phone: '(555) 345-6789', email: 'james.o@email.com',
    birthday: '1992-07-20', loyaltyPoints: 920, lifetimeSpend: 1050, totalVisits: 12,
    lastVisit: '2026-06-01', tier: LOYALTY_TIER.SILVER, notes: 'Regular Thursday dinner. Vegetarian.',
    dietaryPreferences: ['Vegetarian'], allergens: [],
    visitHistory: [
      { date: '2026-06-01', partySize: 2, total: 96, items: 'Mushroom Risotto, Burrata, Wine x2' },
      { date: '2026-05-22', partySize: 3, total: 165, items: 'Multiple vegetarian mains' },
    ],
  },
  {
    id: 'cust-003', name: 'Sofia Martinez', phone: '(555) 456-7890', email: 'sofia.m@email.com',
    birthday: '1985-11-03', loyaltyPoints: 380, lifetimeSpend: 430, totalVisits: 5,
    lastVisit: '2026-05-15', tier: LOYALTY_TIER.BRONZE, notes: 'Birthday in November. Loves desserts.',
    dietaryPreferences: [], allergens: ['Nuts'],
    visitHistory: [
      { date: '2026-05-15', partySize: 3, total: 185, items: 'Ribeye, Chicken, Cocktails, Desserts' },
    ],
  },
  {
    id: 'cust-004', name: 'David Chen', phone: '(555) 567-8901', email: 'david.chen@email.com',
    birthday: '1979-05-12', loyaltyPoints: 1650, lifetimeSpend: 1900, totalVisits: 18,
    lastVisit: '2026-05-30', tier: LOYALTY_TIER.GOLD, notes: 'Corporate account. Usually 6-8 pax.',
    dietaryPreferences: [], allergens: [],
    visitHistory: [
      { date: '2026-05-30', partySize: 6, total: 480, items: 'Multiple steaks, seafood, wine bottles' },
      { date: '2026-05-02', partySize: 8, total: 640, items: 'Full table, tasting menu style' },
    ],
  },
  {
    id: 'cust-005', name: 'Rachel Kim', phone: '(555) 678-9012', email: 'rachel.k@email.com',
    birthday: '1995-09-25', loyaltyPoints: 140, lifetimeSpend: 160, totalVisits: 2,
    lastVisit: '2026-04-18', tier: LOYALTY_TIER.BRONZE, notes: '',
    dietaryPreferences: ['Vegan'], allergens: ['Dairy'],
    visitHistory: [
      { date: '2026-04-18', partySize: 2, total: 88, items: 'Salads, sides, cocktails' },
    ],
  },
  {
    id: 'cust-006', name: 'Michael Torres', phone: '(555) 789-0123', email: 'mtorres@email.com',
    birthday: '1983-01-08', loyaltyPoints: 760, lifetimeSpend: 870, totalVisits: 9,
    lastVisit: '2026-05-25', tier: LOYALTY_TIER.SILVER, notes: 'Sommelier. Interested in wine pairings.',
    dietaryPreferences: [], allergens: [],
    visitHistory: [
      { date: '2026-05-25', partySize: 2, total: 220, items: 'Octopus, Salmon, Wine flight' },
    ],
  },
  {
    id: 'cust-007', name: 'Anna Blackwood', phone: '(555) 890-1234', email: 'anna.b@email.com',
    birthday: '1991-04-30', loyaltyPoints: 2100, lifetimeSpend: 2400, totalVisits: 22,
    lastVisit: '2026-06-03', tier: LOYALTY_TIER.GOLD, notes: 'VIP. Owner knows personally. Best table always.',
    dietaryPreferences: [], allergens: ['Gluten'],
    visitHistory: [
      { date: '2026-06-03', partySize: 4, total: 420, items: 'Premium mains, cocktails, desserts' },
    ],
  },
  {
    id: 'cust-008', name: 'Robert Walsh', phone: '(555) 901-2345', email: 'rwalsh@email.com',
    birthday: '1976-12-15', loyaltyPoints: 55, lifetimeSpend: 62, totalVisits: 1,
    lastVisit: '2026-06-04', tier: LOYALTY_TIER.BRONZE, notes: 'First visit. Said he found us on Google.',
    dietaryPreferences: [], allergens: [],
    visitHistory: [
      { date: '2026-06-04', partySize: 2, total: 62, items: 'Burger, salad, draft beer' },
    ],
  },
];

// ── Pre-seeded Orders (for demo occupied tables) ───────────────
export function buildSeedOrders(tables, menu, staff) {
  const itemById = {};
  menu.items.forEach((i) => { itemById[i.id] = i; });

  const t3Order = {
    id: 'order-t3-seed',
    tableId: 'T3',
    status: ORDER_STATUS.SENT,
    serverId: 'staff-sarah',
    partySize: 3,
    createdAt: mins(47),
    sentAt: mins(45),
    items: [
      { id: uid(), itemId: 'item-009', name: 'Ribeye Steak 12oz', price: 52, quantity: 1, modifiers: [{ name: 'Med-Rare', priceModifier: 0 }, { name: 'Blue Cheese', priceModifier: 3 }], specialRequest: '', seatNumber: 1 },
      { id: uid(), itemId: 'item-006', name: 'Caesar Salad', price: 15, quantity: 1, modifiers: [{ name: 'Caesar', priceModifier: 0 }], specialRequest: '', seatNumber: 2 },
      { id: uid(), itemId: 'item-014', name: 'Chicken Burger', price: 22, quantity: 1, modifiers: [{ name: 'Well-Done', priceModifier: 0 }], specialRequest: '', seatNumber: 3 },
      { id: uid(), itemId: 'item-024', name: 'Old Fashioned', price: 16, quantity: 2, modifiers: [], specialRequest: '', seatNumber: null },
    ],
    tipPercent: 0,
    discountAmount: 0,
    paymentMethod: null,
    statusHistory: [{ status: ORDER_STATUS.DRAFT, timestamp: mins(47), staffId: 'staff-sarah' }, { status: ORDER_STATUS.SENT, timestamp: mins(45), staffId: 'staff-sarah' }],
  };

  const t5Order = {
    id: 'order-t5-seed',
    tableId: 'T5',
    status: ORDER_STATUS.IN_PROGRESS,
    serverId: 'staff-marcus',
    partySize: 4,
    createdAt: mins(12),
    sentAt: mins(10),
    items: [
      { id: uid(), itemId: 'item-010', name: 'Pan-Seared Salmon', price: 34, quantity: 2, modifiers: [], specialRequest: 'Extra lemon on side', seatNumber: 1 },
      { id: uid(), itemId: 'item-013', name: 'Mushroom Risotto', price: 26, quantity: 1, modifiers: [], specialRequest: '', seatNumber: 2 },
      { id: uid(), itemId: 'item-015', name: 'Smash Burger', price: 21, quantity: 1, modifiers: [{ name: 'Medium', priceModifier: 0 }, { name: 'Bacon', priceModifier: 3 }], specialRequest: '', seatNumber: 3 },
      { id: uid(), itemId: 'item-016', name: 'Truffle Fries', price: 10, quantity: 2, modifiers: [], specialRequest: '', seatNumber: null },
      { id: uid(), itemId: 'item-027', name: 'Aperol Spritz', price: 14, quantity: 2, modifiers: [], specialRequest: '', seatNumber: null },
      { id: uid(), itemId: 'item-030', name: 'Chardonnay Glass', price: 14, quantity: 2, modifiers: [], specialRequest: '', seatNumber: null },
    ],
    tipPercent: 0,
    discountAmount: 0,
    paymentMethod: null,
    statusHistory: [{ status: ORDER_STATUS.DRAFT, timestamp: mins(12), staffId: 'staff-marcus' }, { status: ORDER_STATUS.SENT, timestamp: mins(10), staffId: 'staff-marcus' }, { status: ORDER_STATUS.IN_PROGRESS, timestamp: mins(9), staffId: 'staff-kitchen' }],
  };

  const b2Order = {
    id: 'order-b2-seed',
    tableId: 'B2',
    status: ORDER_STATUS.SENT,
    serverId: 'staff-jamie',
    partySize: 1,
    createdAt: mins(22),
    sentAt: mins(20),
    items: [
      { id: uid(), itemId: 'item-024', name: 'Old Fashioned', price: 16, quantity: 1, modifiers: [{ name: 'On the Rocks', priceModifier: 0 }], specialRequest: '', seatNumber: 1 },
      { id: uid(), itemId: 'item-003', name: 'Wagyu Beef Sliders', price: 18, quantity: 1, modifiers: [], specialRequest: '', seatNumber: 1 },
    ],
    tipPercent: 0,
    discountAmount: 0,
    paymentMethod: null,
    statusHistory: [{ status: ORDER_STATUS.DRAFT, timestamp: mins(22), staffId: 'staff-jamie' }, { status: ORDER_STATUS.SENT, timestamp: mins(20), staffId: 'staff-jamie' }],
  };

  const deliveryOrder1 = {
    id: 'DEL-001',
    type: ORDER_TYPE.DELIVERY,
    source: 'Uber Eats',
    status: ORDER_STATUS.IN_KITCHEN,
    customerName: 'Alex Johnson',
    items: [
      { id: uid(), itemId: 'item-001', name: 'Truffle Burger', price: 18, quantity: 2, modifiers: [], specialRequest: '', seatNumber: null }
    ],
    createdAt: mins(6),
    sentAt: mins(5),
    etaAt: Date.now() + 15 * 60000,
    tipPercent: 0, discountAmount: 0, paymentMethod: null,
  };

  const deliveryOrder2 = {
    id: 'DEL-002',
    type: ORDER_TYPE.ONLINE,
    source: 'Direct',
    status: ORDER_STATUS.PENDING_ADMIN,
    customerName: 'Sam Smith',
    items: [
      { id: uid(), itemId: 'item-008', name: 'Wedge Salad', price: 13, quantity: 1, modifiers: [], specialRequest: '', seatNumber: null }
    ],
    createdAt: mins(2),
    tipPercent: 0, discountAmount: 0, paymentMethod: null,
  };

  const deliveryOrder3 = {
    id: 'DEL-003',
    type: ORDER_TYPE.DELIVERY,
    source: 'DoorDash',
    status: ORDER_STATUS.READY,
    customerName: 'Jamie Lee',
    items: [
      { id: uid(), itemId: 'item-009', name: 'Ribeye Steak 12oz', price: 52, quantity: 3, modifiers: [{name: 'Medium Rare', priceModifier: 0}], specialRequest: '', seatNumber: null }
    ],
    createdAt: mins(40),
    etaAt: Date.now() + 5 * 60000,
    tipPercent: 0, discountAmount: 0, paymentMethod: null,
  };

  return [t3Order, t5Order, b2Order, deliveryOrder1, deliveryOrder2, deliveryOrder3];
}

// ── Historical Orders (for reports) ──────────────────────────
export function buildHistoricalOrders() {
  const historicalOrders = [];
  const servers = ['staff-sarah', 'staff-marcus', 'staff-jamie'];
  const methods = ['CASH', 'CARD', 'MOBILE'];

  // Generate orders for today at various hours
  const hourlyData = [
    { hour: 11, count: 3, avgTotal: 65 },
    { hour: 12, count: 8, avgTotal: 78 },
    { hour: 13, count: 12, avgTotal: 82 },
    { hour: 14, count: 6, avgTotal: 72 },
    { hour: 17, count: 5, avgTotal: 95 },
    { hour: 18, count: 14, avgTotal: 124 },
    { hour: 19, count: 18, avgTotal: 138 },
    { hour: 20, count: 15, avgTotal: 142 },
    { hour: 21, count: 9, avgTotal: 118 },
  ];

  hourlyData.forEach(({ hour, count, avgTotal }) => {
    for (let i = 0; i < count; i++) {
      const date = new Date();
      date.setHours(hour, Math.floor(Math.random() * 60), 0, 0);
      const total = avgTotal + (Math.random() - 0.5) * 40;
      historicalOrders.push({
        id: `hist-${uid()}`,
        tableId: `T${Math.floor(Math.random() * 10) + 1}`,
        status: ORDER_STATUS.CLOSED,
        serverId: servers[Math.floor(Math.random() * servers.length)],
        partySize: Math.floor(Math.random() * 4) + 1,
        createdAt: date.getTime(),
        closedAt: date.getTime() + 45 * 60 * 1000,
        total: Math.max(total, 20),
        subtotal: Math.max(total * 0.9, 18),
        tax: total * 0.085,
        tip: total * 0.18,
        paymentMethod: methods[Math.floor(Math.random() * methods.length)],
        items: [],
      });
    }
  });

  return historicalOrders;
}

// ── Settings Seed ─────────────────────────────────────────────
export const SEED_SETTINGS = {
  restaurantName: 'Ember & Oak',
  tagline: 'Contemporary American Kitchen',
  address: '142 Hearth Street, San Francisco, CA 94103',
  phone: '(415) 555-0192',
  taxId: '94-1234567',
  logoUrl: null,
  taxRate: 0.085,
  taxInclusive: false,
  taxClasses: { Food: 0.085, Alcohol: 0.085, 'Non-taxable': 0 },
  receiptHeader: 'Thank you for dining at Ember & Oak!',
  receiptFooter: 'Please visit us at emberandoak.com',
  acceptedPayments: ['CASH', 'CARD', 'MOBILE', 'GIFT_CARD', 'HOUSE_ACCOUNT'],
  tipDefaults: [15, 18, 20, 22],
  serviceChargePercent: 0,
  serviceChargeThreshold: 8,
  tableTurnTarget: 90,
  orderTimeoutAlert: 20,
  kdsWarningMinutes: 8,
  kdsCriticalMinutes: 12,
  darkMode: true,
  shiftStart: null,
  shiftEnd: null,
};
