// ============================================================
// FICHIER : api/lib/redis.js
// RÔLE   : Client Redis (Upstash) utilisé pour stocker les
//          sessions du double scan (30 secondes de validité).
//          Redis est OBLIGATOIRE car Vercel est sans état.
// USAGE  : await redis.set(key, value, { ex: 30 })
// ============================================================

const { Redis } = require('@upstash/redis');

// Lit automatiquement UPSTASH_REDIS_REST_URL et _TOKEN
const redis = Redis.fromEnv();

module.exports = redis;
