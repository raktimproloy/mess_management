import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        name: true,
        phone: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return new Response(JSON.stringify({
      success: true,
      admins: admins
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Error fetching admins:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

export async function POST(request) {
  try {
    const { name, phone, password } = await request.json();

    // Validate required fields
    if (!name || !phone || !password) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Name, phone, and password are required'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Check if admin with this phone already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: {
        phone: phone
      }
    });

    if (existingAdmin) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Admin with this phone number already exists'
      }), {
        status: 409,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new admin
    const newAdmin = await prisma.admin.create({
      data: {
        name: name,
        phone: phone,
        password: hashedPassword
      }
    });

    // Return success response (without password)
    const { password: _, ...adminWithoutPassword } = newAdmin;

    return new Response(JSON.stringify({
      success: true,
      message: 'Admin created successfully',
      admin: adminWithoutPassword
    }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Error creating admin:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
} 