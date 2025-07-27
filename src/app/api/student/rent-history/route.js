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
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10', 10);
    const categoryId = url.searchParams.get('categoryId');
    const month = url.searchParams.get('month');
    const year = url.searchParams.get('year');
    const paymentType = url.searchParams.get('paymentType');

    // Get student ID from the authenticated user
    const studentId = authResult.student.id;

    // Build where clause - always filter by the authenticated student
    let where = {
      studentId: studentId
    };
    
    // Filter by category if provided
    if (categoryId) where.categoryId = parseInt(categoryId);
    
    // Filter by payment type if provided
    if (paymentType) where.paymentType = paymentType;
    
    // Filter by month and year
    if (month && year) {
      where.rentMonth = `${year}-${String(month).padStart(2, '0')}`;
    } else if (year) {
      where.rentMonth = { startsWith: `${year}-` };
    }

    // Get total count and rent history with pagination
    const [total, history] = await Promise.all([
      prisma.rentHistory.count({ where }),
      prisma.rentHistory.findMany({
        where,
        orderBy: { paidDate: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { 
          rent: {
            include: {
              category: true
            }
          }
        },
      }),
    ]);

    // Calculate summary statistics for this student
    const allHistory = await prisma.rentHistory.findMany({ where });
    const totalPaid = allHistory.reduce((sum, record) => 
      sum + record.paidRent + record.paidAdvance + record.paidExternal, 0
    );
    const totalDue = allHistory.reduce((sum, record) => 
      sum + record.dueRent + record.dueAdvance + record.dueExternal, 0
    );

    return new Response(JSON.stringify({
      success: true,
      history,
      total,
      page,
      pageSize,
      summary: {
        totalRecords: total,
        totalPaid,
        totalDue,
        averagePayment: total > 0 ? totalPaid / total : 0
      }
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('Error fetching student rent history:', err);
    return new Response(JSON.stringify({ 
      success: false,
      message: 'Server error', 
      error: err.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 