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
      rentAmount: currentRent.rentAmount,
      advanceAmount: currentRent.advanceAmount,
      externalAmount: currentRent.externalAmount,
      previousDue: currentRent.previousDue,
      discountAmount: currentRent.discountAmount,
      totalDue: currentRent.rentAmount + currentRent.advanceAmount + currentRent.externalAmount + currentRent.previousDue - currentRent.discountAmount,
      paidAmount: currentRent.rentPaid + currentRent.advancePaid + currentRent.externalPaid,
      remainingDue: (currentRent.rentAmount + currentRent.advanceAmount + currentRent.externalAmount + currentRent.previousDue - currentRent.discountAmount) - (currentRent.rentPaid + currentRent.advancePaid + currentRent.externalPaid),
      status: currentRent.status
    } : null;

    // Calculate complaint statistics
    const complaintStats = complaints.reduce((acc, complaint) => {
      acc.total++;
      acc[complaint.status]++;
      return acc;
    }, { total: 0, pending: 0, checking: 0, solved: 0, canceled: 0 });

    // Calculate payment request statistics
    const paymentStats = paymentRequests.reduce((acc, request) => {
      acc.total++;
      acc[request.status]++;
      acc.totalAmount += request.totalAmount;
      return acc;
    }, { total: 0, pending: 0, approved: 0, rejected: 0, totalAmount: 0 });

    // Calculate total paid amount
    const totalPaid = (totalPaidAmount._sum.paidRent || 0) + 
                     (totalPaidAmount._sum.paidAdvance || 0) + 
                     (totalPaidAmount._sum.paidExternal || 0);

    // Calculate monthly statistics
    const monthlyStatsData = monthlyStats.reduce((acc, stat) => {
      const monthKey = stat.rentMonth;
      if (!acc[monthKey]) {
        acc[monthKey] = { totalPaid: 0, paymentCount: 0 };
      }
      acc[monthKey].totalPaid += (stat.paidRent || 0) + (stat.paidAdvance || 0) + (stat.paidExternal || 0);
      acc[monthKey].paymentCount++;
      return acc;
    }, {});

    // Calculate average monthly payment
    const totalPayments = rentHistory.length;
    const averageMonthlyPayment = totalPayments > 0 ? totalPaid / totalPayments : 0;

    // Calculate discount information
    const discountInfo = student.discountRef ? {
      title: student.discountRef.title,
      type: student.discountRef.discountType,
      amount: student.discountRef.discountAmount,
      description: student.discountRef.description
    } : null;

    return new Response(JSON.stringify({
      success: true,
      data: {
        // Student Information
        student: {
          id: student.id,
          name: student.name,
          phone: student.phone,
          status: student.status,
          joiningDate: student.joiningDate,
          livingMonths: livingMonths,
          profileImage: student.profileImage
        },
        
        // Category Information
        category: {
          title: student.categoryRef.title,
          rentAmount: student.categoryRef.rentAmount,
          externalAmount: student.categoryRef.externalAmount
        },
        
        // Discount Information
        discount: discountInfo,
        
        // Current Month Rent
        currentRent: dueRent,
        
        // Rent Statistics
        rents: {
          total: allRents.length,
          paid: allRents.filter(rent => rent.status === 'paid').length,
          unpaid: allRents.filter(rent => rent.status === 'unpaid').length,
          partial: allRents.filter(rent => rent.status === 'partial').length
        },
        
        // Complaint Statistics
        complaints: {
          total: complaintStats.total,
          pending: complaintStats.pending,
          checking: complaintStats.checking,
          solved: complaintStats.solved,
          canceled: complaintStats.canceled,
          recent: complaints.slice(0, 5)
        },
        
        // Payment Statistics
        payments: {
          totalRequests: paymentStats.total,
          pending: paymentStats.pending,
          approved: paymentStats.approved,
          rejected: paymentStats.rejected,
          totalAmount: paymentStats.totalAmount,
          recent: paymentRequests.slice(0, 5)
        },
        
        // Payment History
        rentHistory: {
          total: rentHistory.length,
          totalPaid: totalPaid,
          averageMonthlyPayment: averageMonthlyPayment,
          recent: rentHistory.slice(0, 5)
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
    console.error('Error fetching student dashboard data:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 