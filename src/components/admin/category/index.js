"use client"
import React, { useState } from 'react';

const initialCategories = [
  {
    id: 1,
    title: 'Breakfast',
    amount: 50,
    description: 'Morning meal',
    created_at: '2024-06-01',
    updated_at: '2024-06-02',
    status: 'Active',
  },
  // Add more sample data as needed
];

function CategoryModal({ open, onClose, onSave, category, mode }) {
  const [form, setForm] = useState(
    category || { title: '', amount: '', description: '', status: 'Active' }
  );

  React.useEffect(() => {
    if (category) setForm(category);
    else setForm({ title: '', amount: '', description: '', status: 'Active' });
  }, [category, open]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative animate-fadeIn">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          {mode === 'add' ? 'Add New Category' : mode === 'edit' ? 'Edit Category' : 'View Category'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              disabled={mode === 'view'}
              required
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input
              name="amount"
              type="number"
              value={form.amount}
              onChange={handleChange}
              disabled={mode === 'view'}
              required
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              name="description"
              value={form.description}
              onChange={handleChange}
              disabled={mode === 'view'}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              disabled={mode === 'view'}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 transition"
            >
              Close
            </button>
            {mode !== 'view' && (
              <button
                type="submit"
                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                Save
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CategoryTable() {
  const [categories, setCategories] = useState(initialCategories);
  const [modal, setModal] = useState({ open: false, mode: 'add', category: null });

  const handleAdd = () => setModal({ open: true, mode: 'add', category: null });
  const handleEdit = (cat) => setModal({ open: true, mode: 'edit', category: cat });
  const handleView = (cat) => setModal({ open: true, mode: 'view', category: cat });
  const handleClose = () => setModal({ open: false, mode: 'add', category: null });

  const handleSave = (cat) => {
    if (modal.mode === 'add') {
      setCategories([
        ...categories,
        { ...cat, id: categories.length + 1, created_at: new Date().toISOString().slice(0, 10), updated_at: new Date().toISOString().slice(0, 10) },
      ]);
    } else if (modal.mode === 'edit') {
      setCategories(categories.map((c) => (c.id === cat.id ? { ...cat, updated_at: new Date().toISOString().slice(0, 10) } : c)));
    }
    handleClose();
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      setCategories(categories.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Category List</h1>
        <button
          onClick={handleAdd}
          className="px-6 py-2 rounded-md bg-blue-600 text-white font-medium shadow hover:bg-blue-700 transition"
        >
          Add New
        </button>
      </div>
      <div className="overflow-x-auto rounded-lg shadow bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Title</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Description</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Created At</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Updated At</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-sm text-gray-700">{cat.id}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{cat.title}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{cat.amount}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{cat.description}</td>
                <td className="px-4 py-2 text-sm text-gray-500">{cat.created_at}</td>
                <td className="px-4 py-2 text-sm text-gray-500">{cat.updated_at}</td>
                <td className="px-4 py-2 text-sm">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${cat.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {cat.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-sm flex gap-2">
                  <button
                    onClick={() => handleView(cat)}
                    className="px-2 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleEdit(cat)}
                    className="px-2 py-1 rounded bg-yellow-400 text-white hover:bg-yellow-500 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="px-2 py-1 rounded bg-red-500 text-white hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <CategoryModal
        open={modal.open}
        onClose={handleClose}
        onSave={handleSave}
        category={modal.category}
        mode={modal.mode}
      />
    </div>
  );
}
