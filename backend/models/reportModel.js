const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reportSchema = new Schema({
  reporterUid: {
    type: String,
    required: true,
    ref: 'User'
  },
  childName: {
    type: String,
    required: true
  },
  childAge: {
    type: Number,
    required: true
  },
  childGender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  lastSeenDate: {
    type: Date,
    required: true
  },
  lastSeenLocation: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  contactName: {
    type: String,
    required: true
  },
  contactPhone: {
    type: String,
    required: true
  },
  contactEmail: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'found', 'closed'],
    default: 'active'
  },
  // Store image ID for GridFS
  childImageId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  additionalDetails: {
    type: String,
    default: ''
  },
  identifyingFeatures: {
    type: String,
    default: ''
  },
  // For location tracking
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
reportSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create a 2dsphere index for location-based queries
reportSchema.index({ location: '2dsphere' });

const Report = mongoose.model('Report', reportSchema);

module.exports = Report; 