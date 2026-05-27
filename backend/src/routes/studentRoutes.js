const express = require('express');
const router = express.Router();
const { verifyToken, verifyStudent } = require('../middleware/auth');
const studentController = require('../controllers/studentController');

// Protected Routes
router.use(verifyToken, verifyStudent);

// Dashboard
router.get('/dashboard', studentController.getDashboard);

// Profile
router.get('/profile', studentController.getProfile);
router.put('/profile', studentController.updateProfile);

// Attendance
router.post('/attendance/mark', studentController.markAttendance);
router.get('/attendance/history', studentController.getAttendanceHistory);

module.exports = router;
