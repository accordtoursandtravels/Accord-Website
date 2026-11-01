"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaShieldAlt, FaArrowLeft, FaWhatsapp } from "react-icons/fa";
import FleetCard from "@/components/fleet/FleetCard";
import Spinner from "@/components/ui/Spinner";
import PublicHeader from "@/components/site/PublicHeader";

export default function FleetPage() {
  const [fleet, setFleet] = useState(null);
  const [activeTab, setActiveTab] = useState("outstation");

  useEffect(() => {
    fetch("/api/fleet")
      .then((r) => r.json())
      .then((d) => setFleet(d.fleet || []))
      .catch(() => setFleet([]));
  }, []);

  return (
    <div className="bg-white font-sans text-slate-800">
      <PublicHeader />

      <section className="px-6 py-[clamp(3rem,6vw,4.5rem)]">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 text-center">
            <span className="mb-3 inline-block rounded bg-orange-50 px-3.5 py-[0.35rem] text-[0.72rem] font-bold tracking-[0.12em] text-orange-600 uppercase">
              Our Fleet &amp; Rates
            </span>
            <h1 className="font-heading mb-2 text-[clamp(1.9rem,4vw,2.6rem)] font-bold text-slate-800">
              Every Vehicle We Run
            </h1>
            <p className="mx-auto max-w-lg text-[0.9rem] text-slate-500">
              Transparent rates. All prices inclusive of fuel &amp; driver. GST at 5% extra.
            </p>
          </div>

          <div className="mb-10 flex flex-wrap justify-center gap-2">
            {[
              ["outstation", "Outstation / One-Way"],
              ["local", "Local Package"],
              ["airport", "Airport Transfer"],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`font-heading rounded-full border-[1.5px] px-5 py-[0.55rem] text-[0.8rem] font-semibold transition-all ${
                  activeTab === key
                    ? "border-orange-600 bg-orange-600 text-white"
                    : "border-slate-200 bg-white text-slate-500"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {!fleet ? (
            <div className="flex justify-center py-20">
              <Spinner />
            </div>
          ) : fleet.length === 0 ? (
            <p className="py-16 text-center text-sm text-slate-500">
              No vehicles published yet — call us for current availability.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {fleet.map((car) => (
                <FleetCard key={car._id} car={car} activeTab={activeTab} />
              ))}
            </div>
          )}

          <div className="mt-8 flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-5 py-3.5 text-[0.82rem] text-amber-800">
            <FaShieldAlt size={14} className="mt-0.5 shrink-0 text-amber-600" />
            <span>
              <strong>Note:</strong> All rates are base fares. GST @ 5% extra. Toll charges are not included.
              You may pay tolls at the counter or settle the actual FASTag amount after it reflects
              in the FASTag statement. Driver Bata and applicable Night Bata are declared upfront
              in the quote.
            </span>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link
              href="/booking"
              className="font-heading rounded-lg bg-orange-600 px-6 py-3 text-sm font-bold text-white no-underline hover:bg-orange-700"
            >
              Book a Cab
            </Link>
            <a
              href="https://wa.me/918123552002"
              target="_blank"
              rel="noopener noreferrer"
              className="font-heading flex items-center gap-1.5 rounded-lg bg-[#25D366] px-6 py-3 text-sm font-bold text-white no-underline"
            >
              <FaWhatsapp size={15} /> Ask on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
