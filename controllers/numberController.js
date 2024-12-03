const WhatsAppNumber = require('../models/whatsappNumber');
const xlsx = require('xlsx');
const path = require('path');


// Add numbers from Excel or CSV file
exports.addNumbersFromFile = (req, res) => {
  if (!req.file || !req.file.path) {
    return res.status(400).json({ message: 'File is required' });
  }

  const filePath = path.resolve(req.file.path);
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // Parse the file to get whatsapp_number column
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  const headers = data[0];
  const whatsappNumberIndex = headers.indexOf('whatsapp_number');

  if (whatsappNumberIndex === -1) {
    return res.status(400).json({ message: 'whatsapp_number column is missing' });
  }

  const fileNumbers = data.slice(1).map(row => row[whatsappNumberIndex]);

  // Get all numbers from the database
  WhatsAppNumber.getAll()
    .then(numbersInDb => {
      const numbersInDbSet = new Set(numbersInDb.map(n => n.phone_number));

      // Find numbers that are in the file but not in the database (new numbers)
      const newNumbers = fileNumbers.filter(num => !numbersInDbSet.has(num));

      // Find numbers that are in the database but not in the file (to deactivate)
      const numbersToDeactivate = numbersInDb
        .filter(n => !fileNumbers.includes(n.phone_number))
        .map(n => n.phone_number);

      // Insert new numbers as 'ACTIVE'
      const insertPromises = newNumbers.map(num =>
        WhatsAppNumber.add({ number: num, status: 'ACTIVE' })
      );

      // Deactivate numbers not in the file
      const deactivatePromises = numbersToDeactivate.map(num =>
        WhatsAppNumber.updateStatusByNumber(num, 'DEACTIVE')
      );

      return Promise.all([...insertPromises, ...deactivatePromises]);
    })
    .then(() => res.status(201).json({ message: 'Numbers processed successfully' }))
    .catch(err => res.status(500).json({ error: 'Error processing numbers', details: err }));
};

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



// Update the status of all numbers to ACTIVE or DEACTIVE
exports.updateAllNumbersStatus = (req, res) => {
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Status is required' });
  }

  // Update the status of all numbers
  WhatsAppNumber.updateAllStatus(status)
    .then(() => res.status(200).json({ message: `All numbers status updated to ${status}` }))
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Error updating status for all numbers', details: err });
    });
};
