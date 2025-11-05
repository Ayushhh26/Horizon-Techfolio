/**
 * Integration Tests for Portfolio Routes
 * Tests portfolio endpoints using supertest
 */

const request = require('supertest');
const app = require('../../src/app');
const DBService = require('../../src/db/dbService');

describe('Portfolio Routes Integration Tests', () => {
  let testUserId;
  let testPortfolioId;

  beforeAll(async () => {
    // Create a test user
    testUserId = `test_user_${Date.now()}`;
    await DBService.saveUser(testUserId, {
      userId: testUserId,
      name: 'Test User',
      email: 'test@example.com'
    }, 'testpassword123');
  });

  describe('POST /portfolio/initialize', () => {
    it('should create a new portfolio with valid data', async () => {
      const response = await request(app)
        .post('/portfolio/initialize')
        .send({
          userId: testUserId,
          tickers: ['AAPL', 'MSFT'],
          horizon: 2
        })
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toBeDefined();
      expect(response.body.portfolioId).toBeDefined();
      expect(response.body.horizon).toBe(2);
      expect(response.body.securities).toBeDefined();
      
      testPortfolioId = response.body.portfolioId;
    });

    it('should return 400 when userId is missing', async () => {
      const response = await request(app)
        .post('/portfolio/initialize')
        .send({
          tickers: ['AAPL'],
          horizon: 1
        })
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    it('should return 400 when tickers array is empty', async () => {
      const response = await request(app)
        .post('/portfolio/initialize')
        .send({
          userId: testUserId,
          tickers: [],
          horizon: 1
        })
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    it('should return 400 when horizon is invalid', async () => {
      const response = await request(app)
        .post('/portfolio/initialize')
        .send({
          userId: testUserId,
          tickers: ['AAPL'],
          horizon: 10
        })
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    it('should return 400 when tickers exceed maximum', async () => {
      const tickers = Array(21).fill('AAPL');
      const response = await request(app)
        .post('/portfolio/initialize')
        .send({
          userId: testUserId,
          tickers,
          horizon: 1
        })
        .expect(400);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /portfolio/:id/signals', () => {
    it('should return signals for valid portfolio', async () => {
      if (!testPortfolioId) {
        pending('No test portfolio created');
        return;
      }

      const response = await request(app)
        .get(`/portfolio/${testPortfolioId}/signals`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.portfolioId).toBe(testPortfolioId);
      expect(response.body.signals).toBeDefined();
      expect(Array.isArray(response.body.signals)).toBe(true);
    });

    it('should return 500 for non-existent portfolio', async () => {
      const response = await request(app)
        .get('/portfolio/nonexistent123/signals')
        .expect(500);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /portfolio/:id/strategy', () => {
    it('should return strategy recommendation for valid portfolio', async () => {
      if (!testPortfolioId) {
        pending('No test portfolio created');
        return;
      }

      const response = await request(app)
        .get(`/portfolio/${testPortfolioId}/strategy`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.portfolioId).toBe(testPortfolioId);
      expect(response.body.strategy).toBeDefined();
      expect(response.body.recommendation).toBeDefined();
    });
  });

  describe('GET /portfolio/:id/performance', () => {
    it('should return performance metrics for valid portfolio', async () => {
      if (!testPortfolioId) {
        pending('No test portfolio created');
        return;
      }

      const response = await request(app)
        .get(`/portfolio/${testPortfolioId}/performance`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.portfolioId).toBe(testPortfolioId);
    });
  });
});

