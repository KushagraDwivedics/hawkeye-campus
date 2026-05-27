const db = require('../config/database');

class LectureSession {
  static async create(lectureId, sessionToken, qrCodeImage, expiryTime) {
    const query = `
      INSERT INTO lecture_sessions (lecture_id, session_token, qr_code_image, session_ends_at)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await db.query(query, [
      lectureId,
      sessionToken,
      qrCodeImage,
      expiryTime
    ]);
    return result.rows[0];
  }

  static async findByLectureId(lectureId) {
    const query = `
      SELECT * FROM lecture_sessions
      WHERE lecture_id = $1 AND is_active = true
    `;
    const result = await db.query(query, [lectureId]);
    return result.rows[0];
  }

  static async findBySessionToken(sessionToken) {
    const query = `
      SELECT ls.*, l.geo_latitude, l.geo_longitude, l.geo_radius
      FROM lecture_sessions ls
      JOIN lectures l ON ls.lecture_id = l.id
      WHERE ls.session_token = $1 AND ls.is_active = true
    `;
    const result = await db.query(query, [sessionToken]);
    return result.rows[0];
  }

  static async endSession(lectureId) {
    const query = `
      UPDATE lecture_sessions
      SET is_active = false
      WHERE lecture_id = $1 AND is_active = true
      RETURNING *
    `;
    const result = await db.query(query, [lectureId]);
    return result.rows[0];
  }

  static async isSessionValid(sessionToken) {
    const query = `
      SELECT * FROM lecture_sessions
      WHERE session_token = $1 
        AND is_active = true 
        AND session_ends_at > CURRENT_TIMESTAMP
    `;
    const result = await db.query(query, [sessionToken]);
    return result.rows.length > 0;
  }

  static async cleanupExpiredSessions() {
    const query = `
      UPDATE lecture_sessions
      SET is_active = false
      WHERE session_ends_at < CURRENT_TIMESTAMP AND is_active = true
    `;
    await db.query(query);
  }
}

module.exports = LectureSession;
