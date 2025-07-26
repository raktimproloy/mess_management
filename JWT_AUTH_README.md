# JWT Authentication System

This document describes the JWT authentication system implemented for the HostelHub application.

## Overview

The application now uses JWT (JSON Web Tokens) for secure authentication of both admin and student users. Tokens are stored in HTTP-only cookies for enhanced security.

## Features

### 🔐 **JWT Authentication**
- Secure token-based authentication
- HTTP-only cookies for token storage
- 7-day token expiration
- Role-based access control (admin/student)

### 🛡️ **Security Features**
- Middleware protection for admin and student routes
- Automatic token verification
- Secure logout functionality
- Invalid token cleanup

### 🎯 **User Experience**
- Dynamic navigation based on authentication status
- Welcome messages with user names
- Seamless login/logout flow
- Loading states during authentication

## API Endpoints

### Authentication Endpoints

#### Admin Login
```
POST /api/login
```
- **Body**: `{ "phone": "string", "password": "string" }`
- **Response**: JWT token stored in `admin_token` cookie
- **Redirects**: `/admin/dashboard` on success

#### Student Login
```
POST /api/student/login
```
- **Body**: `{ "phone": "string", "password": "string" }`
- **Response**: JWT token stored in `student_token` cookie
- **Redirects**: `/student/dashboard` on success

#### Get Current User
```
GET /api/auth/me
```
- **Response**: Current user information from JWT token
- **Headers**: Automatically reads cookies

#### Logout
```
POST /api/logout
```
- **Response**: Clears all authentication cookies
- **Redirects**: Home page

## File Structure

```
src/
├── lib/
│   └── auth.js                 # JWT utility functions
├── hooks/
│   └── useAuth.js              # React hook for authentication
├── components/
│   ├── layout/
│   │   ├── Navigation.js       # Dynamic navigation component
│   │   ├── adminLayout/
│   │   │   └── header.js       # Admin header with user info
│   │   └── studentLayout/
│   │       └── header.js       # Student header with user info
│   └── common/
│       └── LogoutButton.js     # Reusable logout component
├── app/
│   ├── api/
│   │   ├── login/
│   │   │   └── route.js        # Admin login API
│   │   ├── auth/
│   │   │   └── me/
│   │   │       └── route.js    # Get current user API
│   │   └── logout/
│   │       └── route.js        # Logout API
│   ├── login/
│   │   ├── admin/
│   │   │   └── page.js         # Admin login page
│   │   └── student/
│   │       └── page.js         # Student login page
│   └── page.js                 # Landing page with dynamic nav
└── middleware.js               # Route protection middleware
```

## Usage

### For Developers

#### 1. **Protecting Routes**
The middleware automatically protects admin and student routes:
- `/admin/*` - Requires admin token
- `/student/*` - Requires student token

#### 2. **Getting User Information**
```javascript
// Server-side
import { getUserFromCookies } from '@/lib/auth';
const user = await getUserFromCookies();

// Client-side
const response = await fetch('/api/auth/me');
const user = await response.json();
```

#### 3. **Creating Protected Components**
```javascript
'use client';
import { useAuth } from '@/hooks/useAuth';

export default function ProtectedComponent() {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please log in</div>;
  
  return <div>Welcome, {user.name}!</div>;
}
```

### For Users

#### Admin Login
1. Navigate to `/login/admin`
2. Enter phone: `9999999999`
3. Enter password: `admin123`
4. Click "Login"
5. Redirected to admin dashboard

#### Student Login
1. Navigate to `/login/student`
2. Enter registered phone number
3. Enter password
4. Click "Login"
5. Redirected to student dashboard

## Security Considerations

### ✅ **Implemented**
- HTTP-only cookies prevent XSS attacks
- JWT tokens expire after 7 days
- Middleware validates tokens on every request
- Secure logout clears all tokens
- Role-based access control

### 🔄 **Recommended Improvements**
- Hash admin passwords (currently plain text)
- Add refresh token mechanism
- Implement rate limiting
- Add CSRF protection
- Use environment variables for JWT secret

## Environment Variables

Add to your `.env.local` file:
```
JWT_SECRET=your_super_secret_jwt_key_here
```

## Testing

### Test Admin Login
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"9999999999","password":"admin123"}'
```

### Test Student Login
```bash
curl -X POST http://localhost:3000/api/student/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"student_phone","password":"student_password"}'
```

## Troubleshooting

### Common Issues

1. **"Not authenticated" error**
   - Check if JWT token exists in cookies
   - Verify token hasn't expired
   - Ensure correct role for route access

2. **Login not working**
   - Verify phone/password combination
   - Check browser console for errors
   - Ensure API endpoints are accessible

3. **Navigation not updating**
   - Clear browser cache
   - Check if `/api/auth/me` is responding
   - Verify component is client-side rendered

### Debug Mode
Enable debug logging by adding to your environment:
```
DEBUG_AUTH=true
```

## Support

For issues or questions about the JWT authentication system, please check:
1. Browser console for client-side errors
2. Server logs for API errors
3. Network tab for failed requests
4. Cookie storage for token issues 