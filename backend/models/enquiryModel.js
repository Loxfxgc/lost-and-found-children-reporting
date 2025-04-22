const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const enquirySchema = new Schema({
  reportId: {
    type: Schema.Types.ObjectId,
    ref: 'Report',
    required: true
  },
  enquirerUid: {
    type: String,
    required: true,
    ref: 'User'
  },
  enquirerName: {
    type: String,
    required: true
  },
  enquirerPhone: {
    type: String,
    required: true
  },
  enquirerEmail: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'responded', 'closed'],
    default: 'pending'
  },
  response: {
    type: String,
    default: ''
  },
  // Store image IDs for GridFS
  imageIds: [{
    type: mongoose.Schema.Types.ObjectId,
    default: null
  }],
  lastSeenLocation: {
    type: String,
    default: ''
  },
  lastSeenDate: {
    type: Date,
    default: null
  },
  sightingDetails: {
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
enquirySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create a 2dsphere index for location-based queries
enquirySchema.index({ location: '2dsphere' });

const Enquiry = mongoose.model('Enquiry', enquirySchema);

module.exports = Enquiry; 