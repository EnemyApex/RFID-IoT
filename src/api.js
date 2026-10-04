// ============================================================
// FICHIER : src/api.js
// RÔLE   : Centralise tous les appels HTTP vers le backend.
//          Injecte automatiquement le token JWT.
// USAGE  : import { api } from '../api'; api.getBooks()
// ============================================================

const API_BASE = import.meta.env.VITE_API_URL || '';

// Récupère le token JWT stocké dans localStorage
function getToken() { return localStorage.getItem('token'); }

// Enveloppe fetch : gère le JSON et l'authentification
async function request(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// API exposée sous forme de fonctions nommées
export const api = {
  // Authentification
  login:    (email, password) => request('/api/auth/login',    { method: 'POST', body: { email, password } }),
  register: (data)            => request('/api/auth/register', { method: 'POST', body: data }),
  me:       ()                => request('/api/auth/me'),

  // Utilisateurs
  getUsers:    ()       => request('/api/users'),
  createUser:  (data)   => request('/api/users',        { method: 'POST',   body: data }),
  updateUser:  (id, d)  => request(`/api/users/${id}`,  { method: 'PUT',    body: d }),
  deleteUser:  (id)     => request(`/api/users/${id}`,  { method: 'DELETE' }),
  getUserTx:   (id)     => request(`/api/users/${id}/transactions`),

  // Livres (catalogue)
  getBooks:    (params = '') => request(`/api/books${params}`),
  getBook:     (id)          => request(`/api/books/${id}`),
  createBook:  (data)        => request('/api/books',      { method: 'POST',   body: data }),
  updateBook:  (id, d)       => request(`/api/books/${id}`, { method: 'PUT',   body: d }),
  deleteBook:  (id)          => request(`/api/books/${id}`, { method: 'DELETE' }),

  // Transactions + stats
  getTransactions: () => request('/api/transactions'),
  getStats:        () => request('/api/stats')
};
