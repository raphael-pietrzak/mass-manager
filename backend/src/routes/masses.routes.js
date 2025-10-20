const express = require('express');
const router = express.Router();
const massController = require('../controllers/mass.controller');

router.get('/', massController.getMassesByDateRange);
router.get('/all', massController.getAll);
router.get('/:id', massController.getMass);
router.post('/', massController.createMass);
router.put('/:id', massController.updateMass);
router.delete('/:id', massController.deleteMass);

// Les routes d'exportation ont été déplacées vers export.routes.js

module.exports = router;
