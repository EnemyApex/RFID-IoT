// ============================================================
// FICHIER : api/routes/transactions.js
// RÔLE   : Retourne l'historique des emprunts.
//          - Admin : toutes les transactions
//          - User  : uniquement les siennes
// ============================================================

const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { connectToDatabase } = require('../lib/db');
const { requireAuth } = require('../lib/auth');

router.get('/', requireAuth, async (req, res) => {
  const { db } = await connectToDatabase();
  const filter = {};
  if (req.user.role !== 'admin') filter.user_id = new ObjectId(req.user.id);

  const items = await db.collection('transactions')
    .find(filter).sort({ timestamp: -1 }).limit(200).toArray();
  res.json(items);
});

module.exports = router;
