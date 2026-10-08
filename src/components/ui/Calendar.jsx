"use client";

import { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const sameDay = (a, b) => a && b && a.toDateString() === b.toDateString();
const isBetween = (d, start, end) => start && end && d > start && d < end;

/**
 * Minimal, dependency-free month calendar in the site's orange/slate theme.
 * Controlled: pass `month` (a Date on the 1st) + `onMonthChange`.
 * Selection is left to the caller via `renderDayState` / `onSelectDay` so it
 * can be reused for both single-date and range pickers.
 */
export default function Calendar({ month, onMonthChange, onSelectDay, dayState, minDate }) {
  const year = month.getFullYear();
  const m = month.getMonth();
  const firstDow = new Date(year, m, 1).getDay();
  const daysInMonth = new Date(year, m + 1, 0).getDate();
  const cells = [...Array(firstDow).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const changeMonth = (delta) => onMonthChange(new Date(year, m + delta, 1));

  return (
    <div className="w-[272px] select-none p-3">
      <div className="mb-2 flex items-center justify-between px-1">
        <button
          type="button"
          onClick={() => changeMonth(-1)}
          className="rounded-md p-1.5 text-slate-400 hover:bg-orange-50 hover:text-orange-600"
        >
          <FaChevronLeft size={11} />
        </button>
        <span className="font-heading text-[0.85rem] font-bold text-slate-800">
          {MONTHS[m]} {year}
        </span>
        <button
          type="button"
          onClick={() => changeMonth(1)}
          className="rounded-md p-1.5 text-slate-400 hover:bg-orange-50 hover:text-orange-600"
        >
          <FaChevronRight size={11} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center">
        {WEEKDAYS.map((d, i) => (
          <div key={i} className="text-[0.65rem] font-semibold text-slate-400">
            {d}
          </div>
        ))}
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const date = new Date(year, m, day);
          const disabled = minDate && date < minDate;
          const state = dayState ? dayState(date) : {};
          return (
            <button
              type="button"
              key={i}
              disabled={disabled}
              onClick={() => onSelectDay(date)}
              className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-[0.78rem] transition-colors disabled:cursor-not-allowed disabled:text-slate-300 ${
                state.selected
                  ? "bg-orange-600 font-bold text-white"
                  : state.inRange
                  ? "bg-orange-50 text-orange-700"
                  : "text-slate-700 hover:bg-orange-50"
              } ${state.today && !state.selected ? "ring-1 ring-orange-300" : ""}`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { sameDay, isBetween };
