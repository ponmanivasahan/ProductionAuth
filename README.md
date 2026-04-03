# Auth Frontend - React + Vite

A premium SaaS-style authentication interface built with React 19, Vite, and Tailwind CSS.

## Features

- **Responsive Login & Password Recovery** - Transparent card design with smooth interactions
- **Token-based Auth** - JWT access/refresh token flow with localStorage persistence
- **Protected Routes** - Role-based access control with PrivateRoute guards
- **OAuth Integration** - Google and HackClub authentication support
- **Email Reset Links** - Password reset and email verification flows
- **Premium UI** - Monochrome palette, glass morphism, and smooth animations

---

## Optimization

This project implements three key optimization techniques to improve performance, security, and reduce bundle size.

### 1. Route-Level Lazy Loading

**What was improved:** Bundle splitting and on-demand route loading.

**How:** Implemented code splitting using `React.lazy()` and `Suspense` for all authentication pages and the dashboard. Each route is loaded only when needed, reducing the initial bundle size.

**Implementation:**
- Auth routes (`AuthPage`, `ForgotPassword`, `ResetPassword`, `Dashboard`, `PrivateRoute`) use `lazy(() => import(...))` 
- Loading fallback with spinner during code split chunk downloads
- Suspense boundary wraps all routes for seamless transitions

**Results:**
```
Production Build Output:
─ AuthPage ~7.00 kB gzip, ~2.66 kB
─ ForgotPassword ~3.21 kB gzip, ~1.39 kB  
─ ResetPassword ~6.31 kB gzip, ~1.92 kB
─ Dashboard ~1.42 kB gzip, ~0.71 kB
─ PrivateRoute ~2.10 kB gzip, ~0.85 kB
```

Each route is now loaded on-demand, reducing initial load time by deferring non-critical route chunks.

### 2. Memory Leak Prevention - Timer Cleanup

**What was improved:** Memory usage and prevented dangling timers.

**How:** Implemented cleanup functions in `useEffect` hooks to clear timeout references when components unmount. This prevents memory leaks from delayed redirects in password reset and email verification flows.

**Implementation:**
- `ResetPassword.jsx`: Clears redirect timer on unmount
- `VerifyEmail.jsx`: Clears verification success redirect on unmount  
- Uses `useRef` to track timer IDs and `clearTimeout` in cleanup functions

**Code Pattern:**
```javascript
useEffect(() => {
  // Timer logic here
  return () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };
}, []);
```

**Results:**
- Eliminated potential memory leaks from 3-second success redirects
- No dangling timers in browser memory when users navigate away
- Cleaner component lifecycle management

### 3. Secure Token Cache with Expiry Validation

**What was improved:** JWT storage security and automatic expiry handling.

**How:** Implemented a dedicated `TokenCache` service that:
- Uses `sessionStorage` instead of `localStorage` for sensitive token data (cleared on tab close)
- Validates JWT expiry before use to prevent stale tokens
- Provides centralized token management across auth layers
- Caches user data with token metadata for faster reload

**Implementation:**
- `tokenCache.js`: Singleton service with token validation logic
- Decodes JWT payload to check `exp` claim against current time
- `setToken()` validates expiry before storing
- `getToken()` returns null if expired, triggers automatic logout
- Used in `AuthService` and `AuthContext` for all token operations

**Security Features:**
```javascript
// Automatic expiry detection
getTimeUntilExpiry() // Returns milliseconds until token expires
isTokenExpired(token) // Validates token hasn't passed exp claim
hasValidToken() // Check before API calls
getStatus() // Debug cache state (time left, user email, etc.)
```

**Results:**
- Tokens stored in sessionStorage (more secure than localStorage)
- Automatic cleanup of expired tokens prevents invalid auth states
- Centralized cache management reduces auth bugs
- Faster user reload with cached expiry metadata

---

## Performance Summary

| Metric | Improvement |
|--------|-------------|
| Initial Bundle | Reduced by on-demand code splitting |
| Time to Interactive | Faster with lazy-loaded routes |
| Memory Usage | Cleaner lifecycle with timer cleanup + session storage |
| Token Security | Validation + sessionStorage prevents stale auth |
| User Experience | Smooth loading states with Suspense fallback |

---

## Environment Configuration

### Backend Environment (`.env`)

Located in `backend/.env`. Required variables:

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_PORT=port
DB_NAME=image_cloudinary

# Server
PORT=5000
BCRYPT_ROUNDS=10

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Cookies
COOKIE_SECRET=your_cookie_secret

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_VERIFY_ON_STARTUP=false

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Token Expiry
PASSWORD_RESET_EXPIRY=1h
EMAIL_VERIFY_EXPIRY=24h

# OAuth - Google
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/oauth/google/callback

# OAuth - HackClub
HACKCLUB_CLIENT_ID=your_hackclub_client_id
HACKCLUB_CLIENT_SECRET=your_hackclub_client_secret
HACKCLUB_CALLBACK_URL=http://localhost:5000/api/oauth/hackclub/callback

# OAuth Redirects
OAUTH_SUCCESS_REDIRECT=http://localhost:5173/dashboard
OAUTH_FAILURE_REDIRECT=http://localhost:5173/login?error=oauth_failed
```

**Important Notes:**
- Gmail SMTP requires an app password (not regular Gmail password)
- All secrets should be strong and unique
- Never commit `.env` to version control
- Token expiry uses formats like `15m`, `1h`, `7d`, etc.

### Frontend Environment (`.env`)

Located in `frontend/.env`. Required variables:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# OAuth Client IDs (same as backend)
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_HACKCLUB_CLIENT_ID=your_hackclub_client_id
```

**Usage in Code:**
```javascript
// Access Vite env vars with import.meta.env prefix
const apiUrl = import.meta.env.VITE_API_URL;
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
```

---

![Database Diagram](./src/assets/DBDIAGRAM.png)

The backend uses MySQL with the following key tables:
- **users** - User accounts with email verification status
- **refresh_tokens** - Token revocation and expiry tracking
- **password_reset_tokens** - Time-limited password reset tokens
- **email_verification_tokens** - Email verification token management
- **oauth_accounts** - OAuth provider account linking
- **sessions** - User session tracking
- **roles** & **user_roles** - Role-based access control

## Setup & Development

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```
