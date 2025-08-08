'use client';
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "Dashboard", icon: "🏠", href: "/admin/dashboard" },
  { name: "CurrentRent", icon: "💰", href: "/admin/current_rent" },
  { name: "Payment Req", icon: "💳", href: "/admin/payment_request" },
  { name: "Complaint", icon: "📝", href: "/admin/complaint" },
];

export default function AdminBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/10 backdrop-blur-lg border-t border-white/20 shadow-2xl lg:hidden">
      <div className="flex justify-around items-center py-4 px-6">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center gap-2 px-4 py-3 rounded-2xl transition-all duration-300 relative group ${
                isActive 
                  ? "bg-gradient-to-r from-red-500/20 to-orange-500/20 text-white shadow-lg border border-white/20" 
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gradient-to-r from-red-400 to-orange-400 rounded-full shadow-lg"></div>
              )}
              
              <span className={`text-2xl transition-all duration-300 ${
                isActive ? "scale-110" : "group-hover:scale-105"
              }`}>
                {item.icon}
              </span>
              
              {/* Hover effect */}
              {!isActive && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-white/0 to-white/0 group-hover:from-white/5 group-hover:to-white/10 transition-all duration-300"></div>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
