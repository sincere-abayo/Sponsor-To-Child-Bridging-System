const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');
const fs = require('fs').promises;
const path = require('path');
const { createObjectCsvWriter } = require('csv-writer');

// User Management
exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, name, email, role, created_at FROM users');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [req.params.id]
    );
    
    if (!users.length) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(users[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const [result] = await pool.query(
      'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?',
      [name, email, role, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user' });
  }
};

// System Statistics
exports.getSystemStatistics = async (req, res) => {
  try {
    const [sponsors] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = "sponsor"');
    const [sponsees] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = "sponsee"');
    const [sponsorships] = await pool.query('SELECT COUNT(*) as count FROM sponsorships');
    const [messages] = await pool.query('SELECT COUNT(*) as count FROM messages');
    
    const [recentActivity] = await pool.query(`
      SELECT 'sponsorship' as type, created_at, sponsor_id, sponsee_id, amount
      FROM sponsorships
      UNION ALL
      SELECT 'message' as type, created_at, sender_id as user_id, receiver_id as target_id, NULL as amount
      FROM messages
      ORDER BY created_at DESC
      LIMIT 10
    `);

    res.json({
      totalSponsors: sponsors[0].count,
      totalSponsees: sponsees[0].count,
      totalSponsorships: sponsorships[0].count,
      totalMessages: messages[0].count,
      recentActivity
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching statistics' });
  }
};

// Report Generation
exports.generateReport = async (req, res) => {
  try {
    const { type, startDate, endDate } = req.query;
    let data;
    let headers;

    if (type === 'sponsorships') {
      [data] = await pool.query(`
        SELECT s.*, 
          u1.name as sponsor_name, 
          u2.name as sponsee_name
        FROM sponsorships s
        JOIN users u1 ON s.sponsor_id = u1.id
        JOIN users u2 ON s.sponsee_id = u2.id
        WHERE s.created_at BETWEEN ? AND ?
      `, [startDate, endDate]);

      headers = [
        { id: 'id', title: 'ID' },
        { id: 'sponsor_name', title: 'Sponsor' },
        { id: 'sponsee_name', title: 'Sponsee' },
        { id: 'amount', title: 'Amount' },
        { id: 'status', title: 'Status' },
        { id: 'created_at', title: 'Date' }
      ];
    } else if (type === 'users') {
      [data] = await pool.query(`
        SELECT id, name, email, role, created_at
        FROM users
        WHERE created_at BETWEEN ? AND ?
      `, [startDate, endDate]);

      headers = [
        { id: 'id', title: 'ID' },
        { id: 'name', title: 'Name' },
        { id: 'email', title: 'Email' },
        { id: 'role', title: 'Role' },
        { id: 'created_at', title: 'Join Date' }
      ];
    }

    const reportPath = path.join(__dirname, '../../reports', `${type}_${Date.now()}.csv`);
    const csvWriter = createObjectCsvWriter({
      path: reportPath,
      header: headers
    });

    await csvWriter.writeRecords(data);
    res.json({ reportUrl: `/reports/${path.basename(reportPath)}` });
  } catch (error) {
    res.status(500).json({ message: 'Error generating report' });
  }
};

// Transaction Monitoring
exports.monitorTransactions = async (req, res) => {
  try {
    const [transactions] = await pool.query(`
      SELECT s.*, 
        u1.name as sponsor_name, 
        u2.name as sponsee_name
      FROM sponsorships s
      JOIN users u1 ON s.sponsor_id = u1.id
      JOIN users u2 ON s.sponsee_id = u2.id
      ORDER BY s.created_at DESC
    `);
    
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transactions' });
  }
};

// Flag suspicious activity
exports.flagTransaction = async (req, res) => {
  try {
    const [result] = await pool.query(
      'UPDATE sponsorships SET status = "flagged" WHERE id = ?',
      [req.params.transactionId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.json({ message: 'Transaction flagged successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error flagging transaction' });
  }
}; 