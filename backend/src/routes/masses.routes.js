const express = require('express');
const router = express.Router();
const massController = require('../controllers/mass.controller');

router.get('/', massController.getMasses);
router.get('/:id', massController.getMass);
router.post('/preview', massController.previewMass); // Nouvelle route pour la prévisualisation
router.post('/', massController.createMass);
router.put('/:id', massController.updateMass);
router.delete('/:id', massController.deleteMass);

// Les routes d'exportation ont été déplacées vers export.routes.js

module.exports = router;
