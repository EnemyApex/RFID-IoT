// ============================================================
// FICHIER : src/pages/User/Dashboard.jsx
// RÔLE   : Accueil utilisateur. Résumé personnel :
//          emprunts en cours, retards, raccourcis.
// ============================================================

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function UserDashboard() {
  const { user } = useAuth();
  const [loans, setLoans] = useState([]);

  useEffect(() => {
    api.getUserTx(user.id).then(setLoans).catch(console.error);
  }, [user.id]);

  const active = loans.filter(l => !l.returned_at);
  const overdue = active.filter(l => new Date(l.due_date) < new Date());

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Bonjour {user.name} 👋</h1>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-5 rounded shadow">
            <div className="text-3xl font-bold text-blue-600">{active.length}</div>
            <div className="text-sm text-gray-500">Emprunts en cours</div>
          </div>
          <div className="bg-white p-5 rounded shadow">
            <div className="text-3xl font-bold text-red-600">{overdue.length}</div>
            <div className="text-sm text-gray-500">En retard</div>
          </div>
          <div className="bg-white p-5 rounded shadow">
            <div className="text-3xl font-bold text-gray-600">{loans.length}</div>
            <div className="text-sm text-gray-500">Total historique</div>
          </div>
        </div>

        <div className="flex gap-3">
          <Link to="/user/catalog" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Parcourir le catalogue
          </Link>
          <Link to="/user/loans" className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
            Voir mes emprunts
          </Link>
        </div>
      </main>
    </>
  );
}
