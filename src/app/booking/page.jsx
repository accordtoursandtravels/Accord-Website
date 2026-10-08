"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  FaPhone,
  FaWhatsapp,
  FaArrowRight,
  FaCheckCircle,
  FaUsers,
  FaMapMarkerAlt,
  FaLocationArrow,
  FaArrowLeft,
  FaCalendarAlt,
  FaClock,
  FaChevronLeft,
  FaChevronRight,
  FaChevronDown,
} from "react-icons/fa";
import { TRIP_TYPES, DURATIONS } from "@/lib/constants";
import PublicHeader from "@/components/site/PublicHeader";

const EMPTY = {
  tripType: "airport",
  outstationMode: "oneWay",
  roundTripDropMode: "pickup",
  pickup: "",
  dropoff: "",
  pickupDate: "",
  dropoffDate: "",
  dropoffTime: "",
  pickupTime: "",
  cabType: "",
  duration: "",
  kms: "",
  airportDistanceKm: "",
  name: "",
  phone: "",
  email: "",
  kyc: null,
};

/* ─────────────────────────────────────────────
   REUSABLE FIELD
───────────────────────────────────────────── */

function Field({ label, error, children }) {
  return (
    <div>
      <label className="font-heading mb-1.5 block text-[0.78rem] font-semibold text-slate-800">
        {label}
      </label>

      {children}

      {error && (
        <p className="mt-1 flex items-center gap-1 text-[0.72rem] text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   INPUT STYLE
───────────────────────────────────────────── */

const inputClass = (err) =>
  `w-full rounded-lg border-[1.5px] px-3.5 py-[0.7rem] text-[0.9rem] text-slate-800 outline-none transition-colors font-sans focus:border-orange-600 ${
    err ? "border-red-300 bg-red-50" : "border-slate-200 bg-white"
  }`;

/* ─────────────────────────────────────────────
   STEP BADGE
───────────────────────────────────────────── */

const StepBadge = ({ n }) => (
  <span className="font-heading flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-orange-600 text-[0.68rem] font-bold text-white">
    {n}
  </span>
);

/* ─────────────────────────────────────────────
   CUSTOM DATE PICKER
   - Replaces the browser's native date picker with a
     consistent, branded calendar UI.
───────────────────────────────────────────── */

function parseDateValue(value) {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function formatDateValue(value) {
  const date = parseDateValue(value);
  if (!date) return "Select date";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function toDateValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function DatePicker({
  value,
  onChange,
  min,
  error,
  placeholder = "Select date",
}) {
  const [open, setOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const selected = parseDateValue(value);
    const minimum = parseDateValue(min);
    const initial = selected || minimum || new Date();
    return new Date(initial.getFullYear(), initial.getMonth(), 1);
  });

  const rootRef = useRef(null);
  const todayValue = toDateValue(new Date());
  const minDate = parseDateValue(min);

  useEffect(() => {
    const handleOutside = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    const selected = parseDateValue(value);
    if (selected) {
      setVisibleMonth(new Date(selected.getFullYear(), selected.getMonth(), 1));
    }
  }, [value]);

  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = [];

  for (let i = 0; i < firstDay; i += 1) days.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    days.push(new Date(year, month, day));
  }

  const canGoPrevious =
    !minDate ||
    new Date(year, month - 1, 1) >=
      new Date(minDate.getFullYear(), minDate.getMonth(), 1);

  const goPrevious = () => {
    if (!canGoPrevious) return;
    setVisibleMonth(new Date(year, month - 1, 1));
  };

  const goNext = () => {
    setVisibleMonth(new Date(year, month + 1, 1));
  };

  const chooseDate = (date) => {
    const dateValue = toDateValue(date);

    if (min && dateValue < min) return;

    onChange(dateValue);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative min-w-0">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`flex h-[58px] min-h-[58px] w-full min-w-0 items-center justify-between gap-2 overflow-hidden rounded-xl border-[1.5px] bg-white px-3.5 text-left outline-none transition-all focus:border-orange-600 focus:ring-2 focus:ring-orange-100 ${
          error ? "border-red-300 bg-red-50" : "border-slate-200"
        }`}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span
          className={`flex items-center gap-2.5 text-[0.9rem] ${
            value ? "text-slate-800" : "text-slate-400"
          }`}
        >
          <FaCalendarAlt
            size={14}
            className={value ? "text-orange-600" : "text-slate-400"}
          />
          <span className="min-w-0 truncate">
            {value ? formatDateValue(value) : placeholder}
          </span>
        </span>

        <FaChevronRight
          size={10}
          className={`text-slate-400 transition-transform ${
            open ? "rotate-90" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+8px)] z-50 w-[min(340px,calc(100vw-1.5rem))] min-w-0 max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_18px_50px_rgba(15,23,42,0.16)]">
          <div className="mb-2 flex items-center justify-between px-1 py-1">
            <button
              type="button"
              onClick={goPrevious}
              disabled={!canGoPrevious}
              className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-orange-50 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-25"
              aria-label="Previous month"
            >
              <FaChevronLeft size={11} />
            </button>

            <div className="text-center">
              <div className="font-heading text-[0.92rem] font-bold text-slate-800">
                {visibleMonth.toLocaleDateString("en-IN", {
                  month: "long",
                  year: "numeric",
                })}
              </div>
              <div className="mt-0.5 text-[0.62rem] font-medium text-slate-400">
                Choose your travel date
              </div>
            </div>

            <button
              type="button"
              onClick={goNext}
              className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-orange-50 hover:text-orange-600"
              aria-label="Next month"
            >
              <FaChevronRight size={11} />
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-1 text-center">
            {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
              <div
                key={`${day}-${index}`}
                className="py-1 text-[0.62rem] font-bold uppercase text-slate-400"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="h-9" />;
              }

              const dateValue = toDateValue(date);
              const disabled = Boolean(min && dateValue < min);
              const selected = dateValue === value;
              const today = dateValue === todayValue;

              return (
                <button
                  key={dateValue}
                  type="button"
                  onClick={() => chooseDate(date)}
                  disabled={disabled}
                  className={`relative h-9 rounded-lg text-[0.76rem] font-semibold transition-all ${
                    disabled
                      ? "cursor-not-allowed text-slate-200"
                      : selected
                        ? "bg-orange-600 text-white shadow-sm"
                        : today
                          ? "bg-orange-50 text-orange-700 ring-1 ring-orange-200 hover:bg-orange-100"
                          : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {date.getDate()}
                  {today && !selected && (
                    <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-orange-600" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-slate-100 px-1 pt-2.5">
            <span className="text-[0.62rem] text-slate-400">
              Today: {formatDateValue(todayValue)}
            </span>
            <button
              type="button"
              onClick={() => {
                onChange(min || todayValue);
                const target = parseDateValue(min || todayValue) || new Date();
                setVisibleMonth(
                  new Date(target.getFullYear(), target.getMonth(), 1),
                );
                setOpen(false);
              }}
              className="text-[0.65rem] font-bold text-orange-600 hover:text-orange-700"
            >
              Select today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   CUSTOM TIME PICKER
   - Replaces the browser's native time picker with a
     consistent, branded time selector.
   - Keeps the stored value in HH:MM format.
   ───────────────────────────────────────────── */

function formatTimeValue(value) {
  if (!value) return "Select time";

  const [hoursString, minutesString] = value.split(":");
  const hours = Number(hoursString);
  const minutes = Number(minutesString);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) return "Select time";

  const period = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;

  return `${String(displayHour).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0",
  )} ${period}`;
}

function TimePicker({
  value,
  onChange,
  error,
  placeholder = "Select time",
  label = "Select Time",
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("hour");
  const [period, setPeriod] = useState(
    value && Number(value.split(":")[0]) >= 12 ? "PM" : "AM",
  );
  const rootRef = useRef(null);

  const currentHour = value ? Number(value.split(":")[0]) : null;
  const currentMinute = value ? Number(value.split(":")[1]) : null;
  const selectedHour = currentHour ?? (period === "PM" ? 13 : 9);
  const selectedMinute = currentMinute ?? 0;

  useEffect(() => {
    const handleOutside = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target))
        setOpen(false);
    };
    const handleEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const chooseHour = (hour) => {
    const actualHour =
      period === "PM" ? (hour === 12 ? 12 : hour + 12) : hour === 12 ? 0 : hour;
    const next = `${String(actualHour).padStart(2, "0")}:${String(selectedMinute).padStart(2, "0")}`;
    onChange(next);
    setMode("minute");
  };

  const chooseMinute = (minute) => {
    const next = `${String(selectedHour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    onChange(next);
    setOpen(false);
    setMode("hour");
  };

  const hourPositions = Array.from({ length: 12 }, (_, index) => index + 1);
  const minuteChoices = Array.from({ length: 12 }, (_, index) => index * 5);
  const clockValue =
    mode === "hour"
      ? selectedHour % 12 || 12
      : Math.round(selectedMinute / 5) * 5;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`flex h-[58px] min-h-[58px] min-w-0 w-full items-center justify-between gap-2 overflow-hidden rounded-xl border-[1.5px] bg-white px-3.5 text-left outline-none transition-all focus:border-orange-600 focus:ring-2 focus:ring-orange-100 ${error ? "border-red-300 bg-red-50" : "border-slate-200"}`}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span
          className={`flex min-w-0 items-center gap-2.5 overflow-hidden text-[0.9rem] ${value ? "text-slate-800" : "text-slate-400"}`}
        >
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-full ${value ? "bg-orange-50 text-orange-600" : "bg-slate-50 text-slate-400"}`}
          >
            <FaClock size={14} />
          </span>
          <span className="min-w-0 truncate">
            {value ? formatTimeValue(value) : placeholder}
          </span>
        </span>
        <FaChevronDown
          size={10}
          className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-1/2 top-[calc(100%+8px)] z-50 w-[min(340px,calc(100vw-1.5rem))] max-w-[calc(100vw-1.5rem)] -translate-x-1/2 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.16)]">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="font-heading text-sm font-bold text-slate-800">
                {label}
              </div>
              <div className="mt-0.5 text-[0.62rem] text-slate-400">
                Choose a time using the clock
              </div>
            </div>
            <div className="font-heading rounded-lg bg-orange-50 px-3 py-1.5 text-sm font-bold text-orange-600">
              {value ? formatTimeValue(value) : "--:--"}
            </div>
          </div>

          <div className="mb-3 flex items-center gap-2">
            <div className="flex flex-1 rounded-lg bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setMode("hour")}
                className={`flex-1 rounded-md py-1.5 text-xs font-bold ${mode === "hour" ? "bg-white text-orange-600 shadow-sm" : "text-slate-500"}`}
              >
                Hour
              </button>
              <button
                type="button"
                onClick={() => setMode("minute")}
                className={`flex-1 rounded-md py-1.5 text-xs font-bold ${mode === "minute" ? "bg-white text-orange-600 shadow-sm" : "text-slate-500"}`}
              >
                Minute
              </button>
            </div>
            <div className="flex rounded-lg border border-slate-200 bg-white p-1">
              {["AM", "PM"].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setPeriod(item);
                    if (value) {
                      const hour12 = Number(value.split(":")[0]) % 12 || 12;
                      const actualHour =
                        item === "PM"
                          ? hour12 === 12
                            ? 12
                            : hour12 + 12
                          : hour12 === 12
                            ? 0
                            : hour12;
                      onChange(
                        `${String(actualHour).padStart(2, "0")}:${String(selectedMinute).padStart(2, "0")}`,
                      );
                    }
                  }}
                  className={`rounded-md px-2.5 py-1.5 text-[0.65rem] font-bold ${period === item ? "bg-orange-600 text-white" : "text-slate-500"}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {mode === "hour" ? (
            <div className="relative mx-auto h-56 w-56 rounded-full border border-slate-200 bg-slate-50 shadow-inner">
              <div
                className="absolute left-1/2 top-1/2 h-1 w-20 -translate-y-1/2 origin-left rounded-full bg-orange-500"
                style={{
                  transform: `translateY(-50%) rotate(${(clockValue % 12) * 30 - 90}deg)`,
                }}
              />
              <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-600" />
              {hourPositions.map((hour) => {
                const angle = (hour * 30 - 90) * (Math.PI / 180);
                const left = 50 + Math.cos(angle) * 39;
                const top = 50 + Math.sin(angle) * 39;
                const selected = clockValue === hour;
                return (
                  <button
                    key={hour}
                    type="button"
                    onClick={() => chooseHour(hour)}
                    className={`absolute h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full text-xs font-bold ${selected ? "bg-orange-600 text-white" : "text-slate-700 hover:bg-orange-100 hover:text-orange-600"}`}
                    style={{ left: `${left}%`, top: `${top}%` }}
                  >
                    {hour}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="mb-2 text-center text-[0.68rem] font-semibold text-slate-500">
                Minutes
              </div>
              <div className="relative mx-auto h-56 w-56 rounded-full border border-slate-200 bg-white shadow-inner">
                <div
                  className="absolute left-1/2 top-1/2 h-1 w-20 -translate-y-1/2 origin-left rounded-full bg-orange-500"
                  style={{
                    transform: `translateY(-50%) rotate(${(clockValue / 5) * 30 - 90}deg)`,
                  }}
                />
                <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-600" />
                {minuteChoices.map((minute) => {
                  const angle = ((minute / 5) * 30 - 90) * (Math.PI / 180);
                  const left = 50 + Math.cos(angle) * 39;
                  const top = 50 + Math.sin(angle) * 39;
                  const selected = selectedMinute === minute;
                  return (
                    <button
                      key={minute}
                      type="button"
                      onClick={() => chooseMinute(minute)}
                      className={`absolute h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full text-xs font-bold ${selected ? "bg-orange-600 text-white" : "text-slate-700 hover:bg-orange-100 hover:text-orange-600"}`}
                      style={{ left: `${left}%`, top: `${top}%` }}
                    >
                      {String(minute).padStart(2, "0")}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={() => setMode(mode === "hour" ? "minute" : "hour")}
              className="text-[0.68rem] font-bold text-orange-600"
            >
              Switch to {mode === "hour" ? "minutes" : "hour"}
            </button>
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                onChange(
                  `${String(now.getHours()).padStart(2, "0")}:${String((Math.round(now.getMinutes() / 5) * 5) % 60).padStart(2, "0")}`,
                );
                setOpen(false);
                setMode("hour");
              }}
              className="text-[0.68rem] font-bold text-slate-500 hover:text-orange-600"
            >
              Use current time
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   LOCATION INPUT
   - Search locations
   - Current location
   - India-focused results
   - Related pickup context for drop-off
───────────────────────────────────────────── */

function LocationInput({
  label,
  value,
  onChange,
  error,
  placeholder,
  relatedTo,
  onSelect,
  currentLocationText = "We'll use your location to suggest nearby places",
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [message, setMessage] = useState("");

  const rootRef = useRef(null);
  const timerRef = useRef(null);

  /* Close dropdown when clicking outside */
  useEffect(() => {
    const handleOutside = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutside);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
    };
  }, []);

  /* Search locations while typing */
  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const searchValue = value.trim();

    if (!searchValue || searchValue.length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    timerRef.current = setTimeout(async () => {
      setLoading(true);
      setMessage("");

      try {
        /*
          Search the typed location independently first.
          Drop-off suggestions must work even when the pickup is
          empty or when adding the pickup as context would make
          the geocoder return no results. If the primary search
          is empty, we retry once with pickup context.
        */
        const searchLocations = async (query) => {
          const params = new URLSearchParams({
            q: query,
            format: "jsonv2",
            addressdetails: "1",
            limit: "8",
            countrycodes: "in",
          });

          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?${params.toString()}`,
            {
              headers: {
                Accept: "application/json",
              },
            },
          );

          if (!response.ok) {
            throw new Error("Location search failed");
          }

          const data = await response.json();
          return Array.isArray(data) ? data : [];
        };

        let data = await searchLocations(searchValue);

        if (!data.length && relatedTo?.trim()) {
          data = await searchLocations(`${searchValue}, ${relatedTo.trim()}`);
        }

        setSuggestions(data);

        if (!data.length) {
          setMessage(
            "No matching locations found. Try a city, area, airport, hotel or landmark.",
          );
        }
      } catch (error) {
        console.error("Location search error:", error);

        setSuggestions([]);

        setMessage(
          "Couldn't load suggestions. You can still enter the location manually.",
        );
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [value, relatedTo]);

  /* Select a location from search results */
  const choose = (place) => {
    const address = place.address || {};

    const city =
      address.city ||
      address.town ||
      address.municipality ||
      address.village ||
      "";

    const area =
      address.suburb || address.neighbourhood || address.residential || "";

    const state = address.state || "";

    const mainName = place.name && place.name !== city ? place.name : "";

    const shortAddress = [mainName || area, city, state]
      .filter(Boolean)
      .join(", ");

    onSelect(shortAddress || place.display_name);

    setOpen(false);
    setSuggestions([]);
  };

  /* Use browser GPS */
  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setMessage(
        "Location access isn't supported by this browser. Please search manually.",
      );
      return;
    }

    setLocating(true);
    setMessage("");

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const params = new URLSearchParams({
            lat: String(coords.latitude),
            lon: String(coords.longitude),
            format: "jsonv2",
            addressdetails: "1",
          });

          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?${params.toString()}`,
            {
              headers: {
                Accept: "application/json",
              },
            },
          );

          if (!response.ok) {
            throw new Error("Reverse geocoding failed");
          }

          const data = await response.json();

          const address = data.address || {};

          const city =
            address.city ||
            address.town ||
            address.municipality ||
            address.village ||
            "";

          const area =
            address.suburb ||
            address.neighbourhood ||
            address.residential ||
            address.road ||
            "";

          const state = address.state || "";

          const locationName =
            [area, city, state].filter(Boolean).join(", ") ||
            data.display_name ||
            "Current location";

          onSelect(locationName);

          setOpen(false);
          setSuggestions([]);
        } catch (error) {
          console.error("Current location error:", error);

          setMessage(
            "We found your location, but couldn't convert it to an address. Please search manually.",
          );
        } finally {
          setLocating(false);
        }
      },
      (error) => {
        console.error("Geolocation permission/error:", error);

        setLocating(false);

        if (error?.code === 1) {
          setMessage(
            "Location permission was denied. Please allow location access or search manually.",
          );
        } else {
          setMessage(
            "We couldn't access your location. Please search for it manually.",
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      },
    );
  };

  return (
    <div ref={rootRef} className="relative">
      {/* INPUT */}
      <div className="relative">
        <FaMapMarkerAlt
          size={13}
          className="absolute top-1/2 left-3 -translate-y-1/2 text-orange-600"
        />

        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onFocus={() => {
            setOpen(true);
            setMessage("");
          }}
          onChange={(event) => {
            onChange(event.target.value);
            setOpen(true);
          }}
          className={`${inputClass(error)} pl-9 pr-10`}
          autoComplete="off"
        />

        {value && (
          <button
            type="button"
            aria-label={`Clear ${label}`}
            onClick={() => {
              onChange("");
              setSuggestions([]);
              setOpen(true);
            }}
            className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full px-2 py-1 text-lg leading-none text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            ×
          </button>
        )}
      </div>

      {/* LOCATION DROPDOWN */}
      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.14)]">
          {/* CURRENT LOCATION */}
          <button
            type="button"
            onClick={useCurrentLocation}
            disabled={locating}
            className="flex min-h-[58px] w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left transition-colors hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-600">
              <FaLocationArrow size={13} />
            </span>

            <span className="min-w-0">
              <span className="block text-[0.8rem] font-bold text-slate-800">
                {locating
                  ? "Finding your location…"
                  : "Use my current location"}
              </span>

              <span className="block text-[0.68rem] text-slate-500">
                {currentLocationText}
              </span>
            </span>
          </button>

          {/* SEARCH RESULTS */}
          {(loading || suggestions.length > 0 || message) && (
            <div className="max-h-64 overflow-y-auto p-1.5">
              {loading && (
                <div className="px-3 py-3 text-[0.75rem] text-slate-500">
                  Searching locations…
                </div>
              )}

              {suggestions.map((place) => (
                <button
                  type="button"
                  key={place.place_id}
                  onClick={() => choose(place)}
                  className="flex min-h-[50px] w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-slate-50"
                >
                  <FaMapMarkerAlt
                    size={12}
                    className="mt-1 shrink-0 text-slate-400"
                  />

                  <span className="min-w-0">
                    <span className="block truncate text-[0.78rem] font-semibold text-slate-800">
                      {place.name ||
                        place.display_name?.split(",")[0] ||
                        "Location"}
                    </span>

                    <span className="block truncate text-[0.68rem] text-slate-500">
                      {place.display_name}
                    </span>
                  </span>
                </button>
              ))}

              {message && !loading && (
                <div className="px-3 py-3 text-[0.7rem] leading-5 text-slate-500">
                  {message}
                </div>
              )}
            </div>
          )}

          {/* HELPER WHEN NOTHING HAS BEEN TYPED */}
          {!value.trim() && !loading && !suggestions.length && !message && (
            <div className="px-4 py-3 text-[0.68rem] text-slate-500">
              Start typing a city, area, airport, hotel or landmark.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   BOOKING PAGE
───────────────────────────────────────────── */

export default function Booking() {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fleet, setFleet] = useState(null);
  const [fleetError, setFleetError] = useState("");

  /* Fetch the active fleet from MongoDB.
     The booking page keeps its existing UI structure, but all
     vehicle names, specs and rates now come from /api/fleet. */
  useEffect(() => {
    let cancelled = false;

    async function loadFleet() {
      try {
        setFleetError("");

        const response = await fetch("/api/fleet", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Could not load fleet");
        }

        if (!cancelled) {
          setFleet(Array.isArray(data.fleet) ? data.fleet : []);
        }
      } catch (error) {
        console.error("Fleet loading error:", error);

        if (!cancelled) {
          setFleet([]);
          setFleetError(
            "We couldn't load the available vehicles. Please refresh and try again.",
          );
        }
      }
    }

    loadFleet();

    return () => {
      cancelled = true;
    };
  }, []);

  const set = (key) => (event) => {
    setForm((previous) => ({
      ...previous,
      [key]: event.target.value,
    }));

    setErrors((previous) => ({
      ...previous,
      [key]: "",
    }));
  };

  const needsDropoff =
    form.tripType === "outstation" || form.tripType === "local" || form.tripType === "airport";
  const needsDuration = form.tripType === "local";
  const needsKms = form.tripType === "outstation";

  /* ─────────────────────────────────────────────
     VALIDATION
  ───────────────────────────────────────────── */

  const validate = () => {
    const e = {};

    if (!form.name.trim()) {
      e.name = "Your name is required";
    }

    if (!form.phone.trim() || !/^[6-9]\d{9}$/.test(form.phone.trim())) {
      e.phone = "Enter a valid 10-digit mobile number";
    }

    if (form.email.trim() && !/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      e.email = "Enter a valid email address";
    }
    if (!form.kyc) {
      e.kyc = "Aadhaar card photo is required for KYC";
    }
    if (!form.pickup.trim()) {
      e.pickup = "Required";
    }

    if (needsDropoff && !form.dropoff.trim()) {
      e.dropoff = "Required";
    }

    if (form.tripType === "outstation" && !form.outstationMode) {
      e.outstationMode = "Select one-way or round trip";
    }

    if (!form.pickupDate) {
      e.pickupDate = "Required";
    }

    if (!form.pickupTime) {
      e.pickupTime = "Required";
    }

    if (form.tripType === "outstation" && !form.dropoffDate) {
      e.dropoffDate = "Required";
    }

    if (form.tripType === "outstation" && !form.dropoffTime) {
      e.dropoffTime = "Required";
    }

    if (form.tripType === "airport") {
      const km = Number(form.airportDistanceKm);
      if (!form.airportDistanceKm || Number.isNaN(km) || km <= 0) e.airportDistanceKm = "Enter the approximate distance from KIA";
      else if (km > 80) e.airportDistanceKm = "Airport rate card covers up to 80 km. Please contact us for longer distances.";
    }

    if (!form.cabType) {
      e.cabType = "Please select a cab type";
    }

    if (needsDuration && !form.duration) {
      e.duration = "Select a package";
    }

    /*
      IMPORTANT:
      KM IS STILL MANUAL.
      We are NOT automatically calculating or overwriting it.
    */
    if (needsKms && (!form.kms || isNaN(+form.kms) || +form.kms < 1)) {
      e.kms = "Enter approximate distance in km";
    }

    return e;
  };

  /* ─────────────────────────────────────────────
     SUBMIT
  ───────────────────────────────────────────── */

  const [submitError, setSubmitError] = useState("");
  const [bookingCode, setBookingCode] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    const errs = validate();

    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    setSubmitError("");

    try {
      const cab = fleet?.find((c) => String(c._id) === String(form.cabType));
      const bookingPayload = {
        name: form.name,
        phone: form.phone,
        email: form.email,
        tripType: form.tripType,
        outstationMode: form.outstationMode,
        roundTripDropMode: form.roundTripDropMode,
        pickupLocation: form.pickup,
        dropLocation: form.dropoff,
        pickupDate: form.pickupDate,
        pickupTime: form.pickupTime,
        returnDate: form.dropoffDate || undefined,
        dropoffTime: form.dropoffTime || undefined,
        airportDistanceKm: form.airportDistanceKm ? Number(form.airportDistanceKm) : undefined,
        fleet: form.cabType || undefined,
        fleetName: cab?.name || "",
        passengers: 1,
        notes: form.tripType === "airport" && form.airportDistanceKm
          ? `Airport distance: ${form.airportDistanceKm} km`
          : form.kms
            ? `Estimated distance: ${form.kms} km`
            : undefined,
        fareBreakdown,
        estimatedFare: fareBreakdown?.total || 0,
      };
      const multipart = new FormData();
      multipart.append("booking", JSON.stringify(bookingPayload));
      multipart.append("kyc", form.kyc);
      const res = await fetch("/api/bookings", {
        method: "POST",
        body: multipart,
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(
          data.error || "Something went wrong. Please try again.",
        );

      setBookingCode(data.booking?.bookingCode || "");
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ─────────────────────────────────────────────
     FARE CALCULATION
  ───────────────────────────────────────────── */

  const selectedCab = fleet?.find(
    (cab) => String(cab._id) === String(form.cabType),
  );

  const dateDifference = (start, end) => {
    if (!start || !end) return 0;
    const startDate = new Date(`${start}T00:00:00`);
    const endDate = new Date(`${end}T00:00:00`);
    return Math.max(0, Math.round((endDate - startDate) / 86400000));
  };

  let fareBreakdown = null;

  if (selectedCab) {
    if (
      form.tripType === "outstation" &&
      form.kms &&
      +form.kms > 0 &&
      form.pickupDate &&
      form.dropoffDate
    ) {
      const dateSpan = dateDifference(form.pickupDate, form.dropoffDate);
      const days = Math.max(1, dateSpan + 1);
      const nights = dateSpan;
      const requestedKm = +form.kms;
      const minKm = Number(selectedCab.rates?.minKm || 300);
      const minimumBilledKm = minKm * days;
      const billedKm = Math.max(requestedKm, minimumBilledKm);
      const perKm = Number(selectedCab.rates?.outstation || 0);
      const extraKm = Math.max(0, requestedKm - minimumBilledKm);
      const baseFare = minimumBilledKm * perKm;
      const extraKmAmount = extraKm * perKm;
      const driverBata = days * Number(selectedCab.rates?.driverBata || 0);
      const nightBata = nights * Number(selectedCab.rates?.nightBata || 0);
      const subtotal = baseFare + extraKmAmount + driverBata + nightBata;
      const gst = subtotal * 0.05;
      fareBreakdown = {
        baseFare,
        billedKm,
        requestedKm,
        minKm,
        minimumBilledKm,
        extraKms: extraKm,
        extraKmRate: perKm,
        extraKmAmount,
        days,
        nights,
        driverBata,
        nightBata,
        subtotal,
        gst,
        total: subtotal + gst,
        type: "outstation",
        mode: form.outstationMode,
      };
    } else if (form.tripType === "local" && form.duration) {
      const duration = DURATIONS.find((item) => item.key === form.duration);
      const baseFare = Number(selectedCab.rates?.[duration?.priceKey] || 0);
      const includedKm = Number(selectedCab.rates?.[duration?.kmKey] || 0);
      const subtotal = baseFare;
      const gst = subtotal * 0.05;
      fareBreakdown = {
        baseFare,
        includedKm,
        extraKmRate: Number(selectedCab.rates?.extraKm || 0),
        extraHourRate: Number(selectedCab.rates?.extraHour || 0),
        subtotal,
        gst,
        total: subtotal + gst,
        type: "local",
        durationLabel: duration?.label || "Local city ride",
      };
    } else if (form.tripType === "airport" && form.airportDistanceKm) {
      const distance = Number(form.airportDistanceKm);
      const band = distance <= 40 ? "0-40 km" : distance <= 60 ? "40-60 km" : distance <= 80 ? "60-80 km" : null;
      const rateKey = distance <= 40 ? "airport40" : distance <= 60 ? "airport60" : "airport80";
      const baseFare = band ? Number(selectedCab.rates?.[rateKey] || 0) : 0;
      const airportNightBata = form.pickupTime && form.pickupTime >= "22:00"
        ? Number(selectedCab.rates?.nightBata || 0)
        : 0;
      const subtotal = baseFare + airportNightBata;
      const gst = subtotal * 0.05;
      fareBreakdown = {
        baseFare,
        airportDistanceKm: distance,
        airportBand: band,
        rateKey,
        airportNightBata,
        subtotal,
        gst,
        total: subtotal + gst,
        type: "airport",
      };
    }
  }

  const estimate = fareBreakdown?.total ?? null;

  /* ─────────────────────────────────────────────
     SUCCESS SCREEN
  ───────────────────────────────────────────── */

  if (success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-8 text-center font-sans">
        <div className="w-full max-w-[480px] rounded-2xl border border-slate-200 bg-white p-10 shadow-[0_20px_60px_rgba(0,0,0,0.1)]">
          <div className="mx-auto mb-6 flex h-[72px] w-[72px] items-center justify-center rounded-full border-2 border-orange-600 bg-orange-50">
            <FaCheckCircle size={32} color="#ea580c" />
          </div>

          <span className="mb-3.5 inline-block rounded-full bg-green-100 px-3 py-[0.28rem] text-[0.68rem] font-bold tracking-[0.1em] text-green-600 uppercase">
            Booking Request Received
          </span>

          <h2 className="font-heading mb-3 text-[1.6rem] font-bold text-slate-800">
            Thank You, {form.name.split(" ")[0]}!
          </h2>

          {bookingCode && (
            <p className="mb-3 text-[0.8rem] font-semibold tracking-[0.04em] text-orange-600">
              Booking ID: {bookingCode}
            </p>
          )}

          <p className="mb-3 text-[0.875rem] leading-[1.75] text-slate-500">
            We have received your cab booking request. Our team will call you on{" "}
            <strong className="text-slate-800">+91 {form.phone}</strong> within{" "}
            <strong className="text-slate-800">3 hours</strong> to confirm.
          </p>

          <p className="mb-8 text-[0.82rem] text-slate-500">
            You can also reach us on{" "}
            <a
              href="https://wa.me/918123552002"
              className="font-semibold text-green-600 no-underline"
            >
              WhatsApp +91 81235 52002
            </a>
          </p>

          {/* BOOKING SUMMARY */}
          <div className="mb-7 rounded-[10px] border border-slate-200 bg-slate-50 p-[1.125rem] text-left">
            <div className="font-heading mb-3 text-[0.72rem] font-semibold tracking-[0.08em] text-slate-800 uppercase">
              Your Booking Summary
            </div>

            {[
              [
                "Trip Type",
                TRIP_TYPES.find((trip) => trip.id === form.tripType)?.label ||
                  "",
              ],
              ["Pickup", form.pickup],
              form.tripType === "outstation"
                ? [
                    "Outstation",
                    form.outstationMode === "roundTrip"
                      ? "Round trip"
                      : "One way",
                  ]
                : null,
              form.dropoff ? ["Drop-off", form.dropoff] : null,
              ["Pickup", `${form.pickupDate} at ${form.pickupTime}`],
              form.dropoffDate
                ? ["Drop-off", `${form.dropoffDate} at ${form.dropoffTime}`]
                : null,
              ["Cab", selectedCab?.name || ""],
              form.tripType === "airport" && form.airportDistanceKm
                ? ["Airport distance", `${form.airportDistanceKm} km`]
                : form.kms ? ["Distance", `${form.kms} km`] : null,
              estimate
                ? [
                    "Est. Fare",
                    `₹${estimate.toLocaleString("en-IN", { maximumFractionDigits: 0 })}/-`,
                  ]
                : null,
            ]
              .filter(Boolean)
              .map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between border-b border-slate-200 py-1.5 text-[0.8rem]"
                >
                  <span className="text-slate-500">{label}</span>

                  <span className="max-w-[60%] text-right font-medium text-slate-800">
                    {value}
                  </span>
                </div>
              ))}
          </div>

          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <button
              onClick={() => {
                setSuccess(false);
                setForm(EMPTY);
              }}
              className="font-heading rounded-lg bg-orange-600 px-6 py-[0.7rem] text-sm font-bold text-white"
            >
              Book Another
            </button>

            <Link
              href="/"
              className="font-heading flex items-center gap-1.5 rounded-lg border-[1.5px] border-slate-200 px-6 py-[0.7rem] text-sm font-semibold text-slate-800 no-underline"
            >
              <FaArrowLeft size={12} />
              Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────
     MAIN FORM
  ───────────────────────────────────────────── */

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <PublicHeader />

      <div className="mx-auto w-full max-w-[860px] px-4 pt-[clamp(1.5rem,5vw,3.5rem)] pb-[clamp(2.5rem,6vw,5rem)] sm:px-6">
        {/* PAGE HEADING */}
        <div className="mb-6 text-center sm:mb-8">
          <span className="mb-3 inline-block rounded bg-orange-50 px-3.5 py-[0.35rem] text-[0.72rem] font-bold tracking-[0.12em] text-orange-600 uppercase">
            Online Booking
          </span>

          <h1 className="font-heading text-[clamp(1.75rem,4vw,2.5rem)] font-bold text-slate-800">
            Book Your Cab
          </h1>

          <p className="mt-2 text-[0.875rem] text-slate-500">
            Fill in the details below. We will confirm via call or WhatsApp.
          </p>
          <Link
            href="/#bus-enquiry"
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 no-underline"
          >
            Need a 25/40+ seater? Send a group-bus enquiry{" "}
            <FaArrowRight size={10} />
          </Link>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-[1.125rem]"
        >
          {/* ─────────────────────────────────────
              STEP 1 — TRIP TYPE
          ───────────────────────────────────── */}

          <div className="w-full min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_6px_rgba(0,0,0,0.04)] sm:p-[1.375rem]">
            <h3 className="font-heading mb-4 flex items-center justify-center gap-2 text-center text-[0.875rem] font-semibold text-slate-800">
              <StepBadge n={1} />
              Select Trip Type
            </h3>

            <div className="mx-auto grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
              {TRIP_TYPES.map((trip) => (
                <button
                  key={trip.id}
                  type="button"
                  onClick={() =>
                    setForm((previous) => ({
                      ...previous,
                      tripType: trip.id,
                      outstationMode: previous.outstationMode || "oneWay",
                      roundTripDropMode: "pickup",
                      dropoff: "",
                      dropoffDate: "",
                      dropoffTime: "",
                      kms: "",
                      airportDistanceKm: "",
                      duration: "",
                    }))
                  }
                  className={`rounded-[10px] border-[1.5px] px-2 py-3.5 text-center transition-all ${
                    form.tripType === trip.id
                      ? "border-orange-600 bg-orange-50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <span
                    className={`mb-1.5 flex justify-center ${
                      form.tripType === trip.id
                        ? "text-orange-600"
                        : "text-slate-500"
                    }`}
                  >
                    <trip.Icon size={22} />
                  </span>

                  <div
                    className={`font-heading mb-0.5 text-xs font-semibold ${
                      form.tripType === trip.id
                        ? "text-orange-600"
                        : "text-slate-800"
                    }`}
                  >
                    {trip.label}
                  </div>

                  <div className="text-[0.6rem] text-slate-500">
                    {trip.desc}
                  </div>
                </button>
              ))}
            </div>

            {form.tripType === "outstation" && (
              <div className="mt-4 rounded-xl border border-orange-100 bg-orange-50/50 p-3.5">
                <div className="mb-2 text-[0.78rem] font-semibold text-slate-800">
                  Outstation trip type *
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {[
                    [
                      "oneWay",
                      "One Way",
                      "Pickup here → drop at your preferred outstation location",
                    ],
                    [
                      "roundTrip",
                      "Round Trip",
                      "Pickup here → return to pickup or a preferred location",
                    ],
                  ].map(([key, label, desc]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() =>
                        setForm((previous) => ({
                          ...previous,
                          outstationMode: key,
                          ...(key === "roundTrip" &&
                          previous.pickup &&
                          previous.roundTripDropMode === "pickup"
                            ? { dropoff: previous.pickup }
                            : {}),
                        }))
                      }
                      className={`rounded-xl border-[1.5px] p-3 text-left transition ${form.outstationMode === key ? "border-orange-600 bg-white shadow-sm" : "border-slate-200 bg-white"}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span
                          className={`font-heading text-sm font-bold ${form.outstationMode === key ? "text-orange-600" : "text-slate-800"}`}
                        >
                          {label}
                        </span>
                        <span
                          className={`h-4 w-4 rounded-full border-2 ${form.outstationMode === key ? "border-orange-600 bg-orange-600 ring-2 ring-orange-100" : "border-slate-300"}`}
                        />
                      </div>
                      <div className="mt-1 text-[0.68rem] leading-5 text-slate-500">
                        {desc}
                      </div>
                    </button>
                  ))}
                </div>

                {form.outstationMode === "roundTrip" && (
                  <div className="mt-3 border-t border-orange-100 pt-3">
                    <div className="mb-2 text-[0.72rem] font-semibold text-slate-700">
                      Return drop-off preference
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[
                        ["pickup", "Return to pickup"],
                        ["preferred", "Preferred location"],
                      ].map(([key, label]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() =>
                            setForm((previous) => ({
                              ...previous,
                              roundTripDropMode: key,
                              dropoff: key === "pickup" ? previous.pickup : "",
                            }))
                          }
                          className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${form.roundTripDropMode === key ? "border-orange-600 bg-orange-600 text-white" : "border-slate-200 bg-white text-slate-600"}`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {errors.outstationMode && (
                  <p className="mt-1.5 text-[0.72rem] text-red-600">
                    {errors.outstationMode}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* ─────────────────────────────────────
              STEP 2 — PASSENGER DETAILS
          ───────────────────────────────────── */}

          <div className="w-full min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_6px_rgba(0,0,0,0.04)] sm:p-[1.375rem]">
            <h3 className="font-heading mb-4 flex items-center gap-2 text-[0.875rem] font-semibold text-slate-800">
              <StepBadge n={2} />
              Your Details
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Full Name *" error={errors.name}>
                <input
                  type="text"
                  placeholder="e.g. Suresh Kumar"
                  value={form.name}
                  onChange={set("name")}
                  className={inputClass(errors.name)}
                />
              </Field>

              <Field label="Email Address (optional)" error={errors.email}>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={set("email")}
                  className={inputClass(errors.email)}
                />
              </Field>

              <Field label="Mobile Number *" error={errors.phone}>
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={form.phone}
                  onChange={set("phone")}
                  maxLength={10}
                  className={inputClass(errors.phone)}
                />
              </Field>
            </div>
          </div>

          <div className="w-full min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_6px_rgba(0,0,0,0.04)] sm:p-[1.375rem]">
            <h3 className="font-heading mb-4 flex items-center gap-2 text-[0.875rem] font-semibold text-slate-800">
              <StepBadge n={3} /> KYC Verification
            </h3>
            <Field label="Aadhaar Card Photo *" error={errors.kyc}>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setForm((p) => ({ ...p, kyc: file }));
                  setErrors((p) => ({ ...p, kyc: "" }));
                }}
                className="block w-full rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3.5 py-3 text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-orange-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-orange-600"
              />
            </Field>
            <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50 px-3.5 py-3 text-[0.72rem] leading-5 text-blue-800">
              Your Aadhaar photo is collected only for booking KYC. It is stored
              privately and scheduled for deletion within 30 days after the end
              of your trip. Max 5MB · JPG, PNG or WEBP.
            </div>
          </div>

          {/* ─────────────────────────────────────
              STEP 4 — ROUTE & DATE
          ───────────────────────────────────── */}

          <div className="w-full min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_6px_rgba(0,0,0,0.04)] sm:p-[1.375rem]">
            <h3 className="font-heading mb-4 flex items-center gap-2 text-[0.875rem] font-semibold text-slate-800">
              <StepBadge n={4} />
              Route &amp; Date
            </h3>

            <div
              className={`mb-4 grid grid-cols-1 gap-4 ${
                needsDropoff ? "sm:grid-cols-2" : ""
              }`}
            >
              {/* PICKUP */}
              <Field
                label="Pickup Location *"
                error={errors.pickup}
              >
                <LocationInput
                    label="Pickup Location"
                    value={form.pickup}
                    onChange={(value) => {
                      setForm((previous) => ({
                        ...previous,
                        pickup: value,
                        ...(previous.tripType === "outstation" &&
                        previous.outstationMode === "roundTrip" &&
                        previous.roundTripDropMode === "pickup"
                          ? { dropoff: value }
                          : {}),
                      }));

                      setErrors((previous) => ({
                        ...previous,
                        pickup: "",
                      }));
                    }}
                    error={errors.pickup}
                    placeholder="Search pickup location..."
                    currentLocationText="Use your GPS location for a quick pickup"
                    onSelect={(value) => {
                      setForm((previous) => ({
                        ...previous,
                        pickup: value,
                        ...(previous.tripType === "outstation" &&
                        previous.outstationMode === "roundTrip" &&
                        previous.roundTripDropMode === "pickup"
                          ? { dropoff: value }
                          : {}),
                      }));

                      setErrors((previous) => ({
                        ...previous,
                        pickup: "",
                      }));
                    }}
                  />
              </Field>

              {/* DROP-OFF */}
              {needsDropoff && (
                <Field
                  label={
                    form.tripType === "airport"
                      ? "Drop-off Location / Airport Terminal *"
                      : form.tripType === "local"
                        ? "Drop-off Location *"
                        : form.outstationMode === "roundTrip"
                          ? "Return Drop-off Location *"
                          : "Drop-off Location *"
                  }
                  error={errors.dropoff}
                >
                  <LocationInput
                    label="Drop-off Location"
                    value={form.dropoff}
                    onChange={(value) => {
                      if (
                        form.tripType === "outstation" &&
                        form.outstationMode === "roundTrip" &&
                        form.roundTripDropMode === "pickup"
                      )
                        return;
                      setForm((previous) => ({ ...previous, dropoff: value }));
                      setErrors((previous) => ({ ...previous, dropoff: "" }));
                    }}
                    error={errors.dropoff}
                    placeholder={
                      form.tripType === "outstation" &&
                      form.outstationMode === "roundTrip" &&
                      form.roundTripDropMode === "pickup"
                        ? "Same as pickup location"
                        : form.pickup
                          ? "Search drop-off location..."
                          : "Select pickup first..."
                    }
                    relatedTo={form.pickup}
                    currentLocationText={
                      form.pickup
                        ? `Suggestions will consider ${form.pickup}`
                        : "Use your current location"
                    }
                    onSelect={(value) => {
                      if (
                        form.tripType === "outstation" &&
                        form.outstationMode === "roundTrip" &&
                        form.roundTripDropMode === "pickup"
                      )
                        return;
                      setForm((previous) => ({ ...previous, dropoff: value }));
                      setErrors((previous) => ({ ...previous, dropoff: "" }));
                    }}
                  />
                </Field>
              )}
            </div>

            {/* LOCATION HELPER */}
            {form.tripType !== "airport" && (
              <div className="mb-4 flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2.5 text-[0.68rem] leading-5 text-slate-500 break-words">
                <FaMapMarkerAlt
                  size={11}
                  className="mt-1 shrink-0 text-orange-600"
                />

                <span>
                  Search for an area, city, airport, hotel or landmark. You can
                  also use{" "}
                  <strong className="text-slate-700">
                    Use my current location
                  </strong>{" "}
                  for pickup.
                </span>
              </div>
            )}

            {/* DATES — FIXED, ALIGNED SCHEDULE CONTAINERS */}
            <div className="grid w-full min-w-0 grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2">
              {/* PICKUP SCHEDULE */}
              <div className="flex min-w-0 w-full flex-col rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                <div className="mb-4 text-[0.72rem] font-bold uppercase tracking-[0.08em] text-slate-500 sm:mb-5 sm:text-[0.78rem]">
                  Pickup schedule
                </div>
                <div className="grid w-full min-w-0 grid-cols-1 gap-4 items-start sm:grid-cols-2">
                  <div className="min-w-0">
                    <Field label="Pickup Date *" error={errors.pickupDate}>
                      <DatePicker
                        value={form.pickupDate}
                        onChange={(value) => {
                          setForm((previous) => ({
                            ...previous,
                            pickupDate: value,
                            ...(previous.dropoffDate &&
                            previous.dropoffDate < value
                              ? { dropoffDate: "", dropoffTime: "" }
                              : {}),
                          }));
                          setErrors((previous) => ({
                            ...previous,
                            pickupDate: "",
                            dropoffDate: "",
                            dropoffTime: "",
                          }));
                        }}
                        min={toDateValue(new Date())}
                        error={errors.pickupDate}
                      />
                    </Field>
                  </div>
                  <div className="min-w-0">
                    <Field label="Pickup Time *" error={errors.pickupTime}>
                      <TimePicker
                        label="Pickup Time"
                        value={form.pickupTime}
                        onChange={(value) => {
                          setForm((previous) => ({
                            ...previous,
                            pickupTime: value,
                          }));
                          setErrors((previous) => ({
                            ...previous,
                            pickupTime: "",
                          }));
                        }}
                        error={errors.pickupTime}
                      />
                    </Field>
                  </div>
                </div>
              </div>

              {/* DROP-OFF SCHEDULE */}
              {form.tripType === "outstation" && (
                <div className="flex min-w-0 w-full flex-col rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                  <div className="mb-4 text-[0.72rem] font-bold uppercase tracking-[0.08em] text-slate-500 sm:mb-5 sm:text-[0.78rem]">
                    Drop-off schedule
                  </div>
                  <div className="grid w-full min-w-0 grid-cols-1 gap-4 items-start sm:grid-cols-2">
                    <div className="min-w-0">
                      <Field label="Drop-off Date *" error={errors.dropoffDate}>
                        <DatePicker
                          value={form.dropoffDate}
                          onChange={(value) => {
                            setForm((previous) => ({
                              ...previous,
                              dropoffDate: value,
                            }));
                            setErrors((previous) => ({
                              ...previous,
                              dropoffDate: "",
                            }));
                          }}
                          min={form.pickupDate || toDateValue(new Date())}
                          error={errors.dropoffDate}
                          placeholder="Select drop-off date"
                        />
                      </Field>
                    </div>
                    <div className="min-w-0">
                      <Field label="Drop-off Time *" error={errors.dropoffTime}>
                        <TimePicker
                          label="Drop-off Time"
                          value={form.dropoffTime}
                          onChange={(value) => {
                            setForm((previous) => ({
                              ...previous,
                              dropoffTime: value,
                            }));
                            setErrors((previous) => ({
                              ...previous,
                              dropoffTime: "",
                            }));
                          }}
                          error={errors.dropoffTime}
                          placeholder="Select drop-off time"
                        />
                      </Field>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {form.tripType === "airport" && (
            <div className="w-full rounded-xl border border-orange-100 bg-orange-50/50 p-4">
              <Field label="Approx. distance from Kempegowda International Airport (KIA) *" error={errors.airportDistanceKm}>
                <div className="flex items-center gap-2">
                  <input type="number" min="1" max="80" inputMode="numeric" placeholder="e.g. 35" value={form.airportDistanceKm} onChange={set("airportDistanceKm")} className={inputClass(errors.airportDistanceKm)} />
                  <span className="shrink-0 text-sm font-semibold text-slate-500">km</span>
                </div>
                <p className="mt-1.5 text-[0.7rem] leading-5 text-slate-500">Up to 40 km = first rate · 40–60 km = second band · 60–80 km = third band. Above 80 km is quoted manually.</p>
              </Field>
            </div>
          )}

          {/* ─────────────────────────────────────
              STEP 4 — CAB & PACKAGE
          ───────────────────────────────────── */}

          <div className="w-full min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_6px_rgba(0,0,0,0.04)] sm:p-[1.375rem]">
            <h3 className="font-heading mb-4 flex items-center gap-2 text-[0.875rem] font-semibold text-slate-800">
              <StepBadge n={5} />
              Select Cab &amp; Package
            </h3>

            {/* CAB TYPE */}
            <div className="mb-5">
              <div className="font-heading mb-2.5 text-[0.78rem] font-semibold text-slate-800">
                Cab Type *
              </div>

              {fleet === null ? (
                <div className="col-span-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                  Loading available vehicles…
                </div>
              ) : fleet.length === 0 ? (
                <div className="col-span-full rounded-lg border border-red-200 bg-red-50 px-4 py-8 text-center text-sm text-red-600">
                  {fleetError ||
                    "No vehicles are currently available for booking."}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2.5 xs:grid-cols-2 md:grid-cols-3">
                  {fleet.map((cab) => {
                    const selected = String(form.cabType) === String(cab._id);

                    const localDuration = DURATIONS.find(
                      (item) => item.key === form.duration,
                    );
                    const displayRate =
                      form.tripType === "local"
                        ? `₹${(cab.rates?.[localDuration?.priceKey] || 0).toLocaleString("en-IN")}/-`
                        : form.tripType === "airport"
                          ? `₹${(fareBreakdown?.baseFare || cab.rates?.airport40 || 0).toLocaleString("en-IN")}/-`
                          : `₹${cab.rates?.outstation || 0}/km`;

                    return (
                      <button
                        key={cab._id}
                        type="button"
                        onClick={() => {
                          setForm((previous) => ({
                            ...previous,
                            cabType: cab._id,
                          }));

                          setErrors((previous) => ({
                            ...previous,
                            cabType: "",
                          }));
                        }}
                        className={`rounded-[10px] border-[1.5px] p-3 text-left transition-all ${
                          selected
                            ? "border-orange-600 bg-orange-50"
                            : "border-slate-200 bg-white"
                        }`}
                      >
                        <div className="mb-1 flex items-start justify-between">
                          <span
                            className={`font-heading text-[0.78rem] font-bold ${
                              selected ? "text-orange-600" : "text-slate-800"
                            }`}
                          >
                            {cab.name}
                          </span>
                        </div>

                        <div className="mb-1.5 flex items-center gap-1 text-[0.68rem] text-slate-500">
                          <FaUsers size={10} />
                          {cab.seats} seats &nbsp;·&nbsp;
                          {cab.category}
                        </div>

                        <div
                          className={`font-heading text-[0.875rem] font-bold ${
                            selected ? "text-orange-600" : "text-slate-800"
                          }`}
                        >
                          {displayRate}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {errors.cabType && (
                <p className="mt-1.5 text-[0.72rem] text-red-600">
                  {errors.cabType}
                </p>
              )}
            </div>

            {/* LOCAL PACKAGE */}
            {needsDuration && (
              <div className="mb-5">
                <div className="font-heading mb-2.5 text-[0.78rem] font-semibold text-slate-800">
                  Local Package *
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {DURATIONS.map((duration) => (
                    <button
                      key={duration.key}
                      type="button"
                      onClick={() => {
                        setForm((previous) => ({
                          ...previous,
                          duration: duration.key,
                        }));

                        setErrors((previous) => ({
                          ...previous,
                          duration: "",
                        }));
                      }}
                      className={`font-heading rounded-full border-[1.5px] px-[1.1rem] py-[0.55rem] text-[0.8rem] font-semibold transition-all ${
                        form.duration === duration.key
                          ? "border-orange-600 bg-orange-50 text-orange-600"
                          : "border-slate-200 bg-white text-slate-500"
                      }`}
                    >
                      {duration.label}
                    </button>
                  ))}
                </div>

                {errors.duration && (
                  <p className="mt-1.5 text-[0.72rem] text-red-600">
                    {errors.duration}
                  </p>
                )}
              </div>
            )}

            {/* OUTSTATION DISTANCE */}
            {needsKms && (
              <Field
                label="Estimated Total Distance in KM *"
                error={errors.kms}
              >
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 500"
                    value={form.kms}
                    onChange={set("kms")}
                    className={`${inputClass(errors.kms)} w-full sm:max-w-[220px]`}
                  />
                  <span className="text-[0.68rem] text-slate-500">
                    Enter the approximate total trip distance. Outstation
                    billing uses the higher of actual distance or the minimum
                    km/day × trip days.
                  </span>
                </div>
              </Field>
            )}
          </div>

          {/* ─────────────────────────────────────
              ESTIMATE
          ───────────────────────────────────── */}

          {fareBreakdown && (
            <div className="w-full rounded-xl bg-orange-600 px-4 py-5 text-white sm:px-6">
              <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_430px]">
                <div className="min-w-0">
                  <div className="mb-1 text-[0.68rem] font-bold tracking-[0.1em] text-white/65 uppercase">
                    Estimated Total
                  </div>
                  <div className="font-heading text-[2.25rem] leading-none font-extrabold">
                    ₹
                    {estimate.toLocaleString("en-IN", {
                      maximumFractionDigits: 0,
                    })}
                    /-
                  </div>
                  <div className="mt-2 text-[0.68rem] text-white/70">
                    Includes estimated GST @ 5%. Final local extra km/hour
                    charges are calculated from actual trip usage.
                  </div>
                </div>

                <div className="w-full min-w-0 rounded-xl border border-white/15 bg-white/10 p-3 text-[0.76rem] leading-6 sm:p-4">
                  <div className="mb-2 font-heading text-sm font-bold">
                    Fare breakdown
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Base fare</span>
                    <strong>
                      ₹
                      {fareBreakdown.baseFare.toLocaleString("en-IN", {
                        maximumFractionDigits: 0,
                      })}
                    </strong>
                  </div>
                  {fareBreakdown.type === "outstation" && (
                    <>
                      <div className="flex justify-between gap-4">
                        <span>Trip duration</span>
                        <strong>
                          {fareBreakdown.days} days · {fareBreakdown.nights}{" "}
                          nights
                        </strong>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span>Billed distance</span>
                        <strong>{fareBreakdown.billedKm} km</strong>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span>Driver Bata</span>
                        <strong>
                          ₹{fareBreakdown.driverBata.toLocaleString("en-IN")}
                        </strong>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span>Night Bata</span>
                        <strong>
                          ₹{fareBreakdown.nightBata.toLocaleString("en-IN")}
                        </strong>
                      </div>
                    </>
                  )}
                  {fareBreakdown.type === "airport" && (
                    <>
                      <div className="flex justify-between gap-4">
                        <span>Airport distance band</span>
                        <strong>{fareBreakdown.airportBand || "Quoted"}</strong>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span>Night Bata (after 10 PM)</span>
                        <strong>₹{Number(fareBreakdown.airportNightBata || 0).toLocaleString("en-IN")}</strong>
                      </div>
                    </>
                  )}
                  {fareBreakdown.type === "local" && (
                    <>
                      <div className="flex justify-between gap-4">
                        <span>Package includes</span>
                        <strong>{fareBreakdown.includedKm} km</strong>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span>Extra km rate</span>
                        <strong>₹{fareBreakdown.extraKmRate}/km</strong>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span>Extra hour rate</span>
                        <strong>₹{fareBreakdown.extraHourRate}/hr</strong>
                      </div>
                    </>
                  )}
                  <div className="mt-2 border-t border-white/20 pt-2 flex justify-between gap-4">
                    <span>Subtotal</span>
                    <strong>
                      ₹
                      {fareBreakdown.subtotal.toLocaleString("en-IN", {
                        maximumFractionDigits: 0,
                      })}
                    </strong>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>GST @ 5%</span>
                    <strong>
                      ₹
                      {fareBreakdown.gst.toLocaleString("en-IN", {
                        maximumFractionDigits: 0,
                      })}
                    </strong>
                  </div>
                  <div className="mt-1 border-t border-white/20 pt-2 flex justify-between gap-4 text-sm">
                    <span className="font-bold">Estimated total</span>
                    <strong>
                      ₹
                      {fareBreakdown.total.toLocaleString("en-IN", {
                        maximumFractionDigits: 0,
                      })}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-white/15 bg-white/10 p-3 text-[0.7rem] leading-5 text-white/80">
                <strong className="text-white">What is Night Bata?</strong>{" "}
                Night Bata is the driver's night allowance. For airport
                transfers, it is added when the booking pickup time is
                <strong className="text-white"> after 10:00 PM</strong>.
                Outstation overnight stays continue to use the applicable
                night-bata rate per night.
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────
              SUBMIT
          ───────────────────────────────────── */}

          {submitError && (
            <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-[0.8rem] text-red-600">
              {submitError}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`font-heading flex w-full items-center justify-center gap-[0.65rem] rounded-[10px] py-4 text-base font-bold text-white shadow-[0_8px_24px_rgba(234,88,12,0.3)] transition-all duration-250 ${
              loading
                ? "cursor-not-allowed bg-orange-500"
                : "cursor-pointer bg-orange-600 hover:-translate-y-0.5 hover:bg-orange-700"
            }`}
          >
            {loading ? (
              <>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="animate-[spin_0.8s_linear_infinite]"
                >
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                Sending Booking Request…
              </>
            ) : (
              <>
                Book Now — Confirm in 3 Hours
                <FaArrowRight size={14} />
              </>
            )}
          </button>
        </form>
      </div>

      {/* ─────────────────────────────────────────
          FIXED CONTACT BUTTONS
      ───────────────────────────────────────── */}

      <div className="fixed right-6 bottom-6 z-999 flex flex-col gap-3">
        <a
          href="tel:+918123552002"
          aria-label="Call"
          className="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-slate-800 text-white no-underline shadow-[0_4px_18px_rgba(0,0,0,0.3)] transition-all duration-200 hover:scale-110 hover:bg-orange-600"
        >
          <FaPhone size={18} />
        </a>

        <a
          href="https://wa.me/918123552002"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp"
          className="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-[#25D366] text-white no-underline shadow-[0_4px_18px_rgba(37,211,102,0.45)] transition-transform duration-200 hover:scale-110"
        >
          <FaWhatsapp size={24} />
        </a>
      </div>
    </div>
  );
}
