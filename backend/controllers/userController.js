const User = require('../models/userModel');
const mongoose = require('mongoose');
const { getGfs } = require('../config/gridfs');

// Create or update a user
const createOrUpdateUser = async (req, res) => {
  try {
    const { 
      uid, 
      email, 
      displayName, 
      phoneNumber, 
      role,
      address,
      city,
      state,
      country,
      zipCode
    } = req.body;

    if (!uid || !email || !displayName) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: uid, email, and displayName are required'
      });
    }

    // Check if user already exists
    let user = await User.findOne({ uid });
    
    if (user) {
      // Update existing user
      user.email = email;
      user.displayName = displayName;
      user.phoneNumber = phoneNumber || user.phoneNumber;
      user.role = role || user.role;
      user.address = address || user.address;
      user.city = city || user.city;
      user.state = state || user.state;
      user.country = country || user.country;
      user.zipCode = zipCode || user.zipCode;
      user.lastLogin = new Date();
      
      await user.save();
      
      return res.status(200).json({
        success: true,
        data: user,
        message: 'User updated successfully'
      });
    } else {
      // Create new user
      user = new User({
        uid,
        email,
        displayName,
        phoneNumber: phoneNumber || '',
        role: role || 'general',
        address: address || '',
        city: city || '',
        state: state || '',
        country: country || '',
        zipCode: zipCode || '',
        lastLogin: new Date()
      });
      
      await user.save();
      
      return res.status(201).json({
        success: true,
        data: user,
        message: 'User created successfully'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error creating/updating user',
      error: error.message
    });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { uid } = req.params;
    
    const user = await User.findOne({ uid });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error retrieving user',
      error: error.message
    });
  }
};

// Update user profile picture
const updateProfilePicture = async (req, res) => {
  try {
    const { uid } = req.params;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No profile picture uploaded'
      });
    }
    
    const user = await User.findOne({ uid });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Delete previous profile picture if exists
    if (user.profilePicture) {
      const gfs = getGfs();
      if (gfs) {
        try {
          await gfs.files.deleteOne({ _id: user.profilePicture });
        } catch (error) {
          console.error('Error deleting previous profile picture:', error);
          // Continue even if deletion fails
        }
      }
    }
    
    // Update with new profile picture
    user.profilePicture = req.file.id;
    await user.save();
    
    return res.status(200).json({
      success: true,
      data: {
        profilePictureId: user.profilePicture,
        profilePictureUrl: `/api/images/${user.profilePicture}`
      },
      message: 'Profile picture updated successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error updating profile picture',
      error: error.message
    });
  }
};

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    // Add pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const users = await User.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const totalUsers = await User.countDocuments();
    
    return res.status(200).json({
      success: true,
      count: users.length,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page,
      totalUsers,
      data: users
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error retrieving users',
      error: error.message
    });
  }
};

// Get users by role
const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    
    // Validate role
    if (!['admin', 'reporter', 'general'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Role must be admin, reporter, or general.'
      });
    }
    
    // Add pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const users = await User.find({ role })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const totalUsers = await User.countDocuments({ role });
    
    return res.status(200).json({
      success: true,
      count: users.length,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page,
      totalUsers,
      data: users
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error retrieving users',
      error: error.message
    });
  }
};

// Update user role
const updateUserRole = async (req, res) => {
  try {
    const { uid } = req.params;
    const { role } = req.body;
    
    // Validate role
    if (!['admin', 'reporter', 'general'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Role must be admin, reporter, or general.'
      });
    }
    
    const user = await User.findOne({ uid });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    user.role = role;
    await user.save();
    
    return res.status(200).json({
      success: true,
      data: user,
      message: 'User role updated successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error updating user role',
      error: error.message
    });
  }
};

module.exports = {
  createOrUpdateUser,
  getUserById,
  updateProfilePicture,
  getAllUsers,
  getUsersByRole,
  updateUserRole
}; 