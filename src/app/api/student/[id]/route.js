import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../../../../lib/auth';

const prisma = new PrismaClient();

// GET: Get student by ID (admin: any, student: self)
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    const { success, user } = verifyToken(authHeader.split(' ')[1]);
    if (!success) return new Response(JSON.stringify({ message: 'Invalid token' }), { status: 401 });
    const student = await prisma.student.findUnique({ where: { id: parseInt(id) } });
    if (!student) return new Response(JSON.stringify({ message: 'Student not found' }), { status: 404 });
    if (user.role === 'admin' || (user.role === 'student' && String(user.id) === String(id))) {
      return new Response(JSON.stringify(student), { status: 200 });
    } else {
      return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 });
    }
  } catch (err) {
    return new Response(JSON.stringify({ message: 'Server error', error: err.message }), { status: 500 });
  }
}

// PUT: Update student (admin: any, student: self, with field restrictions)
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    const { success, user } = verifyToken(authHeader.split(' ')[1]);
    if (!success) return new Response(JSON.stringify({ message: 'Invalid token' }), { status: 401 });
    const data = await request.json();
    const student = await prisma.student.findUnique({ where: { id: parseInt(id) } });
    if (!student) return new Response(JSON.stringify({ message: 'Student not found' }), { status: 404 });
    let updateData = {};
    if (user.role === 'admin') {
      updateData = { ...data };
      delete updateData.id;
      
      // Convert categoryId to integer if present
      if (updateData.categoryId) {
        updateData.categoryId = parseInt(updateData.categoryId);
      }
      if (updateData.category) {
        updateData.category = parseInt(updateData.category);
      }
      
      // If status is being changed from leave to living, update joiningDate
      if (student.status === 'leave' && data.status === 'living' && data.newJoiningDate) {
        updateData.joiningDate = new Date(data.newJoiningDate);
      }
      delete updateData.newJoiningDate;
    } else if (user.role === 'student' && String(user.id) === String(id)) {
      // Only allow certain fields
      const allowed = ['name', 'smsPhone', 'profileImage', 'hideRanking', 'password'];
      for (const key of Object.keys(data)) {
        if (allowed.includes(key)) {
          updateData[key] = data[key];
        }
      }
    } else {
      return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 });
    }
    const updated = await prisma.student.update({ where: { id: parseInt(id) }, data: updateData });
    return new Response(JSON.stringify(updated), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ message: 'Server error', error: err.message }), { status: 500 });
  }
}

// DELETE: Set status to 'leave' (soft delete)
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    const { success, user } = verifyToken(authHeader.split(' ')[1]);
    if (!success || user.role !== 'admin') return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 });
    const updated = await prisma.student.update({
      where: { id: parseInt(id) },
      data: { status: 'leave', updatedAt: new Date() },
    });
    return new Response(JSON.stringify({ message: 'Student set to leave', student: updated }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ message: 'Server error', error: err.message }), { status: 500 });
  }
} 