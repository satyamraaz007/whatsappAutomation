const express = require('express');
const router = express.Router();
const numberController = require('../controllers/numberController');
const { authenticate } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// Update the status of all numbers
router.put('/update-all-status', authenticate, numberController.updateAllNumbersStatus);

// Delete all numbers for the logged-in user
router.delete('/all-numbers', authenticate, numberController.deleteAllNumbers);

// Add a new WhatsApp number
router.post('/', authenticate, numberController.addNumber);

// Get all WhatsApp numbers
router.get('/', authenticate, numberController.getAllNumbers);

// Get all WhatsApp numbers with pagination
router.get('/paginated-number', authenticate, numberController.getAllNumbersWithPagination);

// Search for a specific phone number
router.post('/search', authenticate, numberController.searchPhoneNumber);

// Add numbers from a file
router.post('/add-numbers', authenticate, upload.single('file'), numberController.addNumbersFromFile);

// Update an existing WhatsApp number (by ID)
router.put('/:id', authenticate, numberController.updateNumber);

// Delete a WhatsApp number
router.delete('/:id', authenticate, numberController.deleteNumber);



module.exports = router;
