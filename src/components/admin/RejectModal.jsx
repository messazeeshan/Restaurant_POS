import React, { useState } from 'react';

const REJECT_REASONS = [
  'Out of stock',
  'Kitchen at capacity',
  'Duplicate order',
  'Other',
];

export default function RejectModal({ onConfirm, onCancel }) {
  const [selected, setSelected] = useState('');
  const [custom, setCustom] = useState('');

  const reason = selected === 'Other' ? (custom.trim() || 'Other') : selected;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}
      onClick={onCancel}
    >
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          padding: 28,
          width: '100%',
          maxWidth: 420,
          boxShadow: 'var(--shadow-xl)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, marginBottom: 6, color: 'var(--text-primary)' }}>
          Reason for rejection?
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 18 }}>
          The waiter will be notified with this reason.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {REJECT_REASONS.map((r) => (
            <label
              key={r}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: `1px solid ${selected === r ? 'var(--accent)' : 'var(--border)'}`,
                background: selected === r ? 'var(--accent-bg)' : 'var(--bg-subtle)',
                cursor: 'pointer',
                fontSize: 14,
                color: 'var(--text-primary)',
              }}
            >
              <input
                type="radio"
                name="reject-reason"
                value={r}
                checked={selected === r}
                onChange={() => setSelected(r)}
                style={{ accentColor: 'var(--accent)' }}
              />
              {r}
            </label>
          ))}
        </div>

        {selected === 'Other' && (
          <textarea
            className="form-textarea"
            placeholder="Describe the reason…"
            rows={2}
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            style={{ marginBottom: 16 }}
            autoFocus
          />
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button
            className="btn btn-danger"
            disabled={!reason}
            onClick={() => onConfirm(reason)}
            id="confirm-reject-btn"
          >
            Confirm Rejection
          </button>
        </div>
      </div>
    </div>
  );
}
