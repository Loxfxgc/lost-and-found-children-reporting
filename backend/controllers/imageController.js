const mongoose = require('mongoose');
const { getGfs } = require('../config/gridfs');
const ObjectId = mongoose.Types.ObjectId;

// Upload an image
// Note: This relies on the multer middleware from gridfs.js being used beforehand
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Return the file information including the ID which can be stored in the report/enquiry
    return res.status(201).json({
      success: true,
      fileId: req.file.id,
      filename: req.file.filename,
      message: 'Image uploaded successfully'
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error uploading image',
      error: error.message
    });
  }
};

// Get an image by ID
const getImage = async (req, res) => {
  try {
    const gfs = getGfs();
    
    if (!gfs) {
      return res.status(500).json({ message: 'GridFS not initialized' });
    }
    
    const fileId = req.params.id;
    
    if (!ObjectId.isValid(fileId)) {
      return res.status(400).json({ message: 'Invalid file ID' });
    }
    
    const file = await gfs.files.findOne({ _id: new ObjectId(fileId) });
    
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    // Check if file is an image
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.contentType)) {
      return res.status(400).json({ message: 'File is not an image' });
    }
    
    // Set the appropriate content type
    res.set('Content-Type', file.contentType);
    
    // Create a read stream and pipe it to the response
    const readstream = gfs.createReadStream(file._id);
    readstream.pipe(res);
    
  } catch (error) {
    return res.status(500).json({
      message: 'Error retrieving image',
      error: error.message
    });
  }
};

// Delete an image by ID
const deleteImage = async (req, res) => {
  try {
    const gfs = getGfs();
    
    if (!gfs) {
      return res.status(500).json({ message: 'GridFS not initialized' });
    }
    
    const fileId = req.params.id;
    
    if (!ObjectId.isValid(fileId)) {
      return res.status(400).json({ message: 'Invalid file ID' });
    }
    
    await gfs.remove({ _id: new ObjectId(fileId), root: 'images' });
    
    return res.status(200).json({ message: 'Image deleted successfully' });
  } catch (error) {
    return res.status(500).json({
      message: 'Error deleting image',
      error: error.message
    });
  }
};

module.exports = {
  uploadImage,
  getImage,
  deleteImage
}; 