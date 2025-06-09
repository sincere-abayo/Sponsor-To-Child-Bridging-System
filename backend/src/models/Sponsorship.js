const { pool } = require('../config/db');

// Create a new sponsorship
async function createSponsorship({ title, description, category, amount, duration, sponseeId }) {
  const [result] = await pool.query(
    `INSERT INTO sponsorships (title, description, category, amount, duration, sponsee_id, status, progress) 
     VALUES (?, ?, ?, ?, ?, ?, 'pending', 0)`,
    [title, description, category, amount, duration, sponseeId]
  );
  return result.insertId;
}

// Get all sponsorships for a user (either as sponsor or sponsee)
async function getUserSponsorships(userId, role, status) {
  let query = `
    SELECT s.*, 
           u1.name as sponsee_name, u1.email as sponsee_email,
           u2.name as sponsor_name, u2.email as sponsor_email
    FROM sponsorships s
    LEFT JOIN users u1 ON s.sponsee_id = u1.id
    LEFT JOIN users u2 ON s.sponsor_id = u2.id
    WHERE (s.sponsee_id = ? OR s.sponsor_id = ?)
  `;
  const params = [userId, userId];

  if (status) {
    query += ' AND s.status = ?';
    params.push(status);
  }

  query += ' ORDER BY s.created_at DESC';

  const [rows] = await pool.query(query, params);
  return rows;
}

// Get available sponsorships (for sponsors to view)
async function getAvailableSponsorships(filters = {}) {
  let query = 'SELECT * FROM sponsorships WHERE status = "pending"';
  const params = [];

  if (filters.category) {
    query += ' AND category = ?';
    params.push(filters.category);
  }

  if (filters.minAmount) {
    query += ' AND amount >= ?';
    params.push(filters.minAmount);
  }

  if (filters.maxAmount) {
    query += ' AND amount <= ?';
    params.push(filters.maxAmount);
  }

  const [rows] = await pool.query(query, params);
  return rows;
}

// Get a single sponsorship by ID
async function getSponsorship(id) {
  const [rows] = await pool.query(
    'SELECT * FROM sponsorships WHERE id = ?',
    [id]
  );
  return rows[0];
}

// Update a sponsorship
async function updateSponsorship(id, updateData) {
  const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
  const values = [...Object.values(updateData), id];
  
  const [result] = await pool.query(
    `UPDATE sponsorships SET ${fields} WHERE id = ?`,
    values
  );
  return result.affectedRows > 0;
}

// Delete a sponsorship
async function deleteSponsorship(id) {
  const [result] = await pool.query(
    'DELETE FROM sponsorships WHERE id = ?',
    [id]
  );
  return result.affectedRows > 0;
}

// Add a document to a sponsorship
async function addDocument(sponsorshipId, { name, url, type }) {
  const [result] = await pool.query(
    `INSERT INTO sponsorship_documents (sponsorship_id, name, url, type) 
     VALUES (?, ?, ?, ?)`,
    [sponsorshipId, name, url, type]
  );
  return result.insertId;
}

// Add an update to a sponsorship
async function addUpdate(sponsorshipId, content) {
  const [result] = await pool.query(
    `INSERT INTO sponsorship_updates (sponsorship_id, content) 
     VALUES (?, ?)`,
    [sponsorshipId, content]
  );
  return result.insertId;
}

module.exports = {
  createSponsorship,
  getUserSponsorships,
  getAvailableSponsorships,
  getSponsorship,
  updateSponsorship,
  deleteSponsorship,
  addDocument,
  addUpdate
}; 