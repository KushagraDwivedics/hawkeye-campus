const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const attendanceController = require('../controllers/attendanceController');

// Mark Attendance (Students)
router.post('/mark', verifyToken, attendanceController.markAttendance);

// Get Attendance Records (Students & Faculty)
router.get('/records', verifyToken, attendanceController.getRecords);

module.exports = router;
