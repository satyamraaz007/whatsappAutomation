const WhatsAppNumber = require('../models/whatsappNumber');

// Get all WhatsApp numbers
exports.getAllNumbers = (req, res) => {
  WhatsAppNumber.getAll()
    .then(numbers => res.json(numbers))
    .catch(err => res.status(500).json({ error: 'Error fetching numbers', details: err }));
};

exports.addNumber = (req, res) => {
    const { number, status } = req.body;
  
    if (!number || !status) {
      return res.status(400).json({ message: 'Number and status are required' });
    }
  
    // Check if the number already exists
    WhatsAppNumber.getAll() // You might want to create a specific method for checking if a number exists
      .then(numbers => {
        const exists = numbers.some(existing => existing.phone_number === number);
        
        if (exists) {
          return res.status(409).json({ message: 'Number already present' });
        }
  
        // Add the new number since it doesn't exist
        return WhatsAppNumber.add({ number, status });
      })
      .then(() => res.status(201).json({ message: 'Number added successfully' }))
      .catch(err => res.status(500).json({ error: 'Error adding number', details: err }));
  };

// Update an existing WhatsApp number
exports.updateNumber = (req, res) => {
  const { id } = req.params;
  const { number, status } = req.body;

  if (!number || !status) {
    return res.status(400).json({ message: 'Number and status are required' });
  }

  WhatsAppNumber.update(id, { number, status })
    .then(() => res.json({ message: 'Number updated successfully' }))
    .catch(err => res.status(500).json({ error: 'Error updating number', details: err }));
};

// Delete a WhatsApp number
exports.deleteNumber = (req, res) => {
  const { id } = req.params;

  WhatsAppNumber.delete(id)
    .then(() => res.json({ message: 'Number deleted successfully' }))
    .catch(err => res.status(500).json({ error: 'Error deleting number', details: err }));
};
