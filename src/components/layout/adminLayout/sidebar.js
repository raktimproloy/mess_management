'use client';
import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "Dashboard", icon: "🏠", href: "/admin/dashboard" },
  { name: "CurrentRent", icon: "💰", href: "/admin/current_rent" },
  { name: "RentHistory", icon: "📜", href: "/admin/rent_history" },
  { name: "PaymentRequest", icon: "💳", href: "/admin/payment_request" },
  { name: "Complaints", icon: "📝", href: "/admin/complaint" },
  { name: "Add Student", icon: "➕", href: "/admin/students/create" },
  { name: "Students", icon: "🧑‍🎓", href: "/admin/students" },
  { name: "Category", icon: "📂", href: "/admin/category" },
  { name: "Discount", icon: "🎫", href: "/admin/discount" },
];

export default function AdminSidebar({ onLinkClick }) {
  const pathname = usePathname();

  const handleLinkClick = () => {
    if (onLinkClick) {
      onLinkClick();
    }
  };

  return (
    <aside className="lg:fixed lg:left-0 lg:top-0 lg:h-full lg:w-64 lg:bg-[#18181b] lg:border-r lg:border-[#232329] lg:text-white lg:flex lg:flex-col lg:py-6 lg:px-4 lg:z-50">
      <div className="mb-8 lg:block hidden">
        <h1 className="text-xl font-bold text-white">Admin Panel</h1>
      </div>
      
      <nav className="flex flex-col gap-2 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={handleLinkClick}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 text-base font-medium ${
                isActive 
                  ? "bg-red-600 text-white shadow-sm" 
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#232329] hover:text-red-600 dark:hover:text-red-400"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      <div className="mt-auto text-xs text-gray-400 px-3 pt-8 lg:block hidden">
        &copy; 2024 Mess Management
      </div>
    </aside>
  );
}
