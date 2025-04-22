const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

/**
 * Authentication middleware to verify JWT tokens
 */
const authMiddleware = (req, res, next) => {
  try {
    // Get token from authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No token provided'
      });
    }

    // Extract token
    const token = authHeader.split('Bearer ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Invalid token format'
      });
    }

    try {
      // Verify token
      const decodedToken = jwt.verify(token, JWT_SECRET);

      // Add user info to request
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        role: decodedToken.role || 'user',
      };

      next();
    } catch (error) {
      console.error('Token verification error:', error);

      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Invalid token',
        error: error.message
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error in authentication',
      error: error.message
    });
  }
};

module.exports = authMiddleware;
