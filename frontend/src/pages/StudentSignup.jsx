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
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
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
      setSuccess('Account created successfully!');
      setTimeout(() => navigate('/student/dashboard'), 1500);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Signup failed';
      setError(errorMsg);
      dispatch(loginFailure(errorMsg));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Hawkeye Campus</h1>
        <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">Student Signup</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-gray-700 font-semibold mb-1 text-sm">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="input-field text-sm"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1 text-sm">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input-field text-sm"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1 text-sm">Roll Number</label>
            <input
              type="text"
              name="rollNumber"
              value={formData.rollNumber}
              onChange={handleChange}
              className="input-field text-sm"
              placeholder="Enter your roll number"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-gray-700 font-semibold mb-1 text-sm">Department</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="input-field text-sm"
                placeholder="e.g., CSE"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1 text-sm">Section</label>
              <input
                type="text"
                name="section"
                value={formData.section}
                onChange={handleChange}
                className="input-field text-sm"
                placeholder="e.g., A"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1 text-sm">Semester</label>
            <input
              type="text"
              name="semester"
              value={formData.semester}
              onChange={handleChange}
              className="input-field text-sm"
              placeholder="e.g., 4"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1 text-sm">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input-field text-sm"
              placeholder="Enter password"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1 text-sm">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="input-field text-sm"
              placeholder="Confirm password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50 text-sm"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-gray-600 text-sm">
            Already have an account?{' '}
            <Link to="/student/login" className="text-blue-600 font-semibold hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentSignup;
