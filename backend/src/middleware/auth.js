const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Verify JWT Token
const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// Verify Student Role
const verifyStudent = (req, res, next) => {
  if (req.user?.role !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Student role required.'
    });
  }
  next();
};

// Verify Faculty Role
const verifyFaculty = (req, res, next) => {
  if (req.user?.role !== 'faculty') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Faculty role required.'
    });
  }
  next();
};

module.exports = {
  verifyToken,
  verifyStudent,
  verifyFaculty
};
