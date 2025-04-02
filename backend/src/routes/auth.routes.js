const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Route pour se connecter en tant qu'administrateur
router.post('/login', authController.loginUser);

module.exports = router;
