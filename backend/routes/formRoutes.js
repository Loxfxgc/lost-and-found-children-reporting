const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// GET all reports
router.get('/', reportController.getAllReports);

// GET reports by status
router.get('/status/:status', reportController.getReportsByStatus);

// GET reports by user
router.get('/user/:uid', reportController.getReportsByUser);

// GET report by ID
router.get('/:id', reportController.getReportById);

// POST create new report
router.post('/', reportController.createReport);

// PUT update report
router.put('/:id', reportController.updateReport);

// DELETE report
router.delete('/:id', reportController.deleteReport);

// GET search reports by location
router.get('/search/location', reportController.searchReportsByLocation);

module.exports = router; 