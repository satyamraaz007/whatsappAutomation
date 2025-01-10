const { initializeWhatsApp, logoutWhatsApp, setQrChangeCallback, setLoginCallback } = require('../whatsappClient/whatsappClient');

// Controller for handling QR code retrieval
const getQrCode = (req, res) => {
  try {
    if (global.isAuthenticated) {
      return res.status(400).json({ message: 'Already authenticated, cannot generate a new QR code.' });
    }

    if (global.qrCodeString) {
      return res.json({ qrCode: global.qrCodeString });
    } else {
      return res.status(500).json({ message: 'QR Code not available. Try again later.' });
    }
  } catch (error) {
    console.error('Error in getQrCode:', error);
    return res.status(500).json({ message: 'Internal Server Error while fetching QR code.' });
  }
};

// Controller for handling logout functionality
const logout = (req, res) => {
  try {
    if (global.isAuthenticated) {
      logoutWhatsApp(); // Call logout function to destroy session
      initializeWhatsApp(); // Reinitialize WhatsApp to allow new QR generation
      return res.json({ message: 'Logged out successfully. You can generate a new QR code.' });
    } else {
      return res.status(400).json({ message: 'No active session to log out from.' });
    }
  } catch (error) {
    console.error('Error in logout:', error);
    return res.status(500).json({ message: 'Internal Server Error during logout.' });
  }
};

// Set QR code update callback
// setQrChangeCallback((newQrCode, loginMessage) => {
//   if (newQrCode) {
//     console.log('New QR code:', newQrCode);
//   } else if (loginMessage) {
//     console.log(loginMessage);
//   }
// });

// Controller for handling real-time updates
const subscribeStatusUpdates = (req, res) => {
  try {
    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Send an initial message to confirm the connection
    res.write('data: Connected to updates stream\n\n');

    // Callback for QR code updates
    setQrChangeCallback((newQrCode) => {
      if (newQrCode) {
        res.write(`data: ${JSON.stringify({ type: 'qr', qrCode: newQrCode })}\n\n`);
      }
    });

    // Callback for login updates
    setLoginCallback((loginMessage) => {
      if (loginMessage) {
        res.write(`data: ${JSON.stringify({ type: 'login', message: loginMessage })}\n\n`);
      }
    });

    // Keep the connection open until the client disconnects
    req.on('close', () => {
      console.log('Client disconnected from updates stream');
      res.end();
    });
  } catch (error) {
    console.error('Error in subscribeStatusUpdates:', error);
    res.status(500).json({ message: 'Internal Server Error while subscribing to updates.' });
  }
};


module.exports = {
  getQrCode,
  logout,
  subscribeStatusUpdates
};
