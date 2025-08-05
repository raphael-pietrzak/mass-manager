const express = require('express');
const router = express.Router();
const celebrantController = require('../controllers/celebrant.controller');

router.get('/', celebrantController.getCelebrants);
router.get('/available', celebrantController.getAvailableCelebrants);
router.get('/full-dates', celebrantController.getFullDates);
router.get('/:id', celebrantController.getCelebrant);
router.get('/:id/unavailable-dates', celebrantController.getUnavailableDates);
router.post('/', celebrantController.createCelebrant);
router.put('/:id', celebrantController.updateCelebrant);
router.delete('/:id', celebrantController.deleteCelebrant);

module.exports = router;
