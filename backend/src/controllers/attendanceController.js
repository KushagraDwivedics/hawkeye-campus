const { Attendance } = require('../models');
const db = require('../config/database');

class AttendanceController {
  // Mark Attendance (Called from student endpoint)
  static async markAttendance(req, res) {
    try {
      const userId = req.user.userId;
      const { lectureId, latitude, longitude, sessionToken } = req.body;

      // Get student
      const studentQuery = 'SELECT id FROM students WHERE user_id = $1';
      const studentResult = await db.query(studentQuery, [userId]);
      if (studentResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }
      const studentId = studentResult.rows[0].id;

      // Get lecture
      const lectureQuery = 'SELECT * FROM lectures WHERE id = $1';
      const lectureResult = await db.query(lectureQuery, [lectureId]);
      if (lectureResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Lecture not found'
        });
      }
      const lecture = lectureResult.rows[0];

      // Validate session
      const sessionQuery = `
        SELECT * FROM lecture_sessions
        WHERE session_token = $1 AND lecture_id = $2 AND is_active = true AND session_ends_at > CURRENT_TIMESTAMP
      `;
      const sessionResult = await db.query(sessionQuery, [sessionToken, lectureId]);
      if (sessionResult.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired session token'
        });
      }

      // Check time window
      const now = new Date();
      const currentTime = now.toTimeString().split(' ')[0];
      if (currentTime < lecture.attendance_window_start || currentTime > lecture.attendance_window_end) {
        // Mark as absent - outside attendance window
        const attendance = await Attendance.markAttendance(
          lectureId,
          studentId,
          'absent',
          { latitude, longitude, qrVerified: true }
        );
        return res.status(400).json({
          success: false,
          message: 'Attendance window is closed',
          data: { status: 'absent' }
        });
      }

      // Check geo-radius
      const { isWithinRadius, calculateDistance } = require('../utils/distance');
      const distance = calculateDistance(
        lecture.geo_latitude,
        lecture.geo_longitude,
        latitude,
        longitude
      );

      const withinRadius = isWithinRadius(
        lecture.geo_latitude,
        lecture.geo_longitude,
        latitude,
        longitude,
        lecture.geo_radius
      );

      const status = withinRadius ? 'present' : 'absent';

      // Mark attendance
      const attendance = await Attendance.markAttendance(
        lectureId,
        studentId,
        status,
        {
          latitude,
          longitude,
          distance,
          qrVerified: true
        }
      );

      res.json({
        success: true,
        message: status === 'present' ? 'Attendance marked as present' : 'You are outside the geo-radius',
        data: {
          attendanceId: attendance.id,
          status,
          distance,
          withinRadius,
          allowedRadius: lecture.geo_radius
        }
      });
    } catch (error) {
      console.error('Mark attendance error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark attendance'
      });
    }
  }

  // Get Records
  static async getRecords(req, res) {
    try {
      const userId = req.user.userId;
      const userRole = req.user.role;

      if (userRole === 'student') {
        // Get student attendance
        const studentQuery = 'SELECT id FROM students WHERE user_id = $1';
        const studentResult = await db.query(studentQuery, [userId]);
        if (studentResult.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'Student not found'
          });
        }

        const records = await Attendance.findByStudent(studentResult.rows[0].id);
        return res.json({
          success: true,
          data: records
        });
      } else if (userRole === 'faculty') {
        // Get faculty lectures attendance
        const facultyQuery = 'SELECT id FROM faculty WHERE user_id = $1';
        const facultyResult = await db.query(facultyQuery, [userId]);
        if (facultyResult.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'Faculty not found'
          });
        }

        const lecturesQuery = `
          SELECT l.id FROM lectures l WHERE l.faculty_id = $1
        `;
        const lecturesResult = await db.query(lecturesQuery, [facultyResult.rows[0].id]);

        const allRecords = [];
        for (const lecture of lecturesResult.rows) {
          const records = await Attendance.findByLecture(lecture.id);
          allRecords.push(...records);
        }

        return res.json({
          success: true,
          data: allRecords
        });
      }

      res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    } catch (error) {
      console.error('Get records error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch records'
      });
    }
  }
}

module.exports = AttendanceController;
