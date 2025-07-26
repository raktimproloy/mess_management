import { promises as fs } from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const data = await request.json();
    // Validate required fields
    if (!data.name || !data.phone || !data.categoryId || !data.joining_date) {
      return new Response(JSON.stringify({ message: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    // Path to students.json in public/database
    const studentsPath = path.join(process.cwd(), 'public/database/students.json');
    let students = [];
    try {
      const studentsRaw = await fs.readFile(studentsPath, 'utf-8');
      students = JSON.parse(studentsRaw);
    } catch (err) {
      // If file doesn't exist, start with empty array
      if (err.code !== 'ENOENT') throw err;
    }
    // Generate unique ID
    const maxId = students.reduce((max, s) => (s.id > max ? s.id : max), 0);
    const newId = maxId + 1;
    // Create new student object
    const hashedPassword = await bcrypt.hash(data.password || data.phone, 10);
    const newStudent = {
      id: newId,
      name: data.name,
      phone: data.phone,
      smsPhone: data.sms_phone || data.phone,
      password: hashedPassword,
      profile_image: '',
      hide_ranking: 0,
      status: data.status || 'living',
      category: data.categoryId,
      categoryId: data.categoryId,
      joiningDate: data.joining_date,
      rents: [],
    };
    students.push(newStudent);
    await fs.writeFile(studentsPath, JSON.stringify(students, null, 2));
    return new Response(JSON.stringify({ message: 'Student created', student: newStudent }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ message: 'Error creating student', error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 