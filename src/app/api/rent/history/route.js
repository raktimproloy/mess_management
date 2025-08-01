import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10', 10);
    const studentId = url.searchParams.get('studentId');
    const categoryId = url.searchParams.get('categoryId');
    const month = url.searchParams.get('month');
    const year = url.searchParams.get('year');
    const paymentType = url.searchParams.get('paymentType');
    const search = url.searchParams.get('search') || '';

    // Build where clause
    let where = {};
    
    // Filter by student ID if provided
    if (studentId) where.studentId = parseInt(studentId);
    
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
    
    // Search by student name or phone
    if (search) {
      where.student = {
        OR: [
          { name: { contains: search } },
          { phone: { contains: search } },
          { smsPhone: { contains: search } },
        ],
      };
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
          student: {
            include: {
              categoryRef: true
            }
          }, 
          rent: {
            include: {
              category: true
            }
          }
        },
      }),
    ]);

    // Calculate summary statistics
    const allHistory = await prisma.rentHistory.findMany({ where });
    const totalPaid = allHistory.reduce((sum, record) => 
      sum + record.paidRent + record.paidAdvance + record.paidExternal, 0
    );
    const totalDue = allHistory.reduce((sum, record) => 
      sum + record.dueRent + record.dueAdvance + record.dueExternal, 0
    );

    return new Response(JSON.stringify({
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
    console.error('Error fetching rent history:', err);
    return new Response(JSON.stringify({ 
      message: 'Server error', 
      error: err.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 