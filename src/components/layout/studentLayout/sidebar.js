'use client';
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "Dashboard", icon: "🏠", href: "/student/dashboard" },
  { name: "Rent", icon: "💰", href: "/student/rent" },
  { name: "Payment Requests", icon: "📋", href: "/student/payment-requests" },
  { name: "Complaint", icon: "📝", href: "/student/complaint" },
  { name: "Profile", icon: "👤", href: "/student/profile" },
];

export default function StudentSidebar({ onLinkClick }) {
  const pathname = usePathname();

  const handleLinkClick = () => {
    if (onLinkClick) {
      onLinkClick();
    }
  };

  return (
    <aside className="lg:fixed lg:left-0 lg:top-0 lg:h-full lg:w-64 lg:bg-white/10 lg:backdrop-blur-lg lg:border-r lg:border-white/20 lg:text-white lg:flex lg:flex-col lg:py-6 lg:px-4 lg:z-50">
      <div className="mb-8 lg:block hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-white text-lg font-bold">🏠</span>
          </div>
          <h1 className="text-xl font-bold text-white">Student Panel</h1>
        </div>
      </div>
      
      <nav className="flex flex-col gap-3 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={handleLinkClick}
              className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 text-base font-medium ${
                isActive 
                  ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white shadow-lg border border-white/20" 
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-white font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="mt-auto text-xs text-white/50 px-4 pt-8 lg:block hidden">
        &copy; 2025 Mess Management
      </div>
    </aside>
  );
}
