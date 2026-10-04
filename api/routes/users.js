// ============================================================
// FICHIER : api/routes/users.js
// RÔLE   : CRUD utilisateurs (réservé admin) + historique
//          personnel (accessible à soi-même ou admin).
// SÉCURITÉ : requireAdmin pour les modifications.
// ============================================================

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { ObjectId } = require('mongodb');
const { connectToDatabase } = require('../lib/db');
const { requireAuth, requireAdmin } = require('../lib/auth');

// --- Liste (admin) : exclut les mots de passe ---
router.get('/', requireAdmin, async (req, res) => {
  const { db } = await connectToDatabase();
  const users = await db.collection('users')
    .find({}, { projection: { password: 0 } })
    .sort({ created_at: -1 }).toArray();
  res.json(users);
});

// --- Création (admin) ---
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { rfid_uid, name, email, role, password } = req.body;
    if (!name) return res.status(400).json({ error: 'name requis' });
    const { db } = await connectToDatabase();
    const hash = password ? await bcrypt.hash(password, 10) : null;
    const result = await db.collection('users').insertOne({
      rfid_uid: rfid_uid || null,
      name,
      email: email || null,
      role: role || 'user',
      password: hash,
      created_at: new Date()
    });
    res.status(201).json({ _id: result.insertedId, rfid_uid, name, email, role });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Doublon détecté' });
    res.status(500).json({ error: err.message });
  }
});

// --- Modification (admin) ---
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { name, email, role, rfid_uid, password } = req.body;
    const update = {};
    if (name)     update.name = name;
    if (email)    update.email = email;
    if (role)     update.role = role;
    if (rfid_uid) update.rfid_uid = rfid_uid;
    if (password) update.password = await bcrypt.hash(password, 10);

    const { db } = await connectToDatabase();
    await db.collection('users').updateOne(
      { _id: new ObjectId(req.params.id) }, { $set: update }
    );
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Suppression (admin) ---
router.delete('/:id', requireAdmin, async (req, res) => {
  const { db } = await connectToDatabase();
  await db.collection('users').deleteOne({ _id: new ObjectId(req.params.id) });
  res.json({ success: true });
});

// --- Historique d'un utilisateur (soi-même ou admin) ---
router.get('/:id/transactions', requireAuth, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
    return res.status(403).json({ error: 'Accès refusé' });
  }
  const { db } = await connectToDatabase();
  const list = await db.collection('transactions')
    .find({ user_id: new ObjectId(req.params.id) })
    .sort({ timestamp: -1 }).toArray();
  res.json(list);
});

module.exports = router;
