import { PrismaClient } from '@prisma/client';
import { sendSMS, sendBulkSMSWithGenerator, generatePaymentConfirmationMessage } from '../../../../lib/sms';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    console.log('🔄 Starting payment request cron job...');
    
    // Get all pending payment requests with online payment method
    const pendingRequests = await prisma.paymentRequest.findMany({
      where: {
        status: 'pending',
        paymentMethod: 'online',
        bikashNumber: { not: null },
        trxId: { not: null }
      },
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
        category: true,
        rent: true
      }
    });

    console.log(`📋 Found ${pendingRequests.length} pending online payment requests`);

    let processedCount = 0;
    let successCount = 0;
    let errorCount = 0;
    let rejectedCount = 0;
    const results = [];
    const smsRecipients = [];

    for (const request of pendingRequests) {
      try {
        console.log(`🔍 Processing request ID: ${request.id}, TRX ID: ${request.trxId}`);
        
        // Check if payment exists in payments table
        const payment = await prisma.payment.findUnique({
          where: {
            trxid: request.trxId
          }
        });

        if (!payment) {
          console.log(`❌ Payment not found for TRX ID: ${request.trxId}`);
          results.push({
            requestId: request.id,
            trxId: request.trxId,
            status: 'payment_not_found',
            message: 'Payment not found in payments table'
          });
          errorCount++;
          continue;
        }

        // Check if payment is already used (status is approved or rejected)
        if (payment.status === 'approved' || payment.status === 'rejected') {
          console.log(`❌ Payment already ${payment.status} for TRX ID: ${request.trxId}`);
          results.push({
            requestId: request.id,
            trxId: request.trxId,
            status: `payment_already_${payment.status}`,
            message: `Payment already ${payment.status}`
          });
          errorCount++;
          continue;
        }

        // Check if payment is older than 2 days
        const paymentAge = Date.now() - payment.receivedAt.getTime();
        const twoDaysInMs = 2 * 24 * 60 * 60 * 1000; // 2 days in milliseconds
        
        if (paymentAge > twoDaysInMs) {
          console.log(`❌ Payment is older than 2 days for TRX ID: ${request.trxId}`);
          
          // Update payment status to rejected
          await prisma.payment.update({
            where: { id: payment.id },
            data: { status: 'rejected' }
          });

          // Update payment request status to rejected
          await prisma.paymentRequest.update({
            where: { id: request.id },
            data: { status: 'rejected' }
          });

          results.push({
            requestId: request.id,
            trxId: request.trxId,
            status: 'rejected',
            message: 'Payment is older than 2 days'
          });
          rejectedCount++;
          continue;
        }

        // Check if bikash number matches
        let numberMatch = false;
        if (request.bikashNumber && payment.fromDetails) {
          const requestNumber = request.bikashNumber.replace(/\s/g, '');
          const paymentNumber = payment.fromDetails.replace(/\s/g, '');
          
          numberMatch = paymentNumber.includes(requestNumber) || requestNumber.includes(paymentNumber);
        }

        // Check if amount matches (with tolerance for small differences)
        const requestAmount = parseFloat(request.totalAmount);
        const paymentAmount = parseFloat(payment.amount);
        const amountDifference = Math.abs(requestAmount - paymentAmount);
        const tolerance = 1.0; // 1 taka tolerance
        const amountMatch = amountDifference <= tolerance;

        // If transaction ID matches but other data doesn't match, reject the payment
        if (!numberMatch || !amountMatch) {
          console.log(`❌ Data mismatch for TRX ID: ${request.trxId}`);
          console.log(`   Number match: ${numberMatch}, Amount match: ${amountMatch}`);
          console.log(`   Request number: ${request.bikashNumber}, Payment number: ${payment.fromDetails}`);
          console.log(`   Request amount: ${requestAmount}, Payment amount: ${paymentAmount}`);
          
          // Update payment status to rejected
          await prisma.payment.update({
            where: { id: payment.id },
            data: { status: 'rejected' }
          });

          // Update payment request status to rejected
          await prisma.paymentRequest.update({
            where: { id: request.id },
            data: { status: 'rejected' }
          });

          results.push({
            requestId: request.id,
            trxId: request.trxId,
            status: 'rejected',
            message: `Data mismatch - Number: ${numberMatch}, Amount: ${amountMatch}`,
            details: {
              numberMatch,
              amountMatch,
              requestNumber: request.bikashNumber,
              paymentNumber: payment.fromDetails,
              requestAmount,
              paymentAmount
            }
          });
          rejectedCount++;
          continue;
        }

        console.log(`✅ All checks passed for request ID: ${request.id}`);

        // Process the payment request (same logic as admin approval)
        const rent = request.rent;
        
        // Create rent history record
        const rentHistory = await prisma.rentHistory.create({
          data: {
            rentMonth: `${rent.createdAt.getFullYear()}-${String(rent.createdAt.getMonth() + 1).padStart(2, '0')}`,
            paidDate: new Date(),
            studentId: request.studentId,
            categoryId: request.categoryId,
            status: 'approved',
            paymentType: 'online',
            dueRent: rent.rentAmount,
            dueAdvance: rent.advanceAmount,
            dueExternal: rent.externalAmount,
            paidRent: request.rentAmount,
            paidAdvance: request.advanceAmount,
            paidExternal: request.externalAmount,
            rentId: request.rentId,
            details: {
              bikashNumber: request.bikashNumber,
              trxId: request.trxId,
              paymentRequestId: request.id,
              paymentId: payment.id,
              autoApproved: true,
              approvedAt: new Date().toISOString()
            }
          }
        });

        // Update payment request with rent history ID and status
        await prisma.paymentRequest.update({
          where: { id: request.id },
          data: {
            status: 'approved',
            rentHistoryId: rentHistory.id
          }
        });

        // Update payment status to approved
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'approved' }
        });

        // Update rent record
        const newRentPaid = (rent.rentPaid || 0) + (request.rentAmount || 0);
        const newAdvancePaid = (rent.advancePaid || 0) + (request.advanceAmount || 0);
        const newExternalPaid = (rent.externalPaid || 0) + (request.externalAmount || 0);
        const newPreviousDuePaid = (rent.previousDuePaid || 0) + (request.previousDueAmount || 0);

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
          where: { id: request.rentId },
          data: {
            rentPaid: newRentPaid,
            advancePaid: newAdvancePaid,
            externalPaid: newExternalPaid,
            previousDuePaid: newPreviousDuePaid,
            status: newStatus,
            paidDate: new Date(),
            paidType: 'online'
          }
        });

        // Prepare SMS recipient data
        smsRecipients.push({
          studentId: request.studentId,
          studentName: request.student.name,
          phone: request.student.phone,
          smsPhone: request.student.smsPhone,
          totalAmount: request.totalAmount,
          paymentMethod: 'Online Payment (Auto-approved)',
          rentHistoryId: rentHistory.id,
          newRentStatus: newStatus
        });

        console.log(`✅ Successfully processed request ID: ${request.id}`);
        results.push({
          requestId: request.id,
          trxId: request.trxId,
          status: 'approved',
          message: 'Payment request automatically approved',
          rentHistoryId: rentHistory.id,
          newRentStatus: newStatus
        });
        successCount++;

      } catch (error) {
        console.error(`❌ Error processing request ID ${request.id}:`, error);
        results.push({
          requestId: request.id,
          trxId: request.trxId,
          status: 'error',
          message: error.message
        });
        errorCount++;
      }
      
      processedCount++;
    }

    // Send bulk SMS to all approved recipients
    let bulkSmsResult = null;
    if (smsRecipients.length > 0) {
      try {
        console.log(`📱 Sending bulk payment confirmation SMS to ${smsRecipients.length} students`);
        
        bulkSmsResult = await sendBulkSMSWithGenerator(
          smsRecipients,
          (recipient) => generatePaymentConfirmationMessage(
            recipient.studentName,
            recipient.totalAmount,
            recipient.paymentMethod
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

    const summary = {
      totalProcessed: processedCount,
      successCount,
      rejectedCount,
      errorCount,
      results,
      smsStats: {
        totalRecipients: smsRecipients.length,
        bulkSmsSuccess: bulkSmsResult?.success || false,
        bulkSmsMessage: bulkSmsResult?.message || 'No SMS sent'
      }
    };

    console.log(`📊 Cron job completed. Summary:`, summary);

    return new Response(JSON.stringify({
      success: true,
      message: 'Payment request cron job completed',
      summary,
      smsRecipients,
      bulkSmsResult
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Cron job error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');

    // Get recent payment requests that were auto-approved
    const recentAutoApproved = await prisma.paymentRequest.findMany({
      where: {
        status: 'approved',
        paymentMethod: 'online'
      },
      include: {
        student: {
          select: {
            name: true,
            phone: true
          }
        },
        category: {
          select: {
            title: true
          }
        },
        rentHistory: {
          select: {
            details: true,
            paidDate: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: limit
    });

    // Get pending online payment requests count
    const pendingCount = await prisma.paymentRequest.count({
      where: {
        status: 'pending',
        paymentMethod: 'online'
      }
    });

    // Get rejected payment requests count
    const rejectedCount = await prisma.paymentRequest.count({
      where: {
        status: 'rejected',
        paymentMethod: 'online'
      }
    });

    // Get total payments count with status breakdown
    const totalPayments = await prisma.payment.count();
    const pendingPayments = await prisma.payment.count({
      where: { status: 'pending' }
    });
    const approvedPayments = await prisma.payment.count({
      where: { status: 'approved' }
    });
    const rejectedPayments = await prisma.payment.count({
      where: { status: 'rejected' }
    });

    // Get recent rejected payments
    const recentRejectedPayments = await prisma.payment.findMany({
      where: {
        status: 'rejected'
      },
      orderBy: {
        receivedAt: 'desc'
      },
      take: 5
    });

    return new Response(JSON.stringify({
      success: true,
      data: {
        recentAutoApproved,
        pendingCount,
        rejectedCount,
        totalPayments,
        paymentStats: {
          total: totalPayments,
          pending: pendingPayments,
          approved: approvedPayments,
          rejected: rejectedPayments
        },
        recentRejectedPayments,
        lastChecked: new Date().toISOString()
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error getting cron status:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
