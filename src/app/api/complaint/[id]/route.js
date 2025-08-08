import { PrismaClient } from '@prisma/client';
import { verifyStudentAuth, verifyAdminAuth } from '../../../../lib/auth';
import { sendSMS, generateComplaintStatusUpdateMessage } from '../../../../lib/sms';

const prisma = new PrismaClient();

// GET: Get specific complaint (student can see their own, admin can see any)
export async function GET(request, { params }) {
  try {
    const { id } = await params;
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

    // Try admin auth first
    let user = null;
    let isAdmin = false;
    let authResult = verifyAdminAuth(request);
    if (authResult.success) {
      user = authResult.user;
      isAdmin = true;
    } else {
      // Try student auth
      const studentAuthResult = verifyStudentAuth(request);
      if (!studentAuthResult.success) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Unauthorized'
        }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      user = studentAuthResult.student;
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

    // Students can only see their own complaints
    if (!isAdmin && complaint.studentId !== user.id) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Forbidden'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      complaint
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error fetching complaint:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// PUT: Update complaint (students can edit title/details, admin can change status)
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
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

    // Try admin auth first
    let user = null;
    let isAdmin = false;
    let authResult = verifyAdminAuth(request);
    if (authResult.success) {
      user = authResult.user;
      isAdmin = true;
    } else {
      // Try student auth
      const studentAuthResult = verifyStudentAuth(request);
      if (!studentAuthResult.success) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Unauthorized'
        }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      user = studentAuthResult.student;
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

    // Students can only edit their own complaints
    if (!isAdmin && complaint.studentId !== user.id) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Forbidden'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await request.json();
    let updateData = {};
    let statusChanged = false;
    let oldStatus = complaint.status;

    if (isAdmin) {
      // Admin can only change status
      if (data.status && ['pending', 'checking', 'solved', 'canceled'].includes(data.status)) {
        updateData.status = data.status;
        statusChanged = oldStatus !== data.status;
      }
    } else {
      // Students can only edit title and details
      if (data.title) {
        updateData.title = data.title.trim();
      }
      if (data.details) {
        updateData.details = data.details.trim();
      }
    }

    if (Object.keys(updateData).length === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'No valid fields to update'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const updatedComplaint = await prisma.complaint.update({
      where: { id: complaintId },
      data: updateData,
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

    // Send SMS notification to student if status was changed by admin
    let smsResult = null;
    if (isAdmin && statusChanged) {
      try {
        console.log(`📱 Sending complaint status update to student: ${complaint.student.name}`);
        
        const studentPhone = complaint.student.phone || complaint.student.smsPhone;
        if (studentPhone) {
          const studentMessage = generateComplaintStatusUpdateMessage(
            complaint.student.name,
            updatedComplaint.title,
            updatedComplaint.status,
            updatedComplaint.complainFor
          );
          
          smsResult = await sendSMS(studentPhone, studentMessage);
          console.log(`📱 Student notification result: ${smsResult.success ? '✅ Success' : '❌ Failed'}`);
        } else {
          console.log(`⚠️ No phone number found for student: ${complaint.student.name}`);
          smsResult = {
            success: false,
            message: 'No phone number available for student'
          };
        }
        
      } catch (smsError) {
        console.error(`❌ Student SMS error:`, smsError);
        smsResult = {
          success: false,
          message: 'Student SMS sending failed',
          error: smsError.message
        };
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Complaint updated successfully',
      complaint: updatedComplaint,
      statusChanged,
      smsNotification: smsResult
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error updating complaint:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// DELETE: Delete complaint (students can delete their own, admin can delete any)
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
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

    // Try admin auth first
    let user = null;
    let isAdmin = false;
    let authResult = verifyAdminAuth(request);
    if (authResult.success) {
      user = authResult.user;
      isAdmin = true;
    } else {
      // Try student auth
      const studentAuthResult = verifyStudentAuth(request);
      if (!studentAuthResult.success) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Unauthorized'
        }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      user = studentAuthResult.student;
    }

    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId }
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

    // Students can only delete their own complaints
    if (!isAdmin && complaint.studentId !== user.id) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Forbidden'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // For students, change status to canceled instead of deleting
    if (!isAdmin) {
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
        message: 'Complaint canceled successfully',
        complaint: updatedComplaint
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      // Admin can actually delete the complaint
      await prisma.complaint.delete({
        where: { id: complaintId }
      });

      return new Response(JSON.stringify({
        success: true,
        message: 'Complaint deleted successfully'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('Error deleting complaint:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 