// src/middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');

exports.authenticateToken = (req, res, next) => {
  const token = req.cookies.token;  // Lire le token des cookies

  if (!token) {
    return res.status(403).json({ error: 'Token manquant' });  // Si aucun token, retour 403
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
    if (err) {
      console.error('Token invalide ou expiré:', err);  // Afficher l'erreur
      return res.status(403).json({ error: 'Token invalide ou expiré' });  // Si le token est invalide
    }
    req.user = user;  // Ajouter l'utilisateur à la requête
    next();  // Passer à la prochaine étape
  });
};
