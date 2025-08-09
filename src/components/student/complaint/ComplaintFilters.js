"use client";
import React from "react";

function ComplaintFilters({ filters, onFilterChange, onClearFilters }) {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 mb-6 border border-white/20 shadow-xl">
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Search by Title</label>
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={onFilterChange}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:bg-white/15"
            placeholder="Search complaint title"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={onFilterChange}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:bg-white/15"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="checking">Checking</option>
              <option value="solved">Solved</option>
              <option value="canceled">Canceled</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={onClearFilters}
              className="w-full py-3 px-4 bg-white/10 text-white rounded-xl border border-white/20 hover:bg-white/20 hover:scale-105 transition-all duration-300"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComplaintFilters;
