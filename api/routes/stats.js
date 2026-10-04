// ============================================================
// FICHIER : api/routes/stats.js
// RÔLE   : Fournit les statistiques pour le dashboard.
//          Contient aussi /seed pour créer le premier admin.
// ============================================================

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { connectToDatabase } = require('../lib/db');

// --- Statistiques globales ---
router.get('/', async (req, res) => {
  const { db } = await connectToDatabase();
  const [totalUsers, totalBooks, availableBooks, activeLoans, overdueLoans] = await Promise.all([
    db.collection('users').countDocuments(),
    db.collection('books').countDocuments(),
    db.collection('books').countDocuments({ available: true }),
    db.collection('transactions').countDocuments({ returned_at: null }),
    db.collection('transactions').countDocuments({
      returned_at: null, due_date: { $lt: new Date() }
    })
  ]);
  res.json({ totalUsers, totalBooks, availableBooks, activeLoans, overdueLoans });
});

// --- Seed : crée l'admin par défaut (appel manuel une fois) ---
router.post('/seed', async (req, res) => {
  const { db } = await connectToDatabase();
  const exists = await db.collection('users').findOne({ email: 'admin@rfidlib.local' });
  if (exists) return res.json({ message: 'Admin existe déjà' });

  await db.collection('users').insertOne({
    email: 'admin@rfidlib.local',
    name: 'Administrateur',
    role: 'admin',
    password: await bcrypt.hash('admin123', 10),
    created_at: new Date()
  });
  res.json({ message: 'Admin créé : admin@rfidlib.local / admin123' });
});

module.exports = router;
