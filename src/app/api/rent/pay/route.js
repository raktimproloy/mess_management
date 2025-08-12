import { PrismaClient } from '@prisma/client';
import { sendSMS, generateRentPaymentConfirmationMessage } from '../../../../lib/sms';

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

    // Send SMS notification to student
    let smsResult = null;
    try {
      console.log(`📱 === RENT PAYMENT SMS DEBUG START ===`);
      console.log(`📱 Student name: ${rent.student.name}`);
      console.log(`📱 Student phone: ${rent.student.phone}`);
      console.log(`📱 Student smsPhone: ${rent.student.smsPhone}`);
      
      const studentPhone = rent.student.smsPhone;
      console.log(`📱 Using phone number: ${studentPhone}`);
      
      if (studentPhone) {
        console.log(`📱 Generating payment confirmation message...`);
        const paymentMessage = generateRentPaymentConfirmationMessage(
          rent.student.name,
          {
            rentPaid: rentPaid || 0,
            advancePaid: advancePaid || 0,
            externalPaid: externalPaid || 0,
            previousDuePaid: previousDuePaid || 0,
            totalPaid: (rentPaid || 0) + (advancePaid || 0) + (externalPaid || 0) + (previousDuePaid || 0),
            paymentType: paidType || 'on hand',
            newStatus: newStatus
          }
        );
        console.log(`📱 Generated message: ${paymentMessage}`);
        
        console.log(`📱 Calling sendSMS function...`);
        smsResult = await sendSMS(studentPhone, paymentMessage);
        console.log(`📱 SMS API response:`, smsResult);
        console.log(`📱 Payment confirmation result: ${smsResult.success ? '✅ Success' : '❌ Failed'}`);
      } else {
        console.log(`⚠️ No phone number found for student: ${rent.student.name}`);
        smsResult = {
          success: false,
          message: 'No phone number available for student'
        };
      }
      console.log(`📱 === RENT PAYMENT SMS DEBUG END ===`);
      
    } catch (smsError) {
      console.error(`❌ Payment SMS error:`, smsError);
      smsResult = {
        success: false,
        message: 'Payment SMS sending failed',
        error: smsError.message
      };
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Payment processed successfully',
      rent: updatedRent,
      history: rentHistory,
      status: newStatus,
      smsNotification: smsResult
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