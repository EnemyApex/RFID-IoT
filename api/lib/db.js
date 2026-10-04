// ============================================================
// FICHIER : api/lib/db.js
// RÔLE   : Établit et met en cache la connexion MongoDB.
//          En serverless, la connexion est réutilisée entre
//          les invocations pour éviter la surcharge.
// USAGE  : const { db } = await connectToDatabase();
// ============================================================

const { MongoClient } = require('mongodb');

const URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'rfidlib';

// Cache de connexion (persiste tant que la fonction reste chaude)
let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  // Réutiliser la connexion existante si disponible
  if (cachedClient && cachedDb) return { client: cachedClient, db: cachedDb };

  const client = new MongoClient(URI, {
    maxPoolSize: 10,                 // Max 10 connexions simultanées
    serverSelectionTimeoutMS: 5000   // Timeout de 5 secondes
  });
  await client.connect();
  const db = client.db(DB_NAME);

  // --- Création des index (idempotent : ne fait rien s'ils existent) ---
  await db.collection('users').createIndex({ rfid_uid: 1 }, { unique: true });
  await db.collection('users').createIndex({ email: 1 }, { unique: true, sparse: true });
  await db.collection('books').createIndex({ rfid_uid: 1 }, { unique: true });

  cachedClient = client;
  cachedDb = db;
  return { client, db };
}

module.exports = { connectToDatabase };
