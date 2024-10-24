const express = require('express');
const router = express.Router();
const whatsappController = require('../controllers/whatsappController');
const numberRoutes = require('./numberRoutes'); // Import number routes
const loginLogoutRoutes = require('./loginLogoutRoutes'); // Import loginLogout routes

// Route to send WhatsApp messages
router.post('/send-message', whatsappController.sendMessageToAll);

// Use the number routes
router.use('/numbers', numberRoutes);

// Use the loginLogoutRoutes
router.use('/auth', loginLogoutRoutes);

module.exports = router;
