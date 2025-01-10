const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // Correct path to authController.js

// Ensure the following methods exist in `authController`
router.post('/register', authController.register);
router.post('/check-username', authController.checkUsernameAvailability);
router.post('/login', authController.login);
router.post('/request-otp-login', authController.requestOTP);
router.post('/login-with-otp', authController.loginWithOTP);
router.post('/request-password-reset', authController.requestPasswordReset);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
