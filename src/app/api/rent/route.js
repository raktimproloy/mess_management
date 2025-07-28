import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../../../lib/auth';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    const { success, user } = verifyToken(authHeader.split(' ')[1]);
    if (!success || (user.role !== 'admin' && user.role !== 'student')) return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 });

    const data = await request.json();
    const {
      studentId,
      categoryId,
      rentAmount = 0,
      externalAmount = 0,
      advanceAmount = 0,
      previousDue = 0,
      status = 'unpaid',
      rentPaid = 0,
      advancePaid = 0,
      externalPaid = 0,
      previousDuePaid = 0,
      paidDate = null,
      paidType = null
    } = data;

    if (!studentId || !categoryId) {
      return new Response(JSON.stringify({ message: 'Missing required fields' }), { status: 400 });
    }

    const rent = await prisma.rent.create({
      data: {
        studentId: parseInt(studentId),
        categoryId: parseInt(categoryId),
        rentAmount: Number(rentAmount),
        externalAmount: Number(externalAmount),
        advanceAmount: Number(advanceAmount),
        previousDue: Number(previousDue),
        status,
        rentPaid: Number(rentPaid),
        advancePaid: Number(advancePaid),
        externalPaid: Number(externalPaid),
        previousDuePaid: Number(previousDuePaid),
        paidDate: paidDate ? new Date(paidDate) : null,
        paidType,
      },
    });

    return new Response(JSON.stringify({ message: 'Rent created', rent }), { status: 201 });
  } catch (err) {
    return new Response(JSON.stringify({ message: 'Server error', error: err.message }), { status: 500 });
  }
} 