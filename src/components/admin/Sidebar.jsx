"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  FaTachometerAlt,
  FaCalendarCheck,
  FaCarSide,
  FaMoneyBillWave,
  FaFileInvoiceDollar,
  FaCommentDots,
  FaSignOutAlt,
  FaGlobe,
} from "react-icons/fa";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: FaTachometerAlt },
  { href: "/admin/bookings", label: "Bookings", icon: FaCalendarCheck },
  { href: "/admin/fleet", label: "Fleet", icon: FaCarSide },
  { href: "/admin/rate-card", label: "Rate Card", icon: FaMoneyBillWave },
  { href: "/admin/invoices", label: "Invoices", icon: FaFileInvoiceDollar },
  { href: "/admin/site-content", label: "Site Content", icon: FaGlobe },
  { href: "/admin/feedback", label: "Feedback", icon: FaCommentDots },
];

export default function Sidebar({ onNavigate }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="flex h-full w-60 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="relative h-9 w-9 shrink-0">
          <Image src="/images/logo.png" fill alt="Accord" className="object-contain" />
        </div>
        <div>
          <div className="font-heading text-[1.05rem] font-extrabold leading-none text-orange-600">Accord</div>
          <div className="text-[0.6rem] tracking-[0.1em] text-slate-400 uppercase">Admin Panel</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {LINKS.map(({ href, label, icon: Icon }) => {
          const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-[0.85rem] font-medium no-underline transition-colors ${
                active ? "bg-orange-50 text-orange-600" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <Icon size={14} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-slate-100 px-3 py-3">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-[0.85rem] font-medium text-slate-500 no-underline transition-colors hover:bg-slate-50 hover:text-slate-800"
        >
          <FaGlobe size={14} />
          View site
        </a>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-left text-[0.85rem] font-medium text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <FaSignOutAlt size={14} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
