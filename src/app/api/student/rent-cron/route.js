import { PrismaClient } from '@prisma/client';
import { sendSMS, sendBulkSMSWithGenerator, generateRentReminderMessage } from '../../../../lib/sms';
import { CONFIG } from '../../../../lib/config.js';

const prisma = new PrismaClient();

function getMonthYear(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Calculate booking amount deduction and return adjusted amounts
 * @param {number} bookingAmount - Student's booking amount
 * @param {number} rentAmount - Category rent amount
 * @param {number} externalAmount - Category external amount
 * @param {number} advanceAmount - Carry forward advance amount
 * @returns {object} Adjusted amounts and remaining booking amount
 */
function calculateBookingDeduction(bookingAmount, rentAmount, externalAmount, advanceAmount) {
  let remainingBookingAmount = bookingAmount;
  let adjustedRentAmount = rentAmount;
  let adjustedExternalAmount = externalAmount;
  let adjustedAdvanceAmount = advanceAmount;

  // First, deduct from rent amount
  if (remainingBookingAmount > 0 && adjustedRentAmount > 0) {
    const deductionFromRent = Math.min(remainingBookingAmount, adjustedRentAmount);
    adjustedRentAmount -= deductionFromRent;
    remainingBookingAmount -= deductionFromRent;
  }

  // Then, deduct from external amount
  if (remainingBookingAmount > 0 && adjustedExternalAmount > 0) {
    const deductionFromExternal = Math.min(remainingBookingAmount, adjustedExternalAmount);
    adjustedExternalAmount -= deductionFromExternal;
    remainingBookingAmount -= deductionFromExternal;
  }

  // Finally, deduct from advance amount
  if (remainingBookingAmount > 0 && adjustedAdvanceAmount > 0) {
    const deductionFromAdvance = Math.min(remainingBookingAmount, adjustedAdvanceAmount);
    adjustedAdvanceAmount -= deductionFromAdvance;
    remainingBookingAmount -= deductionFromAdvance;
  }

  return {
    adjustedRentAmount: Math.max(0, adjustedRentAmount),
    adjustedExternalAmount: Math.max(0, adjustedExternalAmount),
    adjustedAdvanceAmount: Math.max(0, adjustedAdvanceAmount),
    remainingBookingAmount: Math.max(0, remainingBookingAmount)
  };
}

export async function POST(request) {
  try {
    const now = new Date();
    const currentMonthYear = getMonthYear(now);
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthYear = getMonthYear(prevMonth);

    // Get all active discounts
    const discounts = await prisma.discount.findMany({
      where: { status: 1 },
      orderBy: { createdAt: 'desc' }
    });

    // Get all living students with joining date in the past or present
    const students = await prisma.student.findMany({
      where: {
        status: 'living',
        joiningDate: { lte: now }, // Only include students who have already joined
      },
      include: { 
        categoryRef: true,
        discountRef: true,
      },
    });

    let createdRents = [];
    let skippedStudents = [];
    let errorStudents = [];
    let smsRecipients = [];

    for (const student of students) {
      try {

        // 1. Check if joining date is in the future (should not happen due to query filter, but double-check)
        if (student.joiningDate > now) {
          skippedStudents.push({
            studentId: student.id,
            studentName: student.name,
            reason: 'Future joining date',
            joiningDate: student.joiningDate
          });
          continue;
        }

        // 2. Check if rent for this month already exists
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        
        const existingRent = await prisma.rent.findFirst({
          where: {
            studentId: student.id,
            createdAt: {
              gte: currentMonthStart,
              lt: currentMonthEnd,
            },
          },
        });
        
        if (existingRent) {
          skippedStudents.push({
            studentId: student.id,
            studentName: student.name,
            reason: 'Rent already exists for current month',
            existingRentId: existingRent.id
          });
          continue;
        }

        // 3. Validate category exists
        const category = student.categoryRef;
        if (!category) {
          skippedStudents.push({
            studentId: student.id,
            studentName: student.name,
            reason: 'No category assigned'
          });
          continue;
        }

        // 4. Get previous month's rent for due calculation
        const prevRentQueryStart = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), 1);
        const prevRentQueryEnd = new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 1);
        
        const prevRent = await prisma.rent.findFirst({
          where: {
            studentId: student.id,
            createdAt: {
              gte: prevRentQueryStart,
              lt: prevRentQueryEnd,
            },
          },
        });
        
        let previousDue = 0;
        let previousDuePaid = 0;
        let carryForwardAdvance = 0;
        let isFirstMonth = false;
        
        if (prevRent) {
          
          // Calculate unpaid amount from previous month
          const totalAmount = (prevRent.rentAmount || 0) + (prevRent.externalAmount || 0) + (prevRent.previousDue || 0);
          const totalPaid = (prevRent.rentPaid || 0) + (prevRent.externalPaid || 0) + (prevRent.previousDuePaid || 0);
          previousDue = Math.max(0, totalAmount - totalPaid);
          
          // Calculate carry-forward advance
          carryForwardAdvance = Math.max(0, (prevRent.advanceAmount || 0) - (prevRent.advancePaid || 0));
          
        } else {
          // This is the student's first month (joining month)
          isFirstMonth = true;
        }

        // 5. Calculate reference discount
        let discountAmount = 0;
        let discountInfo = null;
        
        const invitedStudents = await prisma.student.findMany({
          where: {
            referenceId: student.id,
            status: 'living'
          },
          include: {
            discountRef: true
          }
        });
        
        if (invitedStudents.length > 0) {
          
          let totalDiscountAmount = 0;
          let discountDetails = [];
          
          for (const invitedStudent of invitedStudents) {
            if (invitedStudent.discountRef) {
              const discount = invitedStudent.discountRef;
              let studentDiscountAmount = 0;
              
              if (discount.discountType === 'percent') {
                studentDiscountAmount = (category.rentAmount * discount.discountAmount) / 100;
              } else {
                studentDiscountAmount = discount.discountAmount;
              }
              
              totalDiscountAmount += studentDiscountAmount;
              discountDetails.push({
                invitedStudentId: invitedStudent.id,
                invitedStudentName: invitedStudent.name,
                discountId: invitedStudent.discountId,
                discountTitle: discount.title,
                discountType: discount.discountType,
                discountAmount: studentDiscountAmount
              });
            }
          }
          
          if (totalDiscountAmount > 0) {
            discountAmount = totalDiscountAmount;
            discountInfo = {
              referenceStudentId: student.id,
              referenceStudentName: student.name,
              totalDiscountAmount: discountAmount,
              invitedStudentsCount: invitedStudents.length,
              discountDetails: discountDetails,
              note: `Reference discount for inviting ${invitedStudents.length} students`
            };
          }
        }

        // 6. Calculate booking amount deduction
        const bookingAmount = student.bookingAmount || 0;
        
        // For first month, add rent amount to advance amount
        let adjustedAdvanceForBooking = carryForwardAdvance;
        if (isFirstMonth) {
          adjustedAdvanceForBooking += category.rentAmount;
        }
        
        const deductionResult = calculateBookingDeduction(
          bookingAmount,
          category.rentAmount,
          category.externalAmount || 0,
          adjustedAdvanceForBooking
        );

        // 7. Update student's booking amount if needed
        if (bookingAmount !== deductionResult.remainingBookingAmount) {
          await prisma.student.update({
            where: { id: student.id },
            data: { bookingAmount: deductionResult.remainingBookingAmount }
          });
        }

        // 8. Create new rent record
        let finalAdvanceAmount = deductionResult.adjustedAdvanceAmount;
        let finalRentAmount = deductionResult.adjustedRentAmount;
        
        // For first month (new joining), set rent to 1200 and advance to 1200
        if (isFirstMonth) {
          finalRentAmount = 1200;
          finalAdvanceAmount = 1200;
        }
        
        const newRent = await prisma.rent.create({
          data: {
            studentId: student.id,
            categoryId: category.id,
            rentAmount: finalRentAmount,
            externalAmount: deductionResult.adjustedExternalAmount,
            previousDue,
            previousDuePaid,
            advanceAmount: finalAdvanceAmount,
            status: 'unpaid',
            rentPaid: 0,
            advancePaid: 0,
            externalPaid: 0,
            paidDate: null,
            paidType: null,
            discountAmount: discountAmount,
          },
        });

        // 9. Prepare SMS recipient data
        const rentDue = finalRentAmount;
        const externalDue = deductionResult.adjustedExternalAmount;
        const advanceDue = finalAdvanceAmount;
        const totalDueAmount = rentDue + externalDue + advanceDue + previousDue; // Fixed: include previousDue
        const dueDate = new Date(now.getFullYear(), now.getMonth(), 5); // 5th of current month
        
        smsRecipients.push({
          studentId: student.id,
          studentName: student.name,
          phone: student.phone,
          smsPhone: student.smsPhone,
          rentDue,
          externalDue,
          advanceDue,
          previousDue, // Added previousDue to SMS data
          totalDueAmount,
          dueDate: dueDate.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          bikashNumber: CONFIG.PAYMENT.BIKASH_NUMBER, // Use configured Bikash number
          isFirstMonth
        });

        createdRents.push({
          ...newRent,
          studentName: student.name,
          categoryTitle: category.title,
          originalBookingAmount: bookingAmount,
          remainingBookingAmount: deductionResult.remainingBookingAmount,
          discountAmount,
          discountInfo
        });

      } catch (studentError) {
        console.error(`  ✗ Error processing student ${student.name} (ID: ${student.id}):`, studentError);
        errorStudents.push({
          studentId: student.id,
          studentName: student.name,
          error: studentError.message
        });
      }
    }

    // 10. Send bulk SMS to all recipients
    let bulkSmsResult = null;
    if (smsRecipients.length > 0) {
      try {
        console.log(`📱 Sending bulk rent reminder SMS to ${smsRecipients.length} students`);
        
        bulkSmsResult = await sendBulkSMSWithGenerator(
          smsRecipients,
          (recipient) => generateRentReminderMessage(
            recipient.studentName,
            recipient.rentDue,
            recipient.externalDue,
            recipient.advanceDue,
            recipient.dueDate,
            recipient.bikashNumber,
            recipient.previousDue
          )
        );
        
        console.log(`📱 Bulk SMS result: ${bulkSmsResult.success ? '✅ Success' : '❌ Failed'}`);
        
      } catch (smsError) {
        console.error(`❌ Bulk SMS error:`, smsError);
        bulkSmsResult = {
          success: false,
          message: 'Bulk SMS sending failed',
          error: smsError.message
        };
      }
    }

    if (skippedStudents.length > 0) {
      skippedStudents.forEach(skip => {
        console.log(`  - ${skip.studentName} (ID: ${skip.studentId}): ${skip.reason}`);
      });
    }

    if (errorStudents.length > 0) {
      errorStudents.forEach(error => {
        console.log(`  - ${error.studentName} (ID: ${error.studentId}): ${error.error}`);
      });
    }

    // Calculate SMS statistics
    const smsStats = {
      totalRecipients: smsRecipients.length,
      bulkSmsSuccess: bulkSmsResult?.success || false,
      bulkSmsMessage: bulkSmsResult?.message || 'No SMS sent'
    };

    return new Response(JSON.stringify({ 
      message: 'Rent generation completed successfully', 
      summary: {
        totalStudents: students.length,
        createdRents: createdRents.length,
        skippedStudents: skippedStudents.length,
        errorStudents: errorStudents.length,
        smsStats
      },
      createdRents,
      skippedStudents,
      errorStudents,
      smsRecipients,
      bulkSmsResult
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('=== Rent Cron Job Error ===');
    console.error('Error:', err);
    console.error('Stack:', err.stack);
    
    return new Response(JSON.stringify({ 
      message: 'Rent generation failed', 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}