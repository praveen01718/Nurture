const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/send-otp', authController.sendOtpEmail);
router.post('/verify-otp', authController.verifyOtpCode);

module.exports = router;