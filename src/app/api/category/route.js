import { promises as fs } from 'fs';
import path from 'path';

const categoryPath = path.join(process.cwd(), 'public/database/categories.json');

async function readCategories() {
  try {
    const data = await fs.readFile(categoryPath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

async function writeCategories(categories) {
  await fs.writeFile(categoryPath, JSON.stringify(categories, null, 2));
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const categories = await readCategories();
  if (id) {
    const cat = categories.find((c) => String(c.id) === String(id));
    if (!cat) {
      return new Response(JSON.stringify({ message: 'Category not found' }), { status: 404 });
    }
    return new Response(JSON.stringify(cat), { status: 200 });
  }
  return new Response(JSON.stringify(categories), { status: 200 });
}

export async function POST(request) {
  const data = await request.json();
  if (!data.title || !data.amount) {
    return new Response(JSON.stringify({ message: 'Title and amount are required' }), { status: 400 });
  }
  const categories = await readCategories();
  const newId = categories.length ? Math.max(...categories.map(c => c.id)) + 1 : 1;
  const now = new Date().toISOString();
  const newCat = {
    id: newId,
    title: data.title,
    amount: Number(data.amount),
    description: data.description || '',
    created_at: now,
    updated_at: now,
    status: data.status === 0 ? 0 : 1,
  };
  categories.push(newCat);
  await writeCategories(categories);
  return new Response(JSON.stringify(newCat), { status: 201 });
}

export async function PUT(request) {
  const data = await request.json();
  if (!data.id) {
    return new Response(JSON.stringify({ message: 'ID is required' }), { status: 400 });
  }
  const categories = await readCategories();
  const idx = categories.findIndex((c) => String(c.id) === String(data.id));
  if (idx === -1) {
    return new Response(JSON.stringify({ message: 'Category not found' }), { status: 404 });
  }
  categories[idx] = {
    ...categories[idx],
    ...data,
    amount: Number(data.amount),
    updated_at: new Date().toISOString(),
  };
  await writeCategories(categories);
  return new Response(JSON.stringify(categories[idx]), { status: 200 });
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return new Response(JSON.stringify({ message: 'ID is required' }), { status: 400 });
  }
  const categories = await readCategories();
  const idx = categories.findIndex((c) => String(c.id) === String(id));
  if (idx === -1) {
    return new Response(JSON.stringify({ message: 'Category not found' }), { status: 404 });
  }
  const deleted = categories.splice(idx, 1)[0];
  await writeCategories(categories);
  return new Response(JSON.stringify(deleted), { status: 200 });
} 