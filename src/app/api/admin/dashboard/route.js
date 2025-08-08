import { PrismaClient } from '@prisma/client';
import { verifyAdminAuth } from '../../../../lib/auth';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    // Verify admin authentication
    const authResult = verifyAdminAuth(request);
    if (!authResult.success) {
      return new Response(JSON.stringify({
        success: false,
        error: authResult.error
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get current month and year
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const currentMonthYear = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;

    // Fetch all required data
    const [
      totalStudents,
      livingStudents,
      totalRents,
      currentMonthRents,
      pendingComplaints,
      totalComplaints,
      paymentRequests,
      categories,
      recentComplaints,
      recentPayments,
      monthlyStats,
      currentMonthRentHistory
    ] = await Promise.all([
      // Total students
      prisma.student.count(),
      
      // Living students
      prisma.student.count({
        where: { status: 'living' }
      }),
      
      // Total rents
      prisma.rent.count(),
      
      // Current month rents - fixed to get actual current month rents
      prisma.rent.findMany({
        where: {
          student: {
            status: 'living'
          }
        },
        include: {
          student: {
            select: { name: true, phone: true }
          },
          category: {
            select: { title: true, rentAmount: true }
          }
        }
      }),
      
      // Pending complaints
      prisma.complaint.count({
        where: { status: 'pending' }
      }),
      
      // Total complaints
      prisma.complaint.count(),
      
      // Payment requests
      prisma.paymentRequest.findMany({
        where: { status: 'pending' },
        include: {
          student: {
            select: { name: true, phone: true }
          },
          category: {
            select: { title: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      
      // Categories
      prisma.category.findMany({
        where: { status: 1 },
        select: { id: true, title: true, rentAmount: true }
      }),
      
      // Recent complaints
      prisma.complaint.findMany({
        include: {
          student: {
            select: { name: true, phone: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      
      // Recent payments
      prisma.rentHistory.findMany({
        include: {
          student: {
            select: { name: true, phone: true }
          },
          rent: {
            include: {
              category: {
                select: { title: true }
              }
            }
          }
        },
        orderBy: { paidDate: 'desc' },
        take: 5
      }),
      
      // Monthly statistics for the last 6 months
      prisma.rentHistory.groupBy({
        by: ['rentMonth'],
        _sum: {
          paidRent: true,
          paidAdvance: true,
          paidExternal: true
        },
        _count: {
          id: true
        },
        orderBy: { rentMonth: 'desc' },
        take: 6
      }),
      
      // Current month rent history for accurate calculations
      prisma.rentHistory.findMany({
        where: {
          rentMonth: currentMonthYear
        },
        include: {
          student: {
            select: { name: true, phone: true }
          },
          rent: {
            include: {
              category: {
                select: { title: true }
              }
            }
          }
        }
      })
    ]);

    // Calculate current month statistics more accurately
    const currentMonthStats = currentMonthRentHistory.reduce((acc, history) => {
      acc.totalPaid += history.paidRent + history.paidAdvance + history.paidExternal;
      acc.totalRent += history.dueRent + history.dueAdvance + history.dueExternal;
      acc.paymentCount += 1;
      return acc;
    }, { totalPaid: 0, totalRent: 0, paymentCount: 0 });

    // Calculate rent statistics for current month
    const currentMonthRentSummary = {
      paid: { count: 0, amount: 0 },
      unpaid: { count: 0, amount: 0 },
      partial: { count: 0, amount: 0 }
    };

    // Group current month rents by status
    currentMonthRents.forEach(rent => {
      const totalAmount = rent.rentAmount + rent.advanceAmount + rent.externalAmount;
      const totalPaid = rent.rentPaid + rent.advancePaid + rent.externalPaid;
      
      if (totalPaid >= totalAmount) {
        currentMonthRentSummary.paid.count++;
        currentMonthRentSummary.paid.amount += totalAmount;
      } else if (totalPaid === 0) {
        currentMonthRentSummary.unpaid.count++;
        currentMonthRentSummary.unpaid.amount += totalAmount;
      } else {
        currentMonthRentSummary.partial.count++;
        currentMonthRentSummary.partial.amount += totalAmount;
      }
    });

    // Calculate complaint statistics
    const complaintStats = await prisma.complaint.groupBy({
      by: ['status'],
      _count: { id: true }
    });

    const complaintSummary = {
      pending: 0,
      checking: 0,
      solved: 0,
      canceled: 0
    };

    complaintStats.forEach(stat => {
      complaintSummary[stat.status] = stat._count.id;
    });

    // Calculate payment statistics
    const paymentStats = await prisma.paymentRequest.groupBy({
      by: ['status'],
      _count: { id: true },
      _sum: { totalAmount: true }
    });

    const paymentSummary = {
      pending: { count: 0, amount: 0 },
      approved: { count: 0, amount: 0 },
      rejected: { count: 0, amount: 0 }
    };

    paymentStats.forEach(stat => {
      paymentSummary[stat.status] = {
        count: stat._count.id,
        amount: stat._sum.totalAmount || 0
      };
    });

    // Calculate overall rent statistics (all time)
    const rentStats = await prisma.rent.groupBy({
      by: ['status'],
      _count: { id: true },
      _sum: { 
        rentAmount: true,
        advanceAmount: true,
        externalAmount: true
      }
    });

    const rentSummary = {
      unpaid: { count: 0, amount: 0 },
      paid: { count: 0, amount: 0 },
      partial: { count: 0, amount: 0 }
    };

    rentStats.forEach(stat => {
      const totalAmount = (stat._sum.rentAmount || 0) + (stat._sum.advanceAmount || 0) + (stat._sum.externalAmount || 0);
      rentSummary[stat.status] = {
        count: stat._count.id,
        amount: totalAmount
      };
    });

    return new Response(JSON.stringify({
      success: true,
      data: {
        // Student Statistics
        students: {
          total: totalStudents,
          living: livingStudents,
          left: totalStudents - livingStudents
        },
        
        // Rent Statistics
        rents: {
          total: totalRents,
          currentMonth: currentMonthRents.length,
          currentMonthStats,
          summary: currentMonthRentSummary, // Use current month summary instead of all-time
          allTimeSummary: rentSummary // Keep all-time summary for reference
        },
        
        // Complaint Statistics
        complaints: {
          total: totalComplaints,
          pending: pendingComplaints,
          summary: complaintSummary
        },
        
        // Payment Statistics
        payments: {
          pendingRequests: paymentRequests.length,
          summary: paymentSummary
        },
        
        // Categories
        categories: categories,
        
        // Recent Activities
        recent: {
          complaints: recentComplaints,
          payments: recentPayments
        },
        
        // Monthly Statistics
        monthlyStats: monthlyStats.map(stat => ({
          month: stat.rentMonth,
          totalPaid: (stat._sum.paidRent || 0) + (stat._sum.paidAdvance || 0) + (stat._sum.paidExternal || 0),
          paymentCount: stat._count.id
        })),
        
        // Current Month Info
        currentMonth: currentMonthYear
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 