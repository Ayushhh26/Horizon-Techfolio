/**
 * Integration Tests for Auth Routes
 * Tests authentication and user endpoints using supertest
 */

const request = require('supertest');
const app = require('../../src/app');

describe('Authentication Routes Integration Tests', () => {
  let testUserId;
  let authToken;

  beforeAll(() => {
    testUserId = `test_auth_user_${Date.now()}`;
  });

  describe('POST /user', () => {
    it('should create a new user with valid data', async () => {
      const response = await request(app)
        .post('/user')
        .send({
          userId: testUserId,
          name: 'Test Auth User',
          email: 'auth@example.com',
          password: 'securepass123'
        })
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toBeDefined();
      expect(response.body.userId).toBe(testUserId);
      expect(response.body.name).toBe('Test Auth User');
      expect(response.body.email).toBe('auth@example.com');
      expect(response.body.passwordHash).toBeUndefined(); // Should not return password hash
    });

    it('should return 400 when userId is missing', async () => {
      const response = await request(app)
        .post('/user')
        .send({
          name: 'Test User'
        })
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    it('should return 400 when userId is too short', async () => {
      const response = await request(app)
        .post('/user')
        .send({
          userId: 'ab',
          name: 'Test User'
        })
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    it('should return 400 when name is missing', async () => {
      const response = await request(app)
        .post('/user')
        .send({
          userId: 'testuser123'
        })
        .expect(400);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('POST /auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          userId: testUserId,
          password: 'securepass123'
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.token).toBeDefined();
      expect(response.body.userId).toBe(testUserId);
      
      authToken = response.body.token;
    });

    it('should return 401 with invalid password', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          userId: testUserId,
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.error).toBeDefined();
    });

    it('should return 401 with non-existent user', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          userId: 'nonexistentuser',
          password: 'anypassword'
        })
        .expect(401);

      expect(response.body.error).toBeDefined();
    });

    it('should return 400 when userId is missing', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          password: 'password123'
        })
        .expect(400);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('POST /auth/verify', () => {
    it('should verify valid token', async () => {
      if (!authToken) {
        pending('No auth token available');
        return;
      }

      const response = await request(app)
        .post('/auth/verify')
        .send({
          token: authToken
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.valid).toBe(true);
      expect(response.body.userId).toBe(testUserId);
    });

    it('should return 401 for invalid token', async () => {
      const response = await request(app)
        .post('/auth/verify')
        .send({
          token: 'invalid.token.here'
        })
        .expect(401);

      expect(response.body.error).toBeDefined();
    });

    it('should return 400 when token is missing', async () => {
      const response = await request(app)
        .post('/auth/verify')
        .send({})
        .expect(400);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /user/:userId/portfolios', () => {
    it('should return portfolios for valid user', async () => {
      const response = await request(app)
        .get(`/user/${testUserId}/portfolios`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.userId).toBe(testUserId);
      expect(response.body.portfolios).toBeDefined();
      expect(Array.isArray(response.body.portfolios)).toBe(true);
    });

    it('should return empty array for user with no portfolios', async () => {
      const newUserId = `no_portfolio_user_${Date.now()}`;
      
      // Create user first
      await request(app)
        .post('/user')
        .send({
          userId: newUserId,
          name: 'No Portfolio User'
        });

      const response = await request(app)
        .get(`/user/${newUserId}/portfolios`)
        .expect(200);

      expect(response.body.portfolios).toEqual([]);
      expect(response.body.count).toBe(0);
    });
  });
});

