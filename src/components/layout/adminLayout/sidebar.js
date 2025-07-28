import Link from "next/link";
import React from "react";

const navItems = [
  { name: "Dashboard", icon: "🏠", href: "/admin/dashboard" },
  { name: "CurrentRent", icon: "💰", href: "/admin/current_rent" },
  { name: "RentHistory", icon: "📜", href: "/admin/rent_history" },
  { name: "PaymentRequest", icon: "💳", href: "/admin/payment_request" },
  { name: "Add Student", icon: "➕", href: "/admin/students/create" },
  { name: "Students", icon: "🧑‍🎓", href: "/admin/students" },
  { name: "Category", icon: "📂", href: "/admin/category" },
  { name: "Discount", icon: "�", href: "/admin/discount" },
  { name: "Reports", icon: "📊", href: "/admin/reports" },
];

export default function AdminSidebar() {
  return (
    <aside className="h-full w-64 bg-[#18181b] border-r border-[#232329] text-white flex flex-col py-6 px-4">
      <nav className="flex flex-col gap-2 mt-4">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[#232329] transition-colors text-base font-medium"
          >
            <span className="text-xl">{item.icon}</span>
            {item.name}
          </Link>
        ))}
      </nav>
      <div className="mt-auto text-xs text-gray-400 px-3 pt-8">&copy; 2024 Mess Management</div>
    </aside>
  );
}
