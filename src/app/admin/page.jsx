"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaCalendarCheck, FaHourglassHalf, FaCheckDouble, FaCarSide, FaCommentDots } from "react-icons/fa";
import Spinner from "@/components/ui/Spinner";

const CARDS = [
  { key: "totalBookings", label: "Total bookings", icon: FaCalendarCheck, color: "text-orange-600 bg-orange-50" },
  { key: "pending", label: "Pending", icon: FaHourglassHalf, color: "text-amber-600 bg-amber-50", nested: "bookings" },
  { key: "completed", label: "Completed", icon: FaCheckDouble, color: "text-emerald-600 bg-emerald-50", nested: "bookings" },
  { key: "activeFleet", label: "Active fleet", icon: FaCarSide, color: "text-blue-600 bg-blue-50" },
  { key: "pendingFeedback", label: "Feedback to review", icon: FaCommentDots, color: "text-purple-600 bg-purple-50" },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

  return (
    <div>
      <h1 className="font-heading mb-1 text-2xl font-bold text-slate-800">Dashboard</h1>
      <p className="mb-8 text-sm text-slate-500">A quick look at what needs your attention.</p>

      {!stats ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {CARDS.map(({ key, label, icon: Icon, color, nested }) => (
            <div key={key} className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
              <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg ${color}`}>
                <Icon size={15} />
              </div>
              <div className="font-heading text-2xl font-bold text-slate-800">
                {nested ? stats[nested]?.[key] ?? 0 : stats[key] ?? 0}
              </div>
              <div className="text-[0.78rem] text-slate-500">{label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/admin/bookings"
          className="font-heading rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white no-underline hover:bg-orange-700"
        >
          Manage bookings
        </Link>
        <Link
          href="/admin/fleet"
          className="font-heading rounded-lg border-[1.5px] border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 no-underline hover:border-orange-600 hover:text-orange-600"
        >
          Manage fleet
        </Link>
      </div>
    </div>
  );
}
