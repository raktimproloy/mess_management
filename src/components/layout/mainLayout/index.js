import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#121214]">
      <Navbar />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 text-white overflow-y-auto">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}
