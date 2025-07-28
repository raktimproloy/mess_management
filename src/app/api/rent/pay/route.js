import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { rentId, rentPaid, advancePaid, externalPaid, previousDuePaid, paymentType = 'partial', paidType } = await request.json();

    if (!rentId) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Rent ID is required' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get the rent record
    const rent = await prisma.rent.findUnique({
      where: { id: parseInt(rentId) },
      include: { student: true, category: true }
    });

    if (!rent) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Rent not found' 
      }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Calculate payment distribution
    let newPreviousDuePaid = (rent.previousDuePaid || 0) + (previousDuePaid || 0);
    let newRentPaid = (rent.rentPaid || 0) + (rentPaid || 0);
    let newExternalPaid = (rent.externalPaid || 0) + (externalPaid || 0);

    // Calculate total due and paid for current month
    const totalDue = rent.rentAmount + rent.externalAmount;
    const totalPaid = newRentPaid + newExternalPaid;

    // Determine new status
    let newStatus = 'unpaid';
    if (totalPaid >= totalDue && (rent.previousDue - newPreviousDuePaid) <= 0) {
      newStatus = 'paid';
    } else if (totalPaid > 0 || newPreviousDuePaid > 0) {
      newStatus = 'partial';
    }

    // Update rent record
    const updatedRent = await prisma.rent.update({
      where: { id: parseInt(rentId) },
      data: {
        rentPaid: newRentPaid,
        advancePaid: (rent.advancePaid || 0) + (advancePaid || 0),
        externalPaid: newExternalPaid,
        previousDuePaid: newPreviousDuePaid,
        status: newStatus,
        paidDate: new Date(),
        paidType: paidType || 'on hand'
      }
    });

    // Create rent history record using createdAt for rentMonth
    const rentHistory = await prisma.rentHistory.create({
      data: {
        rentMonth: `${rent.createdAt.getFullYear()}-${String(rent.createdAt.getMonth() + 1).padStart(2, '0')}`,
        paidDate: new Date(),
        studentId: rent.studentId,
        categoryId: rent.categoryId,
        status: 'approved',
        paymentType: paidType || 'on hand',
        dueRent: rent.rentAmount - (rent.rentPaid || 0),
        dueAdvance: (rent.advanceAmount || 0) - (rent.advancePaid || 0),
        dueExternal: rent.externalAmount - (rent.externalPaid || 0),
        paidRent: rentPaid || 0,
        paidAdvance: advancePaid || 0,
        paidExternal: externalPaid || 0,
        rentId: rent.id,
        details: {
          paymentType: paidType || 'on hand',
          previousDue: rent.previousDue,
          previousDuePaid: newPreviousDuePaid - (rent.previousDuePaid || 0),
          totalPaid: totalPaid,
          totalDue: totalDue
        }
      }
    });

    return new Response(JSON.stringify({
      success: true,
      message: 'Payment processed successfully',
      rent: updatedRent,
      history: rentHistory,
      status: newStatus
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Payment error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 