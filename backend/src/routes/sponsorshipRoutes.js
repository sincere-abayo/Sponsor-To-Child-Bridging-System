const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');
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
router.post('/', authenticateToken, createSponsorship);

// Get all sponsorships for the authenticated user
router.get('/my-sponsorships', authenticateToken, getUserSponsorships);

// Get all available sponsorships (for sponsors to browse)
router.get('/available', authenticateToken, getAvailableSponsorships);

// Get a single sponsorship by ID
router.get('/:id', authenticateToken, getSponsorship);

// Update a sponsorship
router.put('/:id', authenticateToken, updateSponsorship);

// Delete a sponsorship
router.delete('/:id', authenticateToken, deleteSponsorship);

// Upload document for a sponsorship
router.post('/:id/documents', authenticateToken, upload.single('document'), uploadDocument);

// Add an update to a sponsorship
router.post('/:id/updates', authenticateToken, addUpdate);

module.exports = router; 