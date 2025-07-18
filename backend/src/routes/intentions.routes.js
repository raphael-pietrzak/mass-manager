const express = require('express');
const router = express.Router();
const intentionController = require('../controllers/intention.controller');

router.get('/ponctual', intentionController.getPonctualIntentions)
router.get('/', intentionController.getIntentions);
router.get('/:id', intentionController.getIntention);
router.get('/:id/masses', intentionController.getIntentionMasses); // Nouvelle route
router.post('/', intentionController.createIntention);
router.post('/preview', intentionController.previewIntention);
router.post('/:id/assignMasses', intentionController.assignToExistingMasses)
router.put('/:id', intentionController.updateIntention);
router.delete('/:id', intentionController.deleteIntention);
router.delete('/', intentionController.deleteBeforeDate);

module.exports = router;
