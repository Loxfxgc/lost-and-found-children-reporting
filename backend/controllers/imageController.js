const mongoose = require('mongoose');
const { cloudinary } = require('../config/cloudinary');
const ObjectId = mongoose.Types.ObjectId;

// Upload an image
// Note: This relies on the multer middleware from cloudinary.js being used beforehand
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      console.error('No file in request:', req.file);
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded'
      });
    }
    
    console.log('File uploaded to Cloudinary:', {
      path: req.file.path,
      filename: req.file.filename,
      public_id: req.file.public_id,
      secure_url: req.file.secure_url,
      url: req.file.url
    });
    
    // Determine the best URL to use
    let imageUrl = req.file.path || req.file.secure_url || req.file.url;
    let imageId = req.file.filename || req.file.public_id;
    
    // In case multer-storage-cloudinary doesn't provide the URL directly,
    // we can construct it from the public_id if available
    if (!imageUrl && imageId) {
      // Get the resource to fetch the secure URL
      try {
        const result = await cloudinary.api.resource(imageId);
        imageUrl = result.secure_url;
      } catch (err) {
        console.error('Error fetching Cloudinary resource:', err);
        // Still continue with the upload info we have
      }
    }
    
    // Return the Cloudinary file information
    return res.status(201).json({
      success: true,
      fileId: imageId,
      public_id: imageId, // Add for consistency
      url: imageUrl,
      secure_url: req.file.secure_url || imageUrl,
      filename: req.file.originalname,
      format: req.file.format,
      message: 'Image uploaded successfully to Cloudinary'
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return res.status(500).json({
      success: false,
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
      return res.status(404).json({ 
        success: false,
        message: 'Image not found' 
      });
    }
    
    // Return the image information
    return res.status(200).json({
      success: true,
      url: result.secure_url,
      resource: result
    });
    
  } catch (error) {
    // If resource not found or any other error
    if (error.http_code === 404) {
      return res.status(404).json({ 
        success: false,
        message: 'Image not found' 
      });
    }
    
    return res.status(500).json({
      success: false,
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
      return res.status(500).json({ 
        success: false,
        message: 'Failed to delete the image from Cloudinary' 
      });
    }
    
    return res.status(200).json({ 
      success: true,
      message: 'Image deleted successfully from Cloudinary' 
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error deleting image from Cloudinary',
      error: error.message
    });
  }
};

// Check Cloudinary health
const healthCheck = async (req, res) => {
  try {
    // Attempt to ping Cloudinary API
    const result = await cloudinary.api.ping();
    
    return res.status(200).json({
      success: true,
      status: 'ok',
      cloudinary: result
    });
  } catch (error) {
    console.error('Cloudinary health check failed:', error);
    
    return res.status(503).json({
      success: false,
      status: 'error',
      message: 'Cloudinary service unavailable',
      error: error.message
    });
  }
};

// Get Cloudinary configuration (public information only)
const getConfig = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      cloud_name: cloudinary.config().cloud_name,
      // Don't expose API key and secret to the client
      secure: true,
      api_version: cloudinary.config().api_version
    });
  } catch (error) {
    console.error('Error retrieving Cloudinary config:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Error retrieving Cloudinary configuration',
      error: error.message
    });
  }
};

module.exports = {
  uploadImage,
  getImage,
  deleteImage,
  healthCheck,
  getConfig
}; 