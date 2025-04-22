const { admin } = require('../config/firebase');

/**
 * Authentication middleware to verify Firebase tokens
 * This middleware verifies the JWT token from Firebase Auth
 */
const authMiddleware = async (req, res, next) => {
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
    const idToken = authHeader.split('Bearer ')[1];
    
    if (!idToken) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized: Invalid token format' 
      });
    }
    
    try {
      // Verify token
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      
      // Add user info to request
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified,
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