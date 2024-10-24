const express = require('express');
const router = express.Router();
const numberController = require('../controllers/numberController');

// Get all WhatsApp numbers
router.get('/', numberController.getAllNumbers);

// Add a new WhatsApp number
router.post('/', numberController.addNumber);

// Update an existing WhatsApp number
router.put('/:id', numberController.updateNumber);

// Delete a WhatsApp number
router.delete('/:id', numberController.deleteNumber);

module.exports = router;
