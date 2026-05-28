# Frontend - Hawkeye Campus 🦅

## Quick Start

### Prerequisites
- Node.js v16+ and npm v8+

### 1️⃣ Installation
```bash
cd frontend
npm install
```

### 2️⃣ Environment Setup
```bash
cp .env.example .env
```

Edit `.env` if your backend is not on `http://localhost:5000/api`

### 3️⃣ Development Server
```bash
npm run dev
```

🎉 App will open at `http://localhost:3000`

---

## 📦 Production Build

```bash
npm run build        # Creates optimized build
npm run preview      # Preview production build
```

---

## 🧹 Code Quality

```bash
npm run lint         # Check code style
npm run lint:fix     # Fix linting issues
```

---

## ✨ Features Implemented

### ✅ Authentication
- Student Login with humanized error messages
- Student Signup with form validation
- Password visibility toggle
- Automatic logout on token expiration
- Secure token storage

### ✅ Dashboard
- Real-time attendance statistics
- Subject-wise attendance breakdown
- Recent attendance history
- Visual indicators (Present/Absent/Late)

### ✅ Profile Management
- View profile information
- Update personal details
- Email verification

### ✅ User Experience
- Responsive design (Mobile & Desktop)
- Dark mode support (Ready)
- Loading states
- Error handling with user-friendly messages
- Smooth transitions & animations

### ✅ Security
- JWT token management
- Protected routes
- Automatic token refresh
- Secure localStorage usage

---

## 🏗️ Project Structure

```
src/
├── components/          # Reusable components
│   ├── Navbar.jsx
│   └── ProtectedRoute.jsx
├── pages/              # Page components
│   ├── StudentLogin.jsx
│   ├── StudentSignup.jsx
│   └── StudentDashboard.jsx
├── redux/              # State management
│   ├── store.js
│   ├── authSlice.js
│   └── studentSlice.js
├── services/           # API integration
│   ├── api.js
│   └── apiService.js
├── styles/             # CSS & Tailwind
│   └── index.css
├── App.jsx
└── main.jsx
```

---

## 🔧 Configuration

### Environment Variables

**`.env`**
```env
# Backend API URL (change if running on different port)
VITE_API_URL=http://localhost:5000/api

# Environment
VITE_APP_ENV=development
```

---

## 📡 API Integration

All API calls are centralized in `src/services/apiService.js`:

```javascript
import { studentService, authService } from '../services/apiService';

// Login
await authService.studentLogin(email, password);

// Get Dashboard
await studentService.getDashboard();

// Mark Attendance
await studentService.markAttendance(lectureId, lat, lon, token);
```

---

## 🎨 Styling

- **Framework:** Tailwind CSS
- **Icons:** React Icons
- **Colors:** Blue & Green theme
- **Responsive:** Mobile-first approach

### Custom Styles

Custom styles in `src/styles/index.css`:
```css
.btn-primary      /* Primary button */
.btn-secondary    /* Secondary button */
.btn-danger       /* Danger button */
.card             /* Card component */
.input-field      /* Input styling */
```

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables
4. Deploy!

```bash
vercel deploy
```

### Deploy to Netlify

```bash
npm run build
netlify deploy --prod --dir=dist
```

---

## 🐛 Troubleshooting

### API Connection Error
```
❌ Connection error. Please check your internet connection.
```
**Solution:** Ensure backend is running and `VITE_API_URL` is correct

### Build Fails
```
❌ Cannot find module
```
**Solution:** Run `npm install` to install dependencies

### Port Already in Use
```
❌ Port 3000 already in use
```
**Solution:** Kill process or use different port: `npm run dev -- --port 3001`

---

## 📚 Learn More

- [React Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Redux Toolkit](https://redux-toolkit.js.org)
- [Axios](https://axios-http.com)

---

## 📞 Support

Need help? Check:
1. This README
2. [Backend README](../backend/README.md)
3. [Main README](../README.md)
4. [GitHub Issues](https://github.com/KushagraDwivedics/hawkeye-campus/issues)

---

**Happy coding! 🚀**
