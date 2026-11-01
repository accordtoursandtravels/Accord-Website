"use client";

import { useEffect, useRef, useState } from "react";
import { FaChevronLeft, FaChevronRight, FaArrowRight } from "react-icons/fa";
import FleetCard from "./FleetCard";
import Spinner from "@/components/ui/Spinner";

export default function FleetSlider({ activeTab }) {
  const [fleet, setFleet] = useState(null);
  const trackRef = useRef(null);

  useEffect(() => {
    fetch("/api/fleet").then((r) => r.json()).then((d) => setFleet(d.fleet || [])).catch(() => setFleet([]));
  }, []);

  const scroll = (dir) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector("[data-fleet-card]");
    const amount = card ? card.getBoundingClientRect().width + 24 : 340;
    track.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  if (!fleet) return <div className="flex justify-center py-16"><Spinner /></div>;
  if (!fleet.length) return <p className="py-10 text-center text-sm text-slate-500">Fleet details will be published shortly. Call us for current availability.</p>;

  return (
    <div className="relative px-1 sm:px-2">
      <button onClick={() => scroll(-1)} aria-label="Previous vehicle" className="absolute left-0 top-[44%] z-20 -translate-y-1/2 rounded-full border border-slate-200 bg-white p-3 text-slate-600 shadow-[0_6px_20px_rgba(0,0,0,0.12)] transition hover:border-orange-600 hover:text-orange-600 sm:-left-1"><FaChevronLeft size={12} /></button>
      <button onClick={() => scroll(1)} aria-label="Next vehicle" className="absolute right-0 top-[44%] z-20 -translate-y-1/2 rounded-full border border-slate-200 bg-white p-3 text-slate-600 shadow-[0_6px_20px_rgba(0,0,0,0.12)] transition hover:border-orange-600 hover:text-orange-600 sm:-right-1"><FaChevronRight size={12} /></button>

      <div ref={trackRef} className="scrollbar-hide flex snap-x snap-mandatory gap-6 overflow-x-auto px-9 pb-3 sm:px-10">
        {fleet.map((car) => <div key={car._id} data-fleet-card className="w-[82vw] max-w-[320px] shrink-0 snap-start sm:w-[320px]"><FleetCard car={car} activeTab={activeTab} /></div>)}
      </div>

      <div className="mt-4 flex justify-center sm:justify-end">
        <a href="/fleet" className="font-heading flex items-center gap-1.5 rounded-lg bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white no-underline transition-colors hover:bg-slate-900">View Full Fleet &amp; Rates <FaArrowRight size={12} /></a>
      </div>
    </div>
  );
}
