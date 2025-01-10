const { verifyToken } = require('../utils/jwtUtils');
const User = require('../models/User');

exports.authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Extract token
  if (!token) {
    return res.status(401).json({ message: 'Access token is missing' });
  }

  try {
    const decoded = verifyToken(token); // Validate token

    const user = await User.findById(decoded.id); // Find user in DB

    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = { id: user.id, username: user.username }; // Attach user details to request
    next(); // Continue to the next middleware
  } catch (err) {
    console.error("Error in authenticate middleware:", err.message); // Debug
    return res.status(401).json({ message: 'Unauthorized', details: err.message });
  }
};
