const express = require('express');
const router = express.Router();
const { admin } = require('../config/firebase');
const User = require('../models/userModel');
const authMiddleware = require('../middleware/authMiddleware');

// POST register new user (Firebase auth is handled client-side)
router.post('/register', async (req, res) => {
  try {
    const { uid, email, displayName } = req.body;
    
    if (!uid || !email) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID and email are required' 
      });
    }
    
    // Check if user already exists in our database
    const existingUser = await User.findOne({ uid });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }
    
    // Create user in our database
    const newUser = new User({
      uid,
      email,
      displayName: displayName || email.split('@')[0],
      lastLogin: new Date()
    });
    
    await newUser.save();
    
    res.status(201).json({
      success: true,
      data: newUser,
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message
    });
  }
});

// POST login user - token validation happens in middleware
router.post('/login', async (req, res) => {
  try {
    const { idToken } = req.body;
    
    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'ID token is required'
      });
    }
    
    // Verify the token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Find or create user in our database
    let user = await User.findOne({ uid: decodedToken.uid });
    
    if (!user) {
      // Auto-create a user if not found
      user = new User({
        uid: decodedToken.uid,
        email: decodedToken.email,
        displayName: decodedToken.name || decodedToken.email.split('@')[0],
        emailVerified: decodedToken.email_verified,
        lastLogin: new Date()
      });
      
      await user.save();
    } else {
      // Update last login
      user.lastLogin = new Date();
      if (user.displayName !== decodedToken.name && decodedToken.name) {
        user.displayName = decodedToken.name;
      }
      await user.save();
    }
    
    res.status(200).json({
      success: true,
      data: {
        user,
        token: idToken
      },
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token',
      error: error.message
    });
  }
});

// GET current user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.user.uid });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving user',
      error: error.message
    });
  }
});

// POST logout user
router.post('/logout', (req, res) => {
  // Firebase logout happens client-side
  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
});

module.exports = router; 