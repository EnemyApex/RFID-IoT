// ============================================================
// FICHIER : src/pages/Login.jsx
// RÔLE   : Page publique de connexion. Redirige l'utilisateur
//          selon son rôle après authentification réussie.
// ============================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail]       = useState('admin@rfidlib.local');
  const [password, setPassword] = useState('admin123');
  const [error, setError]       = useState('');
  const [busy, setBusy]         = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      const user = await login(email, password);
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit}
            className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-blue-700 mb-6">
          📚 RFIDlib
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>
        )}

        <label className="block mb-3">
          <span className="text-sm text-gray-600">Email</span>
          <input type="email" required value={email}
                 onChange={e => setEmail(e.target.value)}
                 className="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </label>

        <label className="block mb-5">
          <span className="text-sm text-gray-600">Mot de passe</span>
          <input type="password" required value={password}
                 onChange={e => setPassword(e.target.value)}
                 className="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </label>

        <button type="submit" disabled={busy}
                className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
          {busy ? 'Connexion...' : 'Se connecter'}
        </button>

        <p className="mt-4 text-xs text-gray-500 text-center">
          Compte admin par défaut : admin@rfidlib.local / admin123
        </p>
      </form>
    </div>
  );
}
