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

    // Get all discounts (like categories)
    const discounts = await prisma.discount.findMany({
      where: { status: 1 }, // Only active discounts
      orderBy: { createdAt: 'desc' }
    });
    console.log(`Found ${discounts.length} active discounts`);

    // Get all living students whose joiningDate is in the past
    const students = await prisma.student.findMany({
      where: {
        status: 'living',
        // Remove the joiningDate filter to include all living students
        // joiningDate: { lte: now },
      },
      include: { 
        categoryRef: true,
        discountRef: true,
        references: {
          select: {
            id: true,
            name: true,
            discountAmount: true
          }
        }
      },
    });

    console.log(`Found ${students.length} living students`);
    students.forEach(student => {
      console.log(`  Student: ${student.name} (ID: ${student.id}), Joining Date: ${student.joiningDate}, Status: ${student.status}`);
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
      let carryForwardAdvance = 0;
      if (prevRent) {
        console.log(`  Found previous month rent (ID: ${prevRent.id}) for student ${student.id}. Details:`);
        console.log(`    createdAt: ${prevRent.createdAt.toISOString()}`);
        console.log(`    rentAmount: ${prevRent.rentAmount}, externalAmount: ${prevRent.externalAmount}`);
        console.log(`    rentPaid: ${prevRent.rentPaid}, externalPaid: ${prevRent.externalPaid}`);
        console.log(`    advancePaid: ${prevRent.advancePaid}, advanceAmount: ${prevRent.advanceAmount}`);
        
        // Calculate unpaid amount from previous month's rent for this student
        const totalAmount = (prevRent.rentAmount || 0) + (prevRent.externalAmount || 0) + (prevRent.previousDue || 0);
        const totalPaid = (prevRent.rentPaid || 0) + (prevRent.externalPaid || 0) + (prevRent.previousDuePaid || 0);
        previousDue = Math.max(0, totalAmount - totalPaid);
        
        // Calculate carry-forward advance (advanceAmount - advancePaid)
        carryForwardAdvance = (prevRent.advanceAmount || 0) - (prevRent.advancePaid || 0);
        if (carryForwardAdvance < 0) carryForwardAdvance = 0;
        console.log(`  Calculated previous due: totalAmount=${totalAmount}, totalPaid=${totalPaid}, previousDue=${previousDue}`);
        console.log(`  Carry forward advance: ${carryForwardAdvance}`);
        console.log(`  [DEBUG] For student ${student.id}, prevRent.advancePaid=${prevRent.advancePaid}, prevRent.advanceAmount=${prevRent.advanceAmount}, carryForwardAdvance=${carryForwardAdvance}`);
      } else {
        console.log(`  No previous month rent found for student ${student.id}. Previous due remains 0.`);
        carryForwardAdvance = 0;
      }

      // Check if this student is a reference (has invited others) and calculate discount
      let discountAmount = 0;
      let discountInfo = null;
      
      console.log(`  Student ${student.name} (ID: ${student.id}) details:`);
      console.log(`    Reference ID: ${student.referenceId}`);
      console.log(`    Discount ID: ${student.discountId}`);
      
      // Check if this student has invited others (is a reference)
      const invitedStudents = await prisma.student.findMany({
        where: {
          referenceId: student.id,
          status: 'living'
        },
        include: {
          discountRef: true
        }
      });
      
      console.log(`  Students invited by ${student.name}: ${invitedStudents.length}`);
      
      if (invitedStudents.length > 0) {
        console.log(`  This student (${student.name}) is a reference and has invited ${invitedStudents.length} students`);
        
        // Calculate total discount amount from all invited students
        let totalDiscountAmount = 0;
        let discountDetails = [];
        
        for (const invitedStudent of invitedStudents) {
          if (invitedStudent.discountRef) {
            const discount = invitedStudent.discountRef;
            console.log(`  Invited student ${invitedStudent.name} has discount: ${discount.title} - ${discount.discountAmount}${discount.discountType === 'percent' ? '%' : '৳'}`);
            
            // Calculate discount amount based on this student's rent amount
            let studentDiscountAmount = 0;
            if (discount.discountType === 'percent') {
              studentDiscountAmount = (rentAmount * discount.discountAmount) / 100;
            } else {
              studentDiscountAmount = discount.discountAmount;
            }
            
            totalDiscountAmount += studentDiscountAmount;
            discountDetails.push({
              invitedStudentId: invitedStudent.id,
              invitedStudentName: invitedStudent.name,
              discountId: invitedStudent.discountId,
              discountTitle: discount.title,
              discountType: discount.discountType,
              discountAmount: studentDiscountAmount
            });
            
            console.log(`  Calculated discount amount for this invitation: ${studentDiscountAmount}`);
          }
        }
        
        if (totalDiscountAmount > 0) {
          discountAmount = totalDiscountAmount;
          console.log(`  Total discount amount for reference student ${student.name}: ${discountAmount}`);
          
          discountInfo = {
            referenceStudentId: student.id,
            referenceStudentName: student.name,
            totalDiscountAmount: discountAmount,
            invitedStudentsCount: invitedStudents.length,
            discountDetails: discountDetails,
            note: `Reference student gets discount for inviting ${invitedStudents.length} students`
          };
        }
      } else {
        console.log(`  Student is not a reference (hasn't invited anyone)`);
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
        advanceAmount: carryForwardAdvance,
        discountAmount, // Add discount amount to preview
        status: 'unpaid',
        rentPaid: 0,
        advancePaid: 0,
        externalPaid: 0,
        paidDate: null,
        paidType: null,
        discountInfo
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

    // Get all discounts (like categories)
    const discounts = await prisma.discount.findMany({
      where: { status: 1 }, // Only active discounts
      orderBy: { createdAt: 'desc' }
    });
    console.log(`Found ${discounts.length} active discounts`);

    // Get all living students whose joiningDate is in the past
    const students = await prisma.student.findMany({
      where: {
        status: 'living',
        // Remove the joiningDate filter to include all living students
        // joiningDate: { lte: now },
      },
      include: { 
        categoryRef: true,
        discountRef: true,
        references: {
          select: {
            id: true,
            name: true,
            discountAmount: true
          }
        }
      },
    });

    console.log(`Found ${students.length} living students`);
    students.forEach(student => {
      console.log(`  Student: ${student.name} (ID: ${student.id}), Joining Date: ${student.joiningDate}, Status: ${student.status}`);
    });

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
        let carryForwardAdvance = 0;
        if (prevRent) {
          console.log(`  Found previous month rent (ID: ${prevRent.id}) for student ${student.id}. Details:`);
          console.log(`    createdAt: ${prevRent.createdAt.toISOString()}`);
          console.log(`    rentAmount: ${prevRent.rentAmount}, externalAmount: ${prevRent.externalAmount}`);
          console.log(`    rentPaid: ${prevRent.rentPaid}, externalPaid: ${prevRent.externalPaid}`);
          console.log(`    advancePaid: ${prevRent.advancePaid}, advanceAmount: ${prevRent.advanceAmount}`);
          
          // Calculate unpaid amount from previous month's rent for this student
          const totalAmount = (prevRent.rentAmount || 0) + (prevRent.externalAmount || 0) + (prevRent.previousDue || 0);
          const totalPaid = (prevRent.rentPaid || 0) + (prevRent.externalPaid || 0) + (prevRent.previousDuePaid || 0);
          previousDue = Math.max(0, totalAmount - totalPaid);
          
          // Calculate carry-forward advance (advanceAmount - advancePaid)
          carryForwardAdvance = (prevRent.advanceAmount || 0) - (prevRent.advancePaid || 0);
          if (carryForwardAdvance < 0) carryForwardAdvance = 0;
          console.log(`  Calculated previous due: totalAmount=${totalAmount}, totalPaid=${totalPaid}, previousDue=${previousDue}`);
          console.log(`  Carry forward advance: ${carryForwardAdvance}`);
          console.log(`  [DEBUG] For student ${student.id}, prevRent.advancePaid=${prevRent.advancePaid}, prevRent.advanceAmount=${prevRent.advanceAmount}, carryForwardAdvance=${carryForwardAdvance}`);
        } else {
          console.log(`  No previous month rent found for student ${student.id}. Previous due remains 0.`);
          carryForwardAdvance = 0;
        }

        // Check if this student is a reference (has invited others) and calculate discount
        let discountAmount = 0;
        let discountInfo = null;
        
        console.log(`  Student ${student.name} (ID: ${student.id}) details:`);
        console.log(`    Reference ID: ${student.referenceId}`);
        console.log(`    Discount ID: ${student.discountId}`);
        
        // Check if this student has invited others (is a reference)
        const invitedStudents = await prisma.student.findMany({
          where: {
            referenceId: student.id,
            status: 'living'
          },
          include: {
            discountRef: true
          }
        });
        
        console.log(`  Students invited by ${student.name}: ${invitedStudents.length}`);
        
        if (invitedStudents.length > 0) {
          console.log(`  This student (${student.name}) is a reference and has invited ${invitedStudents.length} students`);
          
          // Calculate total discount amount from all invited students
          let totalDiscountAmount = 0;
          let discountDetails = [];
          
          for (const invitedStudent of invitedStudents) {
            if (invitedStudent.discountRef) {
              const discount = invitedStudent.discountRef;
              console.log(`  Invited student ${invitedStudent.name} has discount: ${discount.title} - ${discount.discountAmount}${discount.discountType === 'percent' ? '%' : '৳'}`);
              
              // Calculate discount amount based on this student's rent amount
              let studentDiscountAmount = 0;
              if (discount.discountType === 'percent') {
                studentDiscountAmount = (rentAmount * discount.discountAmount) / 100;
              } else {
                studentDiscountAmount = discount.discountAmount;
              }
              
              totalDiscountAmount += studentDiscountAmount;
              discountDetails.push({
                invitedStudentId: invitedStudent.id,
                invitedStudentName: invitedStudent.name,
                discountId: invitedStudent.discountId,
                discountTitle: discount.title,
                discountType: discount.discountType,
                discountAmount: studentDiscountAmount
              });
              
              console.log(`  Calculated discount amount for this invitation: ${studentDiscountAmount}`);
            }
          }
          
          if (totalDiscountAmount > 0) {
            discountAmount = totalDiscountAmount;
            console.log(`  Total discount amount for reference student ${student.name}: ${discountAmount}`);
            
            discountInfo = {
              referenceStudentId: student.id,
              referenceStudentName: student.name,
              totalDiscountAmount: discountAmount,
              invitedStudentsCount: invitedStudents.length,
              discountDetails: discountDetails,
              note: `Reference student gets discount for inviting ${invitedStudents.length} students`
            };
          }
        } else {
          console.log(`  Student is not a reference (hasn't invited anyone)`);
        }

        console.log(`Creating rent for student ${student.name}: rentAmount=${rentAmount}, externalAmount=${externalAmount}, previousDue=${previousDue}, discountAmount=${discountAmount}`);

        // Create new rent record with discount amount
        const newRent = await prisma.rent.create({
          data: {
            studentId: student.id,
            categoryId: category.id,
            rentAmount,
            externalAmount,
            previousDue,
            previousDuePaid,
            advanceAmount: carryForwardAdvance,
            status: 'unpaid',
            rentPaid: 0,
            advancePaid: 0,
            externalPaid: 0,
            paidDate: null,
            paidType: null,
            discountAmount: discountAmount, // Add discount amount to rent record
          },
        });

        console.log(`Created rent ID: ${newRent.id} for student ${student.name}`);

        createdRents.push({
          ...newRent,
          studentName: student.name,
          categoryTitle: category.title,
          discountAmount, // Add discount amount to response
          discountInfo
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