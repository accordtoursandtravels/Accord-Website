"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FaPlus, FaEdit, FaTrash, FaImage } from "react-icons/fa";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/components/ui/ToastProvider";

const EMPTY = {
  cities: { name: "", state: "", image: "", active: true, order: 0 },
  partners: { name: "", logo: "", active: true, order: 0 },
  testimonials: { name: "", role: "", company: "", city: "", rating: 5, text: "", image: "", active: true, featured: true, order: 0 },
};

const LABELS = { testimonials: "Testimonials", cities: "Cities", partners: "Corporate Partners" };

export default function SiteContentAdmin() {
  const [data, setData] = useState(null);
  const [type, setType] = useState("testimonials");
  const [editing, setEditing] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);
  const toast = useToast();

  const load = async () => {
    try {
      const r = await fetch("/api/site-content?all=true", { cache: "no-store", credentials: "same-origin" });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Could not load site content");
      setData(d);
    } catch (e) {
      console.error("Admin site content load failed", e);
      setData({ cities: [], partners: [], testimonials: [] });
      toast("Could not load site content. Please sign in again if needed.", "error");
    }
  };
  useEffect(() => { load(); }, []);

  const list = data?.[type] || [];
  const imageField = type === "partners" ? "logo" : "image";

  function openNew() {
    setSelectedFile(null);
    setEditing({ ...EMPTY[type] });
  }

  function openEdit(item) {
    setSelectedFile(null);
    setEditing({ ...item });
  }

  function update(patch) { setEditing((v) => ({ ...v, ...patch })); }

  async function save() {
    if (!editing?.name?.trim() || (type === "testimonials" && !editing.text?.trim())) {
      toast(type === "testimonials" ? "Name and testimonial text are required" : "Name is required", "error");
      return;
    }
    setSaving(true);
    try {
      const form = new FormData();
      form.set("type", type);
      if (editing._id) form.set("id", editing._id);
      form.set("item", JSON.stringify(editing));
      if (selectedFile) form.set("image", selectedFile);
      const res = await fetch("/api/site-content/item", { method: editing._id ? "PUT" : "POST", body: form });
      if (!res.ok) throw new Error();
      toast("Saved", "success");
      setEditing(null);
      setSelectedFile(null);
      await load();
    } catch {
      toast("Could not save this item", "error");
    } finally {
      setSaving(false);
    }
  }

  async function del(id) {
    if (!confirm("Delete this item?")) return;
    const res = await fetch("/api/site-content/item", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type, id }) });
    if (res.ok) { toast("Deleted", "success"); load(); } else toast("Could not delete", "error");
  }


  return (
    <div className="min-w-0">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-heading mb-1 text-2xl font-bold text-slate-800">Site Content</h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-500">Manage cities, partner logos and testimonials. Images are uploaded to the site and the content is stored in MongoDB.</p>
        </div>
        <Button icon={FaPlus} onClick={openNew}>Add {type === "testimonials" ? "Testimonial" : type === "cities" ? "City" : "Partner"}</Button>
      </div>

      <div className="mb-6 overflow-x-auto border-b border-slate-200">
        <div className="flex min-w-max gap-1">
          {Object.keys(LABELS).map((key) => (
            <button key={key} onClick={() => setType(key)} className={`border-b-2 px-4 py-3 text-sm font-semibold whitespace-nowrap ${type === key ? "border-orange-600 text-orange-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}>
              {LABELS[key]} <span className="ml-1 text-xs text-slate-400">{data?.[key]?.length || 0}</span>
            </button>
          ))}
        </div>
      </div>

    
      {!data ? <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">Loading content…</div> : list.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center"><p className="text-sm text-slate-500">No {LABELS[type].toLowerCase()} yet.</p><Button className="mt-4" onClick={openNew}>Add one</Button></div>
      ) : (
        <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2">
          {list.map((x) => (
            <article key={x._id} className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex min-w-0 items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  {x[imageField] ? <img src={x[imageField]} alt="" className={`${type === "cities" ? "h-40" : "h-28"} mb-4 w-full rounded-lg object-cover`} /> : <div className="mb-4 flex h-20 items-center justify-center rounded-lg bg-slate-50 text-slate-300"><FaImage /></div>}
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-heading text-base font-bold text-slate-800">{x.name}</h2>
                    {!x.active && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">Hidden</span>}
                  </div>
                  <div className="mt-1 text-xs text-slate-400">{type === "cities" ? `${x.state || "India"}` : type === "partners" ? "Corporate partner" : [x.company, x.city].filter(Boolean).join(" · ")}</div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button onClick={() => openEdit(x)} className="rounded-lg p-2.5 text-slate-400 hover:bg-orange-50 hover:text-orange-600" aria-label="Edit"><FaEdit /></button>
                  <button onClick={() => del(x._id)} className="rounded-lg p-2.5 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label="Delete"><FaTrash /></button>
                </div>
              </div>
              {type === "testimonials" && <>
                <div className="mb-2 flex gap-1 text-amber-500">{[...Array(Number(x.rating) || 5)].map((_, i) => <span key={i}>★</span>)}</div>
                <p className="text-sm leading-6 text-slate-600">&quot;{x.text}&quot;</p>
                <div className="mt-3 text-xs text-slate-400">{[x.role, x.city].filter(Boolean).join(" · ")}</div>
              </>}
            </article>
          ))}
        </div>
      )}

      <Modal open={!!editing} onClose={() => !saving && setEditing(null)} title={editing?._id ? `Edit ${type === "cities" ? "City" : type === "partners" ? "Partner" : "Testimonial"}` : `Add ${type === "cities" ? "City" : type === "partners" ? "Partner" : "Testimonial"}`} maxWidth="max-w-3xl">
        {editing && (
          <div className="space-y-5">
            {type === "cities" && <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input label="City name" value={editing.name || ""} onChange={(e) => update({ name: e.target.value })} autoFocus />
                <Input label="State" value={editing.state || ""} onChange={(e) => update({ state: e.target.value })} />
              </div>
              <ImagePicker label="City / heritage image" current={editing.image} file={selectedFile} onChange={setSelectedFile} fileRef={fileRef} />
              <Input label="Image URL (optional fallback)" value={editing.image || ""} onChange={(e) => update({ image: e.target.value })} placeholder="https://…" />
            </>}

            {type === "partners" && <>
              <Input label="Partner name" value={editing.name || ""} onChange={(e) => update({ name: e.target.value })} autoFocus />
              <ImagePicker label="Partner logo" current={editing.logo} file={selectedFile} onChange={setSelectedFile} fileRef={fileRef} compact />
              <Input label="Logo URL (optional fallback)" value={editing.logo || ""} onChange={(e) => update({ logo: e.target.value })} placeholder="https://…" />
            </>}

            {type === "testimonials" && <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input label="Name" value={editing.name || ""} onChange={(e) => update({ name: e.target.value })} autoFocus />
                <Input label="Role" value={editing.role || ""} onChange={(e) => update({ role: e.target.value })} />
                <Input label="Company" value={editing.company || ""} onChange={(e) => update({ company: e.target.value })} />
                <Input label="City" value={editing.city || ""} onChange={(e) => update({ city: e.target.value })} />
                <Input label="Rating (1–5)" type="number" min="1" max="5" value={editing.rating || 5} onChange={(e) => update({ rating: e.target.value })} />
              </div>
              <textarea className="min-h-32 w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-orange-600" placeholder="Testimonial text" value={editing.text || ""} onChange={(e) => update({ text: e.target.value })} />
              <ImagePicker label="Client image (optional)" current={editing.image} file={selectedFile} onChange={setSelectedFile} fileRef={fileRef} compact />
              <Input label="Image URL (optional fallback)" value={editing.image || ""} onChange={(e) => update({ image: e.target.value })} placeholder="https://…" />
            </>}

            <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={editing.active !== false} onChange={(e) => update({ active: e.target.checked })} /> Visible on website</label>
              <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setEditing(null)} disabled={saving}>Cancel</Button><Button onClick={save} loading={saving}>Save</Button></div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function ImagePicker({ label, current, file, onChange, fileRef, compact = false }) {
  const preview = file ? URL.createObjectURL(file) : current;
  return (
    <div>
      <div className="mb-1.5 block text-[0.8rem] font-medium text-slate-600">{label}</div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_180px]">
        <label className="flex min-h-24 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 px-4 text-center text-xs text-slate-500 transition hover:border-orange-300 hover:bg-orange-50/40">
          <span><strong className="text-slate-700">Choose image</strong><br />JPG, PNG, WEBP or AVIF · max 5MB</span>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={(e) => onChange(e.target.files?.[0] || null)} />
        </label>
        {preview ? <img src={preview} alt="Preview" className={`${compact ? "h-24" : "h-32"} w-full rounded-lg object-cover`} /> : <div className="flex h-24 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400">No image selected</div>}
      </div>
      {file && <p className="mt-1.5 text-[11px] text-slate-400">Selected: {file.name}</p>}
    </div>
  );
}
