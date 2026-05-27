const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

const studentSignupValidation = [
  body('fullName')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 3 }).withMessage('Full name must be at least 3 characters'),
  body('email')
    .trim()
    .isEmail().withMessage('Valid email is required')
    .custom((value) => {
      if (!value.endsWith(process.env.COLLEGE_EMAIL_DOMAIN || '@college.edu')) {
        throw new Error('Only college emails are allowed');
      }
      return true;
    }),
  body('rollNumber')
    .trim()
    .notEmpty().withMessage('Roll number is required')
    .isAlphanumeric().withMessage('Roll number must be alphanumeric'),
  body('department')
    .trim()
    .notEmpty().withMessage('Department is required'),
  body('section')
    .trim()
    .notEmpty().withMessage('Section is required'),
  body('semester')
    .trim()
    .notEmpty().withMessage('Semester is required'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain uppercase, lowercase, number, and special character'),
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match'),
  handleValidationErrors
];

const facultySignupValidation = [
  body('facultyName')
    .trim()
    .notEmpty().withMessage('Faculty name is required')
    .isLength({ min: 3 }).withMessage('Faculty name must be at least 3 characters'),
  body('email')
    .trim()
    .isEmail().withMessage('Valid email is required')
    .custom((value) => {
      if (!value.endsWith(process.env.COLLEGE_EMAIL_DOMAIN || '@college.edu')) {
        throw new Error('Only college emails are allowed');
      }
      return true;
    }),
  body('facultyCode')
    .trim()
    .notEmpty().withMessage('Faculty code is required'),
  body('department')
    .trim()
    .notEmpty().withMessage('Department is required'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain uppercase, lowercase, number, and special character'),
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match'),
  handleValidationErrors
];

const loginValidation = [
  body('email')
    .trim()
    .isEmail().withMessage('Valid email is required'),
  body('password')
    .notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  studentSignupValidation,
  facultySignupValidation,
  loginValidation
};
