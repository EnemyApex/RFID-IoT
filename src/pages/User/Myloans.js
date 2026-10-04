// ============================================================
// FICHIER : src/pages/User/MyLoans.jsx
// RÔLE   : Liste personnelle des emprunts en cours + historique.
//          Met en rouge les retards, calcule les jours restants.
// ============================================================

import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function UserLoans() {
  const { user } = useAuth();
  const [loans, setLoans] = useState([]);

  useEffect(() => {
    api.getUserTx(user.id).then(setLoans).catch(console.error);
  }, [user.id]);

  const active = loans.filter(l => !l.returned_at);
  const history = loans.filter(l => l.returned_at);

  // Calcule le nombre de jours restants avant échéance
  function daysLeft(due) {
    return Math.ceil((new Date(due) - new Date()) / (1000 * 60 * 60 * 24));
  }

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Mes emprunts</h1>

        {/* Emprunts en cours */}
        <h2 className="text-lg font-semibold mb-3">En cours ({active.length})</h2>
        <div className="bg-white rounded shadow overflow-hidden mb-8">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Livre', 'Emprunté le', 'À rendre le', 'Statut'].map(h => (
                  <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {active.map(l => {
                const d = daysLeft(l.due_date);
                return (
                  <tr key={l._id}>
                    <td className="px-4 py-2">{l.book_title}</td>
                    <td className="px-4 py-2 text-gray-500 text-sm">
                      {new Date(l.timestamp).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-2 text-gray-500 text-sm">
                      {new Date(l.due_date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        d < 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {d < 0 ? `Retard de ${-d} j` : `${d} j restants`}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {active.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                  Aucun emprunt en cours
                </td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Historique */}
        <h2 className="text-lg font-semibold mb-3">Historique ({history.length})</h2>
        <div className="bg-white rounded shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Livre', 'Rendu le', 'Amende'].map(h => (
                  <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {history.map(l => (
                <tr key={l._id}>
                  <td className="px-4 py-2">{l.book_title}</td>
                  <td className="px-4 py-2 text-gray-500 text-sm">
                    {new Date(l.returned_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-2">{l.fine > 0 ? `${l.fine} DA` : '-'}</td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr><td colSpan={3} className="px-4 py-6 text-center text-gray-400">
                  Aucun historique
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
