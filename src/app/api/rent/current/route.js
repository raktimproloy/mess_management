import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function getMonthRange(date) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  return { start, end };
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10', 10);
    const search = url.searchParams.get('search') || '';
    const category = url.searchParams.get('category') || '';

    const now = new Date();
    const { start, end } = getMonthRange(now);

    // Build where clause using createdAt instead of monthYear
    const where = {
      createdAt: {
        gte: start,
        lt: end,
      },
      ...(category ? { categoryId: parseInt(category) } : {}),
      ...(search && {
        student: {
          OR: [
            { name: { contains: search } },
            { phone: { contains: search } },
            { smsPhone: { contains: search } },
          ],
        },
      }),
    };

    // Get rents with pagination
    const [total, rents] = await Promise.all([
      prisma.rent.count({ where }),
      prisma.rent.findMany({
        where,
        include: { student: true, category: true },
        orderBy: { id: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    // No mapping needed, all fields including paidType are returned.

    // Summary for current month using createdAt
    const allRents = await prisma.rent.findMany({
      where: { createdAt: { gte: start, lt: end } },
    });
    const totalStudents = new Set(allRents.map(r => r.studentId)).size;
    const totalRent = allRents.reduce((sum, r) => sum + (r.rentAmount + r.externalAmount + (r.previousDue || 0)), 0);
    const totalPaid = allRents.reduce((sum, r) => sum + (r.rentPaid + (r.externalPaid || 0)), 0);
    const totalDue = totalRent - totalPaid;

    return new Response(JSON.stringify({
      rents,
      total,
      page,
      pageSize,
      summary: {
        totalStudents,
        totalRent,
        totalPaid,
        totalDue,
      },
    }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ message: 'Server error', error: err.message }), { status: 500 });
  }
} 