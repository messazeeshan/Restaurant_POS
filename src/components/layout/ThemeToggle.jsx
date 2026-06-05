import React from 'react';
import { Sun, Moon } from 'lucide-react';
import useAppStore from '../../store/useAppStore.js';

/**
 * ThemeToggle — sun/moon button that switches dark/light mode
 * @param {{ className?: string, iconOnly?: boolean }} props
 */
export default function ThemeToggle({ className = '', iconOnly = false }) {
  const { theme, toggleTheme } = useAppStore();
  const isDark = theme === 'dark';

  return (
    <button
      className={`nav-item ${className}`}
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      style={{ justifyContent: 'flex-start' }}
    >
      <span className="nav-icon">
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </span>
      <span className="nav-label">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
    </button>
  );
}
