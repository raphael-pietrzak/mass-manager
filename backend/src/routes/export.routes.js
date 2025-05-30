const express = require('express');
const router = express.Router();
const exportController = require('../controllers/export.controller');
const exportDonorController = require('../controllers/donor.controller');

// Routes d'exportation des intentions de messes
router.get('/masses/excel', exportController.exportToExcel);
router.get('/masses/pdf', exportController.exportToPdf);
router.get('/masses/word', exportController.exportToWord);
router.get('/donors/excel', exportDonorController.exportToExcel);
router.get('/donors/pdf', exportDonorController.exportToPdf);

module.exports = router;
