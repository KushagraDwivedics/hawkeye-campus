const { User, Student, Faculty } = require('../models');
const { hashPassword, comparePassword } = require('../utils/encryption');
const { generateTokens, verifyToken } = require('../utils/jwt');
const { sendPasswordResetEmail } = require('../utils/email');
const db = require('../config/database');
const { v4: uuid } = require('uuid');

class AuthController {
  // Student Signup
  static async studentSignup(req, res) {
    try {
      const { fullName, email, rollNumber, department, section, semester, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Email already registered'
        });
      }

      // Check if roll number already exists
      const existingStudent = await Student.findByRollNumber(rollNumber);
      if (existingStudent) {
        return res.status(409).json({
          success: false,
          message: 'Roll number already registered'
        });
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      // Create user
      const user = await User.create(email, passwordHash, 'student');

      // Get or create department, section, semester IDs
      const deptResult = await db.query(
        'SELECT id FROM departments WHERE LOWER(name) = LOWER($1)',
        [department]
      );
      const departmentId = deptResult.rows[0]?.id;

      const sectionResult = await db.query(
        'SELECT id FROM sections WHERE LOWER(name) = LOWER($1)',
        [section]
      );
      const sectionId = sectionResult.rows[0]?.id;

      const semesterResult = await db.query(
        'SELECT id FROM semesters WHERE LOWER(name) = LOWER($1)',
        [semester]
      );
      const semesterId = semesterResult.rows[0]?.id;

      if (!departmentId || !sectionId || !semesterId) {
        return res.status(400).json({
          success: false,
          message: 'Invalid department, section, or semester'
        });
      }

      // Create student record
      const student = await Student.create(
        user.id,
        fullName,
        rollNumber,
        departmentId,
        sectionId,
        semesterId
      );

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user.id, 'student');

      // Save refresh token
      const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      await db.query(
        'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
        [user.id, refreshToken, expiryDate]
      );

