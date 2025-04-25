const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/mongodb');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');

// Create Express app
const app = express();
const PORT = process.env.PORT || 50001;

// Security middleware
app.use(helmet()); // Set security HTTP headers
app.use(morgan('dev')); // Log HTTP requests

// Performance middleware
app.use(compression()); // Compress all responses

// Standard middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Welcome route
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Welcome to Lost and Found Children Reporting API',
    version: '1.0.0',
    status: 'running'
  });
});

// API routes
app.use('/api/reports', require('./routes/formRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/enquiries', require('./routes/enquiryRoutes'));
app.use('/api/images', require('./routes/imageRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ 
    success: false, 
    message: `Cannot ${req.method} ${req.originalUrl}` 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.stack
  });
});

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Start the server with port fallback
    const server = app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    }).on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        // Try with a different port
        const newPort = PORT + 1;
        console.log(`Port ${PORT} is in use, trying port ${newPort} instead...`);
        app.listen(newPort, () => {
          console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${newPort}`);
        });
      } else {
        console.error('Failed to start server:', err);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer(); 