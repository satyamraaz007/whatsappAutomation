const db = require("../config/db");

class WhatsAppLog {
  /**
   * Save a new message log
   * @param {Object} logData - The log details
   * @param {string} logData.phone_number - The recipient's phone number
   * @param {string} logData.message - The text message sent
   * @param {string} logData.image - The path to the image file sent
   * @param {Date} logData.sent_time - The timestamp when the message was sent
   * @param {string} logData.status - The status of the message (e.g., SENT, FAILED)
   * @param {string} [logData.message_id] - The unique message ID (optional)
   * @param {Date} [logData.scheduled_time] - The scheduled time for the message (optional)
   */
  static saveSentLog({
    phone_number,
    message,
    image,
    sent_time,
    status,
    message_id = null,
    scheduled_time = null,
  }) {
    return new Promise((resolve, reject) => {
      const query = `
      INSERT INTO whatsapp_sent_logs (phone_number, message, image, sent_time, status, message_id, scheduled_time)
      VALUES (?, ?, ?, ?, ?, ?, ?)`;
      const values = [
        phone_number,
        message,
        image,
        sent_time,
        status,
        message_id,
        scheduled_time,
      ]; // Ensure scheduled_time is included here

      db.query(query, values, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  }

  /**
   * Update the delivery status of a message
   * @param {string} phone_number - The recipient's phone number
   * @param {string} message_id - The unique message ID
   * @param {string} status - The updated status (e.g., DELIVERED, READ)
   */
  static updateMessageStatus(phone_number, message_id, status) {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE whatsapp_sent_logs
        SET status = ?
        WHERE phone_number = ? AND message_id = ?`;
      const values = [status, phone_number, message_id];

      db.query(query, values, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  }

  /**
   * Fetch all logs
   * @returns {Promise<Array>} - List of all message logs
   */
  static getAllLogs() {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM whatsapp_sent_logs`;
      db.query(query, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  }

  /**
   * Fetch logs by phone number
   * @param {string} phone_number - The recipient's phone number
   * @returns {Promise<Array>} - List of logs for the given phone number
   */
  static getLogsByPhoneNumber(phone_number) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM whatsapp_sent_logs
        WHERE phone_number = ?`;
      db.query(query, [phone_number], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  }
}

module.exports = WhatsAppLog;
