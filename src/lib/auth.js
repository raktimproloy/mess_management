import jwt from 'jsonwebtoken';
import { jwtDecode } from 'jwt-decode';

// Use a consistent JWT_SECRET across all files
const JWT_SECRET = 'your_jwt_secret_key_here_make_it_long_and_secure_123456789';

// Verify JWT token and extract user data
export function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { success: true, user: decoded };
  } catch (error) {
    return { success: false, error: 'Invalid token' };
  }
}

// Extract token from Authorization header
export function extractTokenFromHeader(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7); // Remove 'Bearer ' prefix
}

// Verify admin authentication
export function verifyAdminAuth(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return { success: false, error: 'Authorization header missing' };
    }

    const token = extractTokenFromHeader(authHeader);
    if (!token) {
      return { success: false, error: 'Invalid authorization format' };
    }

    const verification = verifyToken(token);
    if (!verification.success) {
      return { success: false, error: verification.error };
    }

    // Check if user is admin
    if (verification.user.role !== 'admin') {
      return { success: false, error: 'Admin access required' };
    }

    return { success: true, user: verification.user };
  } catch (error) {
    return { success: false, error: 'Authentication failed' };
  }
}

// Verify student authentication
export function verifyStudentAuth(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return { success: false, error: 'Authorization header missing' };
    }

    const token = extractTokenFromHeader(authHeader);
    if (!token) {
      return { success: false, error: 'Invalid authorization format' };
    }

    const verification = verifyToken(token);
    if (!verification.success) {
      return { success: false, error: verification.error };
    }

    // Check if user is student
    if (verification.user.role !== 'student') {
      return { success: false, error: 'Student access required' };
    }

    return { success: true, student: verification.user };
  } catch (error) {
    return { success: false, error: 'Authentication failed' };
  }
}

// Get admin data from localStorage
export function getAdminData() {
  if (typeof window === 'undefined') return null;
  
  const token = localStorage.getItem('adminToken');
  const adminData = localStorage.getItem('adminData');
  
  if (!token || !adminData) return null;
  
  try {
    const decoded = jwtDecode(token);
    
    // Check expiry (exp is in seconds)
    if (!decoded.exp || Date.now() >= decoded.exp * 1000) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      return null;
    }
    // Check role
    if (decoded.role !== 'admin') {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      return null;
    }
    return JSON.parse(adminData);
  } catch (e) {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    return null;
  }
}

// Check if admin is authenticated
export function isAdminAuthenticated() {
  return getAdminData() !== null;
}

// Logout admin
export function logoutAdmin() {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminData');
}

// Get student data from localStorage
export function getStudentData() {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('studentToken');
  const studentData = localStorage.getItem('studentData');
  if (!token || !studentData) return null;
  try {
    const decoded = jwtDecode(token);
    // Check expiry (exp is in seconds)
    if (!decoded.exp || Date.now() >= decoded.exp * 1000) {
      localStorage.removeItem('studentToken');
      localStorage.removeItem('studentData');
      return null;
    }
    // Check role
    if (decoded.role !== 'student') {
      localStorage.removeItem('studentToken');
      localStorage.removeItem('studentData');
      return null;
    }
    return JSON.parse(studentData);
  } catch (e) {
    localStorage.removeItem('studentToken');
    localStorage.removeItem('studentData');
    return null;
  }
}

// Check if student is authenticated
export function isStudentAuthenticated() {
  return getStudentData() !== null;
}

// Logout student
export function logoutStudent() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('studentToken');
  localStorage.removeItem('studentData');
}

// Create JWT token
export function createToken(payload, expiresIn = '7d') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
} 