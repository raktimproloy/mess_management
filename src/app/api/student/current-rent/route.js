import { promises as fs } from 'fs';
import path from 'path';

const rentsPath = path.join(process.cwd(), 'public/database/rents.json');
const studentsPath = path.join(process.cwd(), 'public/database/students.json');
const categoriesPath = path.join(process.cwd(), 'public/database/categories.json');

function getMonthYear(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function isCurrentMonth(date) {
  const now = new Date();
  const d = new Date(date);
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

export async function GET(request) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const pageSize = parseInt(url.searchParams.get('pageSize') || '10', 10);
  const search = url.searchParams.get('search') || '';
  const category = url.searchParams.get('category');

  const [rentsRaw, students, categories] = await Promise.all([
    fs.readFile(rentsPath, 'utf-8').then(JSON.parse),
    fs.readFile(studentsPath, 'utf-8').then(JSON.parse),
    fs.readFile(categoriesPath, 'utf-8').then(JSON.parse),
  ]);
  const now = new Date();
  const currentMonthYear = getMonthYear(now);

  // Filter rents for current month
  let rents = rentsRaw.filter(r => getMonthYear(r.month_year) === currentMonthYear);

  // Filter by category
  if (category) {
    rents = rents.filter(r => {
      const student = students.find(s => s.id === r.studentId);
      return student && (student.categoryId || student.category) == category;
    });
  }

  // Search by student name or phone
  if (search) {
    rents = rents.filter(r => {
      const student = students.find(s => s.id === r.studentId);
      return student && (
        student.name.toLowerCase().includes(search.toLowerCase()) ||
        (student.phone && student.phone.includes(search))
      );
    });
  }

  // Pagination
  const total = rents.length;
  const paginated = rents.slice((page - 1) * pageSize, page * pageSize);

  // Totals
  let totalRent = 0, totalPaid = 0, totalDue = 0;
  for (const r of rents) {
    totalRent += (r.rent_amount || 0);
    if (r.status === 'paid') totalPaid += (r.rent_amount || 0);
    else totalDue += (r.rent_amount || 0);
  }
  // Total students for current month
  const studentIds = new Set(rents.map(r => r.studentId));
  const totalStudents = studentIds.size;

  // Attach student and category info
  const result = paginated.map(r => {
    const student = students.find(s => s.id === r.studentId);
    const categoryObj = categories.find(c => c.id === (student?.categoryId || student?.category));
    return {
      ...r,
      student,
      category: categoryObj,
    };
  });

  return new Response(JSON.stringify({
    rents: result,
    total,
    totalRent,
    totalPaid,
    totalDue,
    totalStudents,
    page,
    pageSize
  }), { status: 200 });
}

// POST: Mark rent as fully paid (all due amounts paid)
export async function POST(request) {
  const { rentId } = await request.json();
  const rents = await fs.readFile(rentsPath, 'utf-8').then(JSON.parse);
  const students = await fs.readFile(studentsPath, 'utf-8').then(JSON.parse);
  const idx = rents.findIndex(r => r.id === rentId);
  if (idx === -1) return new Response(JSON.stringify({ message: 'Rent not found' }), { status: 404 });
  const rent = rents[idx];
  rents[idx].rent_paid = rent.rent_amount || 0;
  rents[idx].advance_paid = rent.advance_amount || 0;
  rents[idx].external_paid = rent.external_amount || 0;
  rents[idx].status = 'paid';
  await fs.writeFile(rentsPath, JSON.stringify(rents, null, 2));
  // Add rent-history record
  const student = students.find(s => s.id === rent.studentId);
  await fetch('http://localhost:3000/api/student/rent-history', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      rent_month: getMonthYear(rent.month_year),
      student_id: rent.studentId,
      category_id: student?.categoryId || student?.category,
      status: 'approved',
      payment_type: 'on hand',
      due_rent: 0,
      due_advance: 0,
      due_external: 0,
      paid_rent: rent.rent_amount || 0,
      paid_advance: rent.advance_amount || 0,
      paid_external: rent.external_amount || 0,
      details: { rentId: rent.id }
    })
  });
  return new Response(JSON.stringify({ message: 'Rent fully paid', rent: rents[idx] }), { status: 200 });
}

// PATCH: Pay specific values for rent_paid, advance_paid, external_paid
export async function PATCH(request) {
  const body = await request.json();
  const { rentId, rent_paid, advance_paid, external_paid } = body;
  const rents = await fs.readFile(rentsPath, 'utf-8').then(JSON.parse);
  const students = await fs.readFile(studentsPath, 'utf-8').then(JSON.parse);
  const idx = rents.findIndex(r => r.id === rentId);
  if (idx === -1) return new Response(JSON.stringify({ message: 'Rent not found' }), { status: 404 });

  let paid_rent = 0, paid_advance = 0, paid_external = 0;
  if (typeof rent_paid === 'number') {
    rents[idx].rent_paid = (rents[idx].rent_paid || 0) + rent_paid;
    paid_rent = rent_paid;
  }
  if (typeof advance_paid === 'number') {
    rents[idx].advance_paid = (rents[idx].advance_paid || 0) + advance_paid;
    paid_advance = advance_paid;
  }
  if (typeof external_paid === 'number') {
    rents[idx].external_paid = (rents[idx].external_paid || 0) + external_paid;
    paid_external = external_paid;
  }
  const totalPaid = (rents[idx].rent_paid || 0) + (rents[idx].advance_paid || 0) + (rents[idx].external_paid || 0);
  const totalDue = (rents[idx].rent_amount || 0) + (rents[idx].advance_amount || 0) + (rents[idx].external_amount || 0);
  if (totalPaid >= totalDue) {
    rents[idx].status = 'paid';
  }
  await fs.writeFile(rentsPath, JSON.stringify(rents, null, 2));
  // Add rent-history record
  const rent = rents[idx];
  const student = students.find(s => s.id === rent.studentId);
  await fetch('http://localhost:3000/api/student/rent-history', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      rent_month: getMonthYear(rent.month_year),
      student_id: rent.studentId,
      category_id: student?.categoryId || student?.category,
      status: 'approved',
      payment_type: 'on hand',
      due_rent: (rent.rent_amount || 0) - (rent.rent_paid || 0),
      due_advance: (rent.advance_amount || 0) - (rent.advance_paid || 0),
      due_external: (rent.external_amount || 0) - (rent.external_paid || 0),
      paid_rent,
      paid_advance,
      paid_external,
      details: { rentId: rent.id }
    })
  });
  return new Response(JSON.stringify({ message: 'Rent updated', rent: rents[idx] }), { status: 200 });
} 