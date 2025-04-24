const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Log Cloudinary configuration
console.log('Cloudinary configured with cloud_name:', cloudinary.config().cloud_name);

// Setup storage engine for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'lost-and-found-children',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 1000, crop: 'limit' }], // Resize images to max width of 1000px
    format: 'jpg', // Convert all images to JPG for consistency
    resource_type: 'auto', // Auto-detect resource type
  },
  filename: (req, file, cb) => {
    // Generate a unique file name
    const uniqueFilename = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, uniqueFilename);
  }
});

// Create multer upload middleware for Cloudinary
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1, // Only one file at a time
  },
  fileFilter: (req, file, cb) => {
    // File filter for validation
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error('File type not allowed. Only images (jpeg, png, gif, webp) are supported.'), false);
    }
    cb(null, true);
  },
});

module.exports = {
  cloudinary,
  upload,
}; 