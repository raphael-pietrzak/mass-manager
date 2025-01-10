const express = require('express');
const router = express.Router();
const intentionController = require('../controllers/intention.controller');

router.get('/', intentionController.getIntentions);
router.get('/:id', intentionController.getIntention);
router.post('/', intentionController.createIntention);
router.put('/:id', intentionController.updateIntention);
router.delete('/:id', intentionController.deleteIntention);

module.exports = router;
