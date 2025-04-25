import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Cloudinary service for handling image operations
 */
const cloudinary = {
  /**
   * Check if Cloudinary service is available
   * @returns {Promise<Object>} Health status object
   */
  checkHealth: async () => {
    try {
      console.log('Checking Cloudinary health...');
      const response = await axios.get(`${API_URL}/images/health`);
      console.log('Cloudinary health response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Cloudinary health check failed:', error.message);
      // Add more diagnostic details
      console.log('Cloudinary health check error details:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        statusText: error.response?.statusText,
        API_URL
      });
      return { status: 'error', message: error.message };
    }
  },

  /**
   * Get configuration details for Cloudinary
   * @returns {Promise<Object>} Configuration object
   */
  getConfig: async () => {
    try {
      const response = await axios.get(`${API_URL}/images/config`);
      console.log('Cloudinary config:', response.data);
      return response.data;
    } catch (error) {
      console.error('Could not get Cloudinary config:', error.message);
      return { status: 'error', message: error.message };
    }
  },

  /**
   * Generate a Cloudinary URL from an image ID
   * @param {string} imageId - Cloudinary public ID
   * @param {Object} options - Transformation options
   * @returns {string} Cloudinary URL
   */
  getImageUrl: (imageId, options = {}) => {
    if (!imageId) return null;
    
    // Check if imageId is already a full URL
    if (imageId.startsWith('http://') || imageId.startsWith('https://')) {
      return imageId;
    }
    
    // Get cloud name from configuration or use default
    let cloudName = 'demo';
    try {
      // Access local storage for cached cloud name if available
      const cachedConfig = localStorage.getItem('cloudinaryConfig');
      if (cachedConfig) {
        const config = JSON.parse(cachedConfig);
        if (config && config.cloud_name) {
          cloudName = config.cloud_name;
        }
      }
    } catch (e) {
      console.error('Error reading cloudinary config from storage:', e);
    }
    
    // Default to secure URL
    const base = `https://res.cloudinary.com/${cloudName}/image/upload`;
    
    // Add transformations if any
    const transformations = [];
    
    if (options.width) transformations.push(`w_${options.width}`);
    if (options.height) transformations.push(`h_${options.height}`);
    if (options.crop) transformations.push(`c_${options.crop}`);
    
    // Add quality auto and format auto for optimization
    if (!options.noOptimize) {
      transformations.push('q_auto');
      transformations.push('f_auto');
    }
    
    const transformationString = transformations.length > 0 
      ? transformations.join(',') + '/' 
      : '';
    
    return `${base}/${transformationString}${imageId}`;
  }
};

export default cloudinary; 