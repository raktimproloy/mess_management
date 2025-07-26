import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../../../lib/auth';

const prisma = new PrismaClient();

// GET: List students (admin: all, student: self)
export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    const { success, user } = verifyToken(authHeader.split(' ')[1]);
    if (!success) return new Response(JSON.stringify({ message: 'Invalid token' }), { status: 401 });

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10', 10);
    const search = url.searchParams.get('search') || '';
    const category = url.searchParams.get('category') || '';
    const status = url.searchParams.get('status') || '';
    const sort = url.searchParams.get('sort') || 'joiningDate';
    const order = url.searchParams.get('order') || 'desc';

    if (user.role === 'admin') {
      const where = {
        ...(search && {
          OR: [
            { name: { contains: search } },
            { phone: { contains: search } },
            { smsPhone: { contains: search } },
          ],
        }),
        ...(category ? { categoryId: parseInt(category) } : {}),
        ...(status ? { status } : {}),
      };
      const total = await prisma.student.count({ where });
      const students = await prisma.student.findMany({
        where,
        orderBy: { [sort]: order },
        skip: (page - 1) * pageSize,
        take: pageSize,
      });
      return new Response(JSON.stringify({ students, total, page, pageSize }), { status: 200 });
    } else if (user.role === 'student') {
      const student = await prisma.student.findUnique({ where: { id: user.id } });
      if (!student) return new Response(JSON.stringify({ message: 'Student not found' }), { status: 404 });
      return new Response(JSON.stringify({ students: [student], total: 1, page: 1, pageSize: 1 }), { status: 200 });
    } else {
      return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 });
    }
  } catch (err) {
    return new Response(JSON.stringify({ message: 'Server error', error: err.message }), { status: 500 });
  }
}

// POST: Create student (admin only)
export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    const { success, user } = verifyToken(authHeader.split(' ')[1]);
    if (!success || user.role !== 'admin') return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 });
    const data = await request.json();
    if (!data.name || !data.phone || !data.categoryId || !data.joiningDate) {
      return new Response(JSON.stringify({ message: 'Missing required fields' }), { status: 400 });
    }
    // Check for duplicate phone
    const existing = await prisma.student.findUnique({ where: { phone: data.phone } });
    if (existing) {
      return new Response(JSON.stringify({ message: 'Student with this phone already exists' }), { status: 409 });
    }
    const newStudent = await prisma.student.create({
      data: {
        name: data.name,
        phone: data.phone,
        smsPhone: data.smsPhone || data.phone,
        password: data.password || data.phone,
        profileImage: '',
        hideRanking: 0,
        status: data.status || 'living',
        category: parseInt(data.categoryId),
        categoryId: parseInt(data.categoryId),
        joiningDate: new Date(data.joiningDate),
      },
    });
    return new Response(JSON.stringify({ message: 'Student created', student: newStudent }), { status: 201 });
  } catch (err) {
    return new Response(JSON.stringify({ message: 'Server error', error: err.message }), { status: 500 });
  }
} 