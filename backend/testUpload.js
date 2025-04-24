require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('Cloudinary config loaded:', cloudinary.config().cloud_name);

// Path to a test image file
// Replace this with the path to an actual image file on your system
const testImagePath = path.join(__dirname, 'test-image.jpg');

// Check if the file exists
if (!fs.existsSync(testImagePath)) {
  console.error('Test image not found at:', testImagePath);
  console.log('Please create or copy an image file to this location and try again.');
  process.exit(1);
}

// Function to upload file directly
async function uploadFile() {
  console.log('Uploading file to Cloudinary...');
  
  try {
    const result = await cloudinary.uploader.upload(testImagePath, {
      folder: 'lost-and-found-children/test',
      resource_type: 'auto'
    });
    
    console.log('Upload successful!');
    console.log('Secure URL:', result.secure_url);
    console.log('Public ID:', result.public_id);
    console.log('Full result:', result);
    
    return result;
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
}

// Execute the upload
uploadFile()
  .then(() => console.log('Test completed'))
  .catch(err => console.error('Test failed:', err)); 