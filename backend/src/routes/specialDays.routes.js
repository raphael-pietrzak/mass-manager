const express = require('express');
const router = express.Router();
const specialDayController = require('../controllers/specialDay.controller');

router.get('/', specialDayController.getSpecialDays);
router.get('/:id', specialDayController.getSpecialDay);
router.post('/', specialDayController.createSpecialDay);
router.put('/:id', specialDayController.updateSpecialDay);
router.delete('/:id', specialDayController.deleteSpecialDay);
router.delete('/', specialDayController.deleteBeforeDate);

module.exports = router;
