import { PrismaClient } from '@prisma/client';
import { verifyAdminAuth } from '../../../lib/auth';

const prisma = new PrismaClient();

// GET: List all discounts (public)
export async function GET() {
  try {
    const discounts = await prisma.discount.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return new Response(JSON.stringify({ success: true, discounts }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// POST: Add new discount (admin only)
export async function POST(request) {
  try {
    const authResult = verifyAdminAuth(request);
    if (!authResult.success) {
      return new Response(JSON.stringify({ success: false, error: authResult.error }), { status: 401 });
    }
    const { title, discountType, discountAmount, description, status } = await request.json();
    if (!title || !discountType || discountAmount === undefined) {
      return new Response(JSON.stringify({ success: false, error: 'Missing required fields' }), { status: 400 });
    }
    const discount = await prisma.discount.create({
      data: {
        title,
        discountType,
        discountAmount: parseFloat(discountAmount),
        description: description || '',
        status: status !== undefined ? parseInt(status) : 1
      }
    });
    return new Response(JSON.stringify({ success: true, discount }), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}

// PUT: Edit discount (admin only)
export async function PUT(request) {
  try {
    const authResult = verifyAdminAuth(request);
    if (!authResult.success) {
      return new Response(JSON.stringify({ success: false, error: authResult.error }), { status: 401 });
    }
    const { id, title, discountType, discountAmount, description, status } = await request.json();
    if (!id) {
      return new Response(JSON.stringify({ success: false, error: 'Discount ID required' }), { status: 400 });
    }
    const discount = await prisma.discount.update({
      where: { id: parseInt(id) },
      data: {
        ...(title !== undefined && { title }),
        ...(discountType !== undefined && { discountType }),
        ...(discountAmount !== undefined && { discountAmount: parseFloat(discountAmount) }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status: parseInt(status) })
      }
    });
    return new Response(JSON.stringify({ success: true, discount }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}

// DELETE: Delete discount (admin only)
export async function DELETE(request) {
  try {
    const authResult = verifyAdminAuth(request);
    if (!authResult.success) {
      return new Response(JSON.stringify({ success: false, error: authResult.error }), { status: 401 });
    }
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) {
      return new Response(JSON.stringify({ success: false, error: 'Discount ID required' }), { status: 400 });
    }
    await prisma.discount.delete({ where: { id: parseInt(id) } });
    return new Response(JSON.stringify({ success: true, message: 'Discount deleted' }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
} 