const { Client } = require('whatsapp-web.js');

let client;
global.qrCodeString = null;
global.isAuthenticated = false;

function initializeWhatsApp() {
  try {
    client = new Client();

    client.on('qr', (qr) => {
      if (!global.isAuthenticated) {
        global.qrCodeString = qr;
        console.log('QR code received, you can scan it from Postman!');
      }
    });

    client.on('ready', () => {
      console.log('WhatsApp client is ready!');
      global.isAuthenticated = true;
      global.qrCodeString = null;
    });

    client.on('auth_failure', (msg) => {
      console.error('Authentication failed: ', msg);
      global.isAuthenticated = false;
    });

    client.on('disconnected', (reason) => {
      console.log('WhatsApp disconnected: ', reason);
      global.isAuthenticated = false;
      global.qrCodeString = null;
    });

    client.initialize();
  } catch (error) {
    console.error('Error initializing WhatsApp client:', error);
  }
}

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

module.exports = { client, initializeWhatsApp, logoutWhatsApp };
