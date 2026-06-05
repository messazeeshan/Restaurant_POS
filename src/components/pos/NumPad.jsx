import React from 'react';
import { Delete } from 'lucide-react';

const NUMPAD_KEYS = [
  '7', '8', '9',
  '4', '5', '6',
  '1', '2', '3',
  '00', '0', '.',
];

/**
 * NumPad — numeric input component for cash amounts
 * @param {{ value: string, onChange: (val: string) => void, onClear?: () => void }} props
 */
export default function NumPad({ value = '', onChange, onClear }) {
  const handleKey = (key) => {
    if (key === 'DEL') {
      onChange(value.slice(0, -1) || '');
      return;
    }

    // Prevent multiple decimals
    if (key === '.' && value.includes('.')) return;

    // Max 2 decimal places
    if (value.includes('.')) {
      const decimals = value.split('.')[1];
      if (decimals && decimals.length >= 2) return;
    }

    // Don't start with 00
    if (key === '00' && !value) return;

    // Max value guard (safety)
    const newVal = value + key;
    if (parseFloat(newVal) > 99999) return;

    onChange(newVal);
  };

  const displayValue = value || '0.00';

  return (
    <div>
      {/* Display */}
      <div
        style={{
          background: 'var(--bg-base)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          padding: '16px',
          textAlign: 'right',
          fontFamily: 'var(--font-display)',
          fontSize: 32,
          fontWeight: 800,
          color: 'var(--text-primary)',
          fontVariantNumeric: 'tabular-nums',
          marginBottom: 12,
          minHeight: 68,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}
      >
        ${displayValue}
      </div>

      {/* Keys */}
      <div className="numpad">
        {NUMPAD_KEYS.map((key) => (
          <button
            key={key}
            className="numpad-btn"
            onClick={() => handleKey(key)}
            aria-label={key}
            id={`numpad-${key}`}
          >
            {key}
          </button>
        ))}
        {/* Delete key */}
        <button
          className="numpad-btn accent"
          onClick={() => handleKey('DEL')}
          aria-label="Delete last digit"
          id="numpad-del"
        >
          <Delete size={20} />
        </button>
        {/* Clear key */}
        <button
          className="numpad-btn"
          onClick={() => onChange('')}
          aria-label="Clear"
          id="numpad-clear"
          style={{ fontSize: 14, fontWeight: 700 }}
        >
          CLR
        </button>
        {/* Enter key */}
        <button
          className="numpad-btn action"
          onClick={() => {}}
          aria-label="Confirm"
          id="numpad-enter"
          style={{ fontSize: 14, fontWeight: 700 }}
        >
          ✓
        </button>
      </div>
    </div>
  );
}
