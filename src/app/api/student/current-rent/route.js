import { PrismaClient } from '@prisma/client';
import { verifyStudentAuth } from '../../../../lib/auth';

const prisma = new PrismaClient();

function getMonthRange(date) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

export async function GET(request) {
  try {
    // Verify student authentication
    const authResult = verifyStudentAuth(request);
    
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

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const studentId = authResult.student.id;

    // Get current month range
    const now = new Date();
    const { start, end } = getMonthRange(now);

    // Get current month's rent
    const currentRent = await prisma.rent.findFirst({
      where: {
        studentId: studentId,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      include: {
        category: true,
        student: {
          select: {
            id: true,
            name: true,
            phone: true,
            smsPhone: true,
            status: true,
            categoryRef: true
          }
        }
      },
    });

    // Calculate total due for current rent
    if (currentRent) {
      currentRent.totalDue = (currentRent.rentAmount || 0) + 
                            (currentRent.advanceAmount || 0) + 
                            (currentRent.externalAmount || 0) + 
                            (currentRent.previousDue || 0);
    }

    // Get previous months' rents with pagination
    const previousRentsWhere = {
      studentId: studentId,
      createdAt: {
        lt: start, // Before current month
      },
    };

    const [totalPreviousRents, previousRents] = await Promise.all([
      prisma.rent.count({ where: previousRentsWhere }),
      prisma.rent.findMany({
        where: previousRentsWhere,
        orderBy: { createdAt: 'desc' }, // Latest first
        skip: (page - 1) * limit,
        take: limit,
        include: {
          category: true,
          student: {
            select: {
              id: true,
              name: true,
              phone: true,
              smsPhone: true,
              status: true,
              categoryRef: true
            }
          }
        },
      }),
    ]);

    // Calculate total due for each previous rent
    previousRents.forEach(rent => {
      rent.totalDue = (rent.rentAmount || 0) + 
                     (rent.advanceAmount || 0) + 
                     (rent.externalAmount || 0) + 
                     (rent.previousDue || 0);
    });

    // Calculate summary for current month
    let currentMonthSummary = {
      totalDue: 0,
      totalPaid: 0,
      remainingDue: 0,
      status: 'no_rent'
    };

    if (currentRent) {
      const totalDue = currentRent.rentAmount + currentRent.externalAmount + currentRent.previousDue;
      const totalPaid = currentRent.rentPaid + currentRent.externalPaid + currentRent.previousDuePaid;
      
      currentMonthSummary = {
        totalDue,
        totalPaid,
        remainingDue: Math.max(0, totalDue - totalPaid),
        status: currentRent.status
      };
    }

    // Calculate summary for previous months
    const allPreviousRents = await prisma.rent.findMany({
      where: previousRentsWhere,
      select: {
        rentAmount: true,
        externalAmount: true,
        previousDue: true,
        rentPaid: true,
        externalPaid: true,
        previousDuePaid: true,
        status: true
      }
    });

    const previousMonthsSummary = allPreviousRents.reduce((summary, rent) => {
      const totalDue = rent.rentAmount + rent.externalAmount + rent.previousDue;
      const totalPaid = rent.rentPaid + rent.externalPaid + rent.previousDuePaid;
      
      summary.totalDue += totalDue;
      summary.totalPaid += totalPaid;
      summary.remainingDue += Math.max(0, totalDue - totalPaid);
      
      if (rent.status === 'paid') summary.paidMonths++;
      else if (rent.status === 'partial') summary.partialMonths++;
      else summary.unpaidMonths++;
      
      return summary;
    }, {
      totalDue: 0,
      totalPaid: 0,
      remainingDue: 0,
      paidMonths: 0,
      partialMonths: 0,
      unpaidMonths: 0
    });

    return new Response(JSON.stringify({
      success: true,
      currentRent,
      currentMonthSummary,
      previousRents,
      previousMonthsSummary: {
        ...previousMonthsSummary,
        totalPages: Math.ceil(totalPreviousRents / limit)
      },
      pagination: {
        page,
        limit,
        total: totalPreviousRents,
        totalPages: Math.ceil(totalPreviousRents / limit)
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (err) {
    console.error('Error fetching student current rent:', err);
    return new Response(JSON.stringify({
      success: false,
      message: 'Server error',
      error: err.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

// POST: Mark rent as fully paid (all due amounts paid)
export async function POST(request) {
  const { rentId } = await request.json();
  const rents = await fs.readFile(rentsPath, 'utf-8').then(JSON.parse);
  const students = await fs.readFile(studentsPath, 'utf-8').then(JSON.parse);
  const idx = rents.findIndex(r => r.id === rentId);
  if (idx === -1) return new Response(JSON.stringify({ message: 'Rent not found' }), { status: 404 });
  const rent = rents[idx];
  rents[idx].rent_paid = rent.rent_amount || 0;
  rents[idx].advance_paid = rent.advance_amount || 0;
  rents[idx].external_paid = rent.external_amount || 0;
  rents[idx].status = 'paid';
  await fs.writeFile(rentsPath, JSON.stringify(rents, null, 2));
  // Add rent-history record
  const student = students.find(s => s.id === rent.studentId);
  await fetch('http://localhost:3000/api/student/rent-history', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      rent_month: getMonthYear(rent.month_year),
      student_id: rent.studentId,
      category_id: student?.categoryId || student?.category,
      status: 'approved',
      payment_type: 'on hand',
      due_rent: 0,
      due_advance: 0,
      due_external: 0,
      paid_rent: rent.rent_amount || 0,
      paid_advance: rent.advance_amount || 0,
      paid_external: rent.external_amount || 0,
      details: { rentId: rent.id }
    })
  });
  return new Response(JSON.stringify({ message: 'Rent fully paid', rent: rents[idx] }), { status: 200 });
}

// PATCH: Pay specific values for rent_paid, advance_paid, external_paid
export async function PATCH(request) {
  const body = await request.json();
  const { rentId, rent_paid, advance_paid, external_paid } = body;
  const rents = await fs.readFile(rentsPath, 'utf-8').then(JSON.parse);
  const students = await fs.readFile(studentsPath, 'utf-8').then(JSON.parse);
  const idx = rents.findIndex(r => r.id === rentId);
  if (idx === -1) return new Response(JSON.stringify({ message: 'Rent not found' }), { status: 404 });

  let paid_rent = 0, paid_advance = 0, paid_external = 0;
  if (typeof rent_paid === 'number') {
    rents[idx].rent_paid = (rents[idx].rent_paid || 0) + rent_paid;
    paid_rent = rent_paid;
  }
  if (typeof advance_paid === 'number') {
    rents[idx].advance_paid = (rents[idx].advance_paid || 0) + advance_paid;
    paid_advance = advance_paid;
  }
  if (typeof external_paid === 'number') {
    rents[idx].external_paid = (rents[idx].external_paid || 0) + external_paid;
    paid_external = external_paid;
  }
  const totalPaid = (rents[idx].rent_paid || 0) + (rents[idx].advance_paid || 0) + (rents[idx].external_paid || 0);
  const totalDue = (rents[idx].rent_amount || 0) + (rents[idx].advance_amount || 0) + (rents[idx].external_amount || 0);
  if (totalPaid >= totalDue) {
    rents[idx].status = 'paid';
  }
  await fs.writeFile(rentsPath, JSON.stringify(rents, null, 2));
  // Add rent-history record
  const rent = rents[idx];
  const student = students.find(s => s.id === rent.studentId);
  await fetch('http://localhost:3000/api/student/rent-history', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      rent_month: getMonthYear(rent.month_year),
      student_id: rent.studentId,
      category_id: student?.categoryId || student?.category,
      status: 'approved',
      payment_type: 'on hand',
      due_rent: (rent.rent_amount || 0) - (rent.rent_paid || 0),
      due_advance: (rent.advance_amount || 0) - (rent.advance_paid || 0),
      due_external: (rent.external_amount || 0) - (rent.external_paid || 0),
      paid_rent,
      paid_advance,
      paid_external,
      details: { rentId: rent.id }
    })
  });
  return new Response(JSON.stringify({ message: 'Rent updated', rent: rents[idx] }), { status: 200 });
} 