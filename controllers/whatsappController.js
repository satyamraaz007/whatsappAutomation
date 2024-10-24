const WhatsAppNumber = require("../models/whatsappNumber");
const WhatsAppLog = require("../models/whatsappSentLog");
const { client } = require("../whatsappClient/whatsappClient"); // Keep this for the client
const formatWhatsAppNumber = require("../utils/formatPhone");
const fs = require('fs'); // Required to read image files
const path = require('path');

// Import `MessageMedia` directly from `whatsapp-web.js`
const { MessageMedia } = require('whatsapp-web.js');

// Multer setup for file uploads
const multer = require('multer');

// Set storage for uploaded images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Save files in the 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  }
});

const upload = multer({ storage });

exports.sendMessageToAll = [
  upload.single('image'), // Handle image upload (if any)
  async (req, res) => {
    const { message } = req.body;
    const imageFilePath = req.file ? req.file.path : null; // Path to the uploaded image file

    // Check if user is authenticated
    if (!global.isAuthenticated) {
      return res.status(401).json({ message: "User is not logged in. Please scan the QR code to authenticate." });
    }

    // Check if at least one of message or image is provided
    if (!message && !imageFilePath) {
      return res.status(400).json({ message: "Either a message or image is required" });
    }

    try {
      // Fetch active phone numbers
      const results = await WhatsAppNumber.getActiveNumbers();

      if (results.length === 0) {
        return res
          .status(404)
          .json({ message: "No active phone numbers found in the database" });
      }

      const sentTime = new Date();
      const promises = results.map(async (row) => {
        let number = formatWhatsAppNumber(row.phone_number);
        let status = 'SENT';

        try {
          // If both message and image are provided
          if (message && imageFilePath) {
            const media = MessageMedia.fromFilePath(imageFilePath);
            await client.sendMessage(number, media); // Send image
            await client.sendMessage(number, message); // Send text
          }
          // If only message is provided
          else if (message) {
            await client.sendMessage(number, message);
          }
          // If only image is provided
          else if (imageFilePath) {
            const media = MessageMedia.fromFilePath(imageFilePath);
            await client.sendMessage(number, media);
          }
        } catch (err) {
          console.error(`Failed to send to ${row.phone_number}:`, err);
          status = 'FAILED';
        }

        // Log every sent message or failure
        await WhatsAppLog.saveSentLog({
          phone_number: row.phone_number,
          message: message || null,
          image: imageFilePath || null,
          sent_time: sentTime,
          status
        });

        console.log(`Message log saved for ${row.phone_number}`);
      });

      await Promise.all(promises);

      res.json({ message: "Messages sent to all active contacts" });
    } catch (err) {
      console.error("Error sending messages:", err);
      res.status(500).json({ message: "Failed to send messages", details: err });
    }
  }
];
