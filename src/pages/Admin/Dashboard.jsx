// ============================================================
// FICHIER : src/pages/Admin/Dashboard.jsx
// RÔLE   : Tableau de bord administrateur. Affiche les
//          statistiques globales en cartes colorées.
// ============================================================

import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { api } from '../../api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.getStats().then(setStats).catch(console.error);
  }, []);

  if (!stats) return <><Navbar /><div className="p-8">Chargement...</div></>;

  const cards = [
    { label: 'Utilisateurs',    value: stats.totalUsers,     color: 'bg-blue-500' },
    { label: 'Livres totaux',   value: stats.totalBooks,     color: 'bg-green-500' },
    { label: 'Disponibles',     value: stats.availableBooks, color: 'bg-emerald-500' },
    { label: 'Emprunts actifs', value: stats.activeLoans,    color: 'bg-yellow-500' },
    { label: 'En retard',       value: stats.overdueLoans,   color: 'bg-red-500' }
  ];

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Tableau de bord</h1>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {cards.map(c => (
            <div key={c.label} className="bg-white rounded-lg shadow p-5">
              <div className={`w-3 h-3 rounded-full ${c.color} mb-3`} />
              <div className="text-3xl font-bold text-gray-800">{c.value}</div>
              <div className="text-sm text-gray-500 mt-1">{c.label}</div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
