import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../../../../lib/auth';

const prisma = new PrismaClient();

// GET: Get specific payment request
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    const { success, user } = verifyToken(authHeader.split(' ')[1]);
    if (!success) return new Response(JSON.stringify({ message: 'Invalid token' }), { status: 401 });

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

    // Check access permissions
    if (user.role === 'student' && paymentRequest.studentId !== user.id) {
      return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 });
    }

    return new Response(JSON.stringify({
      success: true,
      paymentRequest
    }), { status: 200 });

  } catch (err) {
    console.error('Error fetching payment request:', err);
    return new Response(JSON.stringify({ message: 'Server error', error: err.message }), { status: 500 });
  }
}

// PUT: Update payment request (admin: approve/reject, student: update own pending request)
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    const { success, user } = verifyToken(authHeader.split(' ')[1]);
    if (!success) return new Response(JSON.stringify({ message: 'Invalid token' }), { status: 401 });

    const data = await request.json();
    const paymentRequest = await prisma.paymentRequest.findUnique({
      where: { id: parseInt(id) },
      include: { rent: true }
    });

    if (!paymentRequest) {
      return new Response(JSON.stringify({ message: 'Payment request not found' }), { status: 404 });
    }

    let updateData = {};

    if (user.role === 'admin') {
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

          // Update rent record
          const rentUpdateData = {};
          
          // Update rent paid amounts
          if (paymentRequest.rentAmount > 0) {
            rentUpdateData.rentPaid = { increment: paymentRequest.rentAmount };
          }
          if (paymentRequest.advanceAmount > 0) {
            rentUpdateData.advancePaid = { increment: paymentRequest.advanceAmount };
          }
          if (paymentRequest.externalAmount > 0) {
            rentUpdateData.externalPaid = { increment: paymentRequest.externalAmount };
          }
          if (paymentRequest.previousDueAmount > 0) {
            rentUpdateData.previousDuePaid = { increment: paymentRequest.previousDueAmount };
          }

          // Update paid date and type
          rentUpdateData.paidDate = new Date();
          rentUpdateData.paidType = paymentRequest.paymentMethod;

          // Determine new status
          const totalDue = paymentRequest.rent.rentAmount + paymentRequest.rent.externalAmount + paymentRequest.rent.previousDue;
          const totalPaid = (paymentRequest.rent.rentPaid + paymentRequest.rentAmount) + 
                           (paymentRequest.rent.externalPaid + paymentRequest.externalAmount) + 
                           (paymentRequest.rent.previousDuePaid + paymentRequest.previousDueAmount);

          if (totalPaid >= totalDue) {
            rentUpdateData.status = 'paid';
          } else if (totalPaid > 0) {
            rentUpdateData.status = 'partial';
          }

          // Update rent
          await prisma.rent.update({
            where: { id: paymentRequest.rentId },
            data: rentUpdateData
          });
        }
      }
    } else if (user.role === 'student' && paymentRequest.studentId === user.id) {
      // Student can only update pending requests
      if (paymentRequest.status !== 'pending') {
        return new Response(JSON.stringify({ message: 'Can only update pending requests' }), { status: 400 });
      }

      // Student can update payment details for pending requests
      if (data.paymentMethod && ['on hand', 'online'].includes(data.paymentMethod)) {
        updateData.paymentMethod = data.paymentMethod;
      }
      if (data.bikashNumber !== undefined) {
        updateData.bikashNumber = data.bikashNumber;
      }
      if (data.trxId !== undefined) {
        updateData.trxId = data.trxId;
      }
      if (data.rentAmount !== undefined) {
        updateData.rentAmount = parseFloat(data.rentAmount);
      }
      if (data.advanceAmount !== undefined) {
        updateData.advanceAmount = parseFloat(data.advanceAmount);
      }
      if (data.externalAmount !== undefined) {
        updateData.externalAmount = parseFloat(data.externalAmount);
      }
      if (data.previousDueAmount !== undefined) {
        updateData.previousDueAmount = parseFloat(data.previousDueAmount);
      }

      // Recalculate total amount
      const totalAmount = (updateData.rentAmount || paymentRequest.rentAmount) + 
                         (updateData.advanceAmount || paymentRequest.advanceAmount) + 
                         (updateData.externalAmount || paymentRequest.externalAmount) + 
                         (updateData.previousDueAmount || paymentRequest.previousDueAmount);
      
      updateData.totalAmount = totalAmount;
    } else {
      return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 });
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

// DELETE: Delete payment request (student can delete own pending requests)
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    const { success, user } = verifyToken(authHeader.split(' ')[1]);
    if (!success) return new Response(JSON.stringify({ message: 'Invalid token' }), { status: 401 });

    const paymentRequest = await prisma.paymentRequest.findUnique({
      where: { id: parseInt(id) }
    });

    if (!paymentRequest) {
      return new Response(JSON.stringify({ message: 'Payment request not found' }), { status: 404 });
    }

    // Check permissions
    if (user.role === 'student' && paymentRequest.studentId !== user.id) {
      return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 });
    }

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