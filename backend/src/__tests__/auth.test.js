const request = require('supertest');
const app = require('../server');
const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');

describe('Authentication Endpoints', () => {
  let testUser;

  beforeEach(async () => {
    // Create a test user
    const hashedPassword = await bcrypt.hash('testpassword123', 10);
    const [result] = await pool.query(
      'INSERT INTO test_users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Test User', 'test@example.com', hashedPassword, 'sponsor']
    );
    testUser = {
      id: result.insertId,
      email: 'test@example.com',
      password: 'testpassword123'
    };
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'New User',
          email: 'new@example.com',
          password: 'password123',
          role: 'sponsor'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', 'new@example.com');
    });

    it('should not register user with existing email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          role: 'sponsor'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'Email already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login existing user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', testUser.email);
    });

    it('should not login with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Invalid credentials');
    });
  });
}); 