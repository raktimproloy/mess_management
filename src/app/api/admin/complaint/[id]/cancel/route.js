import { PrismaClient } from '@prisma/client';
import { verifyAdminAuth } from '../../../../../../lib/auth';

const prisma = new PrismaClient();

// PUT: Mark complaint as canceled (admin only)
export async function PUT(request, { params }) {
  try {
    // Verify admin authentication
    const authResult = verifyAdminAuth(request);
    if (!authResult.success) {
      return new Response(JSON.stringify({
        success: false,
        error: authResult.error
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { id } = params;
    const complaintId = parseInt(id);

    if (isNaN(complaintId)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid complaint ID'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            phone: true,
            smsPhone: true,
            status: true
          }
        }
      }
    });

    if (!complaint) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Complaint not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Update complaint status to canceled
    const updatedComplaint = await prisma.complaint.update({
      where: { id: complaintId },
      data: { status: 'canceled' },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            phone: true,
            smsPhone: true,
            status: true
          }
        }
      }
    });

    return new Response(JSON.stringify({
      success: true,
      message: 'Complaint marked as canceled',
      complaint: updatedComplaint
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error updating complaint status:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 