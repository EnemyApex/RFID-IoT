// ============================================================
// FICHIER : api/routes/scan.js
// RÔLE   : Cœur métier du double scan.
// SCÉNARIOS :
//   1. Scan CARTE UTILISATEUR → ouvre une session Redis (30s)
//   2. Scan LIVRE + session active → emprunt
//   3. Scan LIVRE déjà emprunté → retour automatique
//   4. Scan LIVRE sans session → demande la carte d'abord
// FLUX   : ESP32 → POST /api/scan → MongoDB + Redis → réponse JSON
// ============================================================

const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { connectToDatabase } = require('../lib/db');
const { requireApiKey } = require('../lib/auth');
const redis = require('../lib/redis');

const SESSION_TTL = 30; // secondes

// Règles de prêt
const FINE_RULES = { freeDays: 3, dailyRate: 50, maxFine: 5000, loanDuration: 14 };

// Calcule l'amende selon le retard
function calculateFine(due, returned) {
  const diffDays = Math.ceil((new Date(returned) - new Date(due)) / (1000 * 60 * 60 * 24));
  if (diffDays <= FINE_RULES.freeDays) return 0;
  return Math.min((diffDays - FINE_RULES.freeDays) * FINE_RULES.dailyRate, FINE_RULES.maxFine);
}

router.post('/', requireApiKey, async (req, res) => {
  try {
    const { uid, device } = req.body;
    if (!uid) return res.status(400).json({ status: 'error', message: 'UID manquant' });

    const deviceId = device || 'unknown';
    const { db } = await connectToDatabase();

    // Log brut (utile pour debug et audit)
    await db.collection('scan_logs').insertOne({ uid, device: deviceId, at: new Date() });

    // ---------- CAS 1 : CARTE UTILISATEUR ----------
    const user = await db.collection('users').findOne({ rfid_uid: uid });
    if (user) {
      // Ouvrir session : cet utilisateur a 30s pour scanner un livre
      await redis.set(`session:${deviceId}`, JSON.stringify({
        userId: user._id.toString(),
        userName: user.name
      }), { ex: SESSION_TTL });

      return res.json({
        status: 'success',
        type: 'user',
        message: `Bienvenue ${user.name}. Scannez un livre (30s).`,
        user: { id: user._id, name: user.name, role: user.role }
      });
    }

    // ---------- CAS 2 : LIVRE ----------
    const book = await db.collection('books').findOne({ rfid_uid: uid });
    if (!book) return res.status(404).json({ status: 'error', message: `UID inconnu : ${uid}` });

    // ---- Sous-cas : livre déjà emprunté → RETOUR automatique ----
    const activeLoan = await db.collection('transactions').findOne({
      book_id: book._id, returned_at: null
    });

    if (activeLoan) {
      const now = new Date();
      const fine = calculateFine(activeLoan.due_date, now);

      await db.collection('transactions').updateOne(
        { _id: activeLoan._id },
        { $set: { returned_at: now, fine } }
      );
      await db.collection('books').updateOne(
        { _id: book._id }, { $set: { available: true } }
      );
      await redis.del(`session:${deviceId}`);

      return res.json({
        status: 'success',
        type: 'return',
        message: `Retour : "${book.title}"${fine > 0 ? ` — Amende : ${fine} DA` : ''}`,
        book: { title: book.title }, fine
      });
    }

    // ---- Sous-cas : livre disponible → emprunt nécessite session ----
    const raw = await redis.get(`session:${deviceId}`);
    const session = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : null;

    if (!session) {
      return res.json({
        status: 'pending',
        type: 'borrow_pending',
        message: `Scannez d'abord votre carte utilisateur.`,
        book: { title: book.title }
      });
    }

    // Récupérer l'utilisateur en session
    const userDoc = await db.collection('users').findOne({
      _id: new ObjectId(session.userId)
    });
    if (!userDoc) {
      await redis.del(`session:${deviceId}`);
      return res.status(404).json({ status: 'error', message: 'Utilisateur introuvable' });
    }

    // Vérifier la limite de 5 emprunts
    const activeCount = await db.collection('transactions').countDocuments({
      user_id: userDoc._id, returned_at: null
    });
    if (activeCount >= 5) {
      await redis.del(`session:${deviceId}`);
      return res.status(400).json({
        status: 'error',
        message: `${userDoc.name} a atteint 5 emprunts`
      });
    }

    // Créer l'emprunt
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + FINE_RULES.loanDuration);

    await db.collection('transactions').insertOne({
      user_id: userDoc._id,
      book_id: book._id,
      user_rfid: userDoc.rfid_uid,
      book_rfid: book.rfid_uid,
      user_name: userDoc.name,
      book_title: book.title,
      action: 'borrow',
      timestamp: new Date(),
      due_date: dueDate,
      returned_at: null,
      fine: 0
    });

    await db.collection('books').updateOne(
      { _id: book._id }, { $set: { available: false } }
    );
    await redis.del(`session:${deviceId}`);

    return res.json({
      status: 'success',
      type: 'borrow',
      message: `Emprunt : "${book.title}" pour ${userDoc.name}`,
      user: { name: userDoc.name },
      book: { title: book.title },
      due_date: dueDate
    });
  } catch (err) {
    console.error('[scan] error:', err);
    return res.status(500).json({ status: 'error', message: err.message });
  }
});

module.exports = router;
