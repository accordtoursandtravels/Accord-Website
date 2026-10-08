"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FaArrowLeft, FaPlus, FaTrash, FaDownload, FaShareAlt, FaSave } from "react-icons/fa";
import InvoicePreview from "@/components/admin/invoice/InvoicePreview";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import Spinner from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/ToastProvider";
import { FLEET } from "@/lib/constants";

const HSN_SAC = "SAC 9966";
const money = (n) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const round2 = (n) => Math.round((Number(n || 0) + Number.EPSILON) * 100) / 100;
const dateInput = (value) => value ? new Date(value).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);

function bookingItems(booking) {
  const f = booking?.fareBreakdown || {};
  const rates = booking?.fleet?.rates || FLEET.find((car) => car.name.toLowerCase() === String(booking?.fleetName || "").toLowerCase())?.rates || {};
  const vehicle = booking?.fleetName || "Vehicle hire";
  const round = (n) => round2(Number(n || 0));
  const items = [];

  if (booking?.tripType === "outstation") {
    const days = Number(f.days || 1);
    const requestedKm = Number(f.requestedKm || 0);
    const minKm = Number(f.minKm || rates.minKm || 300);
    const minimumBilledKm = Number(f.minimumBilledKm || minKm * days);
    const extraKm = Number(f.extraKms || Math.max(0, requestedKm - minimumBilledKm));
    const perKm = Number(f.extraKmRate || rates.outstation || 0);
    const baseFare = Number(f.baseFare || minimumBilledKm * perKm);
    items.push({ description: `${vehicle} - Vehicle hire (${minKm} km/day included)`, qty: days, unit: "days", rate: days ? round(baseFare / days) : baseFare });
    items.push({ description: `Total KM used: ${requestedKm} km`, qty: requestedKm, unit: "km", rate: 0 });
    if (extraKm > 0) items.push({ description: "Extra KM", qty: extraKm, unit: "km", rate: perKm });
    if (Number(f.extraHours || 0) > 0) items.push({ description: "Extra hour charges", qty: Number(f.extraHours), unit: "hrs", rate: Number(f.extraHourRate || rates.extraHour || 0) });
    if (Number(f.toll || 0) > 0) items.push({ description: "Toll / parking / permit", qty: 1, unit: "charge", rate: Number(f.toll) });
    if (Number(f.driverBata || 0) > 0) items.push({ description: "Driver bata - day", qty: days, unit: "days", rate: round(Number(f.driverBata) / days) });
    if (Number(f.nightBata || 0) > 0) items.push({ description: "Driver bata - night", qty: Number(f.nights || 0), unit: "nights", rate: Number(f.nights) ? round(Number(f.nightBata) / Number(f.nights)) : Number(f.nightBata) });
  } else if (booking?.tripType === "local") {
    items.push({ description: `${vehicle} - ${f.durationLabel || "Local city ride"}`, qty: 1, unit: "package", rate: Number(f.baseFare || 0) });
    items.push({ description: `Total KM used: ${Number(f.includedKm || 0)} km`, qty: Number(f.includedKm || 0), unit: "km", rate: 0 });
    if (Number(f.extraKms || 0) > 0) items.push({ description: "Extra KM", qty: Number(f.extraKms), unit: "km", rate: Number(f.extraKmRate || rates.extraKm || 0) });
    if (Number(f.extraHours || 0) > 0) items.push({ description: "Extra hour charges", qty: Number(f.extraHours), unit: "hrs", rate: Number(f.extraHourRate || rates.extraHour || 0) });
    if (Number(f.toll || 0) > 0) items.push({ description: "Toll / parking / permit", qty: 1, unit: "charge", rate: Number(f.toll) });
  } else if (booking?.tripType === "airport") {
    const distance = Number(f.airportDistanceKm || booking.airportDistanceKm || 0);
    items.push({ description: `${vehicle} - Airport transfer (${f.airportBand || "rate card"})`, qty: 1, unit: "trip", rate: Number(f.baseFare || 0) });
    items.push({ description: `Total KM used: ${distance} km`, qty: distance, unit: "km", rate: 0 });
    if (Number(f.airportNightBata || 0) > 0) items.push({ description: "Driver bata - night (after 10 PM)", qty: 1, unit: "night", rate: Number(f.airportNightBata) });
    if (Number(f.toll || 0) > 0) items.push({ description: "Toll / parking / permit", qty: 1, unit: "charge", rate: Number(f.toll) });
  }
  return items.length ? items : [{ description: `${vehicle} - Cab service`, qty: 1, unit: "service", rate: round2(Number(booking?.estimatedFare || 0) / 1.05) }];
}

