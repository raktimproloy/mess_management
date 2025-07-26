import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function GET() {
  try {
    // Generate a random number between 1 and 1000
    const randomNumber = Math.floor(Math.random() * 1000) + 1;
    
    // Store the random number in the testing table
    const newTestRecord = await prisma.testing.create({
      data: {
        value: randomNumber
      }
    });
    
    // Get all records from testing table
    const allTestRecords = await prisma.testing.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: `Random number ${randomNumber} stored successfully!`,
      newRecord: newTestRecord,
      allRecords: allTestRecords
    }), { 
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
} 