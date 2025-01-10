const crypto = require("crypto");

exports.generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit OTP
};

exports.generateToken = () => {
  return crypto.randomBytes(20).toString("hex"); // Generates a secure token
};
