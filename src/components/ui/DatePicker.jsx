"use client";

import { useEffect, useRef, useState } from "react";
import { FaRegCalendarAlt } from "react-icons/fa";
import Calendar, { sameDay } from "./Calendar";

const fmt = (d) =>
  d ? d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "";

/**
 * Single-date picker with the same look everywhere it's used (booking form,
 * admin edit modals). `value`/`onChange` use plain Date objects.
 */
export default function DatePicker({ label, value, onChange, minDate, placeholder = "Select date", className = "" }) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(value || minDate || new Date());
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className={`relative ${className}`} ref={ref}>
      {label && <label className="mb-1.5 block text-[0.8rem] font-medium text-slate-600">{label}</label>}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center justify-between rounded-lg border-[1.5px] bg-white px-3.5 py-2.5 text-left text-sm outline-none transition-colors focus:border-orange-600 ${
          open ? "border-orange-600" : "border-slate-200"
        } ${value ? "text-slate-800" : "text-slate-400"}`}
      >
        {value ? fmt(value) : placeholder}
        <FaRegCalendarAlt size={13} className="text-orange-600" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1.5 rounded-xl border border-slate-200 bg-white shadow-[0_16px_50px_rgba(0,0,0,0.14)]">
          <Calendar
            month={month}
            onMonthChange={setMonth}
            minDate={minDate}
            dayState={(d) => ({ selected: sameDay(d, value), today: sameDay(d, new Date()) })}
            onSelectDay={(d) => {
              onChange(d);
              setOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
