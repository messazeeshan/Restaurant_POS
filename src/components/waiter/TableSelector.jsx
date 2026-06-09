import React from 'react';
import { Users } from 'lucide-react';
import useTableStore from '../../store/useTableStore.js';
import { TABLE_STATUS } from '../../data/constants.js';

export default function TableSelector({ onSelect }) {
  const { tables } = useTableStore();

  const availableTables = tables.filter((t) => t.status === TABLE_STATUS.AVAILABLE);
  const occupiedTables = tables.filter((t) => t.status !== TABLE_STATUS.AVAILABLE && t.status !== TABLE_STATUS.RESERVED);

  const handleOccupied = (table) => {
    if (window.confirm(`Table ${table.number} is currently occupied. Start a new order anyway?`)) {
      onSelect(table);
    }
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
        Select a Table
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
        Tap a table to begin the dine-in order
      </div>


      {/* Available */}
      {availableTables.length > 0 && (
        <>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
            Available ({availableTables.length})
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 10, marginBottom: 24 }}>
            {availableTables.map((table) => (
              <button
                key={table.id}
                onClick={() => onSelect(table)}
                style={{
                  padding: '20px 10px',
                  background: 'var(--bg-surface)',
                  border: '2px solid var(--success)',
                  borderRadius: 'var(--radius-lg)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                }}
                id={`waiter-table-${table.id}`}
              >
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--text-primary)' }}>
                  {table.number}
                </div>
                <div style={{ fontSize: 11, color: 'var(--success)', fontWeight: 600 }}>Available</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Users size={10} /> {table.capacity}
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Occupied */}
      {occupiedTables.length > 0 && (
        <>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
            Occupied ({occupiedTables.length})
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 10 }}>
            {occupiedTables.map((table) => (
              <button
                key={table.id}
                onClick={() => handleOccupied(table)}
                style={{
                  padding: '20px 10px',
                  background: 'var(--bg-subtle)',
                  border: '2px solid var(--warning)',
                  borderRadius: 'var(--radius-lg)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  opacity: 0.85,
                }}
              >
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--text-primary)' }}>
                  {table.number}
                </div>
                <div style={{ fontSize: 11, color: 'var(--warning)', fontWeight: 600 }}>Occupied</div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
