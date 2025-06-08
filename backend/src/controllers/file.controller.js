const fileService = require('../services/file.service');
const path = require('path');

// Upload file
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file uploaded'
      });
    }

    const sponsorshipId = req.body.sponsorshipId || null;
    const fileId = await fileService.saveFileInfo(req.file, req.user.id, sponsorshipId);

    res.status(201).json({
      status: 'success',
      data: {
        fileId,
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size
      }
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to upload file'
    });
  }
};

// Get file by ID
exports.getFile = async (req, res) => {
  try {
    const file = await fileService.getFileById(req.params.fileId);
    if (!file) {
      return res.status(404).json({
        status: 'error',
        message: 'File not found'
      });
    }

    res.json({
      status: 'success',
      data: file
    });
  } catch (error) {
    console.error('Error getting file:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get file'
    });
  }
};

// Get user files
exports.getUserFiles = async (req, res) => {
  try {
    const files = await fileService.getFilesByUserId(req.user.id);
    res.json({
      status: 'success',
      data: files
    });
  } catch (error) {
    console.error('Error getting user files:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get user files'
    });
  }
};

// Get sponsorship files
exports.getSponsorshipFiles = async (req, res) => {
  try {
    const files = await fileService.getFilesBySponsorshipId(req.params.sponsorshipId);
    res.json({
      status: 'success',
      data: files
    });
  } catch (error) {
    console.error('Error getting sponsorship files:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get sponsorship files'
    });
  }
};

// Delete file
exports.deleteFile = async (req, res) => {
  try {
    await fileService.deleteFile(req.params.fileId, req.user.id);
    res.json({
      status: 'success',
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    if (error.message === 'File not found') {
      return res.status(404).json({
        status: 'error',
        message: 'File not found'
      });
    }
    if (error.message === 'Unauthorized to delete this file') {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized to delete this file'
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete file'
    });
  }
}; 