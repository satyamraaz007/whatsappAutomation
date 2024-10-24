const express = require('express');
const router = express.Router();
const numberController = require('../controllers/numberController');
const upload = require('../middleware/upload');

// Get all WhatsApp numbers
router.get('/', numberController.getAllNumbers);

// Add a new WhatsApp number
router.post('/', numberController.addNumber);

router.post('/add-numbers', upload.single('file'), numberController.addNumbersFromFile);

// Update an existing WhatsApp number
router.put('/:id', numberController.updateNumber);

// Delete a WhatsApp number
router.delete('/:id', numberController.deleteNumber);

module.exports = router;
