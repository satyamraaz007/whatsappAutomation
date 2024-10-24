const express = require('express');
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

// Set up Express app
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json()); // To parse JSON requests

// MySQL connection setup
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', 
  password: '', // Your MySQL password
  database: 'whatsapp_sender'
});

// Handle MySQL connection errors
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL: ', err);
    process.exit(1); // Exit if DB connection fails
  } else {
    console.log('Connected to MySQL');
  }
});

// WhatsApp client setup
let client;
let qrCodeString = null;

// Reinitialize the client if needed
let clientInitialized = false;

function initializeWhatsApp() {
  client = new Client();

  client.on('qr', (qr) => {
    qrCodeString = qr;
    console.log('QR code received, you can scan it from Postman!');
  });

  client.on('ready', () => {
    console.log('WhatsApp client is ready!');
    clientInitialized = true; // Mark the client as initialized
  });

  client.on('auth_failure', (msg) => {
    console.error('Authentication failed: ', msg);
    clientInitialized = false; // Reset client if auth fails
  });

  client.on('disconnected', (reason) => {
    console.log('WhatsApp disconnected: ', reason);
    qrCodeString = null;
    clientInitialized = false; // Reset client when disconnected
  });

  client.initialize();
}

initializeWhatsApp();


// Route to get QR code
app.get('/get-qr', (req, res) => {
  if (qrCodeString) {
    res.json({ qrCode: qrCodeString });
  } else {
    res.status(500).json({ message: 'QR Code not available. Try again.' });
  }
});

// API route to send messages to all phone numbers from the database
app.post('/send-message', (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ message: 'Message is required' });
  }

  // Fetch phone numbers from the database
  db.query('SELECT phone_number FROM whatsapp_numbers', (err, results) => {
    if (err) {
      console.error('Error fetching phone numbers from the database: ', err);
      return res.status(500).json({ error: 'Error fetching phone numbers' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'No phone numbers found in the database' });
    }

    let promises = [];
    results.forEach((row) => {
      let number = formatWhatsAppNumber(row.phone_number);

      // Send the message and store the promises for response handling
      promises.push(
        client.sendMessage(number, message)
          .then(response => {
            console.log(`Message sent to ${row.phone_number}`);
          })
          .catch(err => {
            console.error(`Failed to send message to ${row.phone_number}: `, err);
          })
      );
    });

    // Wait for all promises to resolve
    Promise.all(promises)
      .then(() => {
        res.json({ message: 'Messages sent to all contacts in the database' });
      })
      .catch((err) => {
        res.status(500).json({ error: 'Failed to send some messages', details: err });
      });
  });
});

// Function to format Indian WhatsApp number correctly
function formatWhatsAppNumber(phone) {
  // Remove any non-numeric characters
  phone = phone.replace(/\D/g, '');

  // Check if it starts with 91 (Indian country code)
  if (!phone.startsWith('91')) {
    phone = '91' + phone; // Add country code if not present
  }

  return `${phone}@c.us`; // Format for WhatsApp
}

// Start the Express server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
