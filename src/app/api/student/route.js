import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sendSMS, generateWelcomeMessage } from '../../../lib/sms';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXT_PUBLIC_JWT_SECRET;

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';
    const categoryId = url.searchParams.get('categoryId') || '';

    // Build where clause
    let where = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { phone: { contains: search } },
        { smsPhone: { contains: search } }
      ];
    }
    
    if (status) {
      where.status = status;
    }
    
    if (categoryId) {
      where.categoryId = parseInt(categoryId);
    }

    // Get total count and students with pagination
    const [total, students] = await Promise.all([
      prisma.student.count({ where }),
      prisma.student.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          categoryRef: {
            select: {
              id: true,
              title: true,
              rentAmount: true
            }
          },
          discountRef: {
            select: {
              id: true,
              title: true,
              discountAmount: true,
              discountType: true
            }
          },
          references: {
            select: {
              id: true,
              name: true,
              phone: true
            }
          }
        }
      })
    ]);

    return new Response(JSON.stringify({
      success: true,
      students,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error fetching students:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.phone || !data.categoryId || !data.joiningDate) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if student with this phone already exists
    const existingStudent = await prisma.student.findUnique({
      where: { phone: data.phone }
    });

    if (existingStudent) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Student with this phone number already exists'
      }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password || data.phone, 10);

    // Get category details for SMS
    const category = await prisma.category.findUnique({
      where: { id: parseInt(data.categoryId) }
    });

    // Create new student
    const newStudent = await prisma.student.create({
      data: {
        name: data.name,
        phone: data.phone,
        smsPhone: data.smsPhone || data.phone,
        password: hashedPassword,
        profileImage: data.profileImage || '',
        hideRanking: data.hideRanking || 0,
        status: data.status || 'living',
        categoryId: parseInt(data.categoryId),
        referenceId: data.referenceId ? parseInt(data.referenceId) : null,
        discountId: data.discountId ? parseInt(data.discountId) : null,
        discountAmount: data.discountAmount || 0,
        bookingAmount: data.bookingAmount || 0,
        joiningDate: new Date(data.joiningDate)
      },
      include: {
        categoryRef: {
          select: {
            id: true,
            title: true,
            rentAmount: true
          }
        }
      }
    });

    // Send welcome SMS
    try {
      const welcomeMessage = generateWelcomeMessage(
        newStudent.name,
        category.title,
        category.rentAmount
      );
      
      const smsResult = await sendSMS(newStudent.smsPhone, welcomeMessage);
      
      console.log(`📱 Welcome SMS result for ${newStudent.name}:`, smsResult);
      
      // Add SMS result to response
      newStudent.smsSent = smsResult.success;
      newStudent.smsMessage = smsResult.message;
      
    } catch (smsError) {
      console.error(`❌ SMS error for ${newStudent.name}:`, smsError);
      newStudent.smsSent = false;
      newStudent.smsMessage = 'SMS sending failed';
    }

    // Remove password from response
    const { password, ...studentWithoutPassword } = newStudent;

    return new Response(JSON.stringify({
      success: true,
      message: 'Student created successfully',
      student: studentWithoutPassword
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error creating student:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 