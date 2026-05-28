import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { studentService } from '../services/apiService';
import Navbar from '../components/Navbar';

const StudentDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await studentService.getDashboard();
      setDashboard(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <>
      <Navbar />
      <div className="container py-8">
        <h1 className="text-4xl font-bold mb-8">Welcome, {user?.fullName}!</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {dashboard && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Lectures</h3>
              <p className="text-3xl font-bold text-blue-600">
                {dashboard.overallAttendance.totalLectures}
              </p>
            </div>
            <div className="card">
              <h3 className="text-gray-600 text-sm font-semibold mb-2">Present</h3>
              <p className="text-3xl font-bold text-green-600">
                {dashboard.overallAttendance.presentCount}
              </p>
            </div>
            <div className="card">
              <h3 className="text-gray-600 text-sm font-semibold mb-2">Absent</h3>
              <p className="text-3xl font-bold text-red-600">
                {dashboard.overallAttendance.absentCount}
              </p>
            </div>
            <div className="card">
              <h3 className="text-gray-600 text-sm font-semibold mb-2">Attendance %</h3>
              <p className="text-3xl font-bold text-purple-600">
                {dashboard.overallAttendance.attendancePercentage}%
              </p>
            </div>
          </div>
        )}

        {dashboard && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Subject-wise Attendance</h2>
              <div className="space-y-3">
                {dashboard.subjectWiseAttendance.map((subject) => (
                  <div key={subject.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-semibold">{subject.name}</p>
                      <p className="text-sm text-gray-600">{subject.code}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{subject.attendance_percentage}%</p>
                      <p className="text-sm text-gray-600">{subject.present_count}/{subject.total_lectures}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h2 className="text-xl font-bold mb-4">Recent Attendance</h2>
              <div className="space-y-3">
                {dashboard.recentAttendance.slice(0, 5).map((record) => (
                  <div key={record.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-semibold">{record.subject_name}</p>
                      <p className="text-sm text-gray-600">{new Date(record.marked_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          record.status === 'present'
                            ? 'bg-green-100 text-green-800'
                            : record.status === 'late'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {record.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default StudentDashboard;
