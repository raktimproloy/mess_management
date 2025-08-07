'use client';
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "Dashboard", icon: "🏠", href: "/student/dashboard" },
  { name: "Rent", icon: "💰", href: "/student/rent" },
  // { name: "Payment Requests", icon: "📋", href: "/student/payment-requests" },
  { name: "Complaint", icon: "📝", href: "/student/complaint" },
  { name: "Profile", icon: "⚙️", href: "/student/profile" },
];

export default function StudentBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1a1a1d] border-t border-gray-200 dark:border-[#2a2a2d] text-gray-700 dark:text-gray-300 lg:hidden shadow-lg backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
      <div className="flex justify-around items-center py-3 px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center gap-1.5 px-4 py-2 rounded-xl transition-all duration-200 relative group ${
                isActive 
                  ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 shadow-sm" 
                  : "text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              }`}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
              )}
              
              <span className={`text-xl transition-transform duration-200 ${
                isActive ? "scale-110" : "group-hover:scale-105"
              }`}>
                {item.icon}
              </span>
              
              <span className={`text-xs font-semibold tracking-wide transition-colors ${
                isActive 
                  ? "text-blue-600 dark:text-blue-400" 
                  : "text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400"
              }`}>
                {item.name}
              </span>
              
              {/* Hover effect */}
              {!isActive && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-blue-50/0 to-blue-50/0 group-hover:from-blue-50/10 group-hover:to-blue-50/5 dark:from-blue-900/0 dark:to-blue-900/0 dark:group-hover:from-blue-900/10 dark:group-hover:to-blue-900/5 transition-all duration-200"></div>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
} 