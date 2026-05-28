import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store';
import ProtectedRoute from './components/ProtectedRoute';
import StudentLogin from './pages/StudentLogin';
import StudentSignup from './pages/StudentSignup';
import StudentDashboard from './pages/StudentDashboard';
import './styles/index.css';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/student/login" replace />} />
          <Route path="/student/login" element={<StudentLogin />} />
          <Route path="/student/signup" element={<StudentSignup />} />

          {/* Protected Routes */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute requiredRole="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/student/login" replace />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;
