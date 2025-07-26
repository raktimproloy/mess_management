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

    // Build where clause
    let where = {};
    if (studentId) where.studentId = parseInt(studentId);
    if (categoryId) where.categoryId = parseInt(categoryId);
    if (paymentType) where.paymentType = paymentType;
    if (month && year) {
      where.rentMonth = `${year}-${String(month).padStart(2, '0')}`;
    } else if (year) {
      where.rentMonth = { startsWith: `${year}-` };
    }

    const [total, history] = await Promise.all([
      prisma.rentHistory.count({ where }),
      prisma.rentHistory.findMany({
        where,
        orderBy: { paidDate: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { student: true, category: true, rent: true },
      }),
    ]);

    return new Response(JSON.stringify({
      history,
      total,
      page,
      pageSize,
    }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ message: 'Server error', error: err.message }), { status: 500 });
  }
} 