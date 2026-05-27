const { Faculty, Lecture, Attendance, Student } = require('../models');
const ExcelJS = require('exceljs');
const db = require('../config/database');

class FacultyController {
  // Get Dashboard
  static async getDashboard(req, res) {
    try {
      const userId = req.user.userId;

      // Get faculty details
      const faculty = await Faculty.findByUserId(userId);
      if (!faculty) {
        return res.status(404).json({
          success: false,
          message: 'Faculty not found'
        });
      }

      // Get lecture statistics
      const lecturesQuery = `
        SELECT 
          COUNT(*) as total_lectures,
          COUNT(DISTINCT subject_id) as subjects_taught,
          COUNT(DISTINCT section_id) as sections_taught
        FROM lectures
        WHERE faculty_id = $1
      `;
      const lecturesResult = await db.query(lecturesQuery, [faculty.id]);

      // Get attendance statistics
      const attendanceQuery = `
        SELECT 
          COUNT(*) as total_attendance_records,
          SUM(CASE WHEN status IN ('present', 'late') THEN 1 ELSE 0 END) as present_count,
          SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_count,
          ROUND(100.0 * SUM(CASE WHEN status IN ('present', 'late') THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0), 2) as average_attendance
        FROM lectures l
        JOIN attendance a ON l.id = a.lecture_id
        WHERE l.faculty_id = $1
      `;
      const attendanceResult = await db.query(attendanceQuery, [faculty.id]);

      // Get recent lectures
      const recentLecturesQuery = `
        SELECT l.*, s.name as subject_name, sec.name as section_name
        FROM lectures l
        JOIN subjects s ON l.subject_id = s.id
        JOIN sections sec ON l.section_id = sec.id
        WHERE l.faculty_id = $1
        ORDER BY l.lecture_date DESC, l.start_time DESC
        LIMIT 5
      `;
      const recentLecturesResult = await db.query(recentLecturesQuery, [faculty.id]);

      res.json({
        success: true,
        data: {
          faculty: {
            facultyName: faculty.faculty_name,
            facultyCode: faculty.faculty_code,
            department: faculty.department_name
          },
          statistics: {
            totalLectures: parseInt(lecturesResult.rows[0].total_lectures) || 0,
            subjectsTaught: parseInt(lecturesResult.rows[0].subjects_taught) || 0,
            sectionsTaught: parseInt(lecturesResult.rows[0].sections_taught) || 0,
            totalAttendanceRecords: parseInt(attendanceResult.rows[0].total_attendance_records) || 0,
            presentCount: parseInt(attendanceResult.rows[0].present_count) || 0,
            absentCount: parseInt(attendanceResult.rows[0].absent_count) || 0,
            averageAttendance: parseFloat(attendanceResult.rows[0].average_attendance) || 0
          },
          recentLectures: recentLecturesResult.rows
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

  // Get Students
  static async getStudents(req, res) {
    try {
      const userId = req.user.userId;
      const { sectionId, search } = req.query;

      const faculty = await Faculty.findByUserId(userId);
      if (!faculty) {
        return res.status(404).json({
          success: false,
          message: 'Faculty not found'
        });
      }

      let query = `
        SELECT s.id, s.full_name, s.roll_number, s.user_id, sec.name as section_name, u.email
        FROM students s
        JOIN sections sec ON s.section_id = sec.id
        JOIN users u ON s.user_id = u.id
        WHERE sec.department_id = $1
      `;
      const params = [faculty.department_id];
      let paramIndex = 2;

      if (sectionId) {
        query += ` AND s.section_id = $${paramIndex}`;
        params.push(sectionId);
        paramIndex++;
      }

      if (search) {
        query += ` AND (s.full_name ILIKE $${paramIndex} OR s.roll_number ILIKE $${paramIndex})`;
        params.push(`%${search}%`);
        paramIndex++;
      }

      query += ` ORDER BY s.full_name`;

      const result = await db.query(query, params);

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Get students error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch students'
      });
    }
  }

  // Get Student Details
  static async getStudentDetails(req, res) {
    try {
      const { id } = req.params;

      const student = await Student.findById(id);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      // Get attendance stats
      const statsQuery = `
        SELECT 
          COUNT(*) as total_lectures,
          SUM(CASE WHEN status IN ('present', 'late') THEN 1 ELSE 0 END) as present_count,
          SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_count,
          ROUND(100.0 * SUM(CASE WHEN status IN ('present', 'late') THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0), 2) as attendance_percentage
        FROM attendance
        WHERE student_id = $1
      `;
      const statsResult = await db.query(statsQuery, [id]);

      res.json({
        success: true,
        data: {
          student,
          statistics: statsResult.rows[0]
        }
      });
    } catch (error) {
      console.error('Get student details error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch student details'
      });
    }
  }

  // Get Attendance Records
  static async getAttendanceRecords(req, res) {
    try {
      const userId = req.user.userId;
      const { lectureId, sectionId, subjectId, status, search } = req.query;

      const faculty = await Faculty.findByUserId(userId);
      if (!faculty) {
        return res.status(404).json({
          success: false,
          message: 'Faculty not found'
        });
      }

      let query = `
        SELECT a.*, l.lecture_date, l.start_time, s.name as subject_name, st.full_name, st.roll_number
        FROM attendance a
        JOIN lectures l ON a.lecture_id = l.id
        JOIN subjects s ON l.subject_id = s.id
        JOIN students st ON a.student_id = st.id
        WHERE l.faculty_id = $1
      `;
      const params = [faculty.id];
      let paramIndex = 2;

      if (lectureId) {
        query += ` AND l.id = $${paramIndex}`;
        params.push(lectureId);
        paramIndex++;
      }

      if (sectionId) {
        query += ` AND l.section_id = $${paramIndex}`;
        params.push(sectionId);
        paramIndex++;
      }

      if (subjectId) {
        query += ` AND l.subject_id = $${paramIndex}`;
        params.push(subjectId);
        paramIndex++;
      }

      if (status) {
        query += ` AND a.status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }

      if (search) {
        query += ` AND (st.full_name ILIKE $${paramIndex} OR st.roll_number ILIKE $${paramIndex})`;
        params.push(`%${search}%`);
        paramIndex++;
      }

      query += ` ORDER BY l.lecture_date DESC, l.start_time DESC`;

      const result = await db.query(query, params);

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Get attendance records error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch attendance records'
      });
    }
  }

  // Modify Attendance
  static async modifyAttendance(req, res) {
    try {
      const userId = req.user.userId;
      const { id } = req.params;
      const { newStatus, reason } = req.body;

      if (!newStatus || !reason) {
        return res.status(400).json({
          success: false,
          message: 'New status and reason are required'
        });
      }

      // Get attendance record
      const attendanceQuery = 'SELECT * FROM attendance WHERE id = $1';
      const attendanceResult = await db.query(attendanceQuery, [id]);
      if (attendanceResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Attendance record not found'
        });
      }

      const attendance = attendanceResult.rows[0];

      // Check if modification is within allowed window (3 days)
      const lectureDate = new Date(attendance.created_at);
      const now = new Date();
      const daysDiff = Math.floor((now - lectureDate) / (1000 * 60 * 60 * 24));

      if (daysDiff > parseInt(process.env.ATTENDANCE_MOD_WINDOW || 3)) {
        return res.status(400).json({
          success: false,
          message: `Attendance can only be modified within ${process.env.ATTENDANCE_MOD_WINDOW || 3} days`
        });
      }

      // Modify attendance
      const updatedAttendance = await Attendance.modifyAttendance(
        id,
        newStatus,
        userId,
        reason
      );

      res.json({
        success: true,
        message: 'Attendance modified successfully',
        data: updatedAttendance
      });
    } catch (error) {
      console.error('Modify attendance error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to modify attendance'
      });
    }
  }

  // Export Attendance
  static async exportAttendance(req, res) {
    try {
      const userId = req.user.userId;
      const { lectureId, format } = req.query;

      const faculty = await Faculty.findByUserId(userId);
      if (!faculty) {
        return res.status(404).json({
          success: false,
          message: 'Faculty not found'
        });
      }

      // Get attendance records
      const query = `
        SELECT a.*, l.lecture_date, l.start_time, s.name as subject_name, st.full_name, st.roll_number
        FROM attendance a
        JOIN lectures l ON a.lecture_id = l.id
        JOIN subjects s ON l.subject_id = s.id
        JOIN students st ON a.student_id = st.id
        WHERE l.faculty_id = $1 AND l.id = $2
        ORDER BY st.roll_number
      `;
      const result = await db.query(query, [faculty.id, lectureId]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No attendance records found'
        });
      }

      if (format === 'xlsx') {
        // Create Excel workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Attendance');

        // Add headers
        worksheet.columns = [
          { header: 'Roll Number', key: 'roll_number', width: 15 },
          { header: 'Student Name', key: 'full_name', width: 25 },
          { header: 'Lecture Date', key: 'lecture_date', width: 15 },
          { header: 'Subject', key: 'subject_name', width: 20 },
          { header: 'Status', key: 'status', width: 12 },
          { header: 'Marked At', key: 'marked_at', width: 20 }
        ];

        // Add rows
        result.rows.forEach(row => {
          worksheet.addRow(row);
        });

        // Send file
        res.setHeader(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
          'Content-Disposition',
          'attachment; filename=attendance.xlsx'
        );

        await workbook.xlsx.write(res);
      } else if (format === 'csv') {
        // Convert to CSV
        let csv = 'Roll Number,Student Name,Lecture Date,Subject,Status,Marked At\n';
        result.rows.forEach(row => {
          csv += `"${row.roll_number}","${row.full_name}","${row.lecture_date}","${row.subject_name}","${row.status}","${row.marked_at}"\n`;
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=attendance.csv');
        res.send(csv);
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid format. Use xlsx or csv'
        });
      }
    } catch (error) {
      console.error('Export attendance error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export attendance'
      });
    }
  }
}

module.exports = FacultyController;
