const express = require('express');
const router = express.Router();
const massController = require('../controllers/mass.controller');

router.get('/', massController.getMasses);
router.get('/:id', massController.getMass);
router.post('/', massController.createMass);
router.put('/:id', massController.updateMass);
router.delete('/:id', massController.deleteMass);

module.exports = router;
