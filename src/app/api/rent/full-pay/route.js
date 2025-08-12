import { PrismaClient } from '@prisma/client';
import { sendSMS, generateRentPaymentConfirmationMessage } from '../../../../lib/sms';

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
      include: { 
        student: {
          select: {
            id: true,
            name: true,
            phone: true,
            smsPhone: true,
            status: true
          }
        }, 
        category: true 
      }
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

    // Send SMS notification to student
    let smsResult = null;
    try {
      console.log(`📱 === FULL PAYMENT SMS DEBUG START ===`);
      console.log(`📱 Student name: ${rent.student.name}`);
      console.log(`📱 Student phone: ${rent.student.phone}`);
      console.log(`📱 Student smsPhone: ${rent.student.smsPhone}`);
      
      const studentPhone = rent.student.smsPhone;
      console.log(`📱 Using phone number: ${studentPhone}`);
      
      if (studentPhone) {
        console.log(`📱 Generating full payment confirmation message...`);
        const paymentMessage = generateRentPaymentConfirmationMessage(
          rent.student.name,
          {
            rentPaid: rent.rentAmount,
            advancePaid: rent.advanceAmount || 0,
            externalPaid: rent.externalAmount,
            previousDuePaid: rent.previousDue,
            totalPaid: totalRentAmount + rent.previousDue,
            paymentType: paidType || 'on hand',
            newStatus: 'paid'
          }
        );
        console.log(`📱 Generated message: ${paymentMessage}`);
        
        console.log(`📱 Calling sendSMS function...`);
        smsResult = await sendSMS(studentPhone, paymentMessage);
        console.log(`📱 SMS API response:`, smsResult);
        console.log(`📱 Full payment confirmation result: ${smsResult.success ? '✅ Success' : '❌ Failed'}`);
      } else {
        console.log(`⚠️ No phone number found for student: ${rent.student.name}`);
        smsResult = {
          success: false,
          message: 'No phone number available for student'
        };
      }
      console.log(`📱 === FULL PAYMENT SMS DEBUG END ===`);
      
    } catch (smsError) {
      console.error(`❌ Full payment SMS error:`, smsError);
      smsResult = {
        success: false,
        message: 'Full payment SMS sending failed',
        error: smsError.message
      };
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Rent fully paid successfully',
      rent: updatedRent,
      history: rentHistory,
      smsNotification: smsResult
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