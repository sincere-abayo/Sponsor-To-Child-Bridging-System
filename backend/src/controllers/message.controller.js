const db = require('../config/db');

const messageController = {
  // Get conversation history between two users
  getConversationHistory: async (req, res) => {
    try {
      const { userId } = req.params;
      const currentUserId = req.user.id;

      const [messages] = await db.query(
        `SELECT m.*, 
          u1.name as sender_name, 
          u2.name as receiver_name
        FROM messages m
        JOIN users u1 ON m.sender_id = u1.id
        JOIN users u2 ON m.receiver_id = u2.id
        WHERE (m.sender_id = ? AND m.receiver_id = ?)
        OR (m.sender_id = ? AND m.receiver_id = ?)
        ORDER BY m.created_at ASC`,
        [currentUserId, userId, userId, currentUserId]
      );

      res.json(messages);
    } catch (error) {
      console.error('Error getting conversation history:', error);
      res.status(500).json({ message: 'Error retrieving conversation history' });
    }
  },

  // Send a new message
  sendMessage: async (req, res) => {
    try {
      const { receiverId, content } = req.body;
      const senderId = req.user.id;

      if (!receiverId || !content) {
        return res.status(400).json({ message: 'Receiver ID and content are required' });
      }

      const [result] = await db.query(
        'INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)',
        [senderId, receiverId, content]
      );

      const [newMessage] = await db.query(
        `SELECT m.*, 
          u1.name as sender_name, 
          u2.name as receiver_name
        FROM messages m
        JOIN users u1 ON m.sender_id = u1.id
        JOIN users u2 ON m.receiver_id = u2.id
        WHERE m.id = ?`,
        [result.insertId]
      );

      res.status(201).json(newMessage[0]);
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ message: 'Error sending message' });
    }
  },

  // Translate a message
  translateMessage: async (req, res) => {
    try {
      const { text, targetLanguage } = req.body;

      if (!text || !targetLanguage) {
        return res.status(400).json({ message: 'Text and target language are required' });
      }

      // TODO: Implement actual translation logic using a translation service
      // For now, return a mock translation
      const translatedText = `[${targetLanguage}] ${text}`;

      res.json({ translatedText });
    } catch (error) {
      console.error('Error translating message:', error);
      res.status(500).json({ message: 'Error translating message' });
    }
  }
};

module.exports = messageController; 