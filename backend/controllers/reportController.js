const Report = require('../models/reportModel');
const User = require('../models/userModel');
const mongoose = require('mongoose');
const { getGfs } = require('../config/gridfs');

// Create a new report
const createReport = async (req, res) => {
  try {
    console.log('Creating new report with data:', req.body);
    
    const {
      reporterUid,
      childName,
      childAge,
      childGender,
      lastSeenDate,
      lastSeenLocation,
      description,
      contactName,
      contactPhone,
      contactEmail,
      additionalDetails,
      identifyingFeatures,
      photoUrl,
      photoId,
      latitude,
      longitude
    } = req.body;

    // Validate reporterUid
    if (!reporterUid) {
      return res.status(400).json({
        success: false,
        message: 'Reporter ID is required'
      });
    }

    // Validate required fields
    if (!childName || !childAge || !lastSeenLocation || !description) {
      return res.status(400).json({
        success: false, 
        message: 'Missing required fields: childName, childAge, lastSeenLocation, and description are required'
      });
    }

    // Try to find user, but continue even if not found
    let user;
    try {
      user = await User.findOne({ uid: reporterUid });
    } catch (userErr) {
      console.error('Error finding user:', userErr);
      // Continue without user - don't stop report creation
    }

    // Create a new report
    const newReport = new Report({
      reporterUid,
      childName,
      childAge: parseInt(childAge, 10), // Ensure it's a number
      childGender: childGender || 'other',
      lastSeenDate: lastSeenDate ? new Date(lastSeenDate) : new Date(),
      lastSeenLocation,
      description,
      contactName: contactName || 'Anonymous',
      contactPhone: contactPhone || 'Not provided',
      contactEmail: contactEmail || 'Not provided',
      photoUrl: photoUrl || null, // Store Cloudinary URL directly
      photoId: photoId || null, // Store Cloudinary public_id
      additionalDetails: additionalDetails || '',
      identifyingFeatures: identifyingFeatures || '',
      status: 'active',
      location: {
        type: 'Point',
        coordinates: [longitude || 0, latitude || 0]
      }
    });

    const savedReport = await newReport.save();
    console.log('Report saved successfully:', savedReport._id);
    
    // Update user report count if user exists
    if (user) {
      try {
        await user.incrementReportCount();
        console.log('Updated report count for user:', reporterUid);
      } catch (countErr) {
        console.error('Error updating user report count:', countErr);
        // Continue anyway - this is not critical
      }
    }
    
    res.status(201).json({
      success: true,
      data: savedReport,
      message: 'Report created successfully'
    });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating report',
      error: error.message
    });
  }
};

// Get all reports with pagination
const getAllReports = async (req, res) => {
  try {
    // Add pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const reports = await Report.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const totalReports = await Report.countDocuments();
    
    res.status(200).json({
      success: true,
      count: reports.length,
      totalPages: Math.ceil(totalReports / limit),
      currentPage: page,
      totalReports,
      data: reports
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving reports',
      error: error.message
    });
  }
};

// Get reports by status with pagination
const getReportsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    
    if (!['active', 'found', 'closed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }
    
    // Add pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const reports = await Report.find({ status })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const totalReports = await Report.countDocuments({ status });
    
    res.status(200).json({
      success: true,
      count: reports.length,
      totalPages: Math.ceil(totalReports / limit),
      currentPage: page,
      totalReports,
      data: reports
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving reports',
      error: error.message
    });
  }
};

// Get reports by user with pagination
const getReportsByUser = async (req, res) => {
  try {
    const { uid } = req.params;
    
    // Add pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const reports = await Report.find({ reporterUid: uid })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const totalReports = await Report.countDocuments({ reporterUid: uid });
    
    res.status(200).json({
      success: true,
      count: reports.length,
      totalPages: Math.ceil(totalReports / limit),
      currentPage: page,
      totalReports,
      data: reports
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving reports',
      error: error.message
    });
  }
};

// Get a single report
const getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report ID'
      });
    }
    
    const report = await Report.findById(id);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving report',
      error: error.message
    });
  }
};

// Update a report
const updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report ID'
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
    
    const updatedReport = await Report.findByIdAndUpdate(
      id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    if (!updatedReport) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: updatedReport,
      message: 'Report updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating report',
      error: error.message
    });
  }
};

// Delete a report
const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report ID'
      });
    }
    
    const report = await Report.findById(id);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }
    
    // Delete associated image if exists
    if (report.childImageId) {
      const gfs = getGfs();
      if (gfs) {
        try {
          await gfs.files.deleteOne({
            _id: new mongoose.Types.ObjectId(report.childImageId)
          });
        } catch (error) {
          console.error('Error deleting image:', error);
          // Continue with deletion of report even if image delete fails
        }
      }
    }
    
    await Report.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting report',
      error: error.message
    });
  }
};

// Search reports by location (within a radius)
const searchReportsByLocation = async (req, res) => {
  try {
    const { longitude, latitude, radius = 10 } = req.query; // radius in kilometers
    
    if (!longitude || !latitude) {
      return res.status(400).json({
        success: false,
        message: 'Longitude and latitude are required'
      });
    }
    
    // Add pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const reports = await Report.find({
      location: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(radius) * 1000 // Convert to meters
        }
      }
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
    
    const totalReports = await Report.countDocuments({
      location: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(radius) * 1000 // Convert to meters
        }
      }
    });
    
    res.status(200).json({
      success: true,
      count: reports.length,
      totalPages: Math.ceil(totalReports / limit),
      currentPage: page,
      totalReports,
      data: reports
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching reports',
      error: error.message
    });
  }
};

module.exports = {
  createReport,
  getAllReports,
  getReportsByStatus,
  getReportsByUser,
  getReportById,
  updateReport,
  deleteReport,
  searchReportsByLocation
};