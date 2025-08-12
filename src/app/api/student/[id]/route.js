import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../../../../lib/auth';
import { sendSMS, generateStudentLeaveMessage } from '../../../../lib/sms';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// GET: Get student by ID (admin: any, student: self)
export async function GET(request, context) {
  try {
    const { id } = await context.params;
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    const { success, user } = verifyToken(authHeader.split(' ')[1]);
    if (!success) return new Response(JSON.stringify({ message: 'Invalid token' }), { status: 401 });
    const student = await prisma.student.findUnique({ where: { id: parseInt(id) } });
    if (!student) return new Response(JSON.stringify({ message: 'Student not found' }), { status: 404 });
    if (user.role === 'admin' || (user.role === 'student' && String(user.id) === String(id))) {
      // Return student data without password
      const { password: _, ...studentWithoutPassword } = student;
      return new Response(JSON.stringify(studentWithoutPassword), { status: 200 });
    } else {
      return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 });
    }
  } catch (err) {
    return new Response(JSON.stringify({ message: 'Server error', error: err.message }), { status: 500 });
  }
}

// PUT: Update student (admin: any, student: self, with field restrictions)
export async function PUT(request, context) {
  try {
    const { id } = await context.params;
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    const { success, user } = verifyToken(authHeader.split(' ')[1]);
    if (!success) return new Response(JSON.stringify({ message: 'Invalid token' }), { status: 401 });
    
    const data = await request.json();
    const student = await prisma.student.findUnique({ where: { id: parseInt(id) } });
    if (!student) return new Response(JSON.stringify({ message: 'Student not found' }), { status: 404 });
    
    let updateData = {};
    
    if (user.role === 'admin') {
      // Only allow specific fields to be updated
      const allowedFields = [
        'name', 'phone', 'smsPhone', 'password', 'profileImage', 'hideRanking',
        'status', 'categoryId', 'referenceId', 'discountId', 'discountAmount',
        'bookingAmount', 'joiningDate'
      ];
      
      updateData = {};
      for (const key of Object.keys(data)) {
        if (allowedFields.includes(key)) {
          updateData[key] = data[key];
        }
      }
      
      // Convert categoryId to integer if present
      if (updateData.categoryId) {
        updateData.categoryId = parseInt(updateData.categoryId);
      }
      
      // Convert bookingAmount to float if present
      if (updateData.bookingAmount !== undefined) {
        updateData.bookingAmount = parseFloat(updateData.bookingAmount);
      }
      
      // Convert discountAmount to float if present
      if (updateData.discountAmount !== undefined) {
        updateData.discountAmount = parseFloat(updateData.discountAmount);
      }
      
      // Convert referenceId to integer if present
      if (updateData.referenceId !== undefined) {
        updateData.referenceId = updateData.referenceId ? parseInt(updateData.referenceId) : null;
      }
      
      // Convert discountId to integer if present
      if (updateData.discountId !== undefined) {
        updateData.discountId = updateData.discountId ? parseInt(updateData.discountId) : null;
      }
      
      // If status is being changed from leave to living, update joiningDate
      if (student.status === 'leave' && data.status === 'living' && data.newJoiningDate) {
        updateData.joiningDate = new Date(data.newJoiningDate);
      }
      delete updateData.newJoiningDate;
      
      // Hash password if it's being updated
      if (updateData.password) {
        const saltRounds = 10;
        updateData.password = await bcrypt.hash(updateData.password, saltRounds);
      }
      
    } else if (user.role === 'student' && String(user.id) === String(id)) {
      // Only allow certain fields
      const allowed = ['name', 'smsPhone', 'profileImage', 'hideRanking', 'password'];
      for (const key of Object.keys(data)) {
        if (allowed.includes(key)) {
          updateData[key] = data[key];
        }
      }
      
      // Hash password if it's being updated
      if (updateData.password) {
        const saltRounds = 10;
        updateData.password = await bcrypt.hash(updateData.password, saltRounds);
      }
      
    } else {
      return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 });
    }
    
    const updated = await prisma.student.update({ where: { id: parseInt(id) }, data: updateData });
    
    // Return student data without password
    const { password: _, ...studentWithoutPassword } = updated;
    return new Response(JSON.stringify(studentWithoutPassword), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ message: 'Server error', error: err.message }), { status: 500 });
  }
}

// DELETE: Set status to 'leave' (soft delete)
export async function DELETE(request, context) {
  try {
    const { id } = await context.params;
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    const { success, user } = verifyToken(authHeader.split(' ')[1]);
    if (!success || user.role !== 'admin') return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 });
    
    // Get student data before updating
    const student = await prisma.student.findUnique({ 
      where: { id: parseInt(id) },
      include: {
        categoryRef: {
          select: {
            title: true
          }
        }
      }
    });
    
    if (!student) {
      return new Response(JSON.stringify({ message: 'Student not found' }), { status: 404 });
    }
    
    const updated = await prisma.student.update({
      where: { id: parseInt(id) },
      data: { status: 'leave', updatedAt: new Date() },
    });
    
    // Send SMS notification to student
    let smsResult = null;
    try {
      console.log(`📱 === STUDENT LEAVE SMS DEBUG START ===`);
      console.log(`📱 Student name: ${student.name}`);
      console.log(`📱 Student phone: ${student.phone}`);
      console.log(`📱 Student smsPhone: ${student.smsPhone}`);
      
      const studentPhone = student.smsPhone;
      console.log(`📱 Using phone number: ${studentPhone}`);
      
      if (studentPhone) {
        console.log(`📱 Generating leave notification message...`);
        const leaveMessage = generateStudentLeaveMessage(
          student.name,
          student.categoryRef?.title || 'Unknown Category'
        );
        console.log(`📱 Generated message: ${leaveMessage}`);
        
        console.log(`📱 Calling sendSMS function...`);
        smsResult = await sendSMS(studentPhone, leaveMessage);
        console.log(`📱 SMS API response:`, smsResult);
        console.log(`📱 Student leave notification result: ${smsResult.success ? '✅ Success' : '❌ Failed'}`);
      } else {
        console.log(`⚠️ No phone number found for student: ${student.name}`);
        smsResult = {
          success: false,
          message: 'No phone number available for student'
        };
      }
      console.log(`📱 === STUDENT LEAVE SMS DEBUG END ===`);
      
    } catch (smsError) {
      console.error(`❌ Student leave SMS error:`, smsError);
      smsResult = {
        success: false,
        message: 'Student leave SMS sending failed',
        error: smsError.message
      };
    }
    
    // Return student data without password
    const { password: _, ...studentWithoutPassword } = updated;
    return new Response(JSON.stringify({ 
      message: 'Student set to leave', 
      student: studentWithoutPassword,
      smsNotification: smsResult
    }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ message: 'Server error', error: err.message }), { status: 500 });
  }
} 