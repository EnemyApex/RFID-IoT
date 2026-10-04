// ============================================================
// FICHIER : src/pages/User/Profile.jsx
// RÔLE   : Affiche les informations du profil utilisateur
//          (nom, email, UID RFID, rôle). Lecture seule.
// ============================================================

import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();

  const rows = [
    ['Nom',       user.name],
    ['Email',     user.email],
    ['UID RFID',  user.rfid_uid || 'Non associé'],
    ['Rôle',      user.role === 'admin' ? 'Administrateur' : 'Utilisateur']
  ];

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Mon profil</h1>
        <div className="bg-white rounded shadow p-6">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between border-b py-3 last:border-0">
              <span className="text-gray-500">{label}</span>
              <span className="font-medium">{value}</span>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
