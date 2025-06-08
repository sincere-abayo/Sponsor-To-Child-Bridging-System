const express = require('express');
const router = express.Router();
const fileController = require('../controllers/file.controller');
const fileService = require('../services/file.service');
const { authenticate } = require('../middleware/auth');

// All file routes require authentication
router.use(authenticate);

// Upload file
router.post('/upload', fileService.upload.single('file'), fileController.uploadFile);

// Get file by ID
router.get('/:fileId', fileController.getFile);

// Get user files
router.get('/user/files', fileController.getUserFiles);

// Get sponsorship files
router.get('/sponsorship/:sponsorshipId/files', fileController.getSponsorshipFiles);

// Delete file
router.delete('/:fileId', fileController.deleteFile);

module.exports = router; 