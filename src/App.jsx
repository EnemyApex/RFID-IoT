// ============================================================
// FICHIER : src/App.jsx
// RÔLE   : Définit toutes les routes de l'application et
//          protège les routes admin/user.
// ROUTES :
//   /login          → page publique
//   /admin/*        → réservé admin
//   /user/*         → réservé utilisateur
// ============================================================

import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages publiques
import Login from './pages/Login';

// Pages Admin
import AdminDashboard     from './pages/Admin/Dashboard';
import AdminUsers         from './pages/Admin/Users';
import AdminBooks         from './pages/Admin/Books';
import AdminTransactions  from './pages/Admin/Transactions';

// Pages Utilisateur
import UserDashboard from './pages/User/Dashboard';
import UserCatalog   from './pages/User/Catalog';
import UserLoans     from './pages/User/MyLoans';
import UserProfile   from './pages/User/Profile';

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Redirection racine selon rôle */}
      <Route path="/" element={
        user
          ? <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'} replace />
          : <Navigate to="/login" replace />
      } />

      {/* Page publique */}
      <Route path="/login" element={<Login />} />

      {/* Zone Admin */}
      <Route path="/admin/dashboard"    element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users"        element={<ProtectedRoute role="admin"><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/books"        element={<ProtectedRoute role="admin"><AdminBooks /></ProtectedRoute>} />
      <Route path="/admin/transactions" element={<ProtectedRoute role="admin"><AdminTransactions /></ProtectedRoute>} />

      {/* Zone Utilisateur */}
      <Route path="/user/dashboard" element={<ProtectedRoute role="user"><UserDashboard /></ProtectedRoute>} />
      <Route path="/user/catalog"   element={<ProtectedRoute role="user"><UserCatalog /></ProtectedRoute>} />
      <Route path="/user/loans"     element={<ProtectedRoute role="user"><UserLoans /></ProtectedRoute>} />
      <Route path="/user/profile"   element={<ProtectedRoute role="user"><UserProfile /></ProtectedRoute>} />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
