// ============================================================
// UTILS — AUTH (session management, no backend)
// ============================================================

import { AUTH_USERS, STORAGE_KEYS } from '../data/constants.js';
import { readStorage, writeStorage, removeStorage } from './persistence.js';

/**
 * Attempt login. Returns session object on success, null on failure.
 */
export function login(username, password) {
  const user = AUTH_USERS.find(
    (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
  );
  if (!user) return null;

  const session = {
    role:     user.role,
    name:     user.name,
    staffId:  user.staffId,
    username: user.username,
    loginAt:  Date.now(),
  };
  writeStorage(STORAGE_KEYS.SESSION, session);
  return session;
}

/**
 * Destroy the current session.
 */
export function logout() {
  removeStorage(STORAGE_KEYS.SESSION);
}

/**
 * Get the current session or null.
 * @returns {{ role: string, name: string, staffId: string, loginAt: number } | null}
 */
export function getSession() {
  return readStorage(STORAGE_KEYS.SESSION, null);
}

/**
 * True if a valid session exists.
 */
export function hasSession() {
  return getSession() !== null;
}
