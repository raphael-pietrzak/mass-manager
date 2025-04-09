const express = require('express');
const router = express.Router();
const exportController = require('../controllers/export.controller');

// Routes d'exportation des intentions de messes
router.get('/masses/word', exportController.exportToWord);
router.get('/masses/excel', exportController.exportToExcel);
router.get('/masses/pdf', exportController.exportToPdf);

module.exports = router;
