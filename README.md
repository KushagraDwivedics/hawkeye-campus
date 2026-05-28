# 🦅 Hawkeye Campus - Smart Attendance Management System

> A secure, geo-fenced attendance management system with QR code integration and real-time tracking.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Configuration](#-configuration)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🎓 Student Features
- ✅ **Secure Authentication** - Email & password with JWT tokens
- ✅ **Mark Attendance** - QR code scanning & geolocation verification
- ✅ **Dashboard** - Real-time attendance tracking
- ✅ **Profile Management** - Update personal information
- ✅ **Attendance History** - View past attendance records
- ✅ **Subject-wise Reports** - Attendance statistics by subject

### 👨‍🏫 Faculty Features
- ✅ **Lecture Management** - Create and manage lectures
- ✅ **QR Code Generation** - Auto-generate QR codes per session
- ✅ **Attendance Records** - View all attendance data
- ✅ **Modify Records** - Make corrections with audit trail
- ✅ **Export Reports** - Download attendance as Excel/CSV
- ✅ **Class Analytics** - View class-wide statistics

### 🔒 Security Features
- ✅ **Geo-Fencing** - Verify student location within radius
- ✅ **QR Code Expiry** - Time-limited QR codes (15 minutes default)
- ✅ **Encryption** - Bcrypt password hashing
- ✅ **CORS Protection** - Restricted API access
- ✅ **Rate Limiting** - Prevent brute force attacks
- ✅ **JWT Tokens** - Secure session management
- ✅ **Audit Logging** - Track all modifications

---

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js (v16+)
- **Framework:** Express.js
- **Database:** PostgreSQL with connection pooling
- **Auth:** JWT + Bcrypt
- **Email:** Nodemailer
- **QR Code:** qrcode library
- **Validation:** Express-validator & Joi
- **Security:** Helmet, CORS, Rate Limiting

### Frontend
- **Framework:** React 18 with Vite
- **State Management:** Redux Toolkit
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **Icons:** React Icons
- **Maps:** Leaflet & React-Leaflet
- **Date Handling:** date-fns

---

## 📁 Project Structure

```
hawkeye-campus/
├── backend/
│   ├── src/
│   │   ├── server.js                 # Express app entry point
│   │   ├── config/
│   │   │   └── database.js          # PostgreSQL pool config
│   │   ├── middleware/
│   │   │   ├── auth.js              # JWT verification
│   │   │   ├── validation.js        # Input validation
│   │   │   ├── errorHandler.js      # Global error handler
│   │   │   └── rateLimiter.js       # Rate limiting
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Student.js
│   │   │   ├── Faculty.js
│   │   │   ├── Lecture.js
│   │   │   ├── Attendance.js
│   │   │   └── LectureSession.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── studentController.js
│   │   │   ├── facultyController.js
│   │   │   ├── lectureController.js
│   │   │   └── attendanceController.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── studentRoutes.js
│   │   │   ├── facultyRoutes.js
│   │   │   ├── lectureRoutes.js
│   │   │   └── attendanceRoutes.js
│   │   ├── utils/
│   │   │   ├── jwt.js
│   │   │   ├── distance.js
│   │   │   ├── encryption.js
│   │   │   └── email.js
│   │   ├── database/
│   │   │   └── schema.sql          # Database schema
│   │   └── services/
│   │       └── qrCodeService.js    # QR generation
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx                # React entry point
│   │   ├── App.jsx                 # Main app component
│   │   ├── components/
│   │   │   ├── ProtectedRoute.jsx  # Route guard
│   │   │   └── Navbar.jsx          # Navigation bar
│   │   ├── pages/
│   │   │   ├── StudentLogin.jsx
│   │   │   ├── StudentSignup.jsx
│   │   │   ├── StudentDashboard.jsx
│   │   │   ├── FacultyLogin.jsx    # Coming soon
│   │   │   └── FacultyDashboard.jsx # Coming soon
│   │   ├── redux/
│   │   │   ├── store.js            # Redux store
│   │   │   ├── authSlice.js        # Auth state
│   │   │   └── studentSlice.js     # Student state
│   │   ├── services/
│   │   │   ├── api.js              # Axios config
│   │   │   └── apiService.js       # API calls
│   │   └── styles/
│   │       └── index.css           # Global styles
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
└── README.md (this file)
```

---

## 🚀 Installation

### Prerequisites
- Node.js v16+ and npm v8+
- PostgreSQL 12+
- Git

### Backend Setup

```bash
# 1. Clone repository
git clone https://github.com/KushagraDwivedics/hawkeye-campus.git
cd hawkeye-campus/backend

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# Edit .env with your credentials

# 4. Create database
sudo -u postgres psql
CREATE DATABASE hawkeye_campus;
\q

# 5. Run schema
psql -U postgres -d hawkeye_campus -a -f src/database/schema.sql

# 6. Start server
npm run dev
# Server runs on http://localhost:5000
```

### Frontend Setup

```bash
# 1. Navigate to frontend
cd ../frontend

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# Keep default API URL or change if needed

# 4. Start development server
npm run dev
# App runs on http://localhost:3000
```

---

## ⚡ Quick Start

### Using Both Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Then open http://localhost:3000 in your browser! 🎉

---

## 🔧 Configuration

### Backend Environment Variables

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hawkeye_campus
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRY=24h
REFRESH_TOKEN_SECRET=your_refresh_secret
REFRESH_TOKEN_EXPIRY=7d

# Email (Optional - for password reset)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_app_password
MAIL_FROM=noreply@hawkeyecampus.com

# Features
GEO_RADIUS_DEFAULT=50          # meters
QR_CODE_EXPIRY=15             # minutes
ATTENDANCE_MOD_WINDOW=3        # days

# CORS
CORS_ORIGINS=http://localhost:3000
FRONTEND_URL=http://localhost:3000
```

### Frontend Environment Variables

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_ENV=development
```

---

## 📚 API Documentation

### Authentication Endpoints

#### Student Signup
```http
POST /api/auth/student/signup
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@college.edu",
  "rollNumber": "CS2024001",
  "department": "CSE",
  "section": "A",
  "semester": 4,
  "password": "securePassword123"
}

Response:
{
  "success": true,
  "message": "Student registered successfully",
  "data": {
    "id": 1,
    "email": "john@college.edu",
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

#### Student Login
```http
POST /api/auth/student/login
Content-Type: application/json

{
  "email": "john@college.edu",
  "password": "securePassword123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": 1,
    "email": "john@college.edu",
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

### Student Endpoints

#### Get Dashboard
```http
GET /api/student/dashboard
Authorization: Bearer {accessToken}

Response:
{
  "success": true,
  "data": {
    "student": { ... },
    "overallAttendance": {
      "totalLectures": 20,
      "presentCount": 18,
      "absentCount": 2,
      "attendancePercentage": 90
    },
    "subjectWiseAttendance": [ ... ],
    "recentAttendance": [ ... ]
  }
}
```

#### Mark Attendance
```http
POST /api/student/attendance/mark
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "lectureId": 1,
  "latitude": 28.7041,
  "longitude": 77.1025,
  "sessionToken": "qr_token_123"
}

Response:
{
  "success": true,
  "message": "Attendance marked as present",
  "data": {
    "status": "present",
    "distance": 25,
    "withinRadius": true,
    "allowedRadius": 50
  }
}
```

---

## 🧪 Testing

### Run Backend Tests
```bash
cd backend
npm test
```

### Run Frontend Tests
```bash
cd frontend
npm test
```

---

## 🐛 Troubleshooting

### Database Connection Failed
```
❌ Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution:**
- Ensure PostgreSQL is running: `sudo service postgresql status`
- Check credentials in `.env`
- Verify database exists: `sudo -u postgres psql -l`

### Frontend API Errors
```
❌ Error: 404 Not Found
```
**Solution:**
- Ensure backend is running on port 5000
- Check `VITE_API_URL` in `.env`
- Verify routes in backend are correct

### CORS Error
```
❌ Access to XMLHttpRequest blocked by CORS policy
```
**Solution:**
- Check `CORS_ORIGINS` in backend `.env`
- Should include frontend URL: `http://localhost:3000`

---

## 📦 Deployment

### Deploy Backend (Heroku)
```bash
cd backend
heroku create hawkeye-campus-api
heroku config:set NODE_ENV=production
heroku config:set DATABASE_URL=postgresql://...
git push heroku main
```

### Deploy Frontend (Vercel)
```bash
cd frontend
npm run build
vercel deploy --prod
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 📞 Support

For issues and questions:
- 📧 Email: support@hawkeyecampus.com
- 🐛 GitHub Issues: [Report a bug](https://github.com/KushagraDwivedics/hawkeye-campus/issues)
- 💬 Discussions: [Ask a question](https://github.com/KushagraDwivedics/hawkeye-campus/discussions)

---

## 🙏 Acknowledgments

- Built with ❤️ using modern web technologies
- Special thanks to the open-source community
- Inspired by real-world college attendance challenges

---

**Made with 🦅 by Kushagra Dwivedi**
