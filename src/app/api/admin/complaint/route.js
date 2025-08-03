import { PrismaClient } from '@prisma/client';
import { verifyAdminAuth } from '../../../../lib/auth';

const prisma = new PrismaClient();

// GET: Get all complaints (admin only)
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

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const status = url.searchParams.get('status') || 'pending'; // Default to pending
    const search = url.searchParams.get('search') || '';
    const complainFor = url.searchParams.get('complainFor') || '';

    // Build where clause
    let where = {};

    // Filter by status (default to pending)
    if (status) {
      where.status = status;
    }

    // Filter by complain type if provided
    if (complainFor) {
      where.complainFor = complainFor;
    }

    // Search by student name or phone, or complaint title
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { student: { name: { contains: search } } },
        { student: { phone: { contains: search } } },
        { student: { smsPhone: { contains: search } } }
      ];
    }

    // Get total count and complaints with pagination
    const [total, complaints] = await Promise.all([
      prisma.complaint.count({ where }),
      prisma.complaint.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          student: {
            select: {
              id: true,
              name: true,
              phone: true,
              smsPhone: true,
              status: true
            }
          }
        }
      })
    ]);

    // Calculate summary statistics
    const allComplaints = await prisma.complaint.findMany();
    const summary = allComplaints.reduce((acc, complaint) => {
      acc.totalComplaints++;
      if (complaint.status === 'pending') acc.pendingComplaints++;
      else if (complaint.status === 'checking') acc.checkingComplaints++;
      else if (complaint.status === 'solved') acc.solvedComplaints++;
      else if (complaint.status === 'canceled') acc.canceledComplaints++;
      return acc;
    }, {
      totalComplaints: 0,
      pendingComplaints: 0,
      checkingComplaints: 0,
      solvedComplaints: 0,
      canceledComplaints: 0
    });

    return new Response(JSON.stringify({
      success: true,
      complaints,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      summary
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error fetching complaints:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 