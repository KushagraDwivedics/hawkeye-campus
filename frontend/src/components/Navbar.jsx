import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/authSlice';
import { FiLogOut, FiHome, FiUser } from 'react-icons/fi';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container flex justify-between items-center py-4">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold">🦅 Hawkeye Campus</h1>
        </div>
        <div className="flex items-center space-x-6">
          <button
            onClick={() => navigate('/student/dashboard')}
            className="flex items-center space-x-2 hover:text-gray-200 transition"
          >
            <FiHome size={20} />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => navigate('/student/profile')}
            className="flex items-center space-x-2 hover:text-gray-200 transition"
          >
            <FiUser size={20} />
            <span>Profile</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 hover:text-gray-200 transition"
          >
            <FiLogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
