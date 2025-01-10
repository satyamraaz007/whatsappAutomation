const jwt = require("jsonwebtoken");
require("dotenv").config(); // Load environment variables from .env

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

if (!JWT_SECRET_KEY) {
  throw new Error("JWT_SECRET_KEY is not defined in the environment variables");
}

exports.generateToken = (payload, expiresIn = "45d") => {
  // Return the generated token
  return jwt.sign(payload, JWT_SECRET_KEY, { expiresIn });
};

exports.verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET_KEY);
    return decoded;
  } catch (err) {
    console.error("Token verification failed:", err.message);
    throw new Error("Invalid token");
  }
};
