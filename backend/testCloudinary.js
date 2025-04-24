require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const cloudinary = require('cloudinary').v2;

// Log environment variables and config
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY?.substring(0, 5) + '...');
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not set');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('\nCloudinary Config after explicit setting:');
console.log('Cloud name:', cloudinary.config().cloud_name);
console.log('API Key:', cloudinary.config().api_key?.substring(0, 5) + '...');
console.log('API Secret:', cloudinary.config().api_secret ? 'Set' : 'Not set'); 