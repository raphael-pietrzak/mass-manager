// src/middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');

exports.authenticateToken = (req, res, next) => {
  // Vérifier d'abord l'en-tête d'autorisation
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"
  
  if (!token) {
    return res.status(401).json({ error: 'Access token manquant' });
  }

  jwt.verify(token, process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET_KEY, (err, user) => {
    if (err) {
      console.error('Access token invalide ou expiré:', err);
      return res.status(403).json({ error: 'Access token invalide ou expiré' });
    }
    req.user = user;
    next();
  });
};
