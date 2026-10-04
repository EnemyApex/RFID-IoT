// ============================================================
// FICHIER : api/routes/auth.js
// RÔLE   : Gère inscription, connexion, et profil courant.
// ROUTES :
//   POST /api/auth/register  → crée un compte utilisateur
//   POST /api/auth/login     → retourne un JWT
//   GET  /api/auth/me        → infos du user connecté
// ============================================================

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { ObjectId } = require('mongodb');
const { connectToDatabase } = require('../lib/db');
const { signToken, requireAuth } = require('../lib/auth');

// --- Inscription (utilisateur normal) ---
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, rfid_uid } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'email, password et name requis' });
    }
    const { db } = await connectToDatabase();
    const hash = await bcrypt.hash(password, 10);

    const result = await db.collection('users').insertOne({
      email, name, rfid_uid: rfid_uid || null,
      password: hash, role: 'user',
      created_at: new Date()
    });

    const token = signToken({ id: result.insertedId, email, role: 'user' });
    res.status(201).json({ token, user: { id: result.insertedId, email, name, role: 'user' } });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Email ou carte déjà utilisé' });
    res.status(500).json({ error: err.message });
  }
});

// --- Connexion ---
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Champs requis' });

    const { db } = await connectToDatabase();
    const user = await db.collection('users').findOne({ email });
    if (!user || !user.password) return res.status(401).json({ error: 'Identifiants invalides' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Identifiants invalides' });

    const token = signToken({ id: user._id, email: user.email, role: user.role });
    res.json({
      token,
      user: {
        id: user._id, email: user.email, name: user.name,
        role: user.role, rfid_uid: user.rfid_uid
      }
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Profil courant ---
router.get('/me', requireAuth, async (req, res) => {
  const { db } = await connectToDatabase();
  const user = await db.collection('users').findOne(
    { _id: new ObjectId(req.user.id) },
    { projection: { password: 0 } }   // ne jamais renvoyer le hash
  );
  if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
  res.json(user);
});

module.exports = router;
