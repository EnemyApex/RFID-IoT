// ============================================================
// FICHIER : src/pages/Admin/Users.jsx
// RÔLE   : CRUD complet des utilisateurs (créer, éditer, suppr).
//          Tableau avec boutons d'action.
// ============================================================

import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { api } from '../../api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [form, setForm]   = useState({ name: '', email: '', rfid_uid: '', role: 'user', password: '' });
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  const load = () => api.getUsers().then(setUsers).catch(e => setError(e.message));
  useEffect(() => { load(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editing) await api.updateUser(editing, form);
      else         await api.createUser(form);
      setForm({ name: '', email: '', rfid_uid: '', role: 'user', password: '' });
      setEditing(null);
      load();
    } catch (err) { setError(err.message); }
  }

  async function handleDelete(id) {
    if (!confirm('Supprimer cet utilisateur ?')) return;
    await api.deleteUser(id);
    load();
  }

  function startEdit(u) {
    setEditing(u._id);
    setForm({ name: u.name, email: u.email || '', rfid_uid: u.rfid_uid || '', role: u.role, password: '' });
  }

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Gestion des utilisateurs</h1>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-6 grid md:grid-cols-6 gap-3">
          <input required placeholder="Nom"    value={form.name}
                 onChange={e => setForm({ ...form, name: e.target.value })}
                 className="px-3 py-2 border rounded" />
          <input placeholder="Email" type="email" value={form.email}
                 onChange={e => setForm({ ...form, email: e.target.value })}
                 className="px-3 py-2 border rounded" />
          <input placeholder="UID RFID" value={form.rfid_uid}
                 onChange={e => setForm({ ...form, rfid_uid: e.target.value })}
                 className="px-3 py-2 border rounded" />
          <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                  className="px-3 py-2 border rounded">
            <option value="user">Utilisateur</option>
            <option value="admin">Admin</option>
          </select>
          <input placeholder="Mot de passe" type="password" value={form.password}
                 onChange={e => setForm({ ...form, password: e.target.value })}
                 className="px-3 py-2 border rounded" />
          <button className="bg-blue-600 text-white rounded hover:bg-blue-700">
            {editing ? 'Mettre à jour' : 'Créer'}
          </button>
        </form>

        {/* Tableau */}
        <div className="bg-white rounded shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['UID RFID', 'Nom', 'Email', 'Rôle', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map(u => (
                <tr key={u._id}>
                  <td className="px-4 py-2 font-mono
