"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { getPengaturan } from "@/actions/pengaturan";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [pengaturan, setPengaturan] = useState<any>(null);

  useEffect(() => {
    getPengaturan().then((result) => {
      if (result.success && result.data) {
        setPengaturan(result.data);
      }
    });
  }, []);

  return (
    <div className="relative min-h-screen bg-slate-50 font-sans flex">
      {/* Sidebar - fixed and togglable */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        namaToko={pengaturan?.nama_toko || "GlowAura"} 
        urlLogo={pengaturan?.url_logo}
      />

      {/* Backdrop overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col lg:pl-64 min-h-screen">
        {/* Navbar */}
        <Navbar 
          onMenuClick={() => setIsSidebarOpen(true)} 
          namaToko={pengaturan?.nama_toko || "GlowAura"} 
          urlLogo={pengaturan?.url_logo}
        />

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
