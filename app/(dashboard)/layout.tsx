"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { getPengaturan } from "@/actions/pengaturan";
import { Toaster } from "react-hot-toast";

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
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        namaToko={pengaturan?.nama_toko || "Toko"} 
        urlLogo={pengaturan?.url_logo}
      />

      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex-1 min-w-0 flex flex-col lg:pl-64 min-h-screen">
        <Navbar 
          onMenuClick={() => setIsSidebarOpen(true)} 
          namaToko={pengaturan?.nama_toko || "Toko"} 
          urlLogo={pengaturan?.url_logo}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 animate-fade-in">
          {children}
        </main>
      </div>

      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
}