const express = require('express');
const router = express.Router();
const mailerController = require('../controllers/mailer.controller');

router.post('/send', mailerController.sendEmail);
router.post('/send-intention', mailerController.sendIntentionByCelebrant);

module.exports = router;
