// ============================================================
// FICHIER : api/index.js
// RÔLE   : Point d'entrée unique du backend serverless Vercel.
//          Monte toutes les routes /api/* et applique les
//          middlewares globaux (CORS, JSON).
// FLUX   : Vercel reçoit une requête → ce fichier → route
//          correspondante → réponse JSON.
// ============================================================

const express = require('express');
const cors = require('cors');

const app = express();

// --- Middlewares globaux ---
app.use(cors());            // Autorise les requêtes cross-origin
app.use(express.json());    // Parse automatiquement le JSON des requêtes

// --- Montage des routes ---
// Chaque routeur gère un domaine fonctionnel distinct.
app.use('/api/scan',         require('./routes/scan'));         // ESP32
app.use('/api/auth',         require('./routes/auth'));         // Login/Register
app.use('/api/users',        require('./routes/users'));        // CRUD users
app.use('/api/books',        require('./routes/books'));        // Catalogue
app.use('/api/transactions', require('./routes/transactions')); // Emprunts
app.use('/api/stats',        require('./routes/stats'));        // Stats + seed

// --- Health check (utile pour tester le déploiement) ---
app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', service: 'RFIDlib', timestamp: new Date() })
);

// --- Gestion d'erreur globale ---
app.use((err, req, res, next) => {
  console.error('[Erreur globale]', err);
  res.status(500).json({ error: err.message });
});

module.exports = app;
