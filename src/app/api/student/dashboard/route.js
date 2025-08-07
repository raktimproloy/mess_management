import { PrismaClient } from '@prisma/client';
import { verifyStudentAuth } from '../../../../lib/auth';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    // Verify student authentication
    const authResult = verifyStudentAuth(request);
    if (!authResult.success) {
      return new Response(JSON.stringify({
        success: false,
        error: authResult.error
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const studentId = authResult.student.id;

    // Get current month and year
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const currentMonthYear = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;

    try {

    // Fetch all required data for the student
    const [
      student,
      currentRent,
      allRents,
      complaints,
      paymentRequests,
      rentHistory,
      totalPaidAmount,
      monthlyStats
    ] = await Promise.all([
      // Student details
      prisma.student.findUnique({
        where: { id: studentId },
        include: {
          categoryRef: {
            select: { title: true, rentAmount: true, externalAmount: true }
          },
          discountRef: {
            select: { title: true, discountType: true, discountAmount: true, description: true }
          }
        }
      }),
      
      // Current month rent
      prisma.rent.findFirst({
        where: {
          studentId: studentId,
          createdAt: {
            gte: new Date(currentYear, currentMonth - 1, 1),
            lt: new Date(currentYear, currentMonth, 1)
          }
        }
      }),
      
      // All rents for this student
      prisma.rent.findMany({
        where: { studentId: studentId },
        orderBy: { createdAt: 'desc' },
        include: {
          category: {
            select: { title: true }
          }
        }
      }),
      
      // Complaints
      prisma.complaint.findMany({
        where: { studentId: studentId },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      
      // Payment requests
      prisma.paymentRequest.findMany({
        where: { studentId: studentId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          category: {
            select: { title: true }
          }
        }
      }),
      
      // Rent history
      prisma.rentHistory.findMany({
        where: { studentId: studentId },
        orderBy: { paidDate: 'desc' },
        take: 10,
        include: {
          rent: {
            include: {
              category: {
                select: { title: true }
              }
            }
          }
        }
      }),
      
      // Category details - we'll get this from the student query instead
      null,
      
      // Discount details - we'll get this from the student query instead
      null,
      
      // Total paid amount
      prisma.rentHistory.aggregate({
        where: { studentId: studentId },
        _sum: {
          paidRent: true,
          paidAdvance: true,
          paidExternal: true
        }
      }),
      
      // Monthly statistics for the last 6 months
      prisma.rentHistory.findMany({
        where: { studentId: studentId },
        select: { rentMonth: true, paidRent: true, paidAdvance: true, paidExternal: true },
        orderBy: { rentMonth: 'desc' },
        take: 6
      })
    ]);

    // Calculate living months
    const joiningDate = new Date(student.joiningDate);
    const livingMonths = Math.floor((now - joiningDate) / (1000 * 60 * 60 * 24 * 30.44)) + 1;

    // Calculate due rent for current month
    const dueRent = currentRent ? {
      rentAmount: currentRent.rentAmount || 0,
      advanceAmount: currentRent.advanceAmount || 0,
      externalAmount: currentRent.externalAmount || 0,
      previousDue: currentRent.previousDue || 0,
      discountAmount: currentRent.discountAmount || 0,
      totalDue: (currentRent.rentAmount || 0) + (currentRent.advanceAmount || 0) + (currentRent.externalAmount || 0) + (currentRent.previousDue || 0) - (currentRent.discountAmount || 0),
      paidAmount: (currentRent.rentPaid || 0) + (currentRent.advancePaid || 0) + (currentRent.externalPaid || 0),
      remainingDue: ((currentRent.rentAmount || 0) + (currentRent.advanceAmount || 0) + (currentRent.externalAmount || 0) + (currentRent.previousDue || 0) - (currentRent.discountAmount || 0)) - ((currentRent.rentPaid || 0) + (currentRent.advancePaid || 0) + (currentRent.externalPaid || 0)),
      status: currentRent.status || 'N/A'
    } : null;

    // Calculate complaint statistics
    const complaintStats = (complaints || []).reduce((acc, complaint) => {
      acc.total++;
      acc[complaint.status]++;
      return acc;
    }, { total: 0, pending: 0, checking: 0, solved: 0, canceled: 0 });

    // Calculate payment request statistics
    const paymentStats = (paymentRequests || []).reduce((acc, request) => {
      acc.total++;
      acc[request.status]++;
      acc.totalAmount += request.totalAmount;
      return acc;
    }, { total: 0, pending: 0, approved: 0, rejected: 0, totalAmount: 0 });

    // Calculate total paid amount - handle null values properly
    let totalPaid = 0;
    if (totalPaidAmount && totalPaidAmount._sum) {
      const paidRent = totalPaidAmount._sum.paidRent || 0;
      const paidAdvance = totalPaidAmount._sum.paidAdvance || 0;
      const paidExternal = totalPaidAmount._sum.paidExternal || 0;
      totalPaid = paidRent + paidAdvance + paidExternal;
    }

    // Alternative calculation method - sum from actual records
    const calculatedTotalPaid = (rentHistory || []).reduce((sum, record) => {
      return sum + (record.paidRent || 0) + (record.paidAdvance || 0) + (record.paidExternal || 0);
    }, 0);
    
    // Use the calculated total if aggregation returns 0 or null
    const finalTotalPaid = calculatedTotalPaid > 0 ? calculatedTotalPaid : totalPaid;

    // Calculate monthly statistics
    const monthlyStatsData = (monthlyStats || []).reduce((acc, stat) => {
      const monthKey = stat.rentMonth;
      if (!acc[monthKey]) {
        acc[monthKey] = { totalPaid: 0, paymentCount: 0 };
      }
      acc[monthKey].totalPaid += (stat.paidRent || 0) + (stat.paidAdvance || 0) + (stat.paidExternal || 0);
      acc[monthKey].paymentCount++;
      return acc;
    }, {});

    // Calculate average monthly payment
    const totalPayments = (rentHistory || []).length;
    const averageMonthlyPayment = totalPayments > 0 ? finalTotalPaid / totalPayments : 0;

    // Calculate discount information
    const discountInfo = student.discountRef ? {
      title: student.discountRef.title || 'N/A',
      type: student.discountRef.discountType || 'N/A',
      amount: student.discountRef.discountAmount || 0,
      description: student.discountRef.description || 'N/A'
    } : null;

    return new Response(JSON.stringify({
      success: true,
      data: {
        // Student Information
        student: {
          id: student.id,
          name: student.name || 'N/A',
          phone: student.phone || 'N/A',
          status: student.status || 'N/A',
          joiningDate: student.joiningDate,
          livingMonths: livingMonths || 0,
          profileImage: student.profileImage || null
        },
        
        // Category Information
        category: student.categoryRef ? {
          title: student.categoryRef.title || 'N/A',
          rentAmount: student.categoryRef.rentAmount || 0,
          externalAmount: student.categoryRef.externalAmount || 0
        } : {
          title: 'N/A',
          rentAmount: 0,
          externalAmount: 0
        },
        
        // Discount Information
        discount: discountInfo,
        
        // Current Month Rent
        currentRent: dueRent,
        
        // Rent Statistics
        rents: {
          total: (allRents || []).length,
          paid: (allRents || []).filter(rent => rent.status === 'paid').length,
          unpaid: (allRents || []).filter(rent => rent.status === 'unpaid').length,
          partial: (allRents || []).filter(rent => rent.status === 'partial').length
        },
        
        // Complaint Statistics
        complaints: {
          total: complaintStats.total,
          pending: complaintStats.pending,
          checking: complaintStats.checking,
          solved: complaintStats.solved,
          canceled: complaintStats.canceled,
          recent: (complaints || []).slice(0, 5)
        },
        
        // Payment Statistics
        payments: {
          totalRequests: paymentStats.total,
          pending: paymentStats.pending,
          approved: paymentStats.approved,
          rejected: paymentStats.rejected,
          totalAmount: paymentStats.totalAmount,
          recent: (paymentRequests || []).slice(0, 5)
        },
        
        // Payment History
        rentHistory: {
          total: (rentHistory || []).length,
          totalPaid: finalTotalPaid,
          averageMonthlyPayment: averageMonthlyPayment,
          recent: (rentHistory || []).slice(0, 5)
        },
        
        // Monthly Statistics
        monthlyStats: Object.entries(monthlyStatsData).map(([month, data]) => ({
          month,
          totalPaid: data.totalPaid,
          paymentCount: data.paymentCount
        })),
        
        // Current Month Info
        currentMonth: currentMonthYear
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

    } catch (error) {
      console.error('Error processing student dashboard data:', error);
      return new Response(JSON.stringify({
        success: false,
        error: 'Error processing dashboard data',
        details: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('Error fetching student dashboard data:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 