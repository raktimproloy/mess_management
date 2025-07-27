import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
// Use the same JWT_SECRET as the auth library
const JWT_SECRET = 'your_jwt_secret_key_here_make_it_long_and_secure_123456789';

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

    // Find student in database
    const student = await prisma.student.findUnique({
      where: { phone: phone }
    });

    if (!student) {
      return new Response(JSON.stringify({ message: 'Invalid phone or password' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify password - support both hashed and plain text passwords for backward compatibility
    let passwordMatch = false;
    if (student.password.startsWith('$2b$')) {
      // Password is hashed, use bcrypt.compare
      passwordMatch = await bcrypt.compare(password, student.password);
    } else {
      // Password is plain text (for backward compatibility with existing data)
      passwordMatch = student.password === password;
    }

    if (!passwordMatch) {
      return new Response(JSON.stringify({ message: 'Invalid phone or password' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        id: student.id, 
        name: student.name, 
        phone: student.phone, 
        role: 'student' 
      }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );

    // Return token and student data (without password)
    const { password: _, ...studentWithoutPassword } = student;
    return new Response(JSON.stringify({ 
      message: 'Login successful', 
      role: 'student', 
      student: studentWithoutPassword, 
      token 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Student login error:', err);
    return new Response(JSON.stringify({ message: 'Error logging in', error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 