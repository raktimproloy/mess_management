import { promises as fs } from 'fs';
import path from 'path';

const studentsPath = path.join(process.cwd(), 'public/database/students.json');
const categoriesPath = path.join(process.cwd(), 'public/database/categories.json');
const rentsPath = path.join(process.cwd(), 'public/database/rents.json');

function getMonthYear(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

async function calculateRents({ students, categories, rentsRaw, now }) {
  const currentMonthYear = getMonthYear(now);
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthYear = getMonthYear(prevMonth);

  let rents = Array.isArray(rentsRaw) ? rentsRaw : [];
  let createdRents = [];
  let updatedStudents = [...students];
  let nextRentId = rents.length ? Math.max(...rents.map(r => r.id)) + 1 : 1;

  for (const student of students) {
    if (student.status !== 'living') continue;
    // Check if rent for this month already exists for this student
    const alreadyExists = rents.some(r => r.studentId === student.id && getMonthYear(r.month_year) === currentMonthYear);
    if (alreadyExists) continue;
    // Get category and amount
    const category = categories.find(c => c.id === (student.categoryId || student.category));
    if (!category) continue;
    const rentAmount = category.amount;
    // Check previous month due
    const prevRent = rents.find(r => r.studentId === student.id && getMonthYear(r.month_year) === prevMonthYear);
    const prevDue = prevRent && prevRent.status === 'due' ? prevRent.rent_amount + (prevRent.external_amount || 0) : 0;
    // Compose new rent
    const rent = {
      id: nextRentId++,
      month_year: new Date(now.getFullYear(), now.getMonth(), 1),
      rent_amount: rentAmount + prevDue,
      advance_amount: 0,
      external_amount: 0,
      status: 'unpaid',
      studentId: student.id,
    };
    rents.push(rent);
    createdRents.push(rent);
    // Update student.rentsIds
    if (!student.rentsIds) student.rentsIds = [];
    student.rentsIds.push(rent.id);
    // Update in updatedStudents
    const idx = updatedStudents.findIndex(s => s.id === student.id);
    if (idx !== -1) updatedStudents[idx] = student;
  }
  return { createdRents, updatedStudents, rents };
}

export async function GET(request) {
  const [students, categories, rentsRaw] = await Promise.all([
    fs.readFile(studentsPath, 'utf-8').then(JSON.parse),
    fs.readFile(categoriesPath, 'utf-8').then(JSON.parse),
    fs.readFile(rentsPath, 'utf-8').then(data => (data ? JSON.parse(data) : []), () => []),
  ]);
  const now = new Date();
  const { createdRents } = await calculateRents({ students, categories, rentsRaw, now });
  return new Response(JSON.stringify({ message: 'Preview rents to be generated', count: createdRents.length, rents: createdRents }), { status: 200 });
}

export async function POST(request) {
  const [students, categories, rentsRaw] = await Promise.all([
    fs.readFile(studentsPath, 'utf-8').then(JSON.parse),
    fs.readFile(categoriesPath, 'utf-8').then(JSON.parse),
    fs.readFile(rentsPath, 'utf-8').then(data => (data ? JSON.parse(data) : []), () => []),
  ]);
  const now = new Date();
  const { createdRents, updatedStudents, rents } = await calculateRents({ students, categories, rentsRaw, now });
  await Promise.all([
    fs.writeFile(rentsPath, JSON.stringify(rents, null, 2)),
    fs.writeFile(studentsPath, JSON.stringify(updatedStudents, null, 2)),
  ]);
  return new Response(JSON.stringify({ message: 'Rents generated', count: createdRents.length, rents: createdRents }), { status: 200 });
} 