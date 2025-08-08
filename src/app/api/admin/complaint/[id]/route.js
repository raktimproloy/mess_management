import { PrismaClient } from '@prisma/client';
import { verifyAdminAuth } from '../../../../../lib/auth';
import { sendSMS, generateComplaintStatusUpdateMessage } from '../../../../../lib/sms';

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

    // Check if status is actually changing
    const statusChanged = complaint.status !== status;

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

    // Send SMS notification to student if status changed
    let smsResult = null;
    if (statusChanged) {
      try {
        console.log(`📱 === SMS DEBUG START ===`);
        console.log(`📱 Student name: ${complaint.student.name}`);
        console.log(`📱 Student phone: ${complaint.student.phone}`);
        console.log(`📱 Student smsPhone: ${complaint.student.smsPhone}`);
        
        const studentPhone = complaint.student.phone || complaint.student.smsPhone;
        console.log(`📱 Using phone number: ${studentPhone}`);
        
        if (studentPhone) {
          console.log(`📱 Generating SMS message...`);
          const studentMessage = generateComplaintStatusUpdateMessage(
            complaint.student.name,
            updatedComplaint.title,
            updatedComplaint.status,
            updatedComplaint.complainFor
          );
          console.log(`📱 Generated message: ${studentMessage}`);
          
          console.log(`📱 Calling sendSMS function...`);
          smsResult = await sendSMS(studentPhone, studentMessage);
          console.log(`📱 SMS API response:`, smsResult);
          console.log(`📱 Student notification result: ${smsResult.success ? '✅ Success' : '❌ Failed'}`);
        } else {
          console.log(`⚠️ No phone number found for student: ${complaint.student.name}`);
          smsResult = {
            success: false,
            message: 'No phone number available for student'
          };
        }
        console.log(`📱 === SMS DEBUG END ===`);
        
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
      message: `Complaint status updated to ${status}`,
      complaint: updatedComplaint,
      statusChanged,
      smsNotification: smsResult
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