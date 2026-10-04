// ============================================================
// FICHIER : src/pages/Admin/Transactions.jsx
// RÔLE   : Affiche l'historique global des emprunts avec
//          utilisateur, livre, date, amendes éventuelles.
// ============================================================

import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { api } from '../../api';

export default function AdminTransactions() {
  const [tx, setTx] = useState([]);

  useEffect(() => { api.getTransactions().then(setTx).catch(console.error); }, []);

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Historique des transactions</h1>
        <div className="bg-white rounded shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Utilisateur', 'Livre', 'Action', 'Date', 'Amende'].map(h => (
                  <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tx.map(t => (
                <tr key={t._id}>
                  <td className="px-4 py-2">{t.user_name}</td>
                  <td className="px-4 py-2">{t.book_title}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      t.action === 'borrow' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                    }`}>{t.action === 'borrow' ? 'Emprunt' : 'Retour'}</span>
                  </td>
                  <td className="px-4 py-2 text-gray-500 text-sm">
                    {new Date(t.timestamp).toLocaleString('fr-FR')}
                  </td>
                  <td className="px-4 py-2">{t.fine > 0 ? `${t.fine} DA` : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
