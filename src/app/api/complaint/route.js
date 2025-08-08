import { PrismaClient } from '@prisma/client';
import { verifyStudentAuth } from '../../../lib/auth';
import { sendSMS, generateComplaintOwnerNotification } from '../../../lib/sms';
import { CONFIG } from '../../../lib/config.js';

const prisma = new PrismaClient();

// GET: Get complaints for authenticated student
export async function GET(request) {
  try {
    const authResult = verifyStudentAuth(request);
    if (!authResult.success) {
      return new Response(JSON.stringify({
        success: false,
        error: authResult.error
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const status = url.searchParams.get('status') || '';
    const search = url.searchParams.get('search') || '';
    const complainFor = url.searchParams.get('complainFor') || '';

    let where = { studentId: authResult.student.id };

    if (status) where.status = status;
    if (complainFor) where.complainFor = complainFor;
    if (search) where.title = { contains: search };

    const [total, complaints] = await Promise.all([
      prisma.complaint.count({ where }),
      prisma.complaint.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          student: {
            select: {
              id: true, name: true, phone: true, smsPhone: true, status: true
            }
          }
        }
      })
    ]);

    const allComplaints = await prisma.complaint.findMany({ 
      where: { studentId: authResult.student.id } 
    });
    
    const summary = allComplaints.reduce((acc, complaint) => {
      acc.totalComplaints++;
      if (complaint.status === 'pending') acc.pendingComplaints++;
      else if (complaint.status === 'checking') acc.checkingComplaints++;
      else if (complaint.status === 'solved') acc.solvedComplaints++;
      else if (complaint.status === 'canceled') acc.canceledComplaints++;
      return acc;
    }, {
      totalComplaints: 0,
      pendingComplaints: 0,
      checkingComplaints: 0,
      solvedComplaints: 0,
      canceledComplaints: 0
    });

    return new Response(JSON.stringify({
      success: true,
      complaints,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      summary
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error fetching complaints:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// POST: Create new complaint (only living students)
export async function POST(request) {
  try {
    const authResult = verifyStudentAuth(request);
    console.log(authResult)
    if (!authResult.success) {
      return new Response(JSON.stringify({
        success: false,
        error: authResult.error
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (authResult.student.status !== 'living') {
      return new Response(JSON.stringify({
        success: false,
        error: 'Only living students can create complaints'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { title, details, complainFor } = await request.json();

    if (!title || !details || !complainFor) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Title, details, and complain type are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!['mess', 'room'].includes(complainFor)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Complain type must be either "mess" or "room"'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const newComplaint = await prisma.complaint.create({
      data: {
        studentId: authResult.student.id,
        title: title.trim(),
        details: details.trim(),
        complainFor: complainFor,
        status: 'pending'
      },
      include: {
        student: {
          select: {
            id: true, name: true, phone: true, smsPhone: true, status: true
          }
        }
      }
    });

    // Send SMS notification to owner
    let smsResult = null;
    try {
      console.log(`📱 Sending complaint notification to owner for student: ${authResult.student.name}`);
      
      const ownerPhone = CONFIG.OWNER.PHONE; // Use configured owner phone number
      const ownerMessage = generateComplaintOwnerNotification(
        authResult.student.name,
        title.trim(),
        complainFor,
        details.trim(),
        authResult.student.phone || authResult.student.smsPhone
      );
      
      smsResult = await sendSMS(ownerPhone, ownerMessage);
      console.log(`📱 Owner notification result: ${smsResult.success ? '✅ Success' : '❌ Failed'}`);
      
    } catch (smsError) {
      console.error(`❌ Owner SMS error:`, smsError);
      smsResult = {
        success: false,
        message: 'Owner SMS sending failed',
        error: smsError.message
      };
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Complaint created successfully',
      complaint: newComplaint,
      smsNotification: smsResult
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error creating complaint:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 