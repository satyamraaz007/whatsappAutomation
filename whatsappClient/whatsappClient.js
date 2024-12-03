const { Client, MessageMedia } = require('whatsapp-web.js');
const WhatsAppLog = require('../models/whatsappSentLog');

let client;
global.qrCodeString = null;
global.isAuthenticated = false;
let qrChangeCallback = null; // Callback for QR code updates
let loginCallback = null; // Callback for login events

function initializeWhatsApp() {
  try {
    client = new Client();

    // Triggered when a new QR code is generated
    client.on('qr', (qr) => {
      if (!global.isAuthenticated) {
        global.qrCodeString = qr;
        console.log('QR code received, you can scan it from Postman!');
        if (qrChangeCallback) {
          qrChangeCallback(qr); // Notify the controller about the new QR code
        }
      }
    });

    // Triggered when the client is ready
    client.on('ready', () => {
      console.log('WhatsApp client is ready!');
      global.isAuthenticated = true;
      global.qrCodeString = null;

      // Notify successful login
      if (loginCallback) {
        loginCallback('User logged in!!');
      }
    });

    // Triggered if authentication fails
    client.on('auth_failure', (msg) => {
      console.error('Authentication failed:', msg);
      global.isAuthenticated = false;
    });

    // Triggered when the client disconnects
    client.on('disconnected', (reason) => {
      console.log('WhatsApp disconnected:', reason);
      global.isAuthenticated = false;
      global.qrCodeString = null;
    });

    // Listen for message acknowledgment status
    client.on('message_ack', async (msg, ack) => {
      try {
        const phoneNumber = msg.to.replace('@c.us', ''); // Format phone number
        let status;

        switch (ack) {
          case -1:
            status = 'FAILED';
            break;
          case 0:
            status = 'SENT_TO_SERVER';
            break;
          case 1:
            status = 'SENT';
            break;
          case 2:
            status = 'DELIVERED';
            break;
          case 3:
            status = 'READ';
            break;
          default:
            status = 'UNKNOWN';
        }

        console.log(`Message to ${phoneNumber} updated to status: ${status}`);

        // Update the message status in the database
        await WhatsAppLog.updateMessageStatus(phoneNumber, msg.id._serialized, status);
      } catch (error) {
        console.error('Error updating message status:', error);
      }
    });

    client.initialize();
  } catch (error) {
    console.error('Error initializing WhatsApp client:', error);
  }
}

// Set a callback for QR code updates
function setQrChangeCallback(callback) {
  qrChangeCallback = callback;
}

// Set a callback for login events
function setLoginCallback(callback) {
  loginCallback = callback;
}

// Logout function
function logoutWhatsApp() {
  try {
    if (client) {
      client.destroy();
      global.isAuthenticated = false;
      global.qrCodeString = null;
      console.log('Logged out from WhatsApp.');
    } else {
      console.log('WhatsApp client is not initialized.');
    }
  } catch (error) {
    console.error('Error during logout:', error);
  }
}

initializeWhatsApp();

module.exports = { client, initializeWhatsApp, logoutWhatsApp, setQrChangeCallback, setLoginCallback };
