import { promises as fs } from 'fs';
import path from 'path';
import { verifyAdminAuth, verifyToken, getStudentData } from '../../../lib/auth';

const studentsPath = path.join(process.cwd(), 'public/database/students.json');

async function readStudents() {
  try {
    const data = await fs.readFile(studentsPath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

async function writeStudents(students) {
  await fs.writeFile(studentsPath, JSON.stringify(students, null, 2));
}

// GET: List students (admin: all, student: self)
export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    const { success, user } = verifyToken(authHeader.split(' ')[1]);
    if (!success) return new Response(JSON.stringify({ message: 'Invalid token' }), { status: 401 });
    const students = await readStudents();
    if (user.role === 'admin') {
      return new Response(JSON.stringify(students), { status: 200 });
    } else if (user.role === 'student') {
      const student = students.find(s => String(s.id) === String(user.id));
      if (!student) return new Response(JSON.stringify({ message: 'Student not found' }), { status: 404 });
      return new Response(JSON.stringify([student]), { status: 200 });
    } else {
      return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 });
    }
  } catch (err) {
    return new Response(JSON.stringify({ message: 'Server error', error: err.message }), { status: 500 });
  }
}

// POST: Create student (admin only)
export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    const { success, user } = verifyToken(authHeader.split(' ')[1]);
    if (!success || user.role !== 'admin') return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 });
    const data = await request.json();
    if (!data.name || !data.phone || !data.categoryId || !data.joiningDate) {
      return new Response(JSON.stringify({ message: 'Missing required fields' }), { status: 400 });
    }
    let students = await readStudents();
    const maxId = students.reduce((max, s) => (s.id > max ? s.id : max), 0);
    const newId = maxId + 1;
    const newStudent = {
      id: newId,
      name: data.name,
      phone: data.phone,
      smsPhone: data.smsPhone || data.phone,
      password: data.password || data.phone,
      profileImage: '',
      hideRanking: 0,
      status: data.status || 'living',
      category: data.categoryId,
      categoryId: data.categoryId,
      joiningDate: data.joiningDate,
      rents: [],
    };
    students.push(newStudent);
    await writeStudents(students);
    return new Response(JSON.stringify({ message: 'Student created', student: newStudent }), { status: 201 });
  } catch (err) {
    return new Response(JSON.stringify({ message: 'Server error', error: err.message }), { status: 500 });
  }
} 