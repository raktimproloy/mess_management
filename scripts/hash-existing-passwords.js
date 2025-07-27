const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function hashExistingPasswords() {
  try {
    console.log('Starting password hashing migration...');
    
    // Get all students
    const students = await prisma.student.findMany();
    console.log(`Found ${students.length} students in database`);
    
    let updatedCount = 0;
    
    for (const student of students) {
      // Check if password is already hashed
      if (!student.password.startsWith('$2b$')) {
        console.log(`Hashing password for student: ${student.name} (${student.phone})`);
        
        // Hash the plain text password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(student.password, saltRounds);
        
        // Update the student record
        await prisma.student.update({
          where: { id: student.id },
          data: { password: hashedPassword }
        });
        
        updatedCount++;
        console.log(`✓ Updated password for ${student.name}`);
      } else {
        console.log(`Password already hashed for: ${student.name}`);
      }
    }
    
    console.log(`\nMigration completed!`);
    console.log(`Total students: ${students.length}`);
    console.log(`Passwords hashed: ${updatedCount}`);
    console.log(`Already hashed: ${students.length - updatedCount}`);
    
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
hashExistingPasswords(); 