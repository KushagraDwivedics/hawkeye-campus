const db = require('../config/database');

class Lecture {
  static async create(lectureData) {
    const query = `
      INSERT INTO lectures (
        subject_id, faculty_id, section_id, lecture_date,
        start_time, end_time, attendance_window_start, attendance_window_end,
        geo_latitude, geo_longitude, geo_radius
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    const values = [
      lectureData.subjectId,
      lectureData.facultyId,
      lectureData.sectionId,
      lectureData.lectureDate,
      lectureData.startTime,
      lectureData.endTime,
      lectureData.attendanceWindowStart,
      lectureData.attendanceWindowEnd,
      lectureData.geoLatitude,
      lectureData.geoLongitude,
      lectureData.geoRadius
    ];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async findById(lectureId) {
    const query = `
      SELECT l.*, s.name as subject_name, f.faculty_name, sec.name as section_name
      FROM lectures l
      JOIN subjects s ON l.subject_id = s.id
      JOIN faculty f ON l.faculty_id = f.id
      JOIN sections sec ON l.section_id = sec.id
      WHERE l.id = $1
    `;
    const result = await db.query(query, [lectureId]);
    return result.rows[0];
  }

  static async findByFaculty(facultyId) {
    const query = `
      SELECT l.*, s.name as subject_name, sec.name as section_name
      FROM lectures l
      JOIN subjects s ON l.subject_id = s.id
      JOIN sections sec ON l.section_id = sec.id
      WHERE l.faculty_id = $1
      ORDER BY l.lecture_date DESC, l.start_time DESC
    `;
    const result = await db.query(query, [facultyId]);
    return result.rows;
  }

  static async findBySection(sectionId) {
    const query = `
      SELECT l.*, s.name as subject_name, f.faculty_name
      FROM lectures l
      JOIN subjects s ON l.subject_id = s.id
      JOIN faculty f ON l.faculty_id = f.id
      WHERE l.section_id = $1
      ORDER BY l.lecture_date DESC, l.start_time DESC
    `;
    const result = await db.query(query, [sectionId]);
    return result.rows;
  }

  static async findUpcoming(sectionId, limit = 10) {
    const query = `
      SELECT l.*, s.name as subject_name, f.faculty_name
      FROM lectures l
      JOIN subjects s ON l.subject_id = s.id
      JOIN faculty f ON l.faculty_id = f.id
      WHERE l.section_id = $1 AND l.lecture_date >= CURRENT_DATE
      ORDER BY l.lecture_date ASC, l.start_time ASC
      LIMIT $2
    `;
    const result = await db.query(query, [sectionId, limit]);
    return result.rows;
  }

  static async update(lectureId, updates) {
    const allowedFields = [
      'lecture_date', 'start_time', 'end_time',
      'attendance_window_start', 'attendance_window_end',
      'geo_latitude', 'geo_longitude', 'geo_radius'
    ];
    const keys = Object.keys(updates).filter(k => allowedFields.includes(k));
    
    if (keys.length === 0) return null;

    const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
    const values = keys.map(k => updates[k]);
    values.push(lectureId);

    const query = `
      UPDATE lectures 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${keys.length + 1}
      RETURNING *
    `;
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async delete(lectureId) {
    const query = 'DELETE FROM lectures WHERE id = $1 RETURNING id';
    const result = await db.query(query, [lectureId]);
    return result.rows[0];
  }
}

module.exports = Lecture;