function detailsFromBooking(booking) {
  const f = booking?.fareBreakdown || {};
  const totalKmsUsed = Number(f.requestedKm || f.billedKm || f.airportDistanceKm || f.includedKm || 0);
  return {
    vehicleType: booking?.fleetName || "",
    totalKmsUsed,
    extraKms: Number(f.extraKms || (booking?.tripType === "outstation" ? Math.max(0, Number(f.requestedKm || 0) - Number(f.minimumBilledKm || 0)) : 0)),
    extraHours: Number(f.extraHours || 0),
    toll: Number(f.toll || 0),
    driverBataDay: Number(f.driverBata || 0),
    driverBataNight: Number(f.nightBata || f.airportNightBata || 0),
    hsnSac: HSN_SAC,
  };
}

function snapshotFromBooking(b) {
  return {
    vehicle: b.fleetName || "Vehicle hire",
    tripType: b.tripType,
    tripDates: b.returnDate
      ? `${new Date(b.pickupDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} to ${new Date(b.returnDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`
      : new Date(b.pickupDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    bookingCode: b.bookingCode,
    pickupLocation: b.pickupLocation || "",
    dropLocation: b.dropLocation || "",
    airportDistanceKm: b.airportDistanceKm || b.fareBreakdown?.airportDistanceKm || null,
  };
}

export default function NewInvoicePage() {
  const [query, setQuery] = useState({ bookingId: "", invoiceId: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [invoiceId, setInvoiceId] = useState("");
  const [bookingSnapshot, setBookingSnapshot] = useState(null);
  const [savedBookings, setSavedBookings] = useState([]);
  const [form, setForm] = useState({
    invoiceNo: "",
    invoiceDate: dateInput(),
    bookingDate: "",
    client: { name: "", phone: "", email: "", address: "", gstin: "" },
    details: {
      vehicleType: "",
      totalKmsUsed: 0,
      extraKms: 0,
      extraHours: 0,
      toll: 0,
      driverBataDay: 0,
      driverBataNight: 0,
      hsnSac: HSN_SAC,
    },
    items: [],
    taxRate: 5,
    discount: 0,
    notes: "Toll, parking and state entry taxes are payable by the client unless stated otherwise.",
    paymentStatus: "unpaid",
    paymentMethod: "",
    transactionId: "",
  });

  const toast = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setQuery({ bookingId: params.get("bookingId") || "", invoiceId: params.get("invoiceId") || "" });
  }, []);

  useEffect(() => {
    if (query.bookingId || query.invoiceId) return;
    fetch("/api/bookings?status=all&sort=-createdAt", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setSavedBookings(d.bookings || []))
      .catch(() => setSavedBookings([]));
  }, [query.bookingId, query.invoiceId]);

  useEffect(() => {
    if (!query.bookingId && !query.invoiceId) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        if (query.invoiceId) {
          const res = await fetch(`/api/invoices/${query.invoiceId}`);
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Could not load invoice");
          const inv = data.invoice;
          setInvoiceId(inv._id);
          setBookingSnapshot(inv.bookingSnapshot || null);
          setForm({
            invoiceNo: inv.invoiceNo,
            invoiceDate: dateInput(inv.invoiceDate),
            bookingDate: dateInput(inv.bookingDate),
            client: inv.client || { name: "", phone: "", email: "", address: "", gstin: "" },
            details: { ...{
              vehicleType: "", totalKmsUsed: 0, extraKms: 0, extraHours: 0, toll: 0, driverBataDay: 0, driverBataNight: 0, hsnSac: HSN_SAC
            }, ...(inv.details || {}) },
            items: inv.items || [],
            taxRate: inv.taxRate ?? 5,
            discount: inv.discount ?? 0,
            notes: inv.notes || "",
            paymentStatus: inv.paymentStatus || "unpaid",
            paymentMethod: inv.paymentMethod || "",
            transactionId: inv.transactionId || "",
          });
        } else {
          const res = await fetch(`/api/bookings/${query.bookingId}`);
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Could not load booking");
          const b = data.booking;
          setBookingSnapshot(snapshotFromBooking(b));
          setForm((prev) => ({
            ...prev,
            bookingDate: dateInput(b.createdAt),
            client: { ...prev.client, name: b.name || "", phone: b.phone || "", email: b.email || "" },
            details: detailsFromBooking(b),
            items: bookingItems(b),
          }));
        }
      } catch (e) {
        toast(e.message, "error");
      } finally {
        setLoading(false);
      }
    })();
  }, [query.bookingId, query.invoiceId, toast]);

  const computed = useMemo(() => {
    const items = form.items.map((i) => ({
      ...i,
      qty: Number(i.qty || 0),
      rate: Number(i.rate || 0),
      amount: round2(Number(i.qty || 0) * Number(i.rate || 0)),
    }));
    const subtotal = round2(items.reduce((a, i) => a + i.amount, 0));
    const discount = round2(Math.max(0, Number(form.discount || 0)));
    const taxable = Math.max(0, subtotal - discount);
    const taxRate = Number(form.taxRate || 0);
    const taxAmount = round2(taxable * (taxRate / 100));
    return {
      ...form,
      items,
      subtotal,
      discount,
      taxRate,
      taxAmount,
      cgstRate: taxRate / 2,
      sgstRate: taxRate / 2,
      cgstAmount: round2(taxAmount / 2),
      sgstAmount: round2(taxAmount / 2),
      total: round2(taxable + taxAmount),
      bookingSnapshot,
    };
  }, [form, bookingSnapshot]);

  const setClient = (key, value) => setForm((p) => ({ ...p, client: { ...p.client, [key]: value } }));

  const loadSavedClient = (bookingId) => {
    const booking = savedBookings.find((b) => String(b._id) === String(bookingId));
    if (!booking) return;
    setBookingSnapshot(snapshotFromBooking(booking));
    setForm((p) => ({
      ...p,
      bookingDate: dateInput(booking.createdAt),
      client: { ...p.client, name: booking.name || "", phone: booking.phone || "", email: booking.email || "" },
      details: detailsFromBooking(booking),
      items: bookingItems(booking),
    }));
  };

  const setItem = (index, key, value) =>
    setForm((p) => ({ ...p, items: p.items.map((i, idx) => idx === index ? { ...i, [key]: value } : i) }));

  const addItem = () =>
    setForm((p) => ({ ...p, items: [...p.items, { description: "", qty: 1, unit: "item", rate: 0 }] }));

  const removeItem = (index) =>
    setForm((p) => ({ ...p, items: p.items.filter((_, idx) => idx !== index) }));

  async function save() {
    if (!form.client.name.trim()) {
      toast("Client name is required", "error");
      return null;
    }
    setSaving(true);
    try {
      const payload = {
        client: form.client,
        invoiceDate: form.invoiceDate,
        bookingDate: form.bookingDate,
        details: computed.details,
        items: computed.items,
        taxRate: 5,
        discount: computed.discount,
        notes: form.notes,
        paymentStatus: form.paymentStatus,
        paymentMethod: form.paymentMethod,
        transactionId: form.transactionId,
      };

      const res = await fetch(invoiceId ? `/api/invoices/${invoiceId}` : "/api/invoices", {
        method: invoiceId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, ...(invoiceId ? {} : { bookingId: query.bookingId || undefined }) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save invoice");

      setInvoiceId(data.invoice._id);
      setForm((p) => ({ ...p, invoiceNo: data.invoice.invoiceNo }));
      if (!invoiceId) window.history.replaceState(null, "", `/admin/invoices/new?invoiceId=${data.invoice._id}`);
      toast("Invoice saved", "success");
      return data.invoice;
    } catch (e) {
      toast(e.message, "error");
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function download() {
    const saved = invoiceId || (await save())?._id;
    if (!saved) return;
    const res = await fetch(`/api/invoices/${saved}/pdf`);
    if (!res.ok) {
      toast("Could not generate PDF", "error");
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${form.invoiceNo || "invoice"}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function share() {
    const saved = await save();
    if (!saved) return;
    setSharing(true);
    try {
      const res = await fetch(`/api/invoices/${saved._id}/share`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not share invoice");
      toast("Invoice sent to the configured admin email, client email and WhatsApp", "success");
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setSharing(false);
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin/invoices" className="mb-2 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 no-underline hover:text-orange-600"><FaArrowLeft /> Invoices</Link>
          <h1 className="font-heading text-2xl font-bold text-slate-800">
            {invoiceId ? "Edit Tax Invoice" : query.bookingId ? "Generate Tax Invoice from Booking" : "Create Manual Tax Invoice"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">Booking data is pre-filled when available. You can edit every billing field before generating the PDF.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" icon={FaSave} loading={saving} onClick={save}>Save</Button>
          <Button variant="outline" icon={FaDownload} onClick={download}>Download PDF</Button>
          <Button icon={FaShareAlt} loading={sharing} onClick={share}>Share Invoice</Button>
        </div>
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-2">
        <div className="space-y-4">
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-4 font-heading text-sm font-bold text-slate-800">Invoice details</div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Invoice number" value={form.invoiceNo || "Assigned when saved"} disabled />
              <Input label="Invoice date" type="date" value={form.invoiceDate} onChange={(e) => setForm((p) => ({ ...p, invoiceDate: e.target.value }))} />
              <Input label="Booking date" type="date" value={form.bookingDate} onChange={(e) => setForm((p) => ({ ...p, bookingDate: e.target.value }))} />
              <Select label="Payment status" value={form.paymentStatus} onChange={(e) => setForm((p) => ({ ...p, paymentStatus: e.target.value }))}>
                <option value="unpaid">Unpaid</option><option value="partial">Partial</option><option value="paid">Paid</option><option value="cancelled">Cancelled</option>
              </Select>
              <Input label="HSN / SAC" value={HSN_SAC} disabled />
              <Input label="GST rate %" value={5} disabled />
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-4 font-heading text-sm font-bold text-slate-800">Client details</div>
            {!query.bookingId && !query.invoiceId && (
              <div className="mb-4 rounded-lg bg-orange-50/60 p-3">
                <label className="mb-1.5 block text-[0.8rem] font-medium text-slate-600">Load client from an existing booking (optional)</label>
                <select defaultValue="" onChange={(e) => loadSavedClient(e.target.value)} className="w-full rounded-lg border-[1.5px] border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-orange-600">
                  <option value="">Enter manually / choose later</option>
                  {savedBookings.map((b) => <option key={b._id} value={b._id}>{b.name} · {b.phone} · {b.bookingCode}</option>)}
                </select>
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Name" required value={form.client.name} onChange={(e) => setClient("name", e.target.value)} />
              <Input label="Phone" value={form.client.phone} onChange={(e) => setClient("phone", e.target.value)} />
              <Input label="Email" type="email" value={form.client.email} onChange={(e) => setClient("email", e.target.value)} />
              <Input label="GSTIN (client, optional)" value={form.client.gstin} onChange={(e) => setClient("gstin", e.target.value)} />
              <Textarea label="Address" value={form.client.address} onChange={(e) => setClient("address", e.target.value)} className="sm:col-span-2" />
            </div>
          </section>


          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <div className="font-heading text-sm font-bold text-slate-800">Invoice line items</div>
                <div className="text-xs text-slate-400">Auto-generated from the booking, but fully editable. Add any additional charge or service.</div>
              </div>
              <Button size="sm" variant="outline" icon={FaPlus} onClick={addItem}>Add item</Button>
            </div>
            <div className="space-y-3">
              {form.items.map((item, index) => (
                <div key={item._id || index} className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
                  <div className="grid gap-3 sm:grid-cols-[1fr_75px_85px_105px_auto]">
                    <Input label="Description" value={item.description} onChange={(e) => setItem(index, "description", e.target.value)} />
                    <Input label="Qty" type="number" min="0" value={item.qty} onChange={(e) => setItem(index, "qty", e.target.value)} />
                    <Input label="Unit" value={item.unit} onChange={(e) => setItem(index, "unit", e.target.value)} />
                    <Input label="Rate ₹" type="number" min="0" value={item.rate} onChange={(e) => setItem(index, "rate", e.target.value)} />
                    <button type="button" onClick={() => removeItem(index)} className="mt-6 flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label="Remove item"><FaTrash size={12} /></button>
                  </div>
                  <div className="mt-2 text-right text-xs font-semibold text-slate-500">Amount: ₹{money(item.qty * item.rate)}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-4 font-heading text-sm font-bold text-slate-800">Tax & payment</div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Discount ₹" type="number" min="0" value={form.discount} onChange={(e) => setForm((p) => ({ ...p, discount: e.target.value }))} />
              <Input label="Payment method" value={form.paymentMethod} onChange={(e) => setForm((p) => ({ ...p, paymentMethod: e.target.value }))} />
              <Input label="Transaction / reference ID" value={form.transactionId} onChange={(e) => setForm((p) => ({ ...p, transactionId: e.target.value }))} />
            </div>
            <div className="mt-4 rounded-lg bg-orange-50 p-4 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><strong>₹{money(computed.subtotal)}</strong></div>
              {computed.discount > 0 && <div className="mt-1 flex justify-between"><span>Discount</span><strong>- ₹{money(computed.discount)}</strong></div>}
              <div className="mt-1 flex justify-between"><span>CGST @ 2.5%</span><strong>₹{money(computed.cgstAmount)}</strong></div>
              <div className="mt-1 flex justify-between"><span>SGST @ 2.5%</span><strong>₹{money(computed.sgstAmount)}</strong></div>
              <div className="mt-2 border-t border-orange-200 pt-2 flex justify-between font-bold text-orange-700"><span>Total bill</span><span>₹{money(computed.total)}</span></div>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <Textarea label="Notes / terms" value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />
          </section>
        </div>

        <div className="xl:sticky xl:top-4">
          <InvoicePreview invoice={computed} />
        </div>
      </div>
    </div>
  );
}
