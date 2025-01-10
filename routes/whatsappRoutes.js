const express = require('express');
const router = express.Router();
const whatsappController = require('../controllers/whatsappController');
const numberRoutes = require('./numberRoutes'); // Import number routes
const loginLogoutRoutes = require('./loginLogoutRoutes'); // Import loginLogout routes
const authRoutes = require('./authRoutes');
const { authenticate } = require('../middleware/authMiddleware');

// Route to send WhatsApp messages
router.post('/send-message', authenticate, whatsappController.sendMessageToAll);

// Use the number routes
router.use('/numbers', numberRoutes);

// Use the loginLogoutRoutes
router.use('/auth', loginLogoutRoutes);

// Use the Authentication Routes
router.use('/auth/user', authRoutes);

module.exports = router;
