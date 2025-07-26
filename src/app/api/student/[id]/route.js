import { promises as fs } from 'fs';
import path from 'path';
import { verifyToken } from '../../../../lib/auth';

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

// GET: Get student by ID (admin: any, student: self)
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    const { success, user } = verifyToken(authHeader.split(' ')[1]);
    if (!success) return new Response(JSON.stringify({ message: 'Invalid token' }), { status: 401 });
    const students = await readStudents();
    const student = students.find(s => String(s.id) === String(id));
    if (!student) return new Response(JSON.stringify({ message: 'Student not found' }), { status: 404 });
    if (user.role === 'admin' || (user.role === 'student' && String(user.id) === String(id))) {
      return new Response(JSON.stringify(student), { status: 200 });
    } else {
      return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 });
    }
  } catch (err) {
    return new Response(JSON.stringify({ message: 'Server error', error: err.message }), { status: 500 });
  }
}

// PUT: Update student (admin: any, student: self, with field restrictions)
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    const { success, user } = verifyToken(authHeader.split(' ')[1]);
    if (!success) return new Response(JSON.stringify({ message: 'Invalid token' }), { status: 401 });
    let students = await readStudents();
    const idx = students.findIndex(s => String(s.id) === String(id));
    if (idx === -1) return new Response(JSON.stringify({ message: 'Student not found' }), { status: 404 });
    const data = await request.json();
    if (user.role === 'admin') {
      students[idx] = { ...students[idx], ...data, id: students[idx].id };
    } else if (user.role === 'student' && String(user.id) === String(id)) {
      // Only allow certain fields
      const allowed = ['name', 'smsPhone', 'profileImage', 'hideRanking', 'password'];
      for (const key of Object.keys(data)) {
        if (allowed.includes(key)) {
          students[idx][key] = data[key];
        }
      }
    } else {
      return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 });
    }
    await writeStudents(students);
    return new Response(JSON.stringify(students[idx]), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ message: 'Server error', error: err.message }), { status: 500 });
  }
}

// DELETE: Delete student (admin only)
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    const { success, user } = verifyToken(authHeader.split(' ')[1]);
    if (!success || user.role !== 'admin') return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 });
    let students = await readStudents();
    const idx = students.findIndex(s => String(s.id) === String(id));
    if (idx === -1) return new Response(JSON.stringify({ message: 'Student not found' }), { status: 404 });
    students.splice(idx, 1);
    await writeStudents(students);
    return new Response(JSON.stringify({ message: 'Student deleted' }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ message: 'Server error', error: err.message }), { status: 500 });
  }
} 