import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import useMenuStore from '../../store/useMenuStore.js';
import ModifierModal from '../pos/ModifierModal.jsx';

const CATEGORY_EMOJIS = {
  Starters: '🥗', Salads: '🥗', Mains: '🍽', Sides: '🍟',
  Desserts: '🍰', Cocktails: '🍸', Wine: '🍷', Beer: '🍺',
  'Soft Drinks': '🧃', Coffee: '☕',
};

export default function CustomerMenu({ cart, setCart }) {
  const { categories, getItemsByCategory } = useMenuStore();
  // Use category ID (not name) — getItemsByCategory filters by item.categoryId
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id || '');
  const [modifierItem, setModifierItem] = useState(null);

  // Once categories load (after parent useEffect), set the first one as active
  React.useEffect(() => {
    if (!activeCategory && categories.length > 0) {
      setActiveCategory(categories[0].id);
    }
  }, [categories]);

  const addToCart = (menuItem, modifiers = []) => {
    const key = `${menuItem.id}-${JSON.stringify(modifiers)}`;
    setCart((prev) => {
      const idx = prev.findIndex((i) => i.key === key);
      if (idx >= 0) return prev.map((i, x) => x === idx ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, {
        key, id: `cc-${Date.now()}-${Math.random().toString(36).substr(2,5)}`,
        itemId: menuItem.id, name: menuItem.name,
        price: menuItem.price, quantity: 1, modifiers,
      }];
    });
  };

  const handleItemTap = (item) => {
    const hasRequired = item.modifierGroups?.some((g) => g.required || g.type === 'REQUIRED');
    if (hasRequired) setModifierItem(item);
    else addToCart(item);
  };

  const items = getItemsByCategory(activeCategory).filter(
    (i) => i.status === 'active' && i.available !== false
  );

  return (
    <div style={{ width: '100%', padding: '20px 16px', boxSizing: 'border-box' }}>
      {/* Category tabs */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 16, scrollbarWidth: 'none' }}>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            style={{
              padding: '8px 18px',
              borderRadius: 100,
              border: activeCategory === cat.id ? '2px solid #1E5C3A' : '2px solid #E8E0D5',
              background: activeCategory === cat.id ? '#1E5C3A' : '#fff',
              color: activeCategory === cat.id ? '#fff' : '#4B5563',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              transition: 'all 0.15s',
            }}
          >
            {CATEGORY_EMOJIS[cat.name] || '🍴'} {cat.name}
          </button>
        ))}
      </div>

      {/* Items grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              background: '#fff',
              border: '1px solid #E8E0D5',
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
          >
            {/* Item image placeholder */}
            <div style={{
              height: 140,
              background: `linear-gradient(135deg, #F5E6C8, #FFF8EE)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 52,
            }}>
              {CATEGORY_EMOJIS[item.category] || '🍽'}
            </div>
            <div style={{ padding: '14px 16px 16px' }}>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 16, color: '#1A1A1A', marginBottom: 4 }}>
                {item.name}
              </div>
              {item.description && (
                <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.4, marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {item.description}
                </div>
              )}
              {item.dietaryFlags?.length > 0 && (
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
                  {item.dietaryFlags.map((f) => (
                    <span key={f} style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0' }}>
                      {f}
                    </span>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 18, color: '#1E5C3A' }}>
                  ${item.price.toFixed(2)}
                </div>
                <button
                  onClick={() => handleItemTap(item)}
                  style={{
                    background: '#1E5C3A',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 10,
                    padding: '8px 16px',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                  id={`customer-add-${item.id}`}
                >
                  <Plus size={14} /> Add
                </button>
              </div>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 0', color: '#6B7280' }}>
            No items in this category
          </div>
        )}
      </div>

      {modifierItem && (
        <ModifierModal
          item={modifierItem}
          onConfirm={(item, modifiers) => { addToCart(item, modifiers); setModifierItem(null); }}
          onClose={() => setModifierItem(null)}
        />
      )}
    </div>
  );
}
