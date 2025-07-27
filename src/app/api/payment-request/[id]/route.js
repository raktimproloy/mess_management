import { PrismaClient } from '@prisma/client';
import { verifyAdminAuth } from '../../../../lib/auth';

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

    const { id } = params;

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

    const { id } = params;

    const data = await request.json();
    const paymentRequest = await prisma.paymentRequest.findUnique({
      where: { id: parseInt(id) },
      include: { rent: true }
    });

    if (!paymentRequest) {
      return new Response(JSON.stringify({ message: 'Payment request not found' }), { status: 404 });
    }

    let updateData = {};

    // Admin can approve/reject payment requests
    if (data.status && ['approved', 'rejected'].includes(data.status)) {
      updateData.status = data.status;

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

    return new Response(JSON.stringify({
      success: true,
      message: 'Payment request updated successfully',
      paymentRequest: updatedPaymentRequest
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

    const { id } = params;

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