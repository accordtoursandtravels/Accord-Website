"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";

const CATEGORIES = ["Sedan", "MPV", "MUV", "Premium MUV", "SUV", "Premium SUV", "Mini Bus", "Bus"];

export default function FleetForm({ car, onSaved }) {
  const isEdit = Boolean(car._id);
  const [values, setValues] = useState({
    name: car.name || "", category: car.category || "Sedan", seats: car.seats || 4, luggage: car.luggage || 2,
    fuel: car.fuel || "Diesel", ac: car.ac ?? true, popular: car.popular ?? false, active: car.active ?? true,
    features: (car.features || []).join(", "), outstation: car.rates?.outstation || "", minKm: car.rates?.minKm || 300,
    driverBata: car.rates?.driverBata || "", nightBata: car.rates?.nightBata || "", local4h: car.rates?.local4h || "",
    local4hKm: car.rates?.local4hKm || 40, local8h: car.rates?.local8h || "", local8hKm: car.rates?.local8hKm || 80,
    extraKm: car.rates?.extraKm || "", extraHour: car.rates?.extraHour || "", airport40: car.rates?.airport40 || "",
    airport60: car.rates?.airport60 || "", airport80: car.rates?.airport80 || "",
  });
  const [imageFile, setImageFile] = useState(null); const [preview, setPreview] = useState(car.image || ""); const [saving, setSaving] = useState(false); const toast = useToast();
  const set = (k) => (e) => setValues((prev) => ({ ...prev, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));
  const onImagePick = (e) => { const file = e.target.files?.[0]; if (!file) return; setImageFile(file); setPreview(URL.createObjectURL(file)); };
  async function handleSubmit(e) {
    e.preventDefault(); setSaving(true);
    try {
      const form = new FormData();
      ["name","category","seats","luggage","fuel","features"].forEach((k) => form.set(k, values[k]));
      ["ac","popular","active"].forEach((k) => form.set(k, String(values[k])));
      Object.keys(values).filter((k) => ["outstation","minKm","driverBata","nightBata","local4h","local4hKm","local8h","local8hKm","extraKm","extraHour","airport40","airport60","airport80"].includes(k)).forEach((k) => form.set(`rates.${k}`, values[k]));
      if (imageFile) form.set("image", imageFile);
      const res = await fetch(isEdit ? `/api/fleet/${car._id}` : "/api/fleet", { method: isEdit ? "PUT" : "POST", body: form });
      const data = await res.json(); if (!res.ok) throw new Error(data.error || "Save failed");
      toast(isEdit ? "Vehicle updated" : "Vehicle added", "success"); onSaved();
    } catch (err) { toast(err.message, "error"); } finally { setSaving(false); }
  }
  return <form onSubmit={handleSubmit} className="space-y-5">
    <div className="flex items-center gap-4"><div className="h-20 w-28 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">{preview ? <img src={preview} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-[0.65rem] text-slate-400">No image</div>}</div><label className="cursor-pointer rounded-lg border-[1.5px] border-slate-200 px-4 py-2 text-[0.8rem] font-semibold text-slate-600 hover:border-orange-600 hover:text-orange-600">{preview ? "Change photo" : "Upload photo"}<input type="file" accept="image/*" onChange={onImagePick} className="hidden" /></label></div>
    <div className="grid grid-cols-2 gap-4"><Input label="Vehicle name" required value={values.name} onChange={set("name")} className="col-span-2" /><Select label="Category" value={values.category} onChange={set("category")}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</Select><Input label="Fuel" value={values.fuel} onChange={set("fuel")} /><Input label="Seats" type="number" min="1" required value={values.seats} onChange={set("seats")} /><Input label="Luggage (bags)" type="number" min="0" value={values.luggage} onChange={set("luggage")} /></div>
    <Input label="Features (comma separated)" value={values.features} onChange={set("features")} placeholder="Music System, GPS Tracker, First Aid Kit" />
    <div className="space-y-4"><div className="text-[0.8rem] font-medium text-slate-600">Rates</div>
      <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4"><div className="mb-3 font-heading text-sm font-bold text-slate-800">Outstation</div><div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><Input label="Outstation ₹/km" type="number" value={values.outstation} onChange={set("outstation")} /><Input label="Minimum km/day" type="number" value={values.minKm} onChange={set("minKm")} /><Input label="Driver bata ₹/day" type="number" value={values.driverBata} onChange={set("driverBata")} /><Input label="Night bata ₹/night" type="number" value={values.nightBata} onChange={set("nightBata")} /></div></div>
      <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4"><div className="mb-3 font-heading text-sm font-bold text-slate-800">Local</div><div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><Input label="4 hrs price ₹" type="number" value={values.local4h} onChange={set("local4h")} /><Input label="4 hrs included km" type="number" value={values.local4hKm} onChange={set("local4hKm")} /><Input label="8 hrs price ₹" type="number" value={values.local8h} onChange={set("local8h")} /><Input label="8 hrs included km" type="number" value={values.local8hKm} onChange={set("local8hKm")} /><Input label="Extra km ₹/km" type="number" value={values.extraKm} onChange={set("extraKm")} /><Input label="Extra hour ₹/hr" type="number" value={values.extraHour} onChange={set("extraHour")} /></div></div>
      <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4"><div className="mb-3 font-heading text-sm font-bold text-slate-800">Airport</div><div className="grid grid-cols-1 gap-3 sm:grid-cols-3"><Input label="≤40 km ₹" type="number" value={values.airport40} onChange={set("airport40")} /><Input label="≤60 km ₹" type="number" value={values.airport60} onChange={set("airport60")} /><Input label="≤80 km ₹" type="number" value={values.airport80} onChange={set("airport80")} /></div></div>
    </div>
    <div className="flex flex-wrap gap-5"><label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={values.ac} onChange={set("ac")} className="accent-orange-600" /> AC</label><label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={values.popular} onChange={set("popular")} className="accent-orange-600" /> Most Booked</label><label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={values.active} onChange={set("active")} className="accent-orange-600" /> Visible on site</label></div>
    <div className="flex justify-end border-t border-slate-100 pt-4"><Button type="submit" loading={saving}>{isEdit ? "Save Changes" : "Add Vehicle"}</Button></div>
  </form>;
}
