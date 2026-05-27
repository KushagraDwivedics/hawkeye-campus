const db = require('../config/database');

class User {
  static async create(email, passwordHash, role) {
    const query = `
      INSERT INTO users (email, password_hash, role)
      VALUES ($1, $2, $3)
      RETURNING id, email, role, created_at
    `;
    const result = await db.query(query, [email, passwordHash, role]);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await db.query(query, [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async updateLastLogin(userId) {
    const query = `
      UPDATE users SET last_login = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, last_login
    `;
    const result = await db.query(query, [userId]);
    return result.rows[0];
  }

  static async updatePassword(userId, newPasswordHash) {
    const query = `
      UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, email
    `;
    const result = await db.query(query, [newPasswordHash, userId]);
    return result.rows[0];
  }

  static async deactivateUser(userId) {
    const query = `
      UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, email
    `;
    const result = await db.query(query, [userId]);
    return result.rows[0];
  }
}

module.exports = User;
