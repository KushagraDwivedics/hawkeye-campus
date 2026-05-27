const express = require('express');
const router = express.Router();
const { verifyToken, verifyFaculty } = require('../middleware/auth');
const lectureController = require('../controllers/lectureController');

// Public Routes
router.get('/:id', lectureController.getLectureDetails);

// Protected Routes (Faculty Only)
router.post('/', verifyToken, verifyFaculty, lectureController.createLecture);
router.get('/', verifyToken, verifyFaculty, lectureController.getLectures);
router.put('/:id', verifyToken, verifyFaculty, lectureController.updateLecture);
router.delete('/:id', verifyToken, verifyFaculty, lectureController.deleteLecture);

// Attendance Session
router.post('/:id/start-session', verifyToken, verifyFaculty, lectureController.startAttendanceSession);
router.post('/:id/end-session', verifyToken, verifyFaculty, lectureController.endAttendanceSession);
router.get('/:id/qr-code', verifyToken, lectureController.getQRCode);

module.exports = router;
