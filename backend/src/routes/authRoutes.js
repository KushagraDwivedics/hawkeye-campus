const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { studentSignupValidation, facultySignupValidation, loginValidation } = require('../middleware/validation');
const { verifyToken } = require('../middleware/auth');

// Student Authentication Routes
router.post('/student/signup', studentSignupValidation, authController.studentSignup);
router.post('/student/login', loginValidation, authController.studentLogin);

// Faculty Authentication Routes
router.post('/faculty/signup', facultySignupValidation, authController.facultySignup);
router.post('/faculty/login', loginValidation, authController.facultyLogin);

// General Authentication Routes
router.post('/logout', verifyToken, authController.logout);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

module.exports = router;
