const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  uid: {
    type: String,
    required: true,
    unique: true,
    index: true // Index for faster queries by uid
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true, // Store emails in lowercase for consistency
    trim: true, // Remove whitespace
    index: true // Index for faster queries by email
  },
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    default: '',
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'reporter', 'general'],
    default: 'general',
    index: true // Index for role-based queries
  },
  profilePicture: {
    type: String, // Cloudinary public_id
    default: null
  },
  profilePictureUrl: {
    type: String, // Cloudinary URL
    default: null
  },
  // Additional user information
  address: {
    type: String,
    default: '',
    trim: true
  },
  city: {
    type: String,
    default: '',
    trim: true
  },
  state: {
    type: String,
    default: '',
    trim: true
  },
  country: {
    type: String,
    default: '',
    trim: true
  },
  zipCode: {
    type: String,
    default: '',
    trim: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  // Stats for better tracking
  reportCount: {
    type: Number,
    default: 0
  },
  enquiryCount: {
    type: Number,
    default: 0
  },
  lastLogin: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true // Once set, this can't be changed
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true, // Automatically manage createdAt and updatedAt
  toJSON: { virtuals: true }, // Include virtuals when documents are converted to JSON
  toObject: { virtuals: true } // Include virtuals when documents are converted to objects
});

// Virtual for full address
userSchema.virtual('fullAddress').get(function() {
  const parts = [this.address, this.city, this.state, this.zipCode, this.country].filter(Boolean);
  return parts.join(', ');
});

// Method to update report count
userSchema.methods.incrementReportCount = async function() {
  this.reportCount += 1;
  return this.save();
};

// Method to update enquiry count
userSchema.methods.incrementEnquiryCount = async function() {
  this.enquiryCount += 1;
  return this.save();
};

// Method to update last login
userSchema.methods.updateLastLogin = async function() {
  this.lastLogin = Date.now();
  return this.save();
};

// Index for better performance on combined queries
userSchema.index({ role: 1, createdAt: -1 });

const User = mongoose.model('User', userSchema);

module.exports = User; 