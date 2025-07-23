import React from "react";
import AdminHeader from "./header";
import AdminSidebar from "./sidebar";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-[#121214]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        <main className="flex-1 p-8 bg-[#18181b] text-white overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
