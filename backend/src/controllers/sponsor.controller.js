const { pool } = require('../config/db');
const { Translate } = require('@google-cloud/translate').v2;

// Initialize Google Translate
const translate = new Translate({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});

// Get sponsor profile
exports.getProfile = async (req, res) => {
  try {
    const [user] = await pool.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching sponsor profile:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
};

// Submit sponsorship
exports.submitSponsorship = async (req, res) => {
  const { sponsee_id, type, details } = req.body;
  
  try {
    // Validate sponsee exists and is a sponsee
    const [sponsee] = await pool.query(
      'SELECT id FROM users WHERE id = ? AND role = "sponsee"',
      [sponsee_id]
    );

    if (!sponsee) {
      return res.status(404).json({ message: 'Sponsee not found' });
    }

    // Create sponsorship
    const [result] = await pool.query(
      'INSERT INTO sponsorships (sponsor_id, sponsee_id, type, details) VALUES (?, ?, ?, ?)',
      [req.user.id, sponsee_id, type, details]
    );

    // TODO: Send notification to sponsee

    res.status(201).json({
      message: 'Sponsorship submitted successfully',
      sponsorship_id: result.insertId
    });
  } catch (error) {
    console.error('Error submitting sponsorship:', error);
    res.status(500).json({ message: 'Error submitting sponsorship' });
  }
};

// Get sponsorship history
exports.getSponsorshipHistory = async (req, res) => {
  try {
    const [sponsorships] = await pool.query(`
      SELECT s.*, 
             u.name as sponsee_name,
             c.photo_url as confirmation_photo
      FROM sponsorships s
      JOIN users u ON s.sponsee_id = u.id
      LEFT JOIN confirmations c ON s.id = c.sponsorship_id
      WHERE s.sponsor_id = ?
      ORDER BY s.created_at DESC
    `, [req.user.id]);

    res.json(sponsorships);
  } catch (error) {
    console.error('Error fetching sponsorship history:', error);
    res.status(500).json({ message: 'Error fetching sponsorship history' });
  }
};

// Send message to sponsee
exports.sendMessage = async (req, res) => {
  const { sponsee_id, content, target_language } = req.body;

  try {
    // Validate sponsee exists
    const [sponsee] = await pool.query(
      'SELECT id FROM users WHERE id = ? AND role = "sponsee"',
      [sponsee_id]
    );

    if (!sponsee) {
      return res.status(404).json({ message: 'Sponsee not found' });
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
      [req.user.id, sponsee_id, content, translated_content]
    );

    // TODO: Send notification to sponsee

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

// Get messages with a specific sponsee
exports.getMessages = async (req, res) => {
  const { sponsee_id } = req.params;

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
    `, [req.user.id, sponsee_id, sponsee_id, req.user.id]);

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
}; 