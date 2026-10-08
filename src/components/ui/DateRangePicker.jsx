"use client";

import { useEffect, useRef, useState } from "react";
import { FaRegCalendarAlt } from "react-icons/fa";
import Calendar, { sameDay, isBetween } from "./Calendar";

const fmt = (d) => (d ? d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "");

/**
 * Themed date-range picker used for the admin bookings filter (and anywhere
 * else a "from -> to" range is needed). `value` is { from, to } (Date | null).
 */
export default function DateRangePicker({ value, onChange, label, className = "" }) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(value?.from || new Date());
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleSelect = (date) => {
    const { from, to } = value || {};
    if (!from || (from && to)) {
      onChange({ from: date, to: null });
    } else if (date < from) {
      onChange({ from: date, to: from });
    } else {
      onChange({ from, to: date });
    }
  };

  const display = value?.from
    ? value?.to
      ? `${fmt(value.from)} – ${fmt(value.to)}`
      : fmt(value.from)
    : "All dates";

  return (
    <div className={`relative ${className}`} ref={ref}>
      {label && <label className="mb-1.5 block text-[0.8rem] font-medium text-slate-600">{label}</label>}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 rounded-lg border-[1.5px] bg-white px-3.5 py-2.5 text-left text-sm outline-none transition-colors focus:border-orange-600 ${
          open ? "border-orange-600" : "border-slate-200"
        } text-slate-700`}
      >
        <FaRegCalendarAlt size={13} className="text-orange-600" />
        {display}
      </button>

      {open && (
        <div className="absolute z-50 mt-1.5 rounded-xl border border-slate-200 bg-white shadow-[0_16px_50px_rgba(0,0,0,0.14)]">
          <Calendar
            month={month}
            onMonthChange={setMonth}
            dayState={(d) => ({
              selected: sameDay(d, value?.from) || sameDay(d, value?.to),
              inRange: isBetween(d, value?.from, value?.to),
              today: sameDay(d, new Date()),
            })}
            onSelectDay={handleSelect}
          />
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2.5">
            <button
              type="button"
              onClick={() => onChange({ from: null, to: null })}
              className="text-[0.75rem] font-semibold text-slate-400 hover:text-orange-600"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="font-heading text-[0.75rem] font-bold text-orange-600"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
