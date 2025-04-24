const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const imageController = require('../controllers/imageController');

// Debug middleware to log requests
router.use((req, res, next) => {
  console.log(`[IMAGE-ROUTES] ${req.method} ${req.originalUrl}`);
  next();
});

// Upload image - uses Cloudinary middleware
router.post('/upload', (req, res, next) => {
  console.log('[IMAGE-ROUTES] Upload request received');
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('[IMAGE-ROUTES] Multer/Cloudinary error:', err);
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    console.log('[IMAGE-ROUTES] File received by multer:', req.file ? 'Yes' : 'No');
    next();
  });
}, imageController.uploadImage);

// Get image by ID
router.get('/:id', imageController.getImage);

// Delete image by ID
router.delete('/:id', imageController.deleteImage);

module.exports = router;