const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const mongoose = require('mongoose');
const crypto = require('crypto');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// MongoDB URI
const mongoURI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'lost-and-found-children';

// Create storage engine with optimized options
const storage = new GridFsStorage({
  url: mongoURI,
  options: { 
    dbName: MONGODB_DB_NAME
  },
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      // Check file type
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return reject(new Error('File type not allowed. Only images (jpeg, png, gif, webp) are supported.'));
      }
      
      // Generate a unique filename using crypto for better security
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        
        // Create unique filename with original extension
        const originalExt = path.extname(file.originalname);
        const filename = buf.toString('hex') + originalExt;
        
        const fileInfo = {
          filename: filename,
          bucketName: 'images', // Collection name for images
          metadata: {
            uploadedBy: req.body.userId || 'anonymous',
            contentType: file.mimetype,
            originalName: file.originalname,
            uploadDate: new Date(),
            size: file.size
          }
        };
        
        resolve(fileInfo);
      });
    });
  }
});

// Initialize GridFS stream with connection caching
let gfs;
const conn = mongoose.connection;

// Connection event handling for GridFS
conn.once('open', () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('images'); // Collection name for images
  console.log('GridFS initialized successfully');
});

// Handle connection errors
conn.on('error', (err) => {
  console.error('GridFS connection error:', err);
});

// Create optimized multer upload middleware
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Only one file at a time
  },
  fileFilter: (req, file, cb) => {
    // Additional file filter for validation
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error('File type not allowed. Only images (jpeg, png, gif, webp) are supported.'), false);
    }
    cb(null, true);
  }
});

module.exports = {
  upload,
  getGfs: () => gfs
}; 