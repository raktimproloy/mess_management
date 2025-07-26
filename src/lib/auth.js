import jwt from 'jsonwebtoken';
import { jwtDecode } from 'jwt-decode';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

// Verify JWT token
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Get admin data from localStorage
export function getAdminData() {
  if (typeof window === 'undefined') return null;
  
  const token = localStorage.getItem('adminToken');
  const adminData = localStorage.getItem('adminData');
  
  if (!token || !adminData) return null;
  
  // Verify token
  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== 'admin') {
    // Clear invalid data
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    return null;
  }
  
  return JSON.parse(adminData);
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