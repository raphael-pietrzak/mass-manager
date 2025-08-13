const express = require('express');
const router = express.Router();
const massController = require('../controllers/mass.controller');

router.get('/', massController.getMasses);
router.get('/:id', massController.getMass);
router.post('/', massController.createMass);
router.put('/:id', massController.updateMass);
router.patch('/:id', massController.updateMassWithoutDate);
router.delete('/:id', massController.deleteMass);
router.delete('/', massController.deleteMassBeforeDate); // Routes pour supprimer les messes avant une certaine date

// Les routes d'exportation ont été déplacées vers export.routes.js

module.exports = router;
