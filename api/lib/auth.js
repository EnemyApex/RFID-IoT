// ============================================================
// FICHIER : api/lib/auth.js
// RÔLE   : Centralise l'authentification :
//          - signature/vérification JWT
//          - middlewares requireAuth / requireAdmin / requireApiKey
// USAGE  : router.get('/', requireAdmin, handler)
// ============================================================

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'change-me';

// --- Signature d'un token (7 jours) ---
function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// --- Vérification d'un token ---
function verifyToken(token) {
  try { return jwt.verify(token, JWT_SECRET); }
  catch { return null; }
}

// --- Middleware : utilisateur connecté ---
function requireAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  const decoded = token ? verifyToken(token) : null;
  if (!decoded) return res.status(401).json({ error: 'Non autorisé' });
  req.user = decoded;   // { id, email, role }
  next();
}

// --- Middleware : administrateur ---
function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès admin requis' });
    }
    next();
  });
}

// --- Middleware : ESP32 (via clé API partagée) ---
function requireApiKey(req, res, next) {
  const key = req.headers['x-api-key'];
  if (process.env.API_KEY && key !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Clé API invalide' });
  }
  next();
}

module.exports = { signToken, verifyToken, requireAuth, requireAdmin, requireApiKey };
