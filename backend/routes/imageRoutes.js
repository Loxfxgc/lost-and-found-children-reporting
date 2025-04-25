const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const imageController = require('../controllers/imageController');

// Debug middleware to log requests
router.use((req, res, next) => {
  console.log(`[IMAGE-ROUTES] ${req.method} ${req.originalUrl}`);
  console.log(`[IMAGE-ROUTES] Request headers:`, req.headers['content-type']);
  next();
});

// Health check endpoint for Cloudinary
router.get('/health', (req, res, next) => {
  console.log('[IMAGE-ROUTES] Cloudinary health check requested');
  next();
}, imageController.healthCheck);

// Get Cloudinary configuration
router.get('/config', (req, res, next) => {
  console.log('[IMAGE-ROUTES] Cloudinary config requested');
  next();
}, imageController.getConfig);

// Upload image - uses Cloudinary middleware
router.post('/upload', (req, res, next) => {
  console.log('[IMAGE-ROUTES] Upload request received');
  console.log('[IMAGE-ROUTES] Request body keys:', Object.keys(req.body));
  console.log('[IMAGE-ROUTES] Request has files:', req.files ? 'Yes' : 'No');
  
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('[IMAGE-ROUTES] Multer/Cloudinary error:', err);
      
      // Return a consistent error response
      return res.status(400).json({
        success: false,
        message: err.message || 'Image upload failed',
        error: err.toString()
      });
    }
    
    // Check if file was properly processed
    if (!req.file) {
      console.warn('[IMAGE-ROUTES] No file received but no error thrown');
      // Continue anyway - the controller will handle this case
    } else {
      console.log('[IMAGE-ROUTES] File received by multer:', req.file.path || req.file.secure_url || 'unknown path');
    }
    
    next();
  });
}, imageController.uploadImage);

// Get image by ID
router.get('/:id', (req, res, next) => {
  console.log(`[IMAGE-ROUTES] Get image request for ID: ${req.params.id}`);
  next();
}, imageController.getImage);

// Delete image by ID
router.delete('/:id', (req, res, next) => {
  console.log(`[IMAGE-ROUTES] Delete image request for ID: ${req.params.id}`);
  next();
}, imageController.deleteImage);

module.exports = router;