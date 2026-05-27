const db = require('../config/database');

class Attendance {
  static async markAttendance(lectureId, studentId, status, data = {}) {
    const query = `
      INSERT INTO attendance (
        lecture_id, student_id, status, marked_at,
        student_lat, student_lon, distance_from_venue, qr_verified
      )
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4, $5, $6, $7)
      ON CONFLICT (lecture_id, student_id) DO UPDATE SET
        status = $3,
        marked_at = CURRENT_TIMESTAMP,
        student_lat = $4,
        student_lon = $5,
        distance_from_venue = $6,
        qr_verified = $7,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    const result = await db.query(query, [
      lectureId,
      studentId,
      status,
      data.latitude,
      data.longitude,
      data.distance,
      data.qrVerified || false
    ]);
    return result.rows[0];
  }

  static async findByLectureAndStudent(lectureId, studentId) {
    const query = `
      SELECT * FROM attendance
      WHERE lecture_id = $1 AND student_id = $2
    `;
    const result = await db.query(query, [lectureId, studentId]);
    return result.rows[0];
  }

  static async findByLecture(lectureId) {
    const query = `
      SELECT a.*, s.full_name, s.roll_number
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      WHERE a.lecture_id = $1
      ORDER BY s.full_name
    `;
    const result = await db.query(query, [lectureId]);
    return result.rows;
  }

  static async findByStudent(studentId, limit = 50) {
    const query = `
      SELECT a.*, l.lecture_date, l.start_time, s.name as subject_name
      FROM attendance a
      JOIN lectures l ON a.lecture_id = l.id
      JOIN subjects s ON l.subject_id = s.id
      WHERE a.student_id = $1
      ORDER BY l.lecture_date DESC, l.start_time DESC
      LIMIT $2
    `;
    const result = await db.query(query, [studentId, limit]);
    return result.rows;
  }

  static async getStudentAttendancePercentage(studentId) {
    const query = `
      SELECT 
        COUNT(*) as total_lectures,
        SUM(CASE WHEN status IN ('present', 'late') THEN 1 ELSE 0 END) as present_count,
        ROUND(100.0 * SUM(CASE WHEN status IN ('present', 'late') THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0), 2) as attendance_percentage
      FROM attendance
      WHERE student_id = $1
    `;
    const result = await db.query(query, [studentId]);
    return result.rows[0];
  }

  static async modifyAttendance(attendanceId, newStatus, modifiedByUserId, reason) {
    const query = `
      UPDATE attendance
      SET 
        status = $2,
        modified_by = (SELECT id FROM faculty WHERE user_id = $3),
        modification_reason = $4,
        is_modified = true,
        modified_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const result = await db.query(query, [attendanceId, newStatus, modifiedByUserId, reason]);
    return result.rows[0];
  }

  static async getAttendanceHistory(studentId, subjectId = null, fromDate = null, toDate = null) {
    let query = `
      SELECT a.*, l.lecture_date, l.start_time, s.name as subject_name, s.code as subject_code
      FROM attendance a
      JOIN lectures l ON a.lecture_id = l.id
      JOIN subjects s ON l.subject_id = s.id
      WHERE a.student_id = $1
    `;
    const params = [studentId];
    let paramIndex = 2;

    if (subjectId) {
      query += ` AND l.subject_id = $${paramIndex}`;
      params.push(subjectId);
      paramIndex++;
    }

    if (fromDate) {
      query += ` AND l.lecture_date >= $${paramIndex}`;
      params.push(fromDate);
      paramIndex++;
    }

    if (toDate) {
      query += ` AND l.lecture_date <= $${paramIndex}`;
      params.push(toDate);
      paramIndex++;
    }

    query += ` ORDER BY l.lecture_date DESC, l.start_time DESC`;
    const result = await db.query(query, params);
    return result.rows;
  }
}

module.exports = Attendance;
