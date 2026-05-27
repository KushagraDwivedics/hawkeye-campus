const { Student, Lecture, Attendance } = require('../models');
const db = require('../config/database');

class StudentController {
  // Get Dashboard
  static async getDashboard(req, res) {
    try {
      const userId = req.user.userId;

      // Get student details
      const student = await Student.findByUserId(userId);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      // Get overall attendance percentage
      const attendanceStats = await Attendance.getStudentAttendancePercentage(student.id);

      // Get subject-wise attendance
      const subjectWiseQuery = `
        SELECT 
          s.id,
          s.code,
          s.name,
          COUNT(a.id) as total_lectures,
          SUM(CASE WHEN a.status IN ('present', 'late') THEN 1 ELSE 0 END) as present_count,
          ROUND(100.0 * SUM(CASE WHEN a.status IN ('present', 'late') THEN 1 ELSE 0 END) / NULLIF(COUNT(a.id), 0), 2) as attendance_percentage
        FROM subjects s
        LEFT JOIN lectures l ON s.id = l.subject_id AND l.section_id = $1
        LEFT JOIN attendance a ON l.id = a.lecture_id AND a.student_id = $2
        WHERE s.semester_id = $3 AND s.department_id = $4
        GROUP BY s.id, s.code, s.name
      `;
      const subjectWiseResult = await db.query(subjectWiseQuery, [
        student.section_id,
        student.id,
        student.semester_id,
        student.department_id
      ]);

      // Get recent attendance history (last 5)
      const recentAttendanceQuery = `
        SELECT a.*, l.lecture_date, l.start_time, s.name as subject_name
        FROM attendance a
        JOIN lectures l ON a.lecture_id = l.id
        JOIN subjects s ON l.subject_id = s.id
        WHERE a.student_id = $1
        ORDER BY l.lecture_date DESC, l.start_time DESC
        LIMIT 5
      `;
      const recentAttendanceResult = await db.query(recentAttendanceQuery, [student.id]);

      res.json({
        success: true,
        data: {
          student: {
            fullName: student.full_name,
            rollNumber: student.roll_number,
            department: student.department_name,
            section: student.section_name
          },
          overallAttendance: {
            totalLectures: attendanceStats.total_lectures || 0,
            presentCount: attendanceStats.present_count || 0,
            absentCount: attendanceStats.absent_count || 0,
            attendancePercentage: parseFloat(attendanceStats.attendance_percentage) || 0
          },
          subjectWiseAttendance: subjectWiseResult.rows,
          recentAttendance: recentAttendanceResult.rows
        }
      });
    } catch (error) {
      console.error('Get dashboard error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard'
      });
    }
  }

  // Get Profile
  static async getProfile(req, res) {
    try {
      const userId = req.user.userId;

      const student = await Student.findByUserId(userId);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      res.json({
        success: true,
        data: {
          id: student.id,
          fullName: student.full_name,
          email: student.user_id, // You'll need to join users table
          rollNumber: student.roll_number,
          department: student.department_name,
          section: student.section_name,
          phone: student.phone,
          dateOfBirth: student.date_of_birth,
          gender: student.gender
        }
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch profile'
      });
    }
  }

  // Update Profile
  static async updateProfile(req, res) {
    try {
      const userId = req.user.userId;
      const student = await Student.findByUserId(userId);

      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      const updatedStudent = await Student.updateProfile(student.id, req.body);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedStudent
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update profile'
      });
    }
  }

  // Mark Attendance
  static async markAttendance(req, res) {
    try {
      const userId = req.user.userId;
      const { lectureId, latitude, longitude, sessionToken } = req.body;

      // Get student
      const student = await Student.findByUserId(userId);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      // Get lecture details
      const lecture = await Lecture.findById(lectureId);
      if (!lecture) {
        return res.status(404).json({
          success: false,
          message: 'Lecture not found'
        });
      }

      // Check if lecture section matches student section
      if (lecture.section_id !== student.section_id) {
        return res.status(403).json({
          success: false,
          message: 'This lecture is not for your section'
        });
      }

      // Validate session token and check expiry
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

      // Check if current time is within attendance window
      const now = new Date();
      const currentTime = now.toTimeString().split(' ')[0];
      
      if (currentTime < lecture.attendance_window_start || currentTime > lecture.attendance_window_end) {
        return res.status(400).json({
          success: false,
          message: 'Attendance window is closed'
        });
      }

      // Calculate distance using Haversine formula
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

      // Determine status
      let status = 'absent';
      if (withinRadius) {
        status = 'present';
      }

      // Mark attendance
      const attendance = await Attendance.markAttendance(
        lectureId,
        student.id,
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
        message: status === 'present' ? 'Attendance marked as present' : 'You are outside the geo-radius. Attendance marked as absent.',
        data: {
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

  // Get Attendance History
  static async getAttendanceHistory(req, res) {
    try {
      const userId = req.user.userId;
      const { subjectId, fromDate, toDate } = req.query;

      const student = await Student.findByUserId(userId);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      const history = await Attendance.getAttendanceHistory(
        student.id,
        subjectId || null,
        fromDate || null,
        toDate || null
      );

      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      console.error('Get attendance history error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch attendance history'
      });
    }
  }
}

module.exports = StudentController;
