"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { FaBars, FaTimes } from "react-icons/fa";
import Sidebar from "./Sidebar";

export default function AdminShell({ children }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  if (pathname === "/admin/login") return children;

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 md:block"><Sidebar /></aside>

      {mobileOpen && <div className="fixed inset-0 z-50 md:hidden" onClick={() => setMobileOpen(false)}>
        <div className="absolute inset-0 bg-slate-900/40" />
        <div className="absolute inset-y-0 left-0 w-[min(88vw,300px)]" onClick={(e) => e.stopPropagation()}><Sidebar onNavigate={() => setMobileOpen(false)} /></div>
      </div>}

      <div className="min-h-screen md:ml-60">
        <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur md:hidden">
          <button onClick={() => setMobileOpen(true)} className="rounded-md p-1.5 text-slate-500 hover:bg-slate-50" aria-label="Open admin menu"><FaBars size={16} /></button>
          <span className="font-heading text-sm font-bold text-orange-600">Accord Admin</span>
        </div>
        <main className="min-w-0 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
