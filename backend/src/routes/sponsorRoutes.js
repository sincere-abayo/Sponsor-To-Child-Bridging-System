const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getAvailableSponsees,
  getSponsorDashboard,
  startSponsoring,
  updateSponsorshipStatus,
  getSponseeDetails,
  addNote,
} = require('../controllers/sponsorController');

// Get all available sponsees (sponsorship requests)
router.get('/available-sponsees', protect, getAvailableSponsees);

// Get sponsor's dashboard data
router.get('/dashboard', protect, getSponsorDashboard);

// Start sponsoring a sponsee
router.post('/start-sponsoring', protect, startSponsoring);

// Update sponsorship status
router.put('/update-status', protect, updateSponsorshipStatus);

// Get sponsee details
router.get('/sponsee/:sponseeId', protect, getSponseeDetails);

// Add note to sponsorship
router.post('/sponsee/:sponseeId/note', protect, addNote);

module.exports = router; 