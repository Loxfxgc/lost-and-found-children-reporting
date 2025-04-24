const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const imageController = require('../controllers/imageController');

// Upload image - uses Cloudinary middleware
router.post('/upload', upload.single('image'), imageController.uploadImage);

// Get image by ID
router.get('/:id', imageController.getImage);

// Delete image by ID
router.delete('/:id', imageController.deleteImage);

module.exports = router;