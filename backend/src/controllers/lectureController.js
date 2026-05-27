const { Lecture, LectureSession } = require('../models');
const { generateQRCode, generateSessionToken } = require('../utils/qrcode');
const db = require('../config/database');

class LectureController {
  // Create Lecture
  static async createLecture(req, res) {
    try {
      const userId = req.user.userId;
      const lectureData = req.body;

      // Get faculty ID
      const facultyQuery = 'SELECT id FROM faculty WHERE user_id = $1';
      const facultyResult = await db.query(facultyQuery, [userId]);
      if (facultyResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Faculty not found'
        });
      }
      const facultyId = facultyResult.rows[0].id;

      // Create lecture
      const lecture = await Lecture.create({
        ...lectureData,
        facultyId
      });

      res.status(201).json({
        success: true,
        message: 'Lecture created successfully',
        data: lecture
      });
    } catch (error) {
      console.error('Create lecture error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create lecture'
      });
    }
  }

  // Get Lectures
  static async getLectures(req, res) {
    try {
      const userId = req.user.userId;

      // Get faculty ID
      const facultyQuery = 'SELECT id FROM faculty WHERE user_id = $1';
      const facultyResult = await db.query(facultyQuery, [userId]);
      if (facultyResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Faculty not found'
        });
      }
      const facultyId = facultyResult.rows[0].id;

      const lectures = await Lecture.findByFaculty(facultyId);

      res.json({
        success: true,
        data: lectures
      });
    } catch (error) {
      console.error('Get lectures error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch lectures'
      });
    }
  }

  // Get Lecture Details
  static async getLectureDetails(req, res) {
    try {
      const { id } = req.params;

      const lecture = await Lecture.findById(id);
      if (!lecture) {
        return res.status(404).json({
          success: false,
          message: 'Lecture not found'
        });
      }

      res.json({
        success: true,
        data: lecture
      });
    } catch (error) {
      console.error('Get lecture details error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch lecture'
      });
    }
  }

  // Update Lecture
  static async updateLecture(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const lecture = await Lecture.update(id, updates);
      if (!lecture) {
        return res.status(404).json({
          success: false,
          message: 'Lecture not found'
        });
      }

      res.json({
        success: true,
        message: 'Lecture updated successfully',
        data: lecture
      });
    } catch (error) {
      console.error('Update lecture error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update lecture'
      });
    }
  }

  // Delete Lecture
  static async deleteLecture(req, res) {
    try {
      const { id } = req.params;

      await Lecture.delete(id);

      res.json({
        success: true,
        message: 'Lecture deleted successfully'
      });
    } catch (error) {
      console.error('Delete lecture error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete lecture'
      });
    }
  }

  // Start Attendance Session
  static async startAttendanceSession(req, res) {
    try {
      const { id } = req.params;

      const lecture = await Lecture.findById(id);
      if (!lecture) {
        return res.status(404).json({
          success: false,
          message: 'Lecture not found'
        });
      }

      // Generate session token
      const sessionToken = generateSessionToken();

      // Calculate expiry time (attendance window end)
      const [hours, minutes, seconds] = lecture.attendance_window_end.split(':');
      const expiryTime = new Date();
      expiryTime.setHours(parseInt(hours), parseInt(minutes), parseInt(seconds));

      // Generate QR code
      const qrResult = await generateQRCode(
        id,
        sessionToken,
        expiryTime.toISOString()
      );

      if (!qrResult.success) {
        return res.status(500).json({
          success: false,
          message: 'Failed to generate QR code'
        });
      }

      // Create session in database
      const session = await LectureSession.create(
        id,
        sessionToken,
        qrResult.qrCode,
        expiryTime
      );

      res.json({
        success: true,
        message: 'Attendance session started',
        data: {
          sessionId: session.id,
          sessionToken: session.session_token,
          qrCode: session.qr_code_image,
          expiresAt: session.session_ends_at
        }
      });
    } catch (error) {
      console.error('Start attendance session error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to start attendance session'
      });
    }
  }

  // End Attendance Session
  static async endAttendanceSession(req, res) {
    try {
      const { id } = req.params;

      const session = await LectureSession.endSession(id);
      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found'
        });
      }

      res.json({
        success: true,
        message: 'Attendance session ended'
      });
    } catch (error) {
      console.error('End attendance session error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to end attendance session'
      });
    }
  }

  // Get QR Code
  static async getQRCode(req, res) {
    try {
      const { id } = req.params;

      const sessionQuery = `
        SELECT * FROM lecture_sessions
        WHERE lecture_id = $1 AND is_active = true
      `;
      const sessionResult = await db.query(sessionQuery, [id]);

      if (sessionResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No active session for this lecture'
        });
      }

      const session = sessionResult.rows[0];

      res.json({
        success: true,
        data: {
          qrCode: session.qr_code_image,
          expiresAt: session.session_ends_at
        }
      });
    } catch (error) {
      console.error('Get QR code error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch QR code'
      });
    }
  }
}

module.exports = LectureController;
