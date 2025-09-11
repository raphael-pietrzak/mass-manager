const express = require('express');
const router = express.Router();
const recurrenceController = require('../controllers/recurrence.controller');

router.get('/', recurrenceController.getRecurrences);
router.get('/active', recurrenceController.getActiveRecurrences);
router.get('/type/:type', recurrenceController.getRecurrencesByType);
router.get('/:id', recurrenceController.getRecurrence);
router.post('/', recurrenceController.createRecurrence);
router.post('/preview', recurrenceController.previewRecurringMass)
router.put('/:id', recurrenceController.updateRecurrence);
router.delete('/:id', recurrenceController.deleteRecurrence);

module.exports = router;
