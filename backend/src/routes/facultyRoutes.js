const express = require('express');
const router = express.Router();
const { verifyToken, verifyFaculty } = require('../middleware/auth');
const facultyController = require('../controllers/facultyController');

// Protected Routes
router.use(verifyToken, verifyFaculty);

// Dashboard
router.get('/dashboard', facultyController.getDashboard);

// Student Management
router.get('/students', facultyController.getStudents);
router.get('/students/:id', facultyController.getStudentDetails);

// Attendance Management
router.get('/attendance/records', facultyController.getAttendanceRecords);
router.put('/attendance/modify/:id', facultyController.modifyAttendance);
router.get('/attendance/export', facultyController.exportAttendance);

module.exports = router;
