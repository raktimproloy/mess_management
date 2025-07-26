import { PrismaClient } from '@prisma/client';
import { verifyAdminAuth } from '../../../lib/auth';

const prisma = new PrismaClient();

// GET - List all categories (public access)
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    return new Response(JSON.stringify({
      success: true,
      categories: categories
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

// POST - Create new category (admin only)
export async function POST(request) {
  try {
    // Verify admin authentication
    const authResult = verifyAdminAuth(request);
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

    const { title, rentAmount, externalAmount, description, status } = await request.json();

    // Validate required fields
    if (!title || !rentAmount || !description) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Title, rent amount, and description are required'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Check if category with this title already exists
    const existingCategory = await prisma.category.findFirst({
      where: {
        title: title
      }
    });

    if (existingCategory) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Category with this title already exists'
      }), {
        status: 409,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Create new category
    const newCategory = await prisma.category.create({
      data: {
        title: title,
        rentAmount: parseFloat(rentAmount),
        externalAmount: externalAmount ? parseFloat(externalAmount) : 0,
        description: description,
        status: status ? parseInt(status) : 1
      }
    });

    return new Response(JSON.stringify({
      success: true,
      message: 'Category created successfully',
      category: newCategory
    }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Error creating category:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
} 