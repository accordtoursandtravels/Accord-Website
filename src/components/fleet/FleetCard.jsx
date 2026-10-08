"use client";
import Link from "next/link";
import { FaUsers, FaSnowflake, FaSuitcase, FaGasPump, FaTachometerAlt } from "react-icons/fa";

export default function FleetCard({ car, activeTab = "outstation" }) {
  const r = car.rates || {};
  const rateRows = {
    outstation: [["Per KM", `₹${r.outstation || 0}/-`], ["Driver Bata", `₹${r.driverBata || 0}/day`], ["Night Bata", `₹${r.nightBata || 0}/night`], ["Min. Billing", `${r.minKm || 300} km/day`], ["Extra KM", `₹${r.extraKm || 0}/km`]],
    local: [["4 Hrs / 40 Km", `₹${(r.local4h || 0).toLocaleString("en-IN")}/-`], ["8 Hrs / 80 Km", `₹${(r.local8h || 0).toLocaleString("en-IN")}/-`], ["Extra KM", `₹${r.extraKm || 0}/km`], ["Extra Hour", `₹${r.extraHour || 0}/hr`]],
    airport: [["Up to 40 km", `₹${(r.airport40 || 0).toLocaleString("en-IN")}/-`], ["40-60 km", `₹${(r.airport60 || 0).toLocaleString("en-IN")}/-`], ["60-80 km", `₹${(r.airport80 || 0).toLocaleString("en-IN")}/-`], ["Parking", "Extra if applicable"]],
  };
  return <div className={`relative overflow-hidden rounded-xl border-[1.5px] bg-white transition-all duration-250 hover:-translate-y-1 hover:shadow-[0_16px_50px_rgba(0,0,0,0.1)] ${car.popular ? "border-orange-600 shadow-[0_8px_36px_rgba(234,88,12,0.13)]" : "border-slate-200 shadow-[0_2px_10px_rgba(0,0,0,0.05)]"}`}>
    {car.popular && <div className="absolute top-[10px] right-[10px] z-2 rounded-full bg-orange-600 px-2.5 py-[0.28rem] text-[0.62rem] font-bold tracking-[0.08em] text-white uppercase">Most Booked</div>}
    <div className="relative h-[180px] overflow-hidden bg-slate-100"><img src={car.image} alt={car.name} className="h-full w-full object-cover" /><div className="absolute bottom-2 left-2.5"><span className="rounded bg-orange-600 px-2 py-[0.2rem] text-[0.62rem] font-bold text-white">{car.category}</span></div></div>
    <div className="p-5"><h3 className="font-heading mb-3.5 text-[1.05rem] font-bold text-slate-800">{car.name}</h3><div className="mb-[1.125rem] grid grid-cols-2 gap-2">{[[FaUsers,`${car.seats} Passengers`],[FaSnowflake,car.ac?"Air Conditioned":"Non-AC"],[FaSuitcase,`${car.luggage} Bags`],[FaGasPump,car.fuel]].map(([Icon,val])=><div key={val} className="flex items-center gap-1.5 text-xs text-slate-500"><span className="text-orange-600"><Icon size={12}/></span>{val}</div>)}</div><div className="mb-4 rounded-lg bg-orange-50 px-4 py-3.5"><div className="grid grid-cols-2 gap-2.5">{rateRows[activeTab].map(([l,v])=><div key={l}><div className="mb-0.5 text-[0.62rem] tracking-[0.06em] text-slate-500 uppercase">{l}</div><div className="font-heading text-[0.9rem] font-bold text-orange-600">{v}</div></div>)}</div></div><div className="mb-4 flex flex-wrap gap-1.5">{(car.features||[]).map((f)=><span key={f} className="flex items-center gap-1 rounded border border-slate-200 bg-slate-50 px-2 py-[0.2rem] text-[0.68rem] text-slate-500"><FaTachometerAlt size={9} className="text-orange-600" />{f}</span>)}</div><Link href="/booking" className="font-heading block rounded-lg bg-orange-600 py-[0.7rem] text-center text-sm font-bold text-white no-underline transition-colors hover:bg-orange-700">Book {car.name.split(" ").slice(0,2).join(" ")}</Link></div>
  </div>;
}
