const express = require('express');
const router = express.Router();
const loginLogoutController = require('../controllers/loginLogoutController');

// Route to get QR code for login
router.get('/get-qr', loginLogoutController.getQrCode);

// Route to handle logout
router.post('/logout', loginLogoutController.logout);

module.exports = router;
