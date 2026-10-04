// ============================================================
// FICHIER : src/pages/User/Catalog.jsx
// RÔLE   : Catalogue de livres pour l'utilisateur.
//          Recherche, filtres de disponibilité, pagination.
// ============================================================

import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import BookCard from '../../components/BookCard';
import { api } from '../../api';

export default function UserCatalog() {
  const [books, setBooks]     = useState([]);
  const [q, setQ]             = useState('');
  const [available, setAvailable] = useState('');
  const [page, setPage]       = useState(1);
  const [meta, setMeta]       = useState({ pages: 1 });

  useEffect(() => {
    const params = new URLSearchParams({ q, page, limit: 12 });
    if (available) params.append('available', available);

    api.getBooks(`?${params}`)
      .then(r => { setBooks(r.items); setMeta({ pages: r.pages }); })
      .catch(console.error);
  }, [q, available, page]);

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Catalogue de livres</h1>

        {/* Barre de recherche + filtre */}
        <div className="flex flex-wrap gap-3 mb-6">
          <input placeholder="Rechercher un titre, auteur, ISBN..."
                 value={q} onChange={e => { setQ(e.target.value); setPage(1); }}
                 className="flex-1 min-w-[250px] px-4 py-2 border rounded" />
          <select value={available}
                  onChange={e => { setAvailable(e.target.value); setPage(1); }}
                  className="px-3 py-2 border rounded">
            <option value="">Tous les livres</option>
            <option value="true">Disponibles uniquement</option>
            <option value="false">Empruntés</option>
          </select>
        </div>

        {/* Grille */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {books.map(b => <BookCard key={b._id} book={b} />)}
        </div>

        {books.length === 0 && (
          <p className="text-center text-gray-500 mt-12">Aucun livre trouvé.</p>
        )}

        {/* Pagination */}
        {meta.pages > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                    className="px-3 py-1 border rounded disabled:opacity-40">Précédent</button>
            <span className="px-3 py-1">Page {page} / {meta.pages}</span>
            <button disabled={page === meta.pages} onClick={() => setPage(p => p + 1)}
                    className="px-3 py-1 border rounded disabled:opacity-40">Suivant</button>
          </div>
        )}
      </main>
    </>
  );
}
