const express = require('express');
const router = express.Router();
const enquiryController = require('../controllers/enquiryController');

// GET all enquiries
router.get('/', enquiryController.getAllEnquiries);

// GET enquiries by report ID
router.get('/report/:reportId', enquiryController.getEnquiriesByReportId);

// GET enquiries by user
router.get('/user/:uid', enquiryController.getEnquiriesByUser);

// GET enquiry by ID
router.get('/:id', enquiryController.getEnquiryById);

// POST create new enquiry
router.post('/', enquiryController.createEnquiry);

// PUT update enquiry
router.put('/:id', enquiryController.updateEnquiry);

// DELETE enquiry
router.delete('/:id', enquiryController.deleteEnquiry);

// POST respond to enquiry
router.post('/:id/respond', enquiryController.respondToEnquiry);

module.exports = router; 