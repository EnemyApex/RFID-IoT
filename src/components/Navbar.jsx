// ============================================================
// FICHIER : src/components/Navbar.jsx
// RÔLE   : Affiche la barre de navigation adaptée au rôle.
//          Admin : liens dashboard/users/books/tx
//          User  : liens dashboard/catalogue/mes emprunts
// ============================================================

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  if (!user) return null;

  const isAdmin = user.role === 'admin';
  const base = isAdmin ? '/admin' : '/user';

  return (
    <nav className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
        <Link to={`${base}/dashboard`} className="text-xl font-bold text-blue-700">
          📚 RFIDlib
        </Link>

        <div className="flex items-center gap-4 text-sm">
          {/* Liens spécifiques au rôle */}
          {isAdmin ? (
            <>
              <Link to="/admin/dashboard"     className="hover:text-blue-600">Dashboard</Link>
              <Link to="/admin/users"         className="hover:text-blue-600">Utilisateurs</Link>
              <Link to="/admin/books"         className="hover:text-blue-600">Livres</Link>
              <Link to="/admin/transactions"  className="hover:text-blue-600">Transactions</Link>
            </>
          ) : (
            <>
              <Link to="/user/dashboard" className="hover:text-blue-600">Accueil</Link>
              <Link to="/user/catalog"   className="hover:text-blue-600">Catalogue</Link>
              <Link to="/user/loans"     className="hover:text-blue-600">Mes emprunts</Link>
              <Link to="/user/profile"   className="hover:text-blue-600">Profil</Link>
            </>
          )}

          {/* Identité + déconnexion */}
          <span className="text-gray-500">|</span>
          <span className="text-gray-700">{user.name}</span>
          <button onClick={handleLogout}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">
            Déconnexion
          </button>
        </div>
      </div>
    </nav>
  );
}
