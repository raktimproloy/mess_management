import { promises as fs } from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';
const adminsPath = path.join(process.cwd(), 'public/database/admins.json');

export async function POST(request) {
  try {
    const { phone, password } = await request.json();
    
    if (!phone || !password) {
      return new Response(JSON.stringify({ message: "Phone and password are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Read admins from JSON file
    const adminsData = await fs.readFile(adminsPath, 'utf-8');
    const admins = JSON.parse(adminsData);
    
    // Find admin with matching credentials
    const admin = admins.find(admin => admin.phone === phone && admin.password === password);
    
    if (!admin) {
      return new Response(JSON.stringify({ message: "Invalid phone or password" }), {
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

    return new Response(
      JSON.stringify({
        message: "Login successful",
        role: "admin",
        admin: {
          id: admin.id,
          name: admin.name,
          phone: admin.phone
        },
        token: token
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error('Login error:', err);
    return new Response(JSON.stringify({ message: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
} 