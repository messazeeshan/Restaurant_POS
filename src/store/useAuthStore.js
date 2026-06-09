// ============================================================
// STORE — useAuthStore (session management)
// ============================================================

import { create } from 'zustand';
import { login as authLogin, logout as authLogout, getSession } from '../utils/auth.js';

const useAuthStore = create((set) => ({
  session: getSession(), // hydrate from localStorage on startup

  login: (username, password) => {
    const session = authLogin(username, password);
    if (session) {
      set({ session });
      return { success: true, session };
    }
    return { success: false };
  },

  logout: () => {
    authLogout();
    set({ session: null });
  },

  refreshSession: () => {
    set({ session: getSession() });
  },
}));

export default useAuthStore;
