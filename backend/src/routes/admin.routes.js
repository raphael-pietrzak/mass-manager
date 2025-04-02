const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware'); // Importe le middleware

// Route protégée par l'authentification
router.get('/admin', authMiddleware, (req, res) => {
  // Seulement si l'utilisateur est authentifié, il aura accès
  res.json({ message: 'Bienvenue dans le tableau de bord admin', user: req.user });
});

module.exports = router;