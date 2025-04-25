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
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 1000, height: 1000, crop: 'limit' }, // Resize images to reasonable dimensions
      { quality: 'auto' } // Optimize quality
    ],
    format: 'jpg', // Convert all images to JPG for consistency
    resource_type: 'auto', // Auto-detect resource type
    use_filename: true, // Use original filename as part of public ID
    unique_filename: true, // Ensure unique filenames
  }
});

// Create multer upload middleware for Cloudinary
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
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

// Debug function to check if Cloudinary is properly configured
const checkCloudinaryConfig = async () => {
  try {
    // Attempt to access account info to verify credentials
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary connection successful:', result.status);
    return true;
  } catch (error) {
    console.error('❌ Cloudinary connection failed:', error.message);
    return false;
  }
};

// Run the check
checkCloudinaryConfig();

module.exports = {
  cloudinary,
  upload,
}; 