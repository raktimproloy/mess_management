import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
// Use the same JWT_SECRET as the auth library
const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXT_PUBLIC_JWT_SECRET;

export async function POST(request) {
  try {
    const { phone, password } = await request.json();
    
    if (!phone || !password) {
      return new Response(JSON.stringify({ 
        success: false,
        message: "Phone and password are required" 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Find admin by phone number
    const admin = await prisma.admin.findUnique({
      where: {
        phone: phone
      }
    });
    
    if (!admin) {
      return new Response(JSON.stringify({ 
        success: false,
        message: "Invalid phone or password" 
      }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Verify password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    
    if (!isPasswordValid) {
      return new Response(JSON.stringify({ 
        success: false,
        message: "Invalid phone or password" 
      }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: admin.id,
        name: admin.name,
        phone: admin.phone,
        role: 'admin'
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return success response (without password)
    const { password: _, ...adminWithoutPassword } = admin;

    return new Response(
      JSON.stringify({
        success: true,
        message: "Login successful",
        role: "admin",
        admin: adminWithoutPassword,
        token: token
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error('Login error:', err);
    return new Response(JSON.stringify({ 
      success: false,
      message: "Server error" 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
} 