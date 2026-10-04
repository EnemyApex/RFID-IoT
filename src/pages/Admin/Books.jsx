// ============================================================
// FICHIER : src/pages/Admin/Books.jsx
// RÔLE   : Gestion admin du catalogue. Ajoute, édite, supprime
//          des livres et associe chaque livre à une étiquette RFID.
// ============================================================

import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { api } from '../../api';

const EMPTY = { rfid_uid: '', title: '', author: '', isbn: '', category: '', description: '' };

export default function AdminBooks() {
  const [books, setBooks]   = useState([]);
  const [form, setForm]     = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [error, setError]   = useState('');

  const load = () => api.getBooks('?limit=100').then(r => setBooks(r.items)).catch(e => setError(e.message));
  useEffect(() => { load(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editing) await api.updateBook(editing, form);
      else         await api.createBook(form);
      setForm(EMPTY); setEditing(null); load();
    } catch (err) { setError(err.message); }
  }

  async function handleDelete(id) {
    if (!confirm('Supprimer ce livre ?')) return;
    await api.deleteBook(id);
    load();
  }

  function startEdit(b) {
    setEditing(b._id);
    setForm({
      rfid_uid: b.rfid_uid, title: b.title, author: b.author || '',
      isbn: b.isbn || '', category: b.category || '', description: b.description || ''
    });
  }

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Catalogue — Gestion admin</h1>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

        <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-6 grid md:grid-cols-6 gap-3">
          <input required placeholder="UID RFID" value={form.rfid_uid}
                 onChange={e => setForm({ ...form, rfid_uid: e.target.value })}
                 className="px-3 py-2 border rounded font-mono" />
          <input required placeholder="Titre" value={form.title}
                 onChange={e => setForm({ ...form, title: e.target.value })}
                 className="px-3 py-2 border rounded" />
          <input placeholder="Auteur" value={form.author}
                 onChange={e => setForm({ ...form, author: e.target.value })}
                 className="px-3 py-2 border rounded" />
          <input placeholder="Catégorie" value={form.category}
                 onChange={e => setForm({ ...form, category: e.target.value })}
                 className="px-3 py-2 border rounded" />
          <input placeholder="ISBN" value={form.isbn}
                 onChange={e => setForm({ ...form, isbn: e.target.value })}
                 className="px-3 py-2 border rounded" />
          <button className="bg-blue-600 text-white rounded hover:bg-blue-700">
            {editing ? 'Mettre à jour' : 'Ajouter'}
          </button>
        </form>

        <div className="bg-white rounded shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['UID', 'Titre', 'Auteur', 'Catégorie', 'Dispo', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {books.map(b => (
                <tr key={b._id}>
                  <td className="px-4 py-2 font-mono text-xs">{b.rfid_uid}</td>
                  <td className="px-4 py-2">{b.title}</td>
                  <td className="px-4 py-2 text-gray-500">{b.author || '-'}</td>
                  <td className="px-4 py-2 text-gray-500">{b.category}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      b.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>{b.available ? 'Oui' : 'Non'}</span>
                  </td>
                  <td className="px-4 py-2 space-x-2">
                    <button onClick={() => startEdit(b)} className="text-blue-600 hover:underline text-sm">Éditer</button>
                    <button onClick={() => handleDelete(b._id)} className="text-red-600 hover:underline text-sm">Suppr.</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
