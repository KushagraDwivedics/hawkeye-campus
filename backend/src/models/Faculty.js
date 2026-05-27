const db = require('../config/database');

class Faculty {
  static async create(userId, facultyName, facultyCode, departmentId) {
    const query = `
      INSERT INTO faculty (
        user_id, faculty_name, faculty_code, department_id
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await db.query(query, [
      userId,
      facultyName,
      facultyCode,
      departmentId
    ]);
    return result.rows[0];
  }

  static async findByUserId(userId) {
    const query = `
      SELECT f.*, d.name as department_name, u.email
      FROM faculty f
      JOIN departments d ON f.department_id = d.id
      JOIN users u ON f.user_id = u.id
      WHERE f.user_id = $1
    `;
    const result = await db.query(query, [userId]);
    return result.rows[0];
  }

  static async findByFacultyCode(facultyCode) {
    const query = `
      SELECT f.*, d.name as department_name, u.email
      FROM faculty f
      JOIN departments d ON f.department_id = d.id
      JOIN users u ON f.user_id = u.id
      WHERE f.faculty_code = $1
    `;
    const result = await db.query(query, [facultyCode]);
    return result.rows[0];
  }

  static async findById(facultyId) {
    const query = `
      SELECT f.*, d.name as department_name, u.email
      FROM faculty f
      JOIN departments d ON f.department_id = d.id
      JOIN users u ON f.user_id = u.id
      WHERE f.id = $1
    `;
    const result = await db.query(query, [facultyId]);
    return result.rows[0];
  }

  static async updateProfile(facultyId, updates) {
    const allowedFields = ['phone', 'office_location', 'qualifications', 'specialization'];
    const keys = Object.keys(updates).filter(k => allowedFields.includes(k));
    
    if (keys.length === 0) return null;

    const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
    const values = keys.map(k => updates[k]);
    values.push(facultyId);

    const query = `
      UPDATE faculty 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${keys.length + 1}
      RETURNING *
    `;
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async getFacultyByDepartment(departmentId) {
    const query = `
      SELECT f.*, u.email
      FROM faculty f
      JOIN users u ON f.user_id = u.id
      WHERE f.department_id = $1
      ORDER BY f.faculty_name
    `;
    const result = await db.query(query, [departmentId]);
    return result.rows;
  }

  static async verifyFaculty(facultyId) {
    const query = `
      UPDATE faculty SET is_verified = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const result = await db.query(query, [facultyId]);
    return result.rows[0];
  }
}

module.exports = Faculty;
