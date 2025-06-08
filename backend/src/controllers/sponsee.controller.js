const { pool } = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for photo upload
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = 'uploads/confirmations';
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `confirmation-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG and JPG are allowed.'));
    }
  }
}).single('photo');

// Get sponsee profile
exports.getProfile = async (req, res) => {
  try {
    const [user] = await pool.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get sponsorship statistics
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total_sponsorships,
        SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered_sponsorships,
        SUM(CASE WHEN status = 'acknowledged' THEN 1 ELSE 0 END) as acknowledged_sponsorships
      FROM sponsorships 
      WHERE sponsee_id = ?
    `, [req.user.id]);

    res.json({
      ...user,
      statistics: stats[0]
    });
  } catch (error) {
    console.error('Error fetching sponsee profile:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
};

// Get received sponsorships
exports.getSponsorships = async (req, res) => {
  try {
    const [sponsorships] = await pool.query(`
      SELECT s.*, 
             u.name as sponsor_name,
             c.photo_url as confirmation_photo,
             c.uploaded_at as confirmation_date
      FROM sponsorships s
      JOIN users u ON s.sponsor_id = u.id
      LEFT JOIN confirmations c ON s.id = c.sponsorship_id
      WHERE s.sponsee_id = ?
      ORDER BY s.created_at DESC
    `, [req.user.id]);

    res.json(sponsorships);
  } catch (error) {
    console.error('Error fetching sponsorships:', error);
    res.status(500).json({ message: 'Error fetching sponsorships' });
  }
};

// Upload confirmation photo
exports.uploadConfirmation = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { sponsorship_id } = req.body;

    try {
      // Verify sponsorship exists and belongs to sponsee
      const [sponsorship] = await pool.query(
        'SELECT id FROM sponsorships WHERE id = ? AND sponsee_id = ?',
        [sponsorship_id, req.user.id]
      );

      if (!sponsorship) {
        // Delete uploaded file if sponsorship doesn't exist
        await fs.unlink(req.file.path);
        return res.status(404).json({ message: 'Sponsorship not found' });
      }

      // Save confirmation record
      const [result] = await pool.query(
        'INSERT INTO confirmations (sponsorship_id, photo_url) VALUES (?, ?)',
        [sponsorship_id, req.file.path]
      );

      // Update sponsorship status
      await pool.query(
        'UPDATE sponsorships SET status = "acknowledged" WHERE id = ?',
        [sponsorship_id]
      );

      // TODO: Send notification to sponsor

      res.status(201).json({
        message: 'Confirmation uploaded successfully',
        confirmation_id: result.insertId,
        photo_url: req.file.path
      });
    } catch (error) {
      // Delete uploaded file if there's an error
      await fs.unlink(req.file.path);
      console.error('Error uploading confirmation:', error);
      res.status(500).json({ message: 'Error uploading confirmation' });
    }
  });
};

// Get messages from sponsor
exports.getMessages = async (req, res) => {
  const { sponsor_id } = req.params;

  try {
    const [messages] = await pool.query(`
      SELECT m.*, 
             sender.name as sender_name,
             receiver.name as receiver_name
      FROM messages m
      JOIN users sender ON m.sender_id = sender.id
      JOIN users receiver ON m.receiver_id = receiver.id
      WHERE (m.sender_id = ? AND m.receiver_id = ?)
         OR (m.sender_id = ? AND m.receiver_id = ?)
      ORDER BY m.created_at ASC
    `, [req.user.id, sponsor_id, sponsor_id, req.user.id]);

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
};

// Reply to sponsor message
exports.replyToMessage = async (req, res) => {
  const { sponsor_id, content, target_language } = req.body;

  try {
    // Validate sponsor exists
    const [sponsor] = await pool.query(
      'SELECT id FROM users WHERE id = ? AND role = "sponsor"',
      [sponsor_id]
    );

    if (!sponsor) {
      return res.status(404).json({ message: 'Sponsor not found' });
    }

    let translated_content = null;
    
    // Translate message if target language is specified
    if (target_language) {
      const [translation] = await translate.translate(content, target_language);
      translated_content = translation;
    }

    // Save message
    const [result] = await pool.query(
      'INSERT INTO messages (sender_id, receiver_id, content, translated_content) VALUES (?, ?, ?, ?)',
      [req.user.id, sponsor_id, content, translated_content]
    );

    // TODO: Send notification to sponsor

    res.status(201).json({
      message: 'Message sent successfully',
      message_id: result.insertId,
      translated_content
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Error sending message' });
  }
}; 