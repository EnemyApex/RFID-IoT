// ============================================================
// FICHIER : api/routes/books.js
// RÔLE   : Catalogue public (recherche, filtres, pagination)
//          + CRUD admin (ajout, modification, suppression).
// ROUTES CLÉS :
//   GET  /api/books?q=&available=&category=&page=&limit=
//   GET  /api/books/:id     → détail d'un livre
//   POST /api/books         → admin uniquement
// ============================================================

const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { connectToDatabase } = require('../lib/db');
const { requireAdmin } = require('../lib/auth');

// --- Catalogue public avec recherche/filtres/pagination ---
router.get('/', async (req, res) => {
  const { db } = await connectToDatabase();
  const { q = '', available, category, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (q) {
    // Recherche insensible à la casse sur titre, auteur, ISBN
    filter.$or = [
      { title:  { $regex: q, $options: 'i' } },
      { author: { $regex: q, $options: 'i' } },
      { isbn:   { $regex: q, $options: 'i' } }
    ];
  }
  if (available === 'true')  filter.available = true;
  if (available === 'false') filter.available = false;
  if (category) filter.category = category;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [items, total] = await Promise.all([
    db.collection('books').find(filter).sort({ title: 1 }).skip(skip).limit(parseInt(limit)).toArray(),
    db.collection('books').countDocuments(filter)
  ]);

  res.json({ items, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
});

// --- Détail d'un livre ---
router.get('/:id', async (req, res) => {
  const { db } = await connectToDatabase();
  const book = await db.collection('books').findOne({ _id: new ObjectId(req.params.id) });
  if (!book) return res.status(404).json({ error: 'Livre introuvable' });
  res.json(book);
});

// --- Ajout (admin) ---
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { rfid_uid, title, author, isbn, category, description, cover_url } = req.body;
    if (!rfid_uid || !title) return res.status(400).json({ error: 'rfid_uid et title requis' });

    const { db } = await connectToDatabase();
    const result = await db.collection('books').insertOne({
      rfid_uid, title,
      author: author || null,
      isbn: isbn || null,
      category: category || 'Général',
      description: description || null,
      cover_url: cover_url || null,
      available: true,
      created_at: new Date()
    });
    res.status(201).json({ _id: result.insertedId, rfid_uid, title });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Étiquette déjà associée' });
    res.status(500).json({ error: err.message });
  }
});

// --- Modification (admin) ---
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { title, author, isbn, category, description, cover_url, rfid_uid } = req.body;
    const update = {};
    if (title)       update.title = title;
    if (author)     
