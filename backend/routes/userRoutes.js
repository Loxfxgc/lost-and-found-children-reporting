const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { upload } = require('../config/gridfs');

// Create or update user
router.post('/', userController.createOrUpdateUser);

// Get user by ID
router.get('/:uid', userController.getUserById);

// Update user profile picture
router.post('/:uid/profile-picture', upload.single('image'), userController.updateProfilePicture);

// Get all users (admin only)
router.get('/', userController.getAllUsers);

// Get users by role
router.get('/role/:role', userController.getUsersByRole);

// Update user role
router.put('/:uid/role', userController.updateUserRole);

module.exports = router; 