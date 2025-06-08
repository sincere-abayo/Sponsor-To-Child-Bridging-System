const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect, authorize } = require('../middleware/auth');
const {
  createSponsorship,
  getUserSponsorships,
  getSponsorship,
  updateSponsorship,
  deleteSponsorship,
  uploadDocument,
  addUpdate,
  getAvailableSponsorships,
} = require('../controllers/sponsorshipController');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only specific file types
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPEG, and PNG files are allowed.'));
    }
  },
});

// Create a new sponsorship request
router.post('/', protect, createSponsorship);

// Get all sponsorships for the authenticated user
router.get('/my-sponsorships', protect, getUserSponsorships);

// Get all available sponsorships (for sponsors to browse)
router.get('/available', protect, getAvailableSponsorships);

// Get a single sponsorship by ID
router.get('/:id', protect, getSponsorship);

// Update a sponsorship
router.put('/:id', protect, updateSponsorship);

// Delete a sponsorship
router.delete('/:id', protect, deleteSponsorship);

// Upload document for a sponsorship
router.post('/:id/documents', protect, upload.single('document'), uploadDocument);

// Add an update to a sponsorship
router.post('/:id/updates', protect, addUpdate);

module.exports = router; 