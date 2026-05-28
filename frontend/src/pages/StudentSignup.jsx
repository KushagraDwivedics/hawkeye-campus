import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginSuccess, loginFailure } from '../redux/authSlice';
import { authService } from '../services/apiService';

const StudentSignup = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    rollNumber: '',
    department: '',
    section: '',
    semester: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  // Humanized error messages
  const getErrorMessage = (err) => {
    const status = err.response?.status;
    const message = err.response?.data?.message;

    if (status === 400) {
      if (message?.includes('email')) return '📧 This email is already registered. Please login instead.';
      if (message?.includes('roll')) return '🆔 This roll number is already in use.';
      return '⚠️ Please check your information and try again.';
    } else if (status === 409) {
      return '⚠️ Account already exists with this email or roll number.';
    } else if (status === 422) {
      return '❌ Please fill in all required fields correctly.';
    } else if (status === 500) {
      return '🔧 Server error. Please try again later.';
    }

    return message || '❌ Sign up failed. Please try again.';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError('👤 Please enter your full name.');
      return false;
    }

    if (!formData.email.trim()) {
      setError('📧 Please enter your email address.');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('📧 Please enter a valid email address.');
      return false;
    }

    if (!formData.rollNumber.trim()) {
      setError('🆔 Please enter your roll number.');
      return false;
    }

    if (!formData.department.trim()) {
      setError('🏢 Please select your department.');
      return false;
    }

    if (!formData.section.trim()) {
      setError('📚 Please select your section.');
      return false;
    }

    if (!formData.semester) {
      setError('📖 Please select your semester.');
      return false;
    }

    if (!formData.password) {
      setError('🔐 Please enter a password.');
      return false;
    }

    if (formData.password.length < 6) {
      setError('🔐 Password must be at least 6 characters long.');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('🔄 Passwords do not match. Please try again.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    try {
      const response = await authService.studentSignup(formData);
      dispatch(
        loginSuccess({
          user: response.data.data,
          accessToken: response.data.data.accessToken,
          refreshToken: response.data.data.refreshToken
        })
      );
      setSuccess('✨ Account created successfully! Redirecting to dashboard...');
      setTimeout(() => navigate('/student/dashboard'), 1500);
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      dispatch(loginFailure(errorMsg));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 to-blue-900 flex items-center justify-center p-4 py-8">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-green-600 mb-2">🦅 Hawkeye Campus</h1>
          <p className="text-gray-600 text-sm">Join the Attendance Revolution</p>
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Create Your Account</h2>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded mb-4 text-sm">
            {success}
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Full Name */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1 text-sm">👤 Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="input-field text-sm"
              placeholder="John Doe"
              disabled={loading}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1 text-sm">📧 Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input-field text-sm"
              placeholder="your@college.edu"
              disabled={loading}
            />
          </div>

          {/* Roll Number */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1 text-sm">🆔 Roll Number</label>
            <input
              type="text"
              name="rollNumber"
              value={formData.rollNumber}
              onChange={handleChange}
              className="input-field text-sm"
              placeholder="e.g., CS2024001"
              disabled={loading}
            />
          </div>

          {/* Department & Section */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-gray-700 font-semibold mb-1 text-sm">🏢 Department</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="input-field text-sm"
                disabled={loading}
              >
                <option value="">Select...</option>
                <option value="CSE">Computer Science</option>
                <option value="ECE">Electronics</option>
                <option value="ME">Mechanical</option>
                <option value="CE">Civil</option>
                <option value="EE">Electrical</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1 text-sm">📚 Section</label>
              <select
                name="section"
                value={formData.section}
                onChange={handleChange}
                className="input-field text-sm"
                disabled={loading}
              >
                <option value="">Select...</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
            </div>
          </div>

          {/* Semester */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1 text-sm">📖 Semester</label>
            <select
              name="semester"
              value={formData.semester}
              onChange={handleChange}
              className="input-field text-sm"
              disabled={loading}
            >
              <option value="">Select Semester...</option>
              <option value="1">1st Semester</option>
              <option value="2">2nd Semester</option>
              <option value="3">3rd Semester</option>
              <option value="4">4th Semester</option>
              <option value="5">5th Semester</option>
              <option value="6">6th Semester</option>
              <option value="7">7th Semester</option>
              <option value="8">8th Semester</option>
            </select>
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1 text-sm">🔐 Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input-field text-sm pr-10"
                placeholder="At least 6 characters"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1 text-sm">🔄 Confirm Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="input-field text-sm"
              placeholder="Re-enter password"
              disabled={loading}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm mt-4"
          >
            {loading ? '⏳ Creating account...' : '✨ Create Account'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-gray-700 text-sm">
            Already have an account?{' '}
            <Link
              to="/student/login"
              className="text-blue-600 font-semibold hover:underline transition"
            >
              Login here
            </Link>
          </p>
        </div>

        {/* Info Footer */}
        <p className="text-center text-xs text-gray-500 mt-4">
          🔒 Your password is securely encrypted.
        </p>
      </div>
    </div>
  );
};

export default StudentSignup;
