import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../../../lib/auth';

const prisma = new PrismaClient();

// GET: List payment requests (admin: all, student: own)
export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    const { success, user } = verifyToken(authHeader.split(' ')[1]);
    if (!success) return new Response(JSON.stringify({ message: 'Invalid token' }), { status: 401 });

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10', 10);
    const status = url.searchParams.get('status') || '';
    const paymentMethod = url.searchParams.get('paymentMethod') || '';
    const search = url.searchParams.get('search') || '';

    let where = {};

    // Filter by user role
    if (user.role === 'student') {
      where.studentId = user.id;
    }

    // Filter by status
    if (status) {
      where.status = status;
    }

    // Filter by payment method
    if (paymentMethod) {
      where.paymentMethod = paymentMethod;
    }

    // Search by student name or phone (admin only)
    if (search && user.role === 'admin') {
      where.student = {
        OR: [
          { name: { contains: search } },
          { phone: { contains: search } },
          { smsPhone: { contains: search } },
        ],
      };
    }

    const [total, paymentRequests] = await Promise.all([
      prisma.paymentRequest.count({ where }),
      prisma.paymentRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          student: {
            select: {
              id: true,
              name: true,
              phone: true,
              smsPhone: true,
              status: true,
              categoryRef: true
            }
          },
          category: true,
          rent: true,
          rentHistory: true
        },
      }),
    ]);

    // Calculate summary
    const allRequests = await prisma.paymentRequest.findMany({ where });
    const summary = allRequests.reduce((acc, request) => {
      acc.totalRequests++;
      acc.totalAmount += request.totalAmount;
      
      if (request.status === 'pending') acc.pendingRequests++;
      else if (request.status === 'approved') acc.approvedRequests++;
      else if (request.status === 'rejected') acc.rejectedRequests++;
      
      if (request.paymentMethod === 'online') acc.onlinePayments++;
      else if (request.paymentMethod === 'on hand') acc.cashPayments++;
      
      return acc;
    }, {
      totalRequests: 0,
      totalAmount: 0,
      pendingRequests: 0,
      approvedRequests: 0,
      rejectedRequests: 0,
      onlinePayments: 0,
      cashPayments: 0
    });

    return new Response(JSON.stringify({
      success: true,
      paymentRequests,
      total,
      page,
      pageSize,
      summary
    }), { status: 200 });

  } catch (err) {
    console.error('Error fetching payment requests:', err);
    return new Response(JSON.stringify({ message: 'Server error', error: err.message }), { status: 500 });
  }
}

// POST: Create payment request (student only)
export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    const { success, user } = verifyToken(authHeader.split(' ')[1]);
    if (!success || user.role !== 'student') return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 });

    const data = await request.json();
    const {
      rentId,
      rentAmount = 0,
      advanceAmount = 0,
      externalAmount = 0,
      previousDueAmount = 0,
      paymentMethod,
      bikashNumber,
      trxId
    } = data;

    // Validate required fields
    if (!rentId || !paymentMethod) {
      return new Response(JSON.stringify({ message: 'Rent ID and payment method are required' }), { status: 400 });
    }

    // Validate payment method
    if (!['on hand', 'online'].includes(paymentMethod)) {
      return new Response(JSON.stringify({ message: 'Payment method must be "on hand" or "online"' }), { status: 400 });
    }

    // Validate online payment fields
    if (paymentMethod === 'online') {
      if (!bikashNumber || !trxId) {
        return new Response(JSON.stringify({ message: 'Bikash number and TRX ID are required for online payment' }), { status: 400 });
      }
    }

    // Get rent details
    const rent = await prisma.rent.findUnique({
      where: { id: parseInt(rentId) },
      include: { category: true }
    });

    if (!rent) {
      return new Response(JSON.stringify({ message: 'Rent not found' }), { status: 404 });
    }

    // Verify the rent belongs to the authenticated student
    if (rent.studentId !== user.id) {
      return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 });
    }

    // Calculate total amount
    const totalAmount = rentAmount + advanceAmount + externalAmount + previousDueAmount;

    if (totalAmount <= 0) {
      return new Response(JSON.stringify({ message: 'Total amount must be greater than 0' }), { status: 400 });
    }

    // Check if there's already a pending request for this rent
    const existingRequest = await prisma.paymentRequest.findFirst({
      where: {
        rentId: parseInt(rentId),
        status: 'pending'
      }
    });

    if (existingRequest) {
      return new Response(JSON.stringify({ message: 'A pending payment request already exists for this rent' }), { status: 409 });
    }

    // Create payment request
    const paymentRequest = await prisma.paymentRequest.create({
      data: {
        studentId: user.id,
        categoryId: rent.categoryId,
        rentId: parseInt(rentId),
        status: 'pending',
        paymentMethod,
        bikashNumber: bikashNumber || null,
        trxId: trxId || null,
        totalAmount,
        rentAmount,
        advanceAmount,
        externalAmount,
        previousDueAmount
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            phone: true,
            smsPhone: true,
            status: true,
            categoryRef: true
          }
        },
        category: true,
        rent: true
      }
    });

    return new Response(JSON.stringify({
      success: true,
      message: 'Payment request created successfully',
      paymentRequest
    }), { status: 201 });

  } catch (err) {
    console.error('Error creating payment request:', err);
    return new Response(JSON.stringify({ message: 'Server error', error: err.message }), { status: 500 });
  }
} 