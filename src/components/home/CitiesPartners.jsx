"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FaChevronLeft, FaChevronRight, FaArrowRight } from "react-icons/fa";

const CITY_IMAGES = {
  Bengaluru: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=900&q=80",
  Hyderabad: "https://images.unsplash.com/photo-1609920658906-8223bd289001?auto=format&fit=crop&w=900&q=80",
  Mumbai: "https://images.unsplash.com/photo-1566552881560-0be862a7c445?auto=format&fit=crop&w=900&q=80",
  Pune: "https://images.unsplash.com/photo-1600181958094-d6f4f2c2e0c6?auto=format&fit=crop&w=900&q=80",
  Delhi: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=900&q=80",
  Chennai: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=900&q=80",
  Kolkata: "https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=900&q=80",
  Kochi: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=900&q=80",
  Jaipur: "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=900&q=80",
  Goa: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=900&q=80",
};

export function CitiesSection() {
  const [cities, setCities] = useState([]);
  const trackRef = useRef(null);
  const pausedRef = useRef(false);

  useEffect(() => {
    fetch("/api/site-content").then((r) => r.json()).then((d) => setCities(d.cities || [])).catch(() => setCities([]));
  }, []);

  useEffect(() => {
    if (cities.length < 2) return;
    const timer = setInterval(() => {
      if (pausedRef.current || !trackRef.current) return;
      const track = trackRef.current;
      const card = track.querySelector("[data-city-card]");
      const amount = card ? card.getBoundingClientRect().width + 16 : 300;
      const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 12;
      track.scrollTo({ left: atEnd ? 0 : track.scrollLeft + amount, behavior: "smooth" });
    }, 3500);
    return () => clearInterval(timer);
  }, [cities.length]);

  const move = (dir) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector("[data-city-card]");
    const amount = card ? card.getBoundingClientRect().width + 16 : 300;
    const next = track.scrollLeft + dir * amount;
    track.scrollTo({ left: Math.max(0, Math.min(next, track.scrollWidth - track.clientWidth)), behavior: "smooth" });
  };

  return (
    <section id="cities" className="overflow-hidden bg-slate-50 px-4 py-[clamp(4rem,7vw,6rem)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center sm:mb-10">
          <span className="mb-3 inline-block rounded bg-orange-50 px-3.5 py-[0.35rem] text-[0.72rem] font-bold tracking-[0.12em] text-orange-600 uppercase">Where We Operate</span>
          <h2 className="font-heading text-[clamp(1.7rem,3.5vw,2.4rem)] font-bold text-slate-800">Major Cities Across India</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-slate-500">From Bengaluru to Mumbai, Hyderabad to Delhi — dependable airport, corporate, local and outstation travel across India&apos;s key cities.</p>
        </div>

        <div className="relative">
          <button onClick={() => move(-1)} aria-label="Previous city" className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-slate-200 bg-white p-3 text-slate-600 shadow-lg transition hover:border-orange-600 hover:text-orange-600 sm:left-1"><FaChevronLeft size={12} /></button>
          <button onClick={() => move(1)} aria-label="Next city" className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-slate-200 bg-white p-3 text-slate-600 shadow-lg transition hover:border-orange-600 hover:text-orange-600 sm:right-1"><FaChevronRight size={12} /></button>

          <div
            ref={trackRef}
            onMouseEnter={() => { pausedRef.current = true; }}
            onMouseLeave={() => { pausedRef.current = false; }}
            onTouchStart={() => { pausedRef.current = true; }}
            onTouchEnd={() => { setTimeout(() => { pausedRef.current = false; }, 2500); }}
            className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto px-11 pb-2 sm:px-12"
          >
            {cities.map((city) => (
              <article key={city._id} data-city-card className="group relative w-[82vw] max-w-[300px] shrink-0 snap-start overflow-hidden rounded-2xl bg-white shadow-[0_4px_18px_rgba(15,23,42,0.07)] sm:w-[285px]">
                <div className="relative h-44 overflow-hidden bg-slate-200">
                  {(city.image || CITY_IMAGES[city.name]) ? <img src={city.image || CITY_IMAGES[city.name]} alt={`${city.name} landmark and city view`} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-sm text-slate-400">City image coming soon</div>}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/65 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4"><h3 className="font-heading text-xl font-bold text-white">{city.name}</h3><p className="text-xs text-white/80">{city.state}</p></div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">Need service in another city? <Link href="/booking" className="font-semibold text-orange-600 no-underline">Talk to our team.</Link></p>
      </div>
    </section>
  );
}

export function PartnersMarquee() {
  const [partners, setPartners] = useState([]);
  const [paused, setPaused] = useState(false);
  useEffect(() => { fetch("/api/site-content").then((r) => r.json()).then((d) => setPartners(d.partners || [])).catch(() => setPartners([])); }, []);
  const doubled = [...partners, ...partners];
  return (
    <section className="overflow-hidden border-y border-slate-100 bg-white py-7">
      <div className="mx-auto max-w-6xl px-4 text-center sm:px-6"><p className="mb-5 text-[0.68rem] font-bold tracking-[0.16em] text-slate-400 uppercase">Trusted By &amp; Corporate Partners</p></div>
      {partners.length > 0 && <div className="overflow-hidden" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <div className={`partner-track flex w-max gap-4 px-2 ${paused ? "pause-marquee" : ""}`}>
          {doubled.map((p, i) => <div key={`${p._id}-${i}`} className="flex h-16 min-w-44 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-7 text-sm font-semibold text-slate-500">
            {p.logo ? <img src={p.logo} alt={p.name} className="max-h-9 max-w-32 object-contain" /> : p.name}
          </div>)}
        </div>
      </div>}
    </section>
  );
}
