'use client';
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "Dashboard", icon: "🏠", href: "/student/dashboard" },
  { name: "Rent", icon: "💰", href: "/student/rent" },
  { name: "Payment Requests", icon: "📋", href: "/student/payment-requests" },
  { name: "Complaint", icon: "📝", href: "/student/complaint" },
  { name: "Profile", icon: "⚙️", href: "/student/profile" },
];

export default function StudentSidebar({ onLinkClick }) {
  const pathname = usePathname();

  const handleLinkClick = () => {
    if (onLinkClick) {
      onLinkClick();
    }
  };

  return (
    <aside className="lg:fixed lg:left-0 lg:top-0 lg:h-full lg:w-64 lg:bg-[#18181b] lg:border-r lg:border-[#232329] lg:text-white lg:flex lg:flex-col lg:py-6 lg:px-4 lg:z-50">
      <div className="mb-8 lg:block hidden">
        <h1 className="text-xl font-bold text-white">Student Panel</h1>
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
                  ? "bg-blue-600 text-white shadow-sm" 
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#232329] hover:text-blue-600 dark:hover:text-blue-400"
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
