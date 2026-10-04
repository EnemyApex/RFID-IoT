// ============================================================
// FICHIER : src/context/AuthContext.jsx
// RÔLE   : Fournit l'utilisateur connecté à toute l'application.
//          Gère login, logout, restauration de session au chargement.
// USAGE  : const { user, login, logout } = useAuth();
// ============================================================

import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // Restauration de session au démarrage
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    api.me()
      .then(setUser)
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  // Connexion
  async function login(email, password) {
    const { token, user } = await api.login(email, password);
    localStorage.setItem('token', token);
    setUser(user);
    return user;
  }

  // Déconnexion
  function logout() {
    localStorage.removeItem('token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans AuthProvider');
  return ctx;
}
