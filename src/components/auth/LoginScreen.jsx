import React, { useState } from 'react';
import { Eye, EyeOff, Flame } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore.js';
import useSettingsStore from '../../store/useSettingsStore.js';

export default function LoginScreen() {
  const { login } = useAuthStore();
  const { getRestaurantName } = useSettingsStore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [shaking, setShaking] = useState(false);
  const [loading, setLoading] = useState(false);

  const restaurantName = getRestaurantName() || 'Ember & Oak';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      triggerError('Please enter your username and password.');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 350)); // brief UX delay
    const result = login(username.trim(), password);
    setLoading(false);
    if (!result.success) {
      triggerError('Invalid username or password.');
    }
  };

  const triggerError = (msg) => {
    setError(msg);
    setShaking(true);
    setTimeout(() => setShaking(false), 600);
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-app)',
      padding: 24,
      boxSizing: 'border-box',
    }}>
      <form
        onSubmit={handleSubmit}
        style={{
          width: '100%',
          maxWidth: 400,
          margin: '0 auto',
          background: 'var(--bg-surface)',
          border: `1px solid ${error ? 'var(--danger)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-xl)',
          padding: '40px 36px',
          boxShadow: 'var(--shadow-lg)',
          animation: shaking ? 'shake 0.5s ease' : 'none',
          transition: 'border-color 0.2s',
        }}
        noValidate
      >
        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 14,
            boxShadow: '0 4px 16px rgba(30, 92, 58, 0.35)',
          }}>
            <Flame size={26} color="#fff" />
          </div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 22,
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.3px',
          }}>
            {restaurantName}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>
            Point of Sale
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'var(--danger-bg)',
            border: '1px solid var(--danger)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 14px',
            fontSize: 13,
            color: 'var(--danger)',
            marginBottom: 18,
            fontWeight: 500,
          }}>
            {error}
          </div>
        )}

        {/* Username */}
        <div className="form-group" style={{ marginBottom: 14 }}>
          <label className="form-label" htmlFor="login-username">Username</label>
          <input
            id="login-username"
            className="form-input"
            type="text"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => { setUsername(e.target.value); setError(''); }}
            placeholder="Enter your username"
            style={error ? { borderColor: 'var(--danger)' } : {}}
          />
        </div>

        {/* Password */}
        <div className="form-group" style={{ marginBottom: 24 }}>
          <label className="form-label" htmlFor="login-password">Password</label>
          <div style={{ position: 'relative' }}>
            <input
              id="login-password"
              className="form-input"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder="Enter your password"
              style={{ paddingRight: 44, ...(error ? { borderColor: 'var(--danger)' } : {}) }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                border: 'none',
                background: 'transparent',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: 4,
                display: 'flex',
              }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', height: 46, fontSize: 15, fontWeight: 700, justifyContent: 'center' }}
          disabled={loading}
          id="login-submit-btn"
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </button>

        {/* Hint */}
        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
          Manager: <strong>manager</strong> / <strong>ember2025</strong>
        </div>
      </form>

      {/* Shake keyframe */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15%  { transform: translateX(-8px); }
          30%  { transform: translateX(8px); }
          45%  { transform: translateX(-6px); }
          60%  { transform: translateX(6px); }
          75%  { transform: translateX(-3px); }
          90%  { transform: translateX(3px); }
        }
      `}</style>
    </div>
  );
}
