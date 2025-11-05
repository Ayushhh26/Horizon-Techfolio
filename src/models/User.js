/**
 * User - Represents an individual investor using the system
 * State: userId, name, email, passwordHash, createdAt
 * Actions: password verification
 */

class User {
  constructor(userId, name, email = null, passwordHash = null) {
    this.userId = userId; // Unique identifier
    this.name = name; // Display name
    this.email = email; // Optional contact info
    this.passwordHash = passwordHash; // Hashed password (never store plaintext)
    this.createdAt = new Date();
  }

  /**
   * Get user metadata (without sensitive data)
   * @returns {Object} User metadata
   */
  get_metadata() {
    return {
      userId: this.userId,
      name: this.name,
      email: this.email,
      createdAt: this.createdAt
    };
  }

  /**
   * Get user data for authentication (includes passwordHash)
   * @returns {Object} User data with password hash
   */
  get_auth_data() {
    return {
      userId: this.userId,
      name: this.name,
      email: this.email,
      passwordHash: this.passwordHash,
      createdAt: this.createdAt
    };
  }
}

module.exports = User;

