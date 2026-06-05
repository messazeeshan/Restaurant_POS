import React, { useState } from 'react';
import { Search } from 'lucide-react';
import useMenuStore from '../../store/useMenuStore.js';
import { formatCurrency } from '../../utils/formatters.js';

const CATEGORY_EMOJIS = {
  'Starters':     '🥗',
  'Salads':       '🥙',
  'Mains':        '🍽️',
  'Sides':        '🥦',
  'Desserts':     '🍮',
  'Cocktails':    '🍹',
  'Wine':         '🍷',
  'Beer':         '🍺',
  'Soft Drinks':  '🥤',
  'Coffee':       '☕',
};

/**
 * MenuGrid — item cards with category filter tabs and search
 * @param {{ onItemSelect: (item: object) => void, addedItemId: string|null }} props
 */
export default function MenuGrid({ onItemSelect, addedItemId }) {
  const { categories, items, getSortedCategories } = useMenuStore();
  const [search, setSearch] = useState('');

  const sortedCategories = getSortedCategories();
  const defaultCategoryId = sortedCategories.length > 0 ? sortedCategories[0].id : null;
  const [selectedCategoryId, setSelectedCategoryId] = useState(defaultCategoryId);
  const activeCategoryId = selectedCategoryId || defaultCategoryId;

  // Filter items
  const filteredItems = items.filter((item) => {
    if (search) {
      const q = search.toLowerCase();
      return item.name.toLowerCase().includes(q) || (item.description || '').toLowerCase().includes(q);
    }
    if (activeCategoryId && item.categoryId !== activeCategoryId) return false;
    return true;
  });

  const activeCategory = sortedCategories.find((c) => c.id === activeCategoryId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Search + Categories */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)', flexShrink: 0 }}>
        {/* Search */}
        <div className="search-bar" style={{ marginBottom: 10 }}>
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search menu items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="menu-search"
            aria-label="Search menu items"
          />
        </div>

        {/* Category tabs */}
        <div className="tabs-scroll" role="tablist" aria-label="Menu categories">
          {sortedCategories.map((cat) => (
            <button
              key={cat.id}
              className={`tab-pill ${activeCategoryId === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategoryId(cat.id)}
              role="tab"
              aria-selected={activeCategoryId === cat.id}
              id={`category-${cat.id}`}
            >
              <span>{CATEGORY_EMOJIS[cat.name] || '🍴'}</span>
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      <div
        className="menu-grid"
        style={{
          gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))',
          flex: 1,
          overflowY: 'auto',
          padding: 12,
          alignContent: 'start',
        }}
        role="list"
        aria-label="Menu items"
      >
        {filteredItems.length === 0 ? (
          <div style={{ gridColumn: '1/-1' }}>
            <div className="empty-state" style={{ padding: '40px 20px' }}>
              <div className="empty-state-icon">🍴</div>
              <div className="empty-state-title">No items found</div>
              <div className="empty-state-subtitle">
                {search ? `No results for "${search}"` : 'Tap a category to browse'}
              </div>
            </div>
          </div>
        ) : (
          filteredItems.map((item) => {
            const category = categories.find((c) => c.id === item.categoryId);
            const categoryColor = category?.color || '#FF6B35';
            const is86d = item.status === '86d';
            const isAdded = addedItemId === item.id;

            return (
              <div
                key={item.id}
                className={`menu-item-card ${is86d ? 'is-86d' : ''} ${isAdded ? 'added' : ''}`}
                onClick={() => !is86d && onItemSelect(item)}
                role="listitem"
                aria-label={`${item.name}, ${formatCurrency(item.price)}${is86d ? ', out of stock' : ''}`}
                tabIndex={is86d ? -1 : 0}
                onKeyDown={(e) => e.key === 'Enter' && !is86d && onItemSelect(item)}
                id={`menu-item-${item.id}`}
              >
                {/* 86 stamp */}
                {is86d && <div className="badge-86">86'd</div>}

                {/* Image / Color placeholder */}
                <div
                  className="menu-item-img"
                  style={{ background: `${categoryColor}18` }}
                  aria-hidden="true"
                >
                  <span style={{ filter: is86d ? 'grayscale(1)' : 'none' }}>
                    {CATEGORY_EMOJIS[category?.name] || '🍴'}
                  </span>
                </div>

                {/* Content */}
                <div className="menu-item-body">
                  <div className="menu-item-name">{item.name}</div>
                  <div className="menu-item-price">{formatCurrency(item.price)}</div>
                  {item.modifierGroups && item.modifierGroups.length > 0 && (
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 3 }}>
                      <span>⚙️</span>
                      {item.modifierGroups.length} option{item.modifierGroups.length > 1 ? 's' : ''}
                    </div>
                  )}
                  {item.dietaryFlags && item.dietaryFlags.length > 0 && (
                    <div style={{ fontSize: 9, color: 'var(--success)', marginTop: 3 }}>
                      {item.dietaryFlags.includes('Vegan') && '🌱 '}
                      {item.dietaryFlags.includes('Gluten-Free') && 'GF '}
                      {item.dietaryFlags.includes('Spicy') && '🌶️'}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
