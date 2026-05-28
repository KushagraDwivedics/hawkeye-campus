# Backend - Hawkeye Campus 🦅

## Quick Start

### Prerequisites
- Node.js v16+ and npm v8+
- PostgreSQL 12+
- Git

### 1️⃣ Installation
```bash
cd backend
npm install
```

### 2️⃣ Database Setup

#### Create PostgreSQL Database
```bash
# Login to PostgreSQL
sudo -u postgres psql

# Create database
CREATE DATABASE hawkeye_campus;

# Exit
\q
```

#### Run Schema
```bash
# Apply database schema
psql -U postgres -d hawkeye_campus -a -f src/database/schema.sql
```

### 3️⃣ Environment Configuration
```bash
cp .env.example .env
```

Edit `.env` with your settings:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hawkeye_campus
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_super_secret_key
```

### 4️⃣ Start Server
```bash
npm run dev
```

✅ Server running at `http://localhost:5000`

---

## 📦 Available Scripts

```bash
npm run dev              # Start with nodemon (development)
npm start                # Start production server
npm run migrate          # Run database migrations
npm run seed             # Seed sample data
npm test                 # Run test suite
npm test:watch          # Run tests in watch mode
npm run lint             # Check code style
npm run lint:fix         # Fix linting issues
```

---

## 🗄️ Database Schema

### Tables
- **users** - Base user table (student/faculty)
- **students** - Student details
- **faculty** - Faculty information
- **departments** - Department data
- **semesters** - Semester info
- **sections** - Class sections
- **subjects** - Course subjects
- **lectures** - Lecture sessions
- **lecture_sessions** - Active QR sessions
- **attendance** - Attendance records
- **attendance_logs** - Audit trail
- **refresh_tokens** - JWT refresh tokens
- **password_reset_tokens** - Reset tokens

### Views
- `attendance_report_view` - Attendance statistics
- `student_attendance_summary` - Per-student summary
- `faculty_lecture_stats` - Faculty statistics

---

## 🔐 Authentication

### JWT Flow
1. User logs in with email/password
2. Server validates credentials
3. Returns `accessToken` (24h) and `refreshToken` (7d)
4. Client stores tokens in localStorage
5. Each API request includes token in Authorization header

### Token Refresh
When `accessToken` expires:
1. Client sends `refreshToken` to `/api/auth/refresh-token`
2. Server validates and issues new `accessToken`
3. Client automatically retries failed request

---

## 📡 API Endpoints

### Authentication Routes
```
POST   /api/auth/student/signup       - Student registration
POST   /api/auth/student/login        - Student login
POST   /api/auth/faculty/signup       - Faculty registration
POST   /api/auth/faculty/login        - Faculty login
POST   /api/auth/logout               - Logout (protected)
POST   /api/auth/refresh-token        - Refresh access token
POST   /api/auth/forgot-password      - Request password reset
POST   /api/auth/reset-password/:token - Reset password
```

### Student Routes
```
GET    /api/student/dashboard         - Get dashboard data
GET    /api/student/profile           - Get profile
PUT    /api/student/profile           - Update profile
POST   /api/student/attendance/mark   - Mark attendance
GET    /api/student/attendance/history - Get history
```

### Faculty Routes
```
GET    /api/faculty/dashboard         - Get dashboard
GET    /api/faculty/students          - Get students
GET    /api/faculty/students/:id      - Get student details
GET    /api/faculty/attendance/records - Get attendance
PUT    /api/faculty/attendance/modify/:id - Modify attendance
GET    /api/faculty/attendance/export - Export report
```

### Lecture Routes
```
POST   /api/lectures                  - Create lecture
GET    /api/lectures                  - Get lectures
GET    /api/lectures/:id              - Get lecture details
PUT    /api/lectures/:id              - Update lecture
DELETE /api/lectures/:id              - Delete lecture
POST   /api/lectures/:id/start-session - Start QR session
POST   /api/lectures/:id/end-session  - End QR session
GET    /api/lectures/:id/qr-code      - Get QR code
```

### Attendance Routes
```
POST   /api/attendance/mark           - Mark attendance
GET    /api/attendance/records        - Get records
```

### Health Check
```
GET    /api/health                    - Server status
```

---

## 🔧 Configuration

### Environment Variables

