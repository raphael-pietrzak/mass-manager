const express = require('express');
const router = express.Router();
const unavailableDaycontroller = require('../controllers/unavailableDay.controller');

router.get('/', unavailableDaycontroller.getUnavailableDays);
router.get('/:id', unavailableDaycontroller.getUnavailableDay);
router.post('/', unavailableDaycontroller.createUnavailableDay);
router.put('/:id', unavailableDaycontroller.updateUnavailableDay);
router.delete('/:id', unavailableDaycontroller.deleteUnavailableDay);

module.exports = router;