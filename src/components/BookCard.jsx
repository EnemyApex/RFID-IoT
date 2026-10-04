// ============================================================
// FICHIER : src/components/BookCard.jsx
// RÔLE   : Composant réutilisable pour afficher un livre dans
//          le catalogue. Affiche titre, auteur, statut, couverture.
// ============================================================

export default function BookCard({ book, onClick }) {
  return (
    <div
      onClick={() => onClick?.(book)}
      className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer overflow-hidden"
    >
      {/* Couverture ou placeholder */}
      <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center text-5xl">
        {book.cover_url
          ? <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
          : '📖'}
      </div>

      <div className="p-4">
        <h3 className="font-bold text-gray-800 truncate">{book.title}</h3>
        <p className="text-sm text-gray-500 truncate">{book.author || 'Auteur inconnu'}</p>

        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="px-2 py-1 bg-gray-100 rounded">{book.category}</span>
          <span className={`px-2 py-1 rounded-full ${
            book.available
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}>
            {book.available ? 'Disponible' : 'Emprunté'}
          </span>
        </div>
      </div>
    </div>
  );
}
