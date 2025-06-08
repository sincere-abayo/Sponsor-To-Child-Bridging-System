const { pool } = require('../config/db');

// Setup before all tests
beforeAll(async () => {
  // Create test database tables
  await pool.query(`
    CREATE TABLE IF NOT EXISTS test_users (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role ENUM('sponsor', 'sponsee', 'admin') NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  // Add other test tables as needed
});

// Cleanup after each test
afterEach(async () => {
  // Clear test data
  await pool.query('DELETE FROM test_users');
  // Clear other test tables
});

// Cleanup after all tests
afterAll(async () => {
  // Drop test tables
  await pool.query('DROP TABLE IF EXISTS test_users');
  // Drop other test tables

  // Close database connection
  await pool.end();
}); 