**Database**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hawkeye_campus
DB_USER=postgres
DB_PASSWORD=your_password
DB_POOL_MIN=2
DB_POOL_MAX=10
```

**JWT & Security**
```env
JWT_SECRET=your_super_secret_key_change_in_production
JWT_EXPIRY=24h
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=7d
```

**Email (Optional)**
```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_app_password
MAIL_FROM=noreply@hawkeyecampus.com
```

**Features**
```env
GEO_RADIUS_DEFAULT=50          # meters
QR_CODE_EXPIRY=15              # minutes
ATTENDANCE_MOD_WINDOW=3         # days
```

**Server**
```env
NODE_ENV=development
PORT=5000
CORS_ORIGINS=http://localhost:3000
FRONTEND_URL=http://localhost:3000
```

---

## 🏗️ Project Structure

```
src/
├── server.js                 # Express app
├── config/
│   └── database.js          # PostgreSQL pool
├── middleware/
│   ├── auth.js              # JWT verification
│   ├── validation.js        # Input validation
│   ├── errorHandler.js      # Global error handler
│   └── rateLimiter.js       # Rate limiting
├── models/
│   ├── User.js
│   ├── Student.js
│   ├── Faculty.js
│   ├── Lecture.js
│   ├── Attendance.js
│   └── LectureSession.js
├── controllers/
│   ├── authController.js
│   ├── studentController.js
│   ├── facultyController.js
│   ├── lectureController.js
│   └── attendanceController.js
├── routes/
│   ├── authRoutes.js
│   ├── studentRoutes.js
│   ├── facultyRoutes.js
│   ├── lectureRoutes.js
│   └── attendanceRoutes.js
├── utils/
│   ├── jwt.js               # Token generation
│   ├── distance.js          # Geolocation calculation
│   ├── encryption.js        # Password hashing
│   └── email.js             # Email sending
├── services/
│   └── qrCodeService.js     # QR generation
└── database/
    └── schema.sql           # Database schema
```

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run in watch mode
npm test:watch

# Run with coverage
npm test -- --coverage
```

---

## 🐛 Troubleshooting

### Database Connection Error
```
❌ Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution:**
1. Ensure PostgreSQL is running: `sudo service postgresql status`
2. Check DB credentials in `.env`
3. Verify database exists: `sudo -u postgres psql -l`
4. Recreate if needed: `sudo -u postgres dropdb hawkeye_campus && createdb hawkeye_campus`

### Port Already in Use
```
❌ Error: listen EADDRINUSE :::5000
```
**Solution:**
1. Kill process on port 5000: `lsof -i :5000 | grep LISTEN | awk '{print $2}' | xargs kill -9`
2. Or change PORT in `.env`

### JWT Secret Error
```
❌ JsonWebTokenError: invalid token
```
**Solution:**
- Ensure `JWT_SECRET` is set in `.env`
- Check token format in Authorization header
- Verify token hasn't expired

---

## 🚀 Deployment

### Deploy to Heroku

```bash
# 1. Create Heroku app
heroku create hawkeye-campus-api

# 2. Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# 3. Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_production_secret

# 4. Deploy
git push heroku main

# 5. View logs
heroku logs --tail
```

### Deploy to Railway

```bash
# 1. Install Railway CLI
npm i -g @railway/cli

# 2. Login and create project
railway login
railway init

# 3. Deploy
railway up
```

---

## 🔒 Security Best Practices

✅ **Implemented:**
- Password hashing with bcrypt (10 rounds)
- JWT token expiration
- CORS validation
- Rate limiting (100 requests/15 min)
- Helmet security headers
- SQL injection prevention via parameterized queries
- Input validation & sanitization
- HTTPS ready (enable in production)

⚠️ **Production Checklist:**
- [ ] Change JWT secrets
- [ ] Enable HTTPS
- [ ] Setup environment variables
- [ ] Configure database backups
- [ ] Enable logging & monitoring
- [ ] Setup email service
- [ ] Configure CORS for production domain
- [ ] Enable rate limiting

---

## 📚 Learn More

- [Express.js](https://expressjs.com)
- [PostgreSQL](https://www.postgresql.org)
- [JWT](https://jwt.io)
- [Bcrypt](https://github.com/kelektiv/node.bcrypt.js)
- [Nodemailer](https://nodemailer.com)

---

## 📞 Support

Need help?
1. Check this README
2. Review [Main README](../README.md)
3. Check [GitHub Issues](https://github.com/KushagraDwivedics/hawkeye-campus/issues)
4. Review API response messages

---

**Happy coding! 🚀**
