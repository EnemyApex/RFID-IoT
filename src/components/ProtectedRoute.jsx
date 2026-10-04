// ============================================================
// FICHIER : src/components/ProtectedRoute.jsx
// RÔLE   : Vérifie que l'utilisateur a le bon rôle avant
//          d'afficher une page. Sinon redirige vers /login
//          ou vers son dashboard par défaut.
// ============================================================

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-8 text-center">Chargement...</div>;

  // Non connecté → login
  if (!user) return <Navigate to="/login" replace />;

  // Mauvais rôle → redirection vers son espace
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'} replace />;
  }

  return children;
}
