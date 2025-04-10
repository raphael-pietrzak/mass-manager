const express = require('express');
const router = express.Router();
const { loginUser, logoutUser } = require('../controllers/auth.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

// Route de login
router.post('/login', loginUser);

// Route de logout
router.post('/logout', logoutUser);

// Route pour vérifier l'authentification
router.get('/check_login', authenticateToken, (req, res) => {
  res.status(200).json({ authenticated: true });
});

module.exports = router;
