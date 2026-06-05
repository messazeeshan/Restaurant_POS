import React, { useState } from 'react';
import { Plus, Edit2, Copy, Trash2, ToggleLeft, ToggleRight, Search } from 'lucide-react';
import useMenuStore from '../../store/useMenuStore.js';
import useAppStore from '../../store/useAppStore.js';
import { formatCurrency } from '../../utils/formatters.js';
import ItemForm from './ItemForm.jsx';

const CATEGORY_EMOJIS = {
  'Starters': '🥗', 'Salads': '🥙', 'Mains': '🍽️', 'Sides': '🥦',
  'Desserts': '🍮', 'Cocktails': '🍹', 'Wine': '🍷', 'Beer': '🍺',
  'Soft Drinks': '🥤', 'Coffee': '☕',
};

export default function MenuManager() {
  const { categories, items, getSortedCategories, toggleItemStatus, deleteItem, duplicateItem, addCategory, updateCategory, deleteCategory } = useMenuStore();
  const { addToast } = useAppStore();

  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [search, setSearch] = useState('');
  const [editItem, setEditItem] = useState(undefined); // undefined = closed, null = new, object = edit
  const [newCategoryName, setNewCategoryName] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);

  const sortedCategories = getSortedCategories();
  const activeCategory = sortedCategories.find((c) => c.id === activeCategoryId);

  const filteredItems = items.filter((item) => {
    if (activeCategoryId && item.categoryId !== activeCategoryId) return false;
    if (search) {
      const q = search.toLowerCase();
      return item.name.toLowerCase().includes(q);
    }
    return true;
  }).sort((a, b) => a.sortOrder - b.sortOrder);

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    addCategory({
      id: `cat-${Date.now()}`,
      name: newCategoryName.trim(),
      color: '#FF6B35',
      sortOrder: categories.length,
    });
    setNewCategoryName('');
    setAddingCategory(false);
    addToast({ type: 'success', message: `Category "${newCategoryName}" added` });
  };

  const handleToggle86 = (item) => {
    toggleItemStatus(item.id);
    addToast({
      type: item.status === 'active' ? 'warning' : 'success',
      message: `${item.name} ${item.status === 'active' ? "86'd" : 'restored'}`,
    });
  };

  const handleDelete = (item) => {
    if (window.confirm(`Delete "${item.name}"? This cannot be undone.`)) {
      deleteItem(item.id);
      addToast({ type: 'warning', message: `${item.name} deleted` });
    }
  };

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* ── Left: Categories ─────────────────────────────────── */}
      <div style={{ width: 220, flexShrink: 0, background: 'var(--bg-surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '16px 12px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700 }}>Categories</span>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setAddingCategory(true)} aria-label="Add category" id="add-category-btn">
            <Plus size={16} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
          {/* All items */}
          <button
            onClick={() => setActiveCategoryId(null)}
            style={{ width: '100%', padding: '9px 10px', borderRadius: 'var(--radius-sm)', border: 'none', background: !activeCategoryId ? 'var(--accent-muted)' : 'transparent', color: !activeCategoryId ? 'var(--accent)' : 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'var(--transition)', marginBottom: 2 }}
          >
            <span>All Items</span>
            <span style={{ fontSize: 11, opacity: 0.7 }}>{items.length}</span>
          </button>

          {sortedCategories.map((cat) => {
            const count = items.filter((i) => i.categoryId === cat.id).length;
            const isActive = activeCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryId(cat.id)}
                id={`cat-btn-${cat.id}`}
                style={{ width: '100%', padding: '9px 10px', borderRadius: 'var(--radius-sm)', border: 'none', background: isActive ? `${cat.color}18` : 'transparent', color: isActive ? cat.color : 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'var(--transition)', marginBottom: 2 }}
              >
                <span>{CATEGORY_EMOJIS[cat.name] || '🍴'} {cat.name}</span>
                <span style={{ fontSize: 11, opacity: 0.7 }}>{count}</span>
              </button>
            );
          })}

          {/* Add category inline form */}
          {addingCategory && (
            <div style={{ padding: '8px 0' }}>
              <input
                className="form-input"
                style={{ height: 36, fontSize: 13, marginBottom: 6 }}
                placeholder="Category name..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                autoFocus
                id="new-category-input"
              />
              <div style={{ display: 'flex', gap: 4 }}>
                <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={handleAddCategory}>Add</button>
                <button className="btn btn-secondary btn-sm" onClick={() => setAddingCategory(false)}>✕</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Right: Items ─────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Toolbar */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)', display: 'flex', gap: 12, alignItems: 'center', flexShrink: 0 }}>
          <div className="search-bar" style={{ flex: 1 }}>
            <Search size={16} className="search-icon" />
            <input type="text" className="search-input" placeholder="Search items..." value={search} onChange={(e) => setSearch(e.target.value)} id="menu-manager-search" />
          </div>
          <button className="btn btn-primary" onClick={() => setEditItem(null)} id="add-item-btn">
            <Plus size={16} /> New Item
          </button>
        </div>

        {/* Category header */}
        {activeCategory && (
          <div style={{ padding: '10px 20px', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: activeCategory.color }} />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{activeCategory.name}</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{filteredItems.length} items</span>
          </div>
        )}

        {/* Items list */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filteredItems.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <div className="empty-state-title">No items found</div>
              <div className="empty-state-subtitle">Add a new item or change your filters</div>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Cost</th>
                  <th>Margin</th>
                  <th>Modifiers</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => {
                  const cat = categories.find((c) => c.id === item.categoryId);
                  const margin = item.cost ? ((item.price - item.cost) / item.price * 100).toFixed(0) : null;
                  const is86d = item.status === '86d';
                  return (
                    <tr key={item.id} style={{ opacity: is86d ? 0.6 : 1 }}>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                          {item.dietaryFlags?.join(' · ')}
                        </div>
                      </td>
                      <td>
                        {cat && (
                          <span className="badge" style={{ background: `${cat.color}18`, color: cat.color, border: `1px solid ${cat.color}30` }}>
                            {cat.name}
                          </span>
                        )}
                      </td>
                      <td style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--accent)' }}>
                        {formatCurrency(item.price)}
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        {item.cost ? formatCurrency(item.cost) : '—'}
                      </td>
                      <td>
                        {margin !== null && (
                          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: parseFloat(margin) > 60 ? 'var(--success)' : parseFloat(margin) > 30 ? 'var(--warning)' : 'var(--danger)', fontSize: 13 }}>
                            {margin}%
                          </span>
                        )}
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                        {item.modifierGroups?.length || 0}
                      </td>
                      <td>
                        <span className={`badge ${is86d ? 'badge-danger' : 'badge-success'}`}>
                          {is86d ? "86'd" : 'Active'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setEditItem(item)} aria-label="Edit" title="Edit" id={`edit-${item.id}`}>
                            <Edit2 size={14} />
                          </button>
                          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => duplicateItem(item.id)} aria-label="Duplicate" title="Duplicate" id={`dup-${item.id}`}>
                            <Copy size={14} />
                          </button>
                          <button
                            className="btn btn-ghost btn-icon btn-sm"
                            onClick={() => handleToggle86(item)}
                            aria-label={is86d ? "Restore item" : "86 item"}
                            title={is86d ? "Restore" : "86"}
                            id={`toggle-${item.id}`}
                            style={{ color: is86d ? 'var(--success)' : 'var(--warning)' }}
                          >
                            {is86d ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                          </button>
                          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleDelete(item)} aria-label="Delete" title="Delete" id={`del-${item.id}`} style={{ color: 'var(--danger)' }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Item Form slide-over */}
      {editItem !== undefined && (
        <ItemForm item={editItem} onClose={() => setEditItem(undefined)} />
      )}
    </div>
  );
}
