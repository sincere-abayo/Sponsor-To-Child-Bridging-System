const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { pool } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// Configure multer storage
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (allowedTypes.includes(file.mimeType)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, PDFs, and Word documents are allowed.'), false);
  }
};

// Configure multer upload
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Save file information to database
const saveFileInfo = async (file, userId, sponsorshipId = null) => {
  try {
    const [result] = await pool.query(
      'INSERT INTO files (user_id, sponsorship_id, filename, original_name, mime_type, size, path) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        userId,
        sponsorshipId,
        file.filename,
        file.originalname,
        file.mimetype,
        file.size,
        file.path
      ]
    );

    return result.insertId;
  } catch (error) {
    // If database insert fails, delete the uploaded file
    await fs.unlink(file.path);
    throw error;
  }
};

// Get file by ID
const getFileById = async (fileId) => {
  try {
    const [files] = await pool.query(
      'SELECT * FROM files WHERE id = ?',
      [fileId]
    );
    return files[0];
  } catch (error) {
    throw error;
  }
};

// Get files by user ID
const getFilesByUserId = async (userId) => {
  try {
    const [files] = await pool.query(
      'SELECT * FROM files WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return files;
  } catch (error) {
    throw error;
  }
};

// Get files by sponsorship ID
const getFilesBySponsorshipId = async (sponsorshipId) => {
  try {
    const [files] = await pool.query(
      'SELECT * FROM files WHERE sponsorship_id = ? ORDER BY created_at DESC',
      [sponsorshipId]
    );
    return files;
  } catch (error) {
    throw error;
  }
};

// Delete file
const deleteFile = async (fileId, userId) => {
  try {
    // Get file information
    const file = await getFileById(fileId);
    if (!file) {
      throw new Error('File not found');
    }

    // Check if user owns the file
    if (file.user_id !== userId) {
      throw new Error('Unauthorized to delete this file');
    }

    // Delete file from storage
    await fs.unlink(file.path);

    // Delete file record from database
    await pool.query(
      'DELETE FROM files WHERE id = ?',
      [fileId]
    );

    return true;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  upload,
  saveFileInfo,
  getFileById,
  getFilesByUserId,
  getFilesBySponsorshipId,
  deleteFile
}; 