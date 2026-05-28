import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginSuccess, loginFailure } from '../redux/authSlice';
import { authService } from '../services/apiService';

const StudentLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  // Humanized error messages
  const getErrorMessage = (err) => {
    if (!err.response) {
      return '🌐 Connection error. Please check your internet connection and try again.';
    }

    const status = err.response.status;
    const message = err.response.data?.message;

    if (status === 400) {
      return '⚠️ Invalid email or password. Please check and try again.';
    } else if (status === 401) {
      return '🔒 Your credentials are incorrect. Please try again.';
    } else if (status === 404) {
      return '👤 Account not found. Please sign up if you don\'t have one.';
    } else if (status === 429) {
      return '⏱️ Too many login attempts. Please try again in a few minutes.';
    } else if (status === 500) {
      return '🔧 Server error. Our team is working on it. Please try again later.';
    }

    return message || '❌ Login failed. Please try again later.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!email.trim()) {
      setError('📧 Please enter your email address.');
      return;
    }

    if (!password) {
      setError('🔐 Please enter your password.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('📧 Please enter a valid email address.');
      return;
    }

    try {
      const response = await authService.studentLogin(email, password);
      dispatch(
        loginSuccess({
          user: response.data.data,
          accessToken: response.data.data.accessToken,
          refreshToken: response.data.data.refreshToken
        })
      );
      navigate('/student/dashboard');
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      dispatch(loginFailure(errorMsg));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">🦅 Hawkeye Campus</h1>
          <p className="text-gray-600 text-sm">Smart Attendance Management</p>
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Student Login</h2>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded mb-6 animate-pulse">
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">📧 Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field focus:ring-blue-500"
              placeholder="your@college.edu"
              required
              disabled={loading}
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">🔐 Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field focus:ring-blue-500 pr-10"
                placeholder="Enter your password"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? '⏳ Logging in...' : '✨ Login'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">or</span>
          </div>
        </div>

        {/* Footer Links */}
        <div className="space-y-3 text-center">
          <p className="text-gray-700">
            Don't have an account?{' '}
            <Link
              to="/student/signup"
              className="text-blue-600 font-semibold hover:underline transition"
            >
              Sign up here
            </Link>
          </p>
          <p className="text-gray-700 text-sm">
            Forgot your password?{' '}
            <Link
              to="/forgot-password"
              className="text-blue-600 font-semibold hover:underline transition"
            >
              Reset it
            </Link>
          </p>
          <hr className="my-3" />
          <p className="text-gray-600 text-sm">
            Faculty member?{' '}
            <Link
              to="/faculty/login"
              className="text-green-600 font-semibold hover:underline transition"
            >
              Login as Faculty
            </Link>
          </p>
        </div>

        {/* Info Footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          🔒 Your data is secure and encrypted.
        </p>
      </div>
    </div>
  );
};

export default StudentLogin;
