import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function getMonthYear(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export async function GET(request) {
  try {
    const now = new Date();
    const currentMonthYear = getMonthYear(now);
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthYear = getMonthYear(prevMonth);

    console.log('--- Rent Cron GET (Preview) Debug ---');
    console.log('Current Date:', now.toISOString());
    console.log('Current Month/Year:', currentMonthYear);
    console.log('Previous Month Start Date:', prevMonth.toISOString());
    console.log('Previous Month/Year:', prevMonthYear);

    // Get all living students whose joiningDate is in the past
    const students = await prisma.student.findMany({
      where: {
        status: 'living',
        joiningDate: { lte: now },
      },
      include: { categoryRef: true },
    });

    let previewRents = [];
    for (const student of students) {
      console.log(`Processing student: ${student.name} (ID: ${student.id})`);

      // Check if rent for this month already exists using createdAt
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      
      const alreadyExists = await prisma.rent.findFirst({
        where: {
          studentId: student.id,
          createdAt: {
            gte: currentMonthStart,
            lt: currentMonthEnd,
          },
        },
      });
      if (alreadyExists) {
        console.log(`  Rent already exists for current month. Skipping.`);
        continue;
      }

      // Get category and amounts
      const category = student.categoryRef;
      if (!category) {
        console.log(`  No category found for student. Skipping.`);
        continue;
      }
      const rentAmount = category.rentAmount;
      const externalAmount = category.externalAmount || 0;

      // Check previous month's rent for due using createdAt
      const prevRentQueryStart = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), 1);
      const prevRentQueryEnd = new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 1);

      console.log(`  Querying for previous month rent for student ${student.id} between ${prevRentQueryStart.toISOString()} and ${prevRentQueryEnd.toISOString()}`);

      const prevRent = await prisma.rent.findFirst({
        where: {
          studentId: student.id,
          createdAt: {
            gte: prevRentQueryStart,
            lt: prevRentQueryEnd,
          },
        },
      });
      
      let previousDue = 0;
      let previousDuePaid = 0; // This is initialized to 0 for the new rent record
      if (prevRent) {
        console.log(`  Found previous month rent (ID: ${prevRent.id}) for student ${student.id}. Details:`);
        console.log(`    createdAt: ${prevRent.createdAt.toISOString()}`);
        console.log(`    rentAmount: ${prevRent.rentAmount}, externalAmount: ${prevRent.externalAmount}`);
        console.log(`    rentPaid: ${prevRent.rentPaid}, externalPaid: ${prevRent.externalPaid}`);
        
        // Calculate unpaid amount from previous month's rent for this student
        const totalAmount = (prevRent.rentAmount || 0) + (prevRent.externalAmount || 0) + (prevRent.previousDue || 0);
        const totalPaid = (prevRent.rentPaid || 0) + (prevRent.externalPaid || 0) + (prevRent.previousDuePaid || 0);
        previousDue = Math.max(0, totalAmount - totalPaid);
        
        console.log(`  Calculated previous due: totalAmount=${totalAmount}, totalPaid=${totalPaid}, previousDue=${previousDue}`);
      } else {
        console.log(`  No previous month rent found for student ${student.id}. Previous due remains 0.`);
      }

      // Compose new rent preview
      previewRents.push({
        studentId: student.id,
        studentName: student.name,
        categoryId: category.id,
        categoryTitle: category.title,
        rentAmount,
        externalAmount,
        previousDue,
        previousDuePaid,
        advanceAmount: 0,
        status: 'unpaid',
        rentPaid: 0,
        advancePaid: 0,
        externalPaid: 0,
        paidDate: null,
        paidType: null,
      });
    }
    console.log('--- End Rent Cron GET (Preview) Debug ---');
    return new Response(JSON.stringify({ message: 'Preview rents to be generated', count: previewRents.length, rents: previewRents }), { status: 200 });
  } catch (err) {
    console.error('Error in Rent Cron GET (Preview):', err);
    return new Response(JSON.stringify({ message: 'Server error', error: err.message }), { status: 500 });
  }
}

