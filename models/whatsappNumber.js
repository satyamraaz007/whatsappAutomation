const db = require("../config/db");

// Model for WhatsApp numbers table
class WhatsAppNumber {
  static getAll() {
    return new Promise((resolve, reject) => {
      db.query("SELECT * FROM whatsapp_numbers", (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  }

  static add(phoneNumber) {
    return new Promise((resolve, reject) => {
      db.query(
        "INSERT INTO whatsapp_numbers (phone_number, status) VALUES (?, ?)",
        [phoneNumber.number, phoneNumber.status],
        (err, results) => {
          if (err) reject(err);
          resolve(results);
        }
      );
    });
  }

  static updateStatusByNumber(phoneNumber, status) {
    return new Promise((resolve, reject) => {
      db.query(
        "UPDATE whatsapp_numbers SET status = ? WHERE phone_number = ?",
        [status, phoneNumber],
        (err, results) => {
          if (err) reject(err);
          resolve(results);
        }
      );
    });
  }

  static update(id, phoneNumber) {
    return new Promise((resolve, reject) => {
      db.query(
        "UPDATE whatsapp_numbers SET phone_number = ?, status = ? WHERE id = ?",
        [phoneNumber.number, phoneNumber.status, id],
        (err, results) => {
          if (err) reject(err);
          resolve(results);
        }
      );
    });
  }

  static delete(id) {
    return new Promise((resolve, reject) => {
      db.query(
        "DELETE FROM whatsapp_numbers WHERE id = ?",
        [id],
        (err, results) => {
          if (err) reject(err);
          resolve(results);
        }
      );
    });
  }

  // Method to get all active WhatsApp numbers
  static getActiveNumbers() {
    return new Promise((resolve, reject) => {
      db.query(
        "SELECT phone_number FROM whatsapp_numbers WHERE status = ?",
        ["ACTIVE"],
        (err, results) => {
          if (err) reject(err);
          resolve(results);
        }
      );
    });
  }
}

module.exports = WhatsAppNumber;
