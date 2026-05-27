const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let status = err.status || 500;
  let message = err.message || 'Internal Server Error';

  // Validation Error
  if (err.name === 'ValidationError') {
    status = 400;
    message = err.details?.map(d => d.message).join(', ') || 'Validation Error';
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    status = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    status = 401;
    message = 'Token expired';
  }

  // Database Errors
  if (err.code === '23505') { // Unique constraint violation
    status = 409;
    message = 'Duplicate entry';
  }

  if (err.code === '23503') { // Foreign key violation
    status = 400;
    message = 'Invalid reference';
  }

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
};

module.exports = errorHandler;
