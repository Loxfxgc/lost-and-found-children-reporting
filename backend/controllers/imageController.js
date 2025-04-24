const mongoose = require('mongoose');
const { cloudinary } = require('../config/cloudinary');
const ObjectId = mongoose.Types.ObjectId;

// Upload an image
// Note: This relies on the multer middleware from cloudinary.js being used beforehand
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Return the Cloudinary file information
    return res.status(201).json({
      success: true,
      fileId: req.file.filename, // Cloudinary public_id
      url: req.file.path, // Cloudinary secure URL
      filename: req.file.originalname,
      message: 'Image uploaded successfully to Cloudinary'
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error uploading image to Cloudinary',
      error: error.message
    });
  }
};

// Get an image by ID
// Note: For Cloudinary, we don't need to stream the file, we can redirect to the URL
const getImage = async (req, res) => {
  try {
    const fileId = req.params.id;
    
    // Get the resource information from Cloudinary
    const result = await cloudinary.api.resource(fileId);
    
    if (!result) {
      return res.status(404).json({ message: 'Image not found' });
    }
    
    // Redirect to the secure URL
    return res.redirect(result.secure_url);
    
  } catch (error) {
    // If resource not found or any other error
    if (error.http_code === 404) {
      return res.status(404).json({ message: 'Image not found' });
    }
    
    return res.status(500).json({
      message: 'Error retrieving image from Cloudinary',
      error: error.message
    });
  }
};

// Delete an image by ID
const deleteImage = async (req, res) => {
  try {
    const fileId = req.params.id;
    
    // Delete the image from Cloudinary
    const result = await cloudinary.uploader.destroy(fileId);
    
    if (result.result !== 'ok') {
      return res.status(500).json({ message: 'Failed to delete the image from Cloudinary' });
    }
    
    return res.status(200).json({ message: 'Image deleted successfully from Cloudinary' });
  } catch (error) {
    return res.status(500).json({
      message: 'Error deleting image from Cloudinary',
      error: error.message
    });
  }
};

module.exports = {
  uploadImage,
  getImage,
  deleteImage
}; 