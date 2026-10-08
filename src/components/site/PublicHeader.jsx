"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaWhatsapp, FaPhone } from "react-icons/fa";
import { NAV_LINKS } from "@/lib/constants";

export default function PublicHeader({ compact = false }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 70);
    window.addEventListener("scroll", fn);
    fn();
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links = [
    ...NAV_LINKS,
    ["Cities", "/#cities"],
    ["Rate Card", "/rate-card"],
    ["Testimonials", "/testimonials"],
    ["Group Travel", "/#bus-enquiry"],
  ];

  return (
    <>
      <div className="bg-orange-600 px-4 py-[0.45rem] sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <a href="tel:+918123552002" className="flex items-center gap-1.5 text-[0.78rem] font-medium text-white no-underline">
            <FaPhone size={11} /> +91 81235 52002
          </a>
          <div className="hidden text-[0.72rem] text-white/85 sm:block">Bengaluru &nbsp;|&nbsp; 24×7 Pan-India Service</div>
        </div>
      </div>
      <nav className={`sticky top-0 z-100 bg-white transition-shadow duration-300 ${scrolled ? "shadow-[0_2px_16px_rgba(0,0,0,0.09)]" : "shadow-[0_1px_0_#e2e8f0]"}`}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2 sm:px-6 sm:py-2.5">
          <Link href="/" className="no-underline">
            <div className="flex items-center gap-2">
              <div className="relative h-12 w-12 shrink-0 sm:h-16 sm:w-16">
                <Image src="/images/logo sep.png" fill alt="Accord Logo" className="object-contain" />
              </div>
              <div>
                <img src="/images/homepage/logo wording.png" alt="Accord" className="h-7 w-32 -translate-x-3 sm:h-9 sm:w-45 sm:-translate-x-5" />
                <div className="hidden text-[0.58rem] tracking-[0.12em] text-slate-500 uppercase translate-x-2 sm:block sm:translate-x-4">Tours &amp; Travels</div>
              </div>
            </div>
          </Link>
          <div className="hidden items-center gap-5 lg:flex">
            {links.map(([label, href]) => (
              href.startsWith("#") ? <a key={label} href={href} className="text-[0.82rem] font-medium text-slate-500 no-underline hover:text-orange-600">{label}</a> :
              <Link key={label} href={href} className="text-[0.82rem] font-medium text-slate-500 no-underline hover:text-orange-600">{label}</Link>
            ))}
            <a href="https://wa.me/918123552002" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-md bg-[#25D366] px-3.5 py-2 text-[0.78rem] font-semibold text-white no-underline"><FaWhatsapp size={14}/> WhatsApp</a>
            <Link href="/booking" className="font-heading rounded-md bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white no-underline hover:bg-orange-700">Book a Cab</Link>
          </div>
          <button onClick={() => setMenuOpen(v=>!v)} className="rounded-md border border-slate-200 px-2.5 py-2 text-slate-800 lg:hidden" aria-label="Menu">
            <span className="text-lg">{menuOpen ? "×" : "☰"}</span>
          </button>
        </div>
        {menuOpen && <div className="flex flex-col gap-3 border-t border-slate-200 bg-white px-6 py-4 lg:hidden">
          {links.map(([label,href]) => <Link key={label} href={href} onClick={()=>setMenuOpen(false)} className="text-sm font-medium text-slate-700 no-underline">{label}</Link>)}
          <Link href="/booking" onClick={()=>setMenuOpen(false)} className="rounded-md bg-orange-600 py-2.5 text-center text-sm font-semibold text-white no-underline">Book a Cab</Link>
        </div>}
      </nav>
    </>
  );
}
