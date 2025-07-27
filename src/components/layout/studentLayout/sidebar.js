import React from "react";
import Link from "next/link";

const navItems = [
  { name: "Dashboard", icon: "🏠", href: "/student/dashboard" },
  { name: "Rent", icon: "💰", href: "/student/rent" },
  { name: "Payment Requests", icon: "📋", href: "/student/payment-requests" },
  { name: "Rent History", icon: "📊", href: "/student/rent-history" },
  { name: "Profile", icon: "⚙️", href: "/student/profile" },
  { name: "Logout", icon: "🚪", href: "/student/logout" },
];

export default function StudentSidebar() {
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
