const db = require('../config/database');

class Student {
  static async create(userId, fullName, rollNumber, departmentId, sectionId, semesterId) {
    const query = `
      INSERT INTO students (
        user_id, full_name, roll_number, department_id, section_id, semester_id
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const result = await db.query(query, [
      userId,
      fullName,
      rollNumber,
      departmentId,
      sectionId,
      semesterId
    ]);
    return result.rows[0];
  }

  static async findByUserId(userId) {
    const query = `
      SELECT s.*, d.name as department_name, sec.name as section_name, u.email
      FROM students s
      JOIN departments d ON s.department_id = d.id
      JOIN sections sec ON s.section_id = sec.id
      JOIN users u ON s.user_id = u.id
      WHERE s.user_id = $1
    `;
    const result = await db.query(query, [userId]);
    return result.rows[0];
  }

  static async findByRollNumber(rollNumber) {
    const query = 'SELECT * FROM students WHERE roll_number = $1';
    const result = await db.query(query, [rollNumber]);
    return result.rows[0];
  }

  static async findById(studentId) {
    const query = `
      SELECT s.*, d.name as department_name, sec.name as section_name, u.email
      FROM students s
      JOIN departments d ON s.department_id = d.id
      JOIN sections sec ON s.section_id = sec.id
      JOIN users u ON s.user_id = u.id
      WHERE s.id = $1
    `;
    const result = await db.query(query, [studentId]);
    return result.rows[0];
  }

  static async updateLocation(studentId, latitude, longitude) {
    const query = `
      UPDATE students 
      SET current_location_lat = $1, current_location_lon = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;
    const result = await db.query(query, [latitude, longitude, studentId]);
    return result.rows[0];
  }

  static async updateProfile(studentId, updates) {
    const allowedFields = ['full_name', 'phone', 'date_of_birth', 'gender'];
    const keys = Object.keys(updates).filter(k => allowedFields.includes(k));
    
    if (keys.length === 0) return null;

    const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
    const values = keys.map(k => updates[k]);
    values.push(studentId);

    const query = `
      UPDATE students 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${keys.length + 1}
      RETURNING *
    `;
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async getStudentsBySection(sectionId) {
    const query = `
      SELECT s.*, u.email, d.name as department_name
      FROM students s
      JOIN users u ON s.user_id = u.id
      JOIN departments d ON s.department_id = d.id
      WHERE s.section_id = $1
      ORDER BY s.full_name
    `;
    const result = await db.query(query, [sectionId]);
    return result.rows;
  }
}

module.exports = Student;
