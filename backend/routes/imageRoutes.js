const express = require('express');
const router = express.Router();
const { upload } = require('../config/gridfs');
const imageController = require('../controllers/imageController');

// Upload image - uses multer middleware
router.post('/upload', upload.single('image'), imageController.uploadImage);

// Get image by ID
router.get('/:id', imageController.getImage);

// Delete image by ID
router.delete('/:id', imageController.deleteImage);

module.exports = router;