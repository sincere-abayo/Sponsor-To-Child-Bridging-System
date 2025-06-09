const { pool } = require('../config/db');

// Get sponsor profile with sponsees
async function getSponsorProfile(userId) {
  const [sponsor] = await pool.query(
    `SELECT 
      u.id, u.name, u.email, u.role,
      COUNT(DISTINCT s.id) as active_sponsorships,
      COALESCE(SUM(s.amount), 0) as total_sponsored
    FROM users u
    LEFT JOIN sponsorships s ON u.id = s.sponsor_id AND s.status = 'active'
    WHERE u.id = ? AND u.role = 'sponsor'
    GROUP BY u.id`,
    [userId]
  );

  if (!sponsor[0]) {
    return null;
  }

  // Get sponsees with their sponsorships
  const [sponsees] = await pool.query(
    `SELECT 
      s.id as sponsorship_id,
      s.status,
      s.amount,
      s.created_at as start_date,
      s.updated_at as end_date,
      u.id as sponsee_id,
      u.name as sponsee_name,
      u.email as sponsee_email
    FROM sponsorships s
    JOIN users u ON s.sponsee_id = u.id
    WHERE s.sponsor_id = ?
    ORDER BY s.created_at DESC`,
    [userId]
  );

  return {
    ...sponsor[0],
    sponsees
  };
}

// Start sponsoring a sponsee
async function startSponsoring(sponsorId, { sponseeId, amount, notes }) {
  const [result] = await pool.query(
    `INSERT INTO sponsorships (
      sponsor_id, sponsee_id, amount, status, notes
    ) VALUES (?, ?, ?, 'active', ?)`,
    [sponsorId, sponseeId, amount, notes]
  );
  return result.insertId;
}

// Update sponsorship status
async function updateSponsorshipStatus(sponsorId, sponsorshipId, status) {
  const [result] = await pool.query(
    `UPDATE sponsorships 
     SET status = ? 
     WHERE id = ? AND sponsor_id = ?`,
    [status, sponsorshipId, sponsorId]
  );
  return result.affectedRows > 0;
}

// Add note to sponsorship
async function addNote(sponsorId, sponsorshipId, note) {
  const [result] = await pool.query(
    `UPDATE sponsorships 
     SET notes = ? 
     WHERE id = ? AND sponsor_id = ?`,
    [note, sponsorshipId, sponsorId]
  );
  return result.affectedRows > 0;
}

// Get sponsor statistics
async function getSponsorStats(userId) {
  const [stats] = await pool.query(
    `SELECT 
      COUNT(DISTINCT CASE WHEN status = 'active' THEN id END) as active_sponsorships,
      COUNT(DISTINCT CASE WHEN status = 'completed' THEN id END) as completed_sponsorships,
      COALESCE(SUM(CASE WHEN status = 'active' THEN amount ELSE 0 END), 0) as current_sponsored,
      COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as total_sponsored
    FROM sponsorships 
    WHERE sponsor_id = ?`,
    [userId]
  );
  return stats[0];
}

// Get all sponsees for a sponsor
async function getSponsees(sponsorId) {
  const [sponsees] = await pool.query(
    `SELECT 
      s.id as sponsorship_id,
      s.status,
      s.amount,
      s.created_at as start_date,
      s.updated_at as end_date,
      s.notes,
      u.id as sponsee_id,
      u.name as sponsee_name,
      u.email as sponsee_email
    FROM sponsorships s
    JOIN users u ON s.sponsee_id = u.id
    WHERE s.sponsor_id = ?
    ORDER BY s.created_at DESC`,
    [sponsorId]
  );
  return sponsees;
}

module.exports = {
  getSponsorProfile,
  startSponsoring,
  updateSponsorshipStatus,
  addNote,
  getSponsorStats,
  getSponsees
}; 