const WhatsAppNumber = require("../models/whatsappNumber");
const WhatsAppLog = require("../models/whatsappSentLog");
const { client } = require("../whatsappClient/whatsappClient");
const formatWhatsAppNumber = require("../utils/formatPhone");
const fs = require("fs");
const path = require("path");
const { MessageMedia } = require("whatsapp-web.js");
const multer = require("multer");
const schedule = require("node-schedule"); // Import for scheduling
require("../whatsappClient/whatsappClient");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage });

exports.sendMessageToAll = [
  upload.single("image"),
  async (req, res) => {
    const { message, scheduled_time } = req.body;
    const imageFilePath = req.file ? req.file.path : null;

    // Validate user authentication
    if (!req.user || !req.user.id) {
      return res
        .status(401)
        .json({ message: "Unauthorized. User is not logged in." });
    }

    // Validate inputs
    if (!message && !imageFilePath) {
      return res
        .status(400)
        .json({ message: "Either a message or an image is required" });
    }

    try {
      if (global.isAuthenticated) {
        const userId = req.user.id;

        // Fetch active phone numbers for the user
        const results = await WhatsAppNumber.getAllActiveNumbersForUser(userId);

        if (results.length === 0) {
          return res
            .status(404)
            .json({ message: "No active phone numbers found for the user" });
        }

        const sentTime = new Date();

        // Function to send messages
        const sendMessages = async () => {
          const promises = results.map(async (row) => {
            const number = formatWhatsAppNumber(row.phone_number);
            let status = "SENT";

            try {
              let sentMessage;
              if (message && imageFilePath) {
                const media = MessageMedia.fromFilePath(imageFilePath);
                await client.sendMessage(number, media); // Send image
                sentMessage = await client.sendMessage(number, message); // Send text
              } else if (message) {
                sentMessage = await client.sendMessage(number, message);
              } else if (imageFilePath) {
                const media = MessageMedia.fromFilePath(imageFilePath);
                sentMessage = await client.sendMessage(number, media);
              }

              // Save message log with message ID
              await WhatsAppLog.saveSentLog({
                phone_number: row.phone_number,
                message: message || null,
                image: imageFilePath || null,
                sent_time: sentTime,
                status,
                message_id: sentMessage.id._serialized,
                user_id: userId,
              });

              console.log(`Message sent to ${row.phone_number}`);
            } catch (err) {
              console.error(`Failed to send to ${row.phone_number}:`, err);
              status = "FAILED";

              // Log failed message
              await WhatsAppLog.saveSentLog({
                phone_number: row.phone_number,
                message: message || null,
                image: imageFilePath || null,
                sent_time: sentTime,
                status,
                user_id: userId,
              });
            }
          });

          await Promise.all(promises);
          console.log("All messages processed.");
        };

        // If `scheduled_time` is provided
        if (scheduled_time) {
          const scheduleDate = new Date(scheduled_time);

          if (scheduleDate < new Date()) {
            return res
              .status(400)
              .json({ message: "Scheduled time must be in the future" });
          }

          // Save logs for scheduled messages
          for (const row of results) {
            await WhatsAppLog.saveSentLog({
              phone_number: row.phone_number,
              message: message || null,
              image: imageFilePath || null,
              sent_time: sentTime,
              status: "PENDING",
              user_id: userId,
              scheduled_time: scheduleDate,
            });
          }

          // Schedule message sending
          schedule.scheduleJob(scheduleDate, sendMessages);
          return res.json({
            message: `Messages scheduled for ${scheduled_time}`,
          });
        }

        // Otherwise, send immediately
        await sendMessages();
        res.json({ message: "Messages sent to all active contacts" });
      } else {
        res.json({ message: "whatsapp not logged-in" });
      }
    } catch (err) {
      console.error("Error sending messages:", err);
      res
        .status(500)
        .json({ message: "Failed to send messages", details: err });
    }
  },
];
