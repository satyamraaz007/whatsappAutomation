const db = require("../config/db");

class User {
  // Check if username exists
  static usernameExists(username) {
    return new Promise((resolve, reject) => {
      db.query(
        "SELECT COUNT(*) AS count FROM users WHERE username = ?",
        [username],
        (err, results) => {
          if (err) return reject(err);
          resolve(results[0].count > 0); // Returns true if username exists
        }
      );
    });
  }

  // find user by ID
  static findById(id) {
    return new Promise((resolve, reject) => {
      db.query("SELECT * FROM users WHERE id = ?", [id], (err, results) => {
        if (err) return reject(err);
        resolve(results[0]);
      });
    });
  }

  // find user by username
  static findByUsername(username) {
    return new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM users WHERE username = ?",
        [username],
        (err, results) => {
          if (err) return reject(err);
          resolve(results[0]);
        }
      );
    });
  }

  // create new user
  static create(user) {
    return new Promise((resolve, reject) => {
      db.query(
        "INSERT INTO users (f_name, l_name, username, email, phone, password_hash) VALUES (?, ?, ?, ?, ?, ?)",
        [
          user.firstName,
          user.lastName,
          user.username,
          user.email,
          user.phone,
          user.password_hash,
        ],
        (err, results) => {
          if (err) return reject(err);
          resolve(results);
        }
      );
    });
  }

  // Find user by email
  static findByEmail(email) {
    return new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
        (err, results) => {
          if (err) return reject(err);
          resolve(results[0]);
        }
      );
    });
  }

  // Find user by reset token
  static findByResetToken(resetToken) {
    return new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM users WHERE reset_token = ?",
        [resetToken],
        (err, results) => {
          if (err) return reject(err);
          resolve(results[0]);
        }
      );
    });
  }

  // Update reset token
  static updateResetToken(userId, resetToken) {
    return new Promise((resolve, reject) => {
      db.query(
        "UPDATE users SET reset_token = ? WHERE id = ?",
        [resetToken, userId],
        (err, results) => {
          if (err) return reject(err);
          resolve(results);
        }
      );
    });
  }

  // Update user password
  static updatePassword(userId, passwordHash) {
    return new Promise((resolve, reject) => {
      db.query(
        "UPDATE users SET password_hash = ? WHERE id = ?",
        [passwordHash, userId],
        (err, results) => {
          if (err) return reject(err);
          resolve(results);
        }
      );
    });
  }

  // Update OTP hash
  static updateOTP(userId, otpHash) {
    return new Promise((resolve, reject) => {
      db.query(
        "UPDATE users SET otp_hash = ?, otp_expiry = DATE_ADD(NOW(), INTERVAL 5 MINUTE) WHERE id = ?",
        [otpHash, userId],
        (err, results) => {
          if (err) return reject(err);
          resolve(results);
        }
      );
    });
  }
}

module.exports = User;
