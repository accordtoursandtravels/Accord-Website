"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Spinner from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/ToastProvider";

const FIELDS = [
  ["outstation", "Outstation ₹/km"],
  ["driverBata", "Driver Bata ₹/day"],
  ["nightBata", "Night Bata ₹/night"],
  ["minKm", "Minimum km/day"],
  ["local4h", "Local 4h / 40km ₹"],
  ["local8h", "Local 8h / 80km ₹"],
  ["extraKm", "Extra km ₹/km"],
  ["extraHour", "Extra hour ₹/hr"],
  ["airport40", "Airport ≤40km ₹"],
  ["airport60", "Airport ≤60km ₹"],
  ["airport80", "Airport ≤80km ₹"],
];

export default function AdminRateCard() {
  const [fleet, setFleet] = useState(null);
  const [saving, setSaving] = useState(null);
  const toast = useToast();

  const load = async () => {
    try {
      const r = await fetch("/api/fleet?all=true", { cache: "no-store", credentials: "same-origin" });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Could not load fleet");
      setFleet(d.fleet || []);
    } catch (e) {
      console.error(e);
      setFleet([]);
      toast("Could not load fleet data. Please sign in again if needed.", "error");
    }
  };

  useEffect(() => { load(); }, []);

  const setRate = (id, key, value) =>
    setFleet((fs) => fs.map((c) => c._id === id ? { ...c, rates: { ...c.rates, [key]: value } } : c));

  async function save(c) {
    setSaving(c._id);
    const form = new FormData();
    ["name", "category", "seats", "luggage", "fuel", "features"].forEach((k) => form.set(k, k === "features" ? (c.features || []).join(",") : c[k] ?? ""));
    ["ac", "popular", "active"].forEach((k) => form.set(k, String(c[k] ?? true)));
    Object.entries(c.rates || {}).forEach(([k, v]) => form.set(`rates.${k}`, v ?? ""));
    const res = await fetch(`/api/fleet/${c._id}`, { method: "PUT", body: form });
    setSaving(null);
    if (res.ok) { toast("Rate card updated", "success"); load(); }
    else toast("Could not save rates", "error");
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading mb-1 text-2xl font-bold text-slate-800">Rate Card</h1>
        <p className="text-sm text-slate-500">Updated to the supplied Accord rate sheet. Local packages are 4h/40km and 8h/80km. Airport pricing has 40km, 60km and 80km bands.</p>
      </div>
      {!fleet ? <div className="flex justify-center py-16"><Spinner /></div> : (
        <div className="space-y-4">
          {fleet.map((c) => (
            <div key={c._id} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div><div className="font-heading font-bold">{c.name}</div><div className="text-xs text-slate-400">{c.category} · {c.seats} seats</div></div>
                <Button size="sm" onClick={() => save(c)} loading={saving === c._id}>Save Rates</Button>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {FIELDS.map(([key, label]) => <Input key={key} label={label} type="number" value={c.rates?.[key] ?? ""} onChange={(e) => setRate(c._id, key, e.target.value)} />)}
              </div>
              <div className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">Airport rule: ≤40km uses the first band; 40–60km uses the second band; 60–80km uses the third band. Beyond 80km requires manual/admin confirmation.</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