export async function POST(request) {
  try {
    const now = new Date();
    const currentMonthYear = getMonthYear(now);
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthYear = getMonthYear(prevMonth);

    console.log('--- Rent Cron POST (Execute) Debug ---');
    console.log('Starting rent generation for month:', currentMonthYear);
    console.log('Current Date:', now.toISOString());
    console.log('Previous Month Start Date:', prevMonth.toISOString());

    // Get all living students whose joiningDate is in the past
    const students = await prisma.student.findMany({
      where: {
        status: 'living',
        joiningDate: { lte: now },
      },
      include: { categoryRef: true },
    });

    console.log('Found', students.length, 'living students');

    let createdRents = [];
    for (const student of students) {
      try {
        console.log(`Processing student: ${student.name} (ID: ${student.id})`);

        // Check if rent for this month already exists using createdAt
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        
        const alreadyExists = await prisma.rent.findFirst({
          where: {
            studentId: student.id,
            createdAt: {
              gte: currentMonthStart,
              lt: currentMonthEnd,
            },
          },
        });
        
        if (alreadyExists) {
          console.log(`  Rent already exists for current month. Skipping.`);
          continue;
        }

        // Get category and amounts
        const category = student.categoryRef;
        if (!category) {
          console.log(`  No category found for student. Skipping.`);
          continue;
        }
        
        const rentAmount = category.rentAmount;
        const externalAmount = category.externalAmount || 0;

        // Check previous month's rent for due using createdAt
        const prevRentQueryStart = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), 1);
        const prevRentQueryEnd = new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 1);
        console.log(`  Querying for previous month rent for student ${student.id} between ${prevRentQueryStart.toISOString()} and ${prevRentQueryEnd.toISOString()}`);

        const prevRent = await prisma.rent.findFirst({
          where: {
            studentId: student.id,
            createdAt: {
              gte: prevRentQueryStart,
              lt: prevRentQueryEnd,
            },
          },
        });
        
        let previousDue = 0;
        let previousDuePaid = 0; // This is initialized to 0 for the new rent record
        if (prevRent) {
          console.log(`  Found previous month rent (ID: ${prevRent.id}) for student ${student.id}. Details:`);
          console.log(`    createdAt: ${prevRent.createdAt.toISOString()}`);
          console.log(`    rentAmount: ${prevRent.rentAmount}, externalAmount: ${prevRent.externalAmount}`);
          console.log(`    rentPaid: ${prevRent.rentPaid}, externalPaid: ${prevRent.externalPaid}`);
          
          // Calculate unpaid amount from previous month's rent for this student
          const totalAmount = (prevRent.rentAmount || 0) + (prevRent.externalAmount || 0) + (prevRent.previousDue || 0);
          const totalPaid = (prevRent.rentPaid || 0) + (prevRent.externalPaid || 0) + (prevRent.previousDuePaid || 0);
          previousDue = Math.max(0, totalAmount - totalPaid);
          
          console.log(`  Calculated previous due: totalAmount=${totalAmount}, totalPaid=${totalPaid}, previousDue=${previousDue}`);
        } else {
          console.log(`  No previous month rent found for student ${student.id}. Previous due remains 0.`);
        }

        console.log(`Creating rent for student ${student.name}: rentAmount=${rentAmount}, externalAmount=${externalAmount}, previousDue=${previousDue}`);

        // Create new rent record (createdAt will be automatically set)
        const newRent = await prisma.rent.create({
          data: {
            studentId: student.id,
            categoryId: category.id,
            rentAmount,
            externalAmount,
            previousDue,
            previousDuePaid,
            advanceAmount: 0,
            status: 'unpaid',
            rentPaid: 0,
            advancePaid: 0,
            externalPaid: 0,
            paidDate: null,
            paidType: null,
          },
        });

        console.log(`Created rent ID: ${newRent.id} for student ${student.name}`);

        createdRents.push({
          ...newRent,
          studentName: student.name,
          categoryTitle: category.title
        });

      } catch (studentError) {
        console.error(`Error processing student ${student.name} (ID: ${student.id}):`, studentError);
        // Continue with other students even if one fails
      }
    }

    console.log(`Successfully created ${createdRents.length} rent records`);
    console.log('--- End Rent Cron POST (Execute) Debug ---');

    return new Response(JSON.stringify({ 
      message: 'Rents generated successfully', 
      count: createdRents.length, 
      rents: createdRents 
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('Error in Rent Cron POST (Execute):', err);
    return new Response(JSON.stringify({ 
      message: 'Server error', 
      error: err.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 