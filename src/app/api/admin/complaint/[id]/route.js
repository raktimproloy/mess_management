import { PrismaClient } from '@prisma/client';
import { verifyAdminAuth } from '../../../../../lib/auth';

const prisma = new PrismaClient();

// PUT: Update complaint status (admin only)
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

    const data = await request.json();
    const { status } = data;

    // Validate status
    if (!status || !['pending', 'checking', 'solved', 'canceled'].includes(status)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Valid status is required (pending, checking, solved, canceled)'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Update complaint status
    const updatedComplaint = await prisma.complaint.update({
      where: { id: complaintId },
      data: { status },
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
      message: `Complaint status updated to ${status}`,
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