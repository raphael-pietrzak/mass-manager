const express = require('express');
const router = express.Router();
const { loginUser, logoutUser, refreshToken, changeUserPassword } = require('../controllers/auth.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

// Route de login
router.post('/login', loginUser);

// Route de logout
router.post('/logout', logoutUser);

// Route pour rafraîchir l'access token
router.post('/refresh-token', refreshToken);

// Route pour vérifier l'authentification
router.get('/check_login', authenticateToken, (req, res) => {
  res.status(200).json({ authenticated: true });
});

router.post('/change_password', authenticateToken, changeUserPassword);

module.exports = router;
