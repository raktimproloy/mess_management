import { PrismaClient } from '@prisma/client';
import { verifyAdminAuth } from '../../../../lib/auth';
import { sendSMS, generatePaymentRequestStatusMessage } from '../../../../lib/sms';

const prisma = new PrismaClient();

// GET: Get specific payment request
export async function GET(request, { params }) {
  try {
    // Verify admin authentication
    const authResult = verifyAdminAuth(request);
    if (!authResult.success) {
      return new Response(JSON.stringify({
        success: false,
        error: authResult.error
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    const { id } = await params;

    const paymentRequest = await prisma.paymentRequest.findUnique({
      where: { id: parseInt(id) },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            phone: true,
            smsPhone: true,
            status: true,
            categoryRef: true
          }
        },
        category: true,
        rent: true,
        rentHistory: true
      }
    });

    if (!paymentRequest) {
      return new Response(JSON.stringify({ message: 'Payment request not found' }), { status: 404 });
    }

    // Admin can access all payment requests
    return new Response(JSON.stringify({
      success: true,
      paymentRequest
    }), { status: 200 });

  } catch (err) {
    console.error('Error fetching payment request:', err);
    return new Response(JSON.stringify({ message: 'Server error', error: err.message }), { status: 500 });
  }
}

// PUT: Update payment request (admin: approve/reject)
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
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    const { id } = await params;

    const data = await request.json();
    const paymentRequest = await prisma.paymentRequest.findUnique({
      where: { id: parseInt(id) },
      include: { 
        rent: true,
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

    if (!paymentRequest) {
      return new Response(JSON.stringify({ message: 'Payment request not found' }), { status: 404 });
    }

    let updateData = {};
    let statusChanged = false;
    let oldStatus = paymentRequest.status;

    // Admin can approve/reject payment requests
    if (data.status && ['approved', 'rejected'].includes(data.status)) {
      updateData.status = data.status;
      statusChanged = oldStatus !== data.status;

      // If approved, create rent history and update rent
      if (data.status === 'approved') {
        // Create rent history record
        const rentHistory = await prisma.rentHistory.create({
          data: {
            rentMonth: `${paymentRequest.rent.createdAt.getFullYear()}-${String(paymentRequest.rent.createdAt.getMonth() + 1).padStart(2, '0')}`,
            paidDate: new Date(),
            studentId: paymentRequest.studentId,
            categoryId: paymentRequest.categoryId,
            status: 'approved',
            paymentType: paymentRequest.paymentMethod,
            dueRent: paymentRequest.rent.rentAmount,
            dueAdvance: paymentRequest.rent.advanceAmount,
            dueExternal: paymentRequest.rent.externalAmount,
            paidRent: paymentRequest.rentAmount,
            paidAdvance: paymentRequest.advanceAmount,
            paidExternal: paymentRequest.externalAmount,
            rentId: paymentRequest.rentId,
            details: {
              bikashNumber: paymentRequest.bikashNumber,
              trxId: paymentRequest.trxId,
              paymentRequestId: paymentRequest.id
            }
          }
        });

        // Update payment request with rent history ID
        updateData.rentHistoryId = rentHistory.id;

        // Update rent record: set paid fields to sum of previous + this request
        const rent = paymentRequest.rent;
        const newRentPaid = (rent.rentPaid || 0) + (paymentRequest.rentAmount || 0);
        const newAdvancePaid = (rent.advancePaid || 0) + (paymentRequest.advanceAmount || 0);
        const newExternalPaid = (rent.externalPaid || 0) + (paymentRequest.externalAmount || 0);
        const newPreviousDuePaid = (rent.previousDuePaid || 0) + (paymentRequest.previousDueAmount || 0);

        // Determine new status
        const totalDue = (rent.rentAmount || 0) + (rent.externalAmount || 0) + (rent.previousDue || 0);
        const totalPaid = newRentPaid + newExternalPaid + newPreviousDuePaid;
        let newStatus = 'unpaid';
        if (totalPaid >= totalDue) {
          newStatus = 'paid';
        } else if (totalPaid > 0) {
          newStatus = 'partial';
        }

        await prisma.rent.update({
          where: { id: paymentRequest.rentId },
          data: {
            rentPaid: newRentPaid,
            advancePaid: newAdvancePaid,
            externalPaid: newExternalPaid,
            previousDuePaid: newPreviousDuePaid,
            status: newStatus,
            paidDate: new Date(),
            paidType: paymentRequest.paymentMethod
          }
        });
      }
    }

    const updatedPaymentRequest = await prisma.paymentRequest.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            phone: true,
            smsPhone: true,
            status: true,
            categoryRef: true
          }
        },
        category: true,
        rent: true,
        rentHistory: true
      }
    });

    // Send SMS notification to student if status changed
    let smsResult = null;
    if (statusChanged) {
      try {
        console.log(`📱 === PAYMENT REQUEST STATUS SMS DEBUG START ===`);
        console.log(`📱 Student name: ${paymentRequest.student.name}`);
        console.log(`📱 Student phone: ${paymentRequest.student.phone}`);
        console.log(`📱 Student smsPhone: ${paymentRequest.student.smsPhone}`);
        
        const studentPhone = paymentRequest.student.phone || paymentRequest.student.smsPhone;
        console.log(`📱 Using phone number: ${studentPhone}`);
        
        if (studentPhone) {
          console.log(`📱 Generating payment request status message...`);
          const statusMessage = generatePaymentRequestStatusMessage(
            paymentRequest.student.name,
            {
              totalAmount: paymentRequest.totalAmount,
              rentAmount: paymentRequest.rentAmount,
              advanceAmount: paymentRequest.advanceAmount,
              externalAmount: paymentRequest.externalAmount,
              previousDueAmount: paymentRequest.previousDueAmount,
              paymentMethod: paymentRequest.paymentMethod,
              bikashNumber: paymentRequest.bikashNumber,
              trxId: paymentRequest.trxId,
              newStatus: updatedPaymentRequest.status
            }
          );
          console.log(`📱 Generated message: ${statusMessage}`);
          
          console.log(`📱 Calling sendSMS function...`);
          smsResult = await sendSMS(studentPhone, statusMessage);
          console.log(`📱 SMS API response:`, smsResult);
          console.log(`📱 Payment request status result: ${smsResult.success ? '✅ Success' : '❌ Failed'}`);
        } else {
          console.log(`⚠️ No phone number found for student: ${paymentRequest.student.name}`);
          smsResult = {
            success: false,
            message: 'No phone number available for student'
          };
        }
        console.log(`📱 === PAYMENT REQUEST STATUS SMS DEBUG END ===`);
        
      } catch (smsError) {
        console.error(`❌ Payment request status SMS error:`, smsError);
        smsResult = {
          success: false,
          message: 'Payment request status SMS sending failed',
          error: smsError.message
        };
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Payment request updated successfully',
      paymentRequest: updatedPaymentRequest,
      statusChanged,
      smsNotification: smsResult
    }), { status: 200 });

  } catch (err) {
    console.error('Error updating payment request:', err);
    return new Response(JSON.stringify({ message: 'Server error', error: err.message }), { status: 500 });
  }
}

// DELETE: Delete payment request (admin only)
export async function DELETE(request, { params }) {
  try {
    // Verify admin authentication
    const authResult = verifyAdminAuth(request);
    if (!authResult.success) {
      return new Response(JSON.stringify({
        success: false,
        error: authResult.error
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    const { id } = await params;

    const paymentRequest = await prisma.paymentRequest.findUnique({
      where: { id: parseInt(id) }
    });

    if (!paymentRequest) {
      return new Response(JSON.stringify({ message: 'Payment request not found' }), { status: 404 });
    }

    // Admin can delete any payment request
    // Only allow deletion of pending requests
    if (paymentRequest.status !== 'pending') {
      return new Response(JSON.stringify({ message: 'Can only delete pending requests' }), { status: 400 });
    }

    await prisma.paymentRequest.delete({
      where: { id: parseInt(id) }
    });

    return new Response(JSON.stringify({
      success: true,
      message: 'Payment request deleted successfully'
    }), { status: 200 });

  } catch (err) {
    console.error('Error deleting payment request:', err);
    return new Response(JSON.stringify({ message: 'Server error', error: err.message }), { status: 500 });
  }
} 