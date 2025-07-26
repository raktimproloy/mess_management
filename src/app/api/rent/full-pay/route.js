import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { rentId, paidType } = await request.json();

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

    // Calculate total amounts
    const totalRentAmount = rent.rentAmount + rent.externalAmount;
    const totalAdvanceAmount = rent.advanceAmount || 0;
    const previousDueRemaining = rent.previousDue - (rent.previousDuePaid || 0);

    // Update rent record to fully paid
    const updatedRent = await prisma.rent.update({
      where: { id: parseInt(rentId) },
      data: {
        rentPaid: rent.rentAmount,
        externalPaid: rent.externalAmount,
        advancePaid: rent.advanceAmount || 0,
        previousDuePaid: rent.previousDue, // Pay off all previous due
        status: 'paid',
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
        dueRent: totalRentAmount,
        dueAdvance: totalAdvanceAmount,
        dueExternal: rent.externalAmount,
        paidRent: rent.rentAmount,
        paidAdvance: rent.advanceAmount || 0,
        paidExternal: rent.externalAmount,
        rentId: rent.id,
        details: {
          paymentType: paidType || 'on hand',
          previousDue: rent.previousDue,
          previousDuePaid: previousDueRemaining,
          totalPaid: totalRentAmount + previousDueRemaining
        }
      }
    });

    return new Response(JSON.stringify({
      success: true,
      message: 'Rent fully paid successfully',
      rent: updatedRent,
      history: rentHistory
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Full pay error:', error);
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