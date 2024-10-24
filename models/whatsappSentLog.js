const db = require("../config/db");

class WhatsAppLog {
  // Save a new message log
  static saveSentLog({ phone_number, message, image, sent_time, status }) {
    return new Promise((resolve, reject) => {
      const query = "INSERT INTO whatsapp_sent_logs (phone_number, message, image, sent_time, status) VALUES (?, ?, ?, ?, ?)";
      const values = [phone_number, message, image, sent_time, status];
      
      db.query(query, values, (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  }
}

module.exports = WhatsAppLog;
