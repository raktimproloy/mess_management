import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Test rentHistory table structure and data
    const allRentHistory = await prisma.rentHistory.findMany({
      take: 5,
      orderBy: { id: 'desc' }
    });

    const rentHistoryCount = await prisma.rentHistory.count();

    const sampleStudent = await prisma.student.findFirst();
    
    if (sampleStudent) {
      const studentRentHistory = await prisma.rentHistory.findMany({
        where: { studentId: sampleStudent.id },
        take: 5
      });

      const studentAggregation = await prisma.rentHistory.aggregate({
        where: { studentId: sampleStudent.id },
        _sum: {
          paidRent: true,
          paidAdvance: true,
          paidExternal: true
        }
      });

      return new Response(JSON.stringify({
        success: true,
        data: {
          totalRentHistoryCount: rentHistoryCount,
          allRentHistory: allRentHistory,
          sampleStudent: sampleStudent,
          studentRentHistory: studentRentHistory,
          studentAggregation: studentAggregation
        }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({
        success: false,
        error: 'No students found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('Test DB error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 