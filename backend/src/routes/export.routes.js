const express = require('express');
const router = express.Router();
const exportController = require('../controllers/export.controller');
const exportDonorController = require('../controllers/donor.controller');

// Routes d'exportation des intentions de messes
router.get('/masses/excel', exportController.exportToExcel);
router.get('/masses/pdf', exportController.exportToPdf);
router.get('/masses/word', exportController.exportToWord);
router.post('/intentions/excel/don', exportController.exportIntentionToExcel)
router.post('/intentions/pdf/don', exportController.exportIntentionToPdf)
router.post('/intentions/word/don', exportController.exportIntentionToWord)

module.exports = router;
