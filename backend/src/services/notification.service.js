const nodemailer = require('nodemailer');
const WebSocket = require('ws');
const { pool } = require('../config/db');

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// WebSocket server instance
let wss;

// Initialize WebSocket server
exports.initializeWebSocket = (server) => {
  wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    console.log('New WebSocket connection');

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message);
        if (data.type === 'auth') {
          // Store user ID with WebSocket connection
          ws.userId = data.userId;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });
};

// Send email notification
const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Send WebSocket notification
const sendWebSocketNotification = (userId, notification) => {
  if (!wss) return;

  wss.clients.forEach((client) => {
    if (client.userId === userId && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(notification));
    }
  });
};

// Notification templates
const notificationTemplates = {
  newSponsorship: (sponsorName, sponseeName) => ({
    email: {
      subject: 'New Sponsorship Received',
      html: `
        <h2>New Sponsorship</h2>
        <p>Dear ${sponseeName},</p>
        <p>You have received a new sponsorship from ${sponsorName}.</p>
        <p>Please log in to your account to view the details.</p>
      `
    },
    websocket: {
      type: 'new_sponsorship',
      message: `New sponsorship received from ${sponsorName}`
    }
  }),

  sponsorshipConfirmed: (sponseeName, sponsorName) => ({
    email: {
      subject: 'Sponsorship Confirmed',
      html: `
        <h2>Sponsorship Confirmed</h2>
        <p>Dear ${sponsorName},</p>
        <p>${sponseeName} has confirmed receipt of your sponsorship.</p>
        <p>Please log in to your account to view the confirmation details.</p>
      `
    },
    websocket: {
      type: 'sponsorship_confirmed',
      message: `${sponseeName} has confirmed your sponsorship`
    }
  }),

  newMessage: (senderName, receiverName) => ({
    email: {
      subject: 'New Message Received',
      html: `
        <h2>New Message</h2>
        <p>Dear ${receiverName},</p>
        <p>You have received a new message from ${senderName}.</p>
        <p>Please log in to your account to view the message.</p>
      `
    },
    websocket: {
      type: 'new_message',
      message: `New message from ${senderName}`
    }
  }),

  flaggedTransaction: (adminName, transactionId) => ({
    email: {
      subject: 'Transaction Flagged',
      html: `
        <h2>Transaction Flagged</h2>
        <p>Dear Admin,</p>
        <p>${adminName} has flagged transaction #${transactionId} for review.</p>
        <p>Please log in to your account to review the transaction.</p>
      `
    },
    websocket: {
      type: 'transaction_flagged',
      message: `Transaction #${transactionId} has been flagged for review`
    }
  })
};

// Main notification function
exports.sendNotification = async (type, userId, data) => {
  try {
    // Get user details
    const [user] = await pool.query(
      'SELECT name, email FROM users WHERE id = ?',
      [userId]
    );

    if (!user) {
      throw new Error('User not found');
    }

    // Get notification template
    const template = notificationTemplates[type](...Object.values(data));

    // Send email notification
    if (template.email) {
      await sendEmail(user.email, template.email.subject, template.email.html);
    }

    // Send WebSocket notification
    if (template.websocket) {
      sendWebSocketNotification(userId, template.websocket);
    }

    // Log notification
    await pool.query(
      'INSERT INTO notifications (user_id, type, data) VALUES (?, ?, ?)',
      [userId, type, JSON.stringify(data)]
    );

  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};

// Get user notifications
exports.getUserNotifications = async (userId) => {
  try {
    const [notifications] = await pool.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [userId]
    );
    return notifications;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

// Mark notification as read
exports.markNotificationAsRead = async (notificationId, userId) => {
  try {
    await pool.query(
      'UPDATE notifications SET is_read = true WHERE id = ? AND user_id = ?',
      [notificationId, userId]
    );
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}; 