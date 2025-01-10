const express = require('express');
const router = express.Router();
const donorController = require('../controllers/donor.controller');

router.get('/', donorController.getDonors);
router.get('/:id', donorController.getDonor);
router.post('/', donorController.createDonor);
router.put('/:id', donorController.updateDonor);
router.delete('/:id', donorController.deleteDonor);

module.exports = router;
