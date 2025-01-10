const db = require("../config/db");

// Model for WhatsApp numbers table
class WhatsAppNumber {
  // Fetch all WhatsApp numbers
  static getAll() {
    return new Promise((resolve, reject) => {
      db.query("SELECT * FROM whatsapp_numbers", (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  }

  // Fetch paginated WhatsApp numbers for a specific user
  static getAllForUserWithPagination(user_id, limit, offset) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT SQL_CALC_FOUND_ROWS * 
        FROM whatsapp_numbers 
        WHERE user_id = ? 
        LIMIT ? OFFSET ?`;

      db.query(query, [user_id, limit, offset], (err, rows) => {
        if (err) {
          console.error("Error fetching paginated numbers:", err.message);
          return reject(err);
        }

        db.query("SELECT FOUND_ROWS() AS total", (countErr, countResults) => {
          if (countErr) {
            console.error("Error counting rows:", countErr.message);
            return reject(countErr);
          }

          resolve({
            rows,
            total: countResults[0].total,
          });
        });
      });
    });
  }

  static add({ number, status, user_id }) {
    return new Promise((resolve, reject) => {
  
      const query = 'INSERT INTO whatsapp_numbers (phone_number, status, user_id) VALUES (?, ?, ?)';
      db.query(query, [number, status, user_id], (err, results) => {
        if (err) {
          return reject(err);
        }
  
        resolve(results);
      });
    });
  }

  // Update the status of a number by its phone number
  static updateStatusByNumber({ number, status, user_id }) {
    return new Promise((resolve, reject) => {
      const query = 'UPDATE whatsapp_numbers SET status = ? WHERE phone_number = ? AND user_id = ?';
      db.query(query, [status, number, user_id], (err, results) => {
        if (err) {
          console.error("Error updating status:", err.message); // Debugging
          return reject(err);
        }
        resolve(results);
      });
    });
  }

  // Update an existing WhatsApp number by its ID
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

  // Delete a WhatsApp number by its ID
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

  // Method to update the status of all WhatsApp numbers for a specific user
static updateAllStatus(userId, status) {
  return new Promise((resolve, reject) => {
    db.query(
      "UPDATE whatsapp_numbers SET status = ? WHERE user_id = ?",
      [status, userId],
      (err, results) => {
        if (err) reject(err);
        resolve(results);
      }
    );
  });
}


  // Method to get all whatsapp numbers for a specific user
  static getAllForUser(user_id) {
    return new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM whatsapp_numbers WHERE user_id = ?",
        [user_id],
        (err, results) => {
          if (err) {
            console.error("Error fetching numbers:", err.message);
            return reject(err);
          }
          resolve(results);
        }
      );
    });
  }

  // Method to get all whatsapp numbers for a specific user
  static getAllActiveNumbersForUser(user_id) {
    return new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM whatsapp_numbers WHERE status = ? AND user_id = ?",
        ["ACTIVE", user_id],
        (err, results) => {
          if (err) {
            console.error("Error fetching numbers:", err.message);
            return reject(err);
          }
          resolve(results);
        }
      );
    });
  }

  // Find a number by ID and user ID
  static findByIdAndUser({ id, user_id }) {
    return new Promise((resolve, reject) => {
      const query = "SELECT * FROM whatsapp_numbers WHERE id = ? AND user_id = ?";
      db.query(query, [id, user_id], (err, results) => {
        if (err) {
          console.error("Error finding number by ID and user:", err.message);
          return reject(err);
        }
        resolve(results[0] || null);
      });
    });
  }

  static findByNumberAndUser({ number, user_id }) {
    return new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM whatsapp_numbers WHERE phone_number = ? AND user_id = ?",
        [number, user_id],
        (err, results) => {
          if (err) {
            console.error("Error finding number:", err.message);
            return reject(err);
          }
          resolve(results[0] || null); // Return the first result or null if not found
        }
      );
    });
  }

  // Delete all numbers for a specific user
  static deleteAllForUser(user_id) {
    return new Promise((resolve, reject) => {
      const query = "DELETE FROM whatsapp_numbers WHERE user_id = ?";
      db.query(query, [user_id], (err, results) => {
        if (err) {
          console.error("Error deleting all numbers for user:", err.message);
          return reject(err);
        }
        resolve(results);
      });
    });
  }  
  
}

module.exports = WhatsAppNumber;
