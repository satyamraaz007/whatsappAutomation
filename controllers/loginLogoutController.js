const { initializeWhatsApp, logoutWhatsApp } = require('../whatsappClient/whatsappClient');

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

module.exports = {
  getQrCode,
  logout,
};
