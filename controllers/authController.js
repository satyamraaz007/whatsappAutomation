const User = require("../models/User");
const { generateOTP } = require("../utils/otpGenerator");
const MailSender = require("../utils/MailSender");
const { hashPassword, comparePassword } = require("../utils/passwordUtils");
const { generateToken } = require("../utils/jwtUtils");
const crypto = require("crypto");

// Register User
exports.register = async (req, res) => {
  const { firstName, lastName, username, email, phone, password } = req.body;
  if (!firstName || !lastName || !username || !email || !phone || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const passwordHash = await hashPassword(password);
    await User.create({
      firstName,
      lastName,
      username,
      email,
      phone,
      password_hash: passwordHash,
    });
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error registering user", details: err.message });
  }
};

// Check username availability
exports.checkUsernameAvailability = async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ message: "Username is required" });
  }

  if (username.length < 5) {
    return res.status(400).json({ message: "Minimum 5 characters required" });
  }

  try {
    const exists = await User.usernameExists(username);
    if (exists) {
      return res.status(409).json({ message: "Username already exists" });
    }

    res.json({ message: "Username is available" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error checking username", details: err.message });
  }
};

// Login User
exports.login = async (req, res) => {
  const { identifier, password } = req.body; // Identifier can be username or email
  if (!identifier || !password) {
    return res
      .status(400)
      .json({ message: "Identifier and password are required" });
  }

  try {
    // Check if the identifier is an email
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);

    // Find user by email or username
    const user = isEmail
      ? await User.findByEmail(identifier)
      : await User.findByUsername(identifier);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate password
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = generateToken({ id: user.id });
    res.json({ message: "Login successful", authToken: token });
  } catch (err) {
    res.status(500).json({ message: "Error logging in", details: err.message });
  }
};

// Request OTP
exports.requestOTP = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate OTP
    const otp = generateOTP();
    const hashedOTP = await hashPassword(otp.toString()); // Hash OTP for security
    await User.updateOTP(user.id, hashedOTP);

    // Send OTP to email
    await MailSender.sendEmail({
      to: email,
      subject: "Your Login OTP",
      template: "otpEmail", // .ejs template
      context: { otp },
    });

    res.json({ message: "OTP sent to your email" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error requesting OTP", details: err.message });
  }
};

// Login with OTP
exports.loginWithOTP = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  try {
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.otp_hash) {
      return res.status(401).json({ message: "No OTP has been set for this user" });
    }

    const isOTPValid = await comparePassword(otp, user.otp_hash);
    if (!isOTPValid) {
      return res.status(401).json({ message: "invalid otp" });
    }


    if (Date.now() > user.otp_expiry) {
      return res.status(401).json({ message: "otp expired" });
    }

    // Generate token
    const token = generateToken({ id: user.id });

    // Clear OTP after successful login
    await User.updateOTP(user.id, null);

    res.json({ message: "Login successful", authToken: token });
  } catch (err) {
    res.status(500).json({ message: "Error logging in", details: err.message });
  }
};

// Request Password Reset
exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    await User.updateResetToken(user.id, resetToken);

    // Send the reset token to the user's email
    console.log(
      `Send this reset link to the user: http://example.com/reset-password/${resetToken}`
    );

    res.json({ message: "Password reset link has been sent to your email" });
  } catch (err) {
    res.status(500).json({
      message: "Error requesting password reset",
      details: err.message,
    });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res
      .status(400)
      .json({ message: "Token and new password are required" });
  }

  try {
    const user = await User.findByResetToken(token);
    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    // Hash the new password
    const passwordHash = await hashPassword(newPassword);
    await User.updatePassword(user.id, passwordHash);

    // Clear the reset token
    await User.updateResetToken(user.id, null);

    res.json({ message: "Password has been reset successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error resetting password", details: err.message });
  }
};