      res.status(201).json({
        success: true,
        message: 'Student account created successfully',
        data: {
          userId: user.id,
          email: user.email,
          fullName: student.full_name,
          rollNumber: student.roll_number,
          accessToken,
          refreshToken
        }
      });
    } catch (error) {
      console.error('Student signup error:', error);
      res.status(500).json({
        success: false,
        message: 'Signup failed'
      });
    }
  }

  // Faculty Signup
  static async facultySignup(req, res) {
    try {
      const { facultyName, email, facultyCode, department, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Email already registered'
        });
      }

      // Check if faculty code already exists
      const existingFaculty = await Faculty.findByFacultyCode(facultyCode);
      if (existingFaculty) {
        return res.status(409).json({
          success: false,
          message: 'Faculty code already registered'
        });
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      // Create user
      const user = await User.create(email, passwordHash, 'faculty');

      // Get department ID
      const deptResult = await db.query(
        'SELECT id FROM departments WHERE LOWER(name) = LOWER($1)',
        [department]
      );
      const departmentId = deptResult.rows[0]?.id;

      if (!departmentId) {
        return res.status(400).json({
          success: false,
          message: 'Invalid department'
        });
      }

      // Create faculty record
      const faculty = await Faculty.create(
        user.id,
        facultyName,
        facultyCode,
        departmentId
      );

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user.id, 'faculty');

      // Save refresh token
      const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await db.query(
        'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
        [user.id, refreshToken, expiryDate]
      );

      res.status(201).json({
        success: true,
        message: 'Faculty account created successfully',
        data: {
          userId: user.id,
          email: user.email,
          facultyName: faculty.faculty_name,
          facultyCode: faculty.faculty_code,
          accessToken,
          refreshToken
        }
      });
    } catch (error) {
      console.error('Faculty signup error:', error);
      res.status(500).json({
        success: false,
        message: 'Signup failed'
      });
    }
  }

  // Student Login
  static async studentLogin(req, res) {
    try {
      const { email, password } = req.body;

      const user = await User.findByEmail(email);
      if (!user || user.role !== 'student') {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      const isPasswordValid = await comparePassword(password, user.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      if (!user.is_active) {
        return res.status(403).json({
          success: false,
          message: 'Account is deactivated'
        });
      }

      // Get student details
      const student = await Student.findByUserId(user.id);

      // Update last login
      await User.updateLastLogin(user.id);

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user.id, 'student');

      // Save refresh token
      const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await db.query(
        'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
        [user.id, refreshToken, expiryDate]
      );

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          userId: user.id,
          email: user.email,
          fullName: student.full_name,
          rollNumber: student.roll_number,
          department: student.department_name,
          section: student.section_name,
          accessToken,
          refreshToken
        }
      });
    } catch (error) {
      console.error('Student login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed'
      });
    }
  }

  // Faculty Login
  static async facultyLogin(req, res) {
    try {
      const { email, password } = req.body;

      const user = await User.findByEmail(email);
      if (!user || user.role !== 'faculty') {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      const isPasswordValid = await comparePassword(password, user.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      if (!user.is_active) {
        return res.status(403).json({
          success: false,
          message: 'Account is deactivated'
        });
      }

      // Get faculty details
      const faculty = await Faculty.findByUserId(user.id);

      // Update last login
      await User.updateLastLogin(user.id);

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user.id, 'faculty');

      // Save refresh token
      const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await db.query(
        'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
        [user.id, refreshToken, expiryDate]
      );

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          userId: user.id,
          email: user.email,
          facultyName: faculty.faculty_name,
          facultyCode: faculty.faculty_code,
          department: faculty.department_name,
          accessToken,
          refreshToken
        }
      });
    } catch (error) {
      console.error('Faculty login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed'
      });
    }
  }

  // Logout
  static async logout(req, res) {
    try {
      const userId = req.user.userId;

      // Revoke all refresh tokens
      await db.query(
        'UPDATE refresh_tokens SET is_revoked = true WHERE user_id = $1',
        [userId]
      );

      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Logout failed'
      });
    }
  }

  // Refresh Token
  static async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token is required'
        });
      }

      // Verify token
      const decoded = verifyToken(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      if (!decoded) {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token'
        });
      }

      // Check if token exists in database
      const result = await db.query(
        'SELECT * FROM refresh_tokens WHERE token = $1 AND is_revoked = false AND expires_at > CURRENT_TIMESTAMP',
        [refreshToken]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token expired or revoked'
        });
      }

      // Get user
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Generate new tokens
      const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.id, user.role);

      // Save new refresh token
      const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await db.query(
        'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
        [user.id, newRefreshToken, expiryDate]
      );

      res.json({
        success: true,
        message: 'Token refreshed',
        data: {
          accessToken,
          refreshToken: newRefreshToken
        }
      });
    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(500).json({
        success: false,
        message: 'Token refresh failed'
      });
    }
  }

  // Forgot Password
  static async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Generate reset token
      const resetToken = uuid();
      const expiryDate = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Save reset token
      await db.query(
        'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
        [user.id, resetToken, expiryDate]
      );

      // Send email
      const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
      await sendPasswordResetEmail(email, resetToken, resetLink);

      res.json({
        success: true,
        message: 'Password reset link sent to email'
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send reset email'
      });
    }
  }

  // Reset Password
  static async resetPassword(req, res) {
    try {
      const { token } = req.params;
      const { newPassword } = req.body;

      // Verify token
      const result = await db.query(
        'SELECT * FROM password_reset_tokens WHERE token = $1 AND is_used = false AND expires_at > CURRENT_TIMESTAMP',
        [token]
      );

      if (result.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired reset token'
        });
      }

      const resetToken = result.rows[0];

      // Hash new password
      const passwordHash = await hashPassword(newPassword);

      // Update user password
      await User.updatePassword(resetToken.user_id, passwordHash);

      // Mark token as used
      await db.query(
        'UPDATE password_reset_tokens SET is_used = true, used_at = CURRENT_TIMESTAMP WHERE token = $1',
        [token]
      );

      res.json({
        success: true,
        message: 'Password reset successful'
      });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({
        success: false,
        message: 'Password reset failed'
      });
    }
  }
}

module.exports = AuthController;
