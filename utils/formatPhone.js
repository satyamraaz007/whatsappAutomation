// Function to format Indian WhatsApp number correctly
function formatWhatsAppNumber(phone) {
    phone = phone.replace(/\D/g, ''); // Remove non-numeric characters
  
    if (!phone.startsWith('91')) {
      phone = '91' + phone; // Add country code if not present
    }
  
    return `${phone}@c.us`; // Format for WhatsApp
  }
  
  module.exports = formatWhatsAppNumber;
  