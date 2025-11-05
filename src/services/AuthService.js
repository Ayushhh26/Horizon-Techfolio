/**
 * Authentication Service
 * Handles JWT token generation and verification
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'horizontrader-secret-key-change-in-production';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d'; // 7 days default

class AuthService {
  /**
   * Generate JWT token for user
   * @param {string} userId - User ID
   * @param {string} name - User name
   * @returns {string} JWT token
   */
  static generateToken(userId, name) {
    const payload = {
      userId,
      name,
      iat: Math.floor(Date.now() / 1000) // Issued at
    };

    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRY
    });
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token to verify
   * @returns {Object|null} Decoded token payload or null if invalid
   */
  static verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return null;
    }
  }

  /**
   * Extract token from Authorization header
   * @param {string} authHeader - Authorization header value
   * @returns {string|null} Token or null
   */
  static extractTokenFromHeader(authHeader) {
    if (!authHeader) {
      return null;
    }

    // Support both "Bearer <token>" and just "<token>"
    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      return parts[1];
    } else if (parts.length === 1) {
      return parts[0];
    }

    return null;
  }

  /**
   * Verify request authentication
   * @param {Object} req - HTTP request object
   * @returns {Object|null} Decoded token or null if not authenticated
   */
  static verifyRequest(req) {
    const authHeader = req.headers.authorization || req.headers['x-auth-token'];
    const token = this.extractTokenFromHeader(authHeader);

    if (!token) {
      return null;
    }

    return this.verifyToken(token);
  }
}

module.exports = AuthService;

