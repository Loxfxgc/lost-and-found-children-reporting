/**
 * MongoDB Database Initialization Script
 * This script creates indexes for better performance and sets up the initial admin user
 */

const mongoose = require('mongoose');
const User = require('../models/userModel');
const Report = require('../models/reportModel');
const Enquiry = require('../models/enquiryModel');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// MongoDB Connection URI
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'lost-and-found-children';

// Connection options
const options = {
  dbName: MONGODB_DB_NAME
};

// Initialize database function
async function initDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, options);
    console.log('Connected to MongoDB successfully!');

    // Create compound indexes for better performance
    console.log('Creating indexes...');
    
    // Report indexes
    await Report.collection.createIndex({ reporterUid: 1, createdAt: -1 });
    await Report.collection.createIndex({ status: 1, createdAt: -1 });
    await Report.collection.createIndex({ 
      childName: 'text', 
      description: 'text', 
      lastSeenLocation: 'text',
      identifyingFeatures: 'text'
    }, { 
      weights: {
        childName: 10,
        description: 5,
        lastSeenLocation: 8,
        identifyingFeatures: 7
      }
    });
    
    // Enquiry indexes
    await Enquiry.collection.createIndex({ enquirerUid: 1, createdAt: -1 });
    await Enquiry.collection.createIndex({ reportId: 1, createdAt: -1 });
    await Enquiry.collection.createIndex({ status: 1, createdAt: -1 });
    
    // Add more indexes as needed
    
    console.log('Indexes created successfully!');
    
    // Check if admin user exists, create if not
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (!adminExists) {
      console.log('Creating default admin user...');
      
      const adminUser = new User({
        uid: 'admin-' + Date.now(),
        email: 'admin@example.com',
        displayName: 'System Administrator',
        role: 'admin',
        verified: true,
        lastLogin: new Date()
      });
      
      await adminUser.save();
      console.log('Default admin user created successfully!');
      console.log('Admin User ID:', adminUser.uid);
      console.log('Please change the admin password after first login.');
    }
    
    console.log('Database initialization completed successfully!');
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

// Run the initialization function
initDatabase(); 