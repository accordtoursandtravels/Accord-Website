"use client";

import { useEffect, useState } from "react";
import { FaPlus, FaEdit, FaTrash, FaEyeSlash } from "react-icons/fa";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/components/ui/ToastProvider";
import FleetForm from "@/components/admin/FleetForm";

export default function AdminFleetPage() {
  const [fleet, setFleet] = useState(null);
  const [editing, setEditing] = useState(null); // null = closed, {} = new, {...} = edit
  const [deleting, setDeleting] = useState(null);
  const toast = useToast();

  const load = async () => {
    try {
      const r = await fetch("/api/fleet?all=true", { cache: "no-store", credentials: "same-origin" });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Could not load fleet");
      setFleet(d.fleet || []);
    } catch (e) {
      console.error("Admin fleet load failed", e);
      setFleet([]);
      toast("Could not load fleet data. Please sign in again if needed.", "error");
    }
  };

  useEffect(() => {
    load();
  }, []);

  async function handleDelete() {
    const res = await fetch(`/api/fleet/${deleting._id}`, { method: "DELETE" });
    if (!res.ok) {
      toast("Could not delete vehicle", "error");
      return;
    }
    toast("Vehicle deleted", "success");
    setDeleting(null);
    load();
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading mb-1 text-2xl font-bold text-slate-800">Fleet</h1>
          <p className="text-sm text-slate-500">Add, edit or remove vehicles shown on the site.</p>
        </div>
        <Button icon={FaPlus} onClick={() => setEditing({})}>
          Add Vehicle
        </Button>
      </div>

      {!fleet ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : fleet.length === 0 ? (
        <p className="rounded-xl border border-slate-200 bg-white py-16 text-center text-sm text-slate-500">
          No vehicles yet — add your first one.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {fleet.map((car) => (
            <div key={car._id} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="relative h-36 bg-slate-100">
                {car.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={car.image} alt={car.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-slate-400">No image</div>
                )}
                {!car.active && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-slate-800/80 px-2 py-0.5 text-[0.65rem] font-semibold text-white">
                    <FaEyeSlash size={9} /> Hidden
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="mb-0.5 font-heading text-sm font-bold text-slate-800">{car.name}</div>
                <div className="mb-3 text-[0.75rem] text-slate-400">
                  {car.category} · {car.seats} seats
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" icon={FaEdit} onClick={() => setEditing(car)} className="flex-1">
                    Edit
                  </Button>
                  <Button size="sm" variant="danger" icon={FaTrash} onClick={() => setDeleting(car)}>
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?._id ? `Edit ${editing.name}` : "Add Vehicle"}
        maxWidth="max-w-2xl"
      >
        {editing && (
          <FleetForm
            car={editing}
            onSaved={() => {
              setEditing(null);
              load();
            }}
          />
        )}
      </Modal>

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Delete vehicle?">
        {deleting && (
          <div>
            <p className="mb-5 text-sm text-slate-600">
              This permanently removes <strong>{deleting.name}</strong> and its photo. This can&apos;t be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleting(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
