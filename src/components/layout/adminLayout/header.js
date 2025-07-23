import React from "react";

export default function AdminHeader() {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-[#18181b] border-b border-[#232329] text-white shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold tracking-tight">Admin Panel</span>
      </div>
      <div className="flex items-center gap-4">
        {/* User info or actions placeholder */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Admin</span>
          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-lg font-bold">A</div>
        </div>
      </div>
    </header>
  );
}
