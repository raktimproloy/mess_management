import { promises as fs } from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export async function POST(request) {
  try {
    const data = await request.json();
    const { phone, password } = data;
    if (!phone || !password) {
      return new Response(JSON.stringify({ message: 'Phone and password are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    // Path to students.json
    const studentsPath = path.join(process.cwd(), 'public/database/students.json');
    let students = [];
    try {
      const studentsRaw = await fs.readFile(studentsPath, 'utf-8');
      students = JSON.parse(studentsRaw);
    } catch (err) {
      return new Response(JSON.stringify({ message: 'Student data not found' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const student = students.find(s => s.phone === phone);
    if (!student) {
      return new Response(JSON.stringify({ message: 'Invalid phone or password' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    // Support both hashed and plain text passwords
    let passwordMatch = false;
    if (student.password.startsWith('$2b$')) {
      passwordMatch = await bcrypt.compare(password, student.password);
    } else {
      passwordMatch = student.password === password;
    }
    if (!passwordMatch) {
      return new Response(JSON.stringify({ message: 'Invalid phone or password' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    // Create JWT token
    const token = jwt.sign({ id: student.id, name: student.name, phone: student.phone, role: 'student' }, JWT_SECRET, { expiresIn: '7d' });
    // Return token and student data (no Set-Cookie)
    return new Response(JSON.stringify({ message: 'Login successful', role: 'student', student: { id: student.id, name: student.name, phone: student.phone }, token }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ message: 'Error logging in', error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 