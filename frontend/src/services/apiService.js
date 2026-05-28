import api from './api';

export const authService = {
  studentSignup: (data) => api.post('/auth/student/signup', data),
  facultySignup: (data) => api.post('/auth/faculty/signup', data),
  studentLogin: (email, password) => api.post('/auth/student/login', { email, password }),
  facultyLogin: (email, password) => api.post('/auth/faculty/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  refreshToken: (refreshToken) => api.post('/auth/refresh-token', { refreshToken }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => api.post(`/auth/reset-password/${token}`, { newPassword })
};

export const studentService = {
  getDashboard: () => api.get('/student/dashboard'),
  getProfile: () => api.get('/student/profile'),
  updateProfile: (data) => api.put('/student/profile', data),
  markAttendance: (lectureId, latitude, longitude, sessionToken) =>
    api.post('/student/attendance/mark', { lectureId, latitude, longitude, sessionToken }),
  getAttendanceHistory: (params) => api.get('/student/attendance/history', { params })
};

export const facultyService = {
  getDashboard: () => api.get('/faculty/dashboard'),
  getStudents: (params) => api.get('/faculty/students', { params }),
  getStudentDetails: (id) => api.get(`/faculty/students/${id}`),
  getAttendanceRecords: (params) => api.get('/faculty/attendance/records', { params }),
  modifyAttendance: (id, data) => api.put(`/faculty/attendance/modify/${id}`, data),
  exportAttendance: (lectureId, format) =>
    api.get('/faculty/attendance/export', { params: { lectureId, format } })
};

export const lectureService = {
  createLecture: (data) => api.post('/lectures', data),
  getLectures: () => api.get('/lectures'),
  getLectureDetails: (id) => api.get(`/lectures/${id}`),
  updateLecture: (id, data) => api.put(`/lectures/${id}`, data),
  deleteLecture: (id) => api.delete(`/lectures/${id}`),
  startSession: (id) => api.post(`/lectures/${id}/start-session`),
  endSession: (id) => api.post(`/lectures/${id}/end-session`),
  getQRCode: (id) => api.get(`/lectures/${id}/qr-code`)
};

export const attendanceService = {
  markAttendance: (data) => api.post('/attendance/mark', data),
  getRecords: () => api.get('/attendance/records')
};
