const Enquiry = require('../models/enquiryModel');
const Report = require('../models/reportModel');
const User = require('../models/userModel');
const mongoose = require('mongoose');
const { getGfs } = require('../config/gridfs');

// Create a new enquiry
const createEnquiry = async (req, res) => {
  try {
    const {
      reportId,
      enquirerUid,
      enquirerName,
      enquirerPhone,
      enquirerEmail,
      message,
      lastSeenLocation,
      lastSeenDate,
      sightingDetails,
      latitude,
      longitude
    } = req.body;

    // Validate enquirerUid
    if (!enquirerUid) {
      return res.status(400).json({
        success: false,
        message: 'Enquirer ID is required'
      });
    }

    // Check if user exists
    const user = await User.findOne({ uid: enquirerUid });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Enquirer not found'
      });
    }

    // Check if report exists
    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report ID'
      });
    }

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Get image IDs if any were uploaded
    const imageIds = req.body.imageIds || [];

    // Create a new enquiry
    const newEnquiry = new Enquiry({
      reportId,
      enquirerUid,
      enquirerName,
      enquirerPhone,
      enquirerEmail,
      message,
      imageIds,
      lastSeenLocation: lastSeenLocation || '',
      lastSeenDate: lastSeenDate || null,
      sightingDetails: sightingDetails || '',
      location: {
        type: 'Point',
        coordinates: [longitude || 0, latitude || 0]
      }
    });

    const savedEnquiry = await newEnquiry.save();

    // Update user enquiry count
    await user.incrementEnquiryCount();
    
    res.status(201).json({
      success: true,
      data: savedEnquiry,
      message: 'Enquiry submitted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error submitting enquiry',
      error: error.message
    });
  }
};

// Get all enquiries with pagination
const getAllEnquiries = async (req, res) => {
  try {
    // Add pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const enquiries = await Enquiry.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const totalEnquiries = await Enquiry.countDocuments();
    
    res.status(200).json({
      success: true,
      count: enquiries.length,
      totalPages: Math.ceil(totalEnquiries / limit),
      currentPage: page,
      totalEnquiries,
      data: enquiries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving enquiries',
      error: error.message
    });
  }
};

// Get enquiries by report ID with pagination
const getEnquiriesByReportId = async (req, res) => {
  try {
    const { reportId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report ID'
      });
    }
    
    // Add pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const enquiries = await Enquiry.find({ reportId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const totalEnquiries = await Enquiry.countDocuments({ reportId });
    
    res.status(200).json({
      success: true,
      count: enquiries.length,
      totalPages: Math.ceil(totalEnquiries / limit),
      currentPage: page,
      totalEnquiries,
      data: enquiries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving enquiries',
      error: error.message
    });
  }
};

// Get enquiries by user with pagination
const getEnquiriesByUser = async (req, res) => {
  try {
    const { uid } = req.params;
    
    // Add pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const enquiries = await Enquiry.find({ enquirerUid: uid })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const totalEnquiries = await Enquiry.countDocuments({ enquirerUid: uid });
    
    res.status(200).json({
      success: true,
      count: enquiries.length,
      totalPages: Math.ceil(totalEnquiries / limit),
      currentPage: page,
      totalEnquiries,
      data: enquiries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving enquiries',
      error: error.message
    });
  }
};

// Get a single enquiry
const getEnquiryById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid enquiry ID'
      });
    }
    
    const enquiry = await Enquiry.findById(id);
    
    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: enquiry
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving enquiry',
      error: error.message
    });
  }
};

// Update an enquiry
const updateEnquiry = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid enquiry ID'
      });
    }
    
    // If coordinates are provided, update the location
    if (req.body.latitude && req.body.longitude) {
      req.body.location = {
        type: 'Point',
        coordinates: [req.body.longitude, req.body.latitude]
      };
      
      // Remove lat/lng from the update object
      delete req.body.latitude;
      delete req.body.longitude;
    }
    
    const updatedEnquiry = await Enquiry.findByIdAndUpdate(
      id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    if (!updatedEnquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: updatedEnquiry,
      message: 'Enquiry updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating enquiry',
      error: error.message
    });
  }
};

// Delete an enquiry
const deleteEnquiry = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid enquiry ID'
      });
    }
    
    const enquiry = await Enquiry.findById(id);
    
    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found'
      });
    }
    
    // Delete associated images if they exist
    if (enquiry.imageIds && enquiry.imageIds.length > 0) {
      const gfs = getGfs();
      if (gfs) {
        for (const imageId of enquiry.imageIds) {
          try {
            await gfs.files.deleteOne({
              _id: new mongoose.Types.ObjectId(imageId)
            });
          } catch (error) {
            console.error(`Error deleting image ${imageId}:`, error);
            // Continue with deletion of other images and the enquiry
          }
        }
      }
    }
    
    await Enquiry.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'Enquiry deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting enquiry',
      error: error.message
    });
  }
};

// Respond to an enquiry
const respondToEnquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const { response, status } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid enquiry ID'
      });
    }
    
    if (!response) {
      return res.status(400).json({
        success: false,
        message: 'Response text is required'
      });
    }
    
    const enquiry = await Enquiry.findById(id);
    
    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found'
      });
    }
    
    enquiry.response = response;
    enquiry.status = status || 'responded';
    enquiry.updatedAt = Date.now();
    
    await enquiry.save();
    
    res.status(200).json({
      success: true,
      data: enquiry,
      message: 'Response submitted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error responding to enquiry',
      error: error.message
    });
  }
};

module.exports = {
  createEnquiry,
  getAllEnquiries,
  getEnquiriesByReportId,
  getEnquiriesByUser,
  getEnquiryById,
  updateEnquiry,
  deleteEnquiry,
  respondToEnquiry
}; 