import { promises as fs } from 'fs';
import path from 'path';

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

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const students = await readStudents();
  if (id) {
    const student = students.find((s) => String(s.id) === String(id));
    if (!student) {
      return new Response(JSON.stringify({ message: 'Student not found' }), { status: 404 });
    }
    return new Response(JSON.stringify(student), { status: 200 });
  }
  return new Response(JSON.stringify(students), { status: 200 });
}

export async function PUT(request) {
  const data = await request.json();
  if (!data.id) {
    return new Response(JSON.stringify({ message: 'ID is required' }), { status: 400 });
  }
  const students = await readStudents();
  const idx = students.findIndex((s) => String(s.id) === String(data.id));
  if (idx === -1) {
    return new Response(JSON.stringify({ message: 'Student not found' }), { status: 404 });
  }
  students[idx] = {
    ...students[idx],
    ...data,
    id: students[idx].id, // Ensure id is not changed
  };
  await writeStudents(students);
  return new Response(JSON.stringify(students[idx]), { status: 200 });
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return new Response(JSON.stringify({ message: 'ID is required' }), { status: 400 });
  }
  const students = await readStudents();
  const idx = students.findIndex((s) => String(s.id) === String(id));
  if (idx === -1) {
    return new Response(JSON.stringify({ message: 'Student not found' }), { status: 404 });
  }
  // Instead of deleting, set status to 'leave'
  students[idx].status = 'leave';
  await writeStudents(students);
  return new Response(JSON.stringify(students[idx]), { status: 200 });
} 