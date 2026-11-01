"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaPlus, FaDownload, FaShareAlt, FaEye, FaSearch, FaFileArchive } from "react-icons/fa";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Spinner from "@/components/ui/Spinner";
import StatusBadge from "@/components/ui/StatusBadge";
import { useToast } from "@/components/ui/ToastProvider";

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const date = (v) => v ? new Date(v).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "";
const currentMonth = () => new Date().toISOString().slice(0, 7);

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [month, setMonth] = useState(currentMonth());
  const [downloadingZip, setDownloadingZip] = useState(false);
  const toast = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (month) params.set("month", month);
      const res = await fetch(`/api/invoices?${params.toString()}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load invoices");
      setInvoices(data.invoices || []);
    } catch (e) {
      setInvoices([]);
      toast(e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [month]);

  const search = (e) => {
    e.preventDefault();
    load();
  };

  async function download(id, no) {
    const res = await fetch(`/api/invoices/${id}/pdf`);
    if (!res.ok) { toast("Could not generate PDF", "error"); return; }
    const blob = await res.blob();
    const u = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = u; a.download = `${no}.pdf`; a.click(); URL.revokeObjectURL(u);
  }

  async function share(id) {
    const res = await fetch(`/api/invoices/${id}/share`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) { toast(data.error || "Could not share invoice", "error"); return; }
    toast("Invoice shared", "success");
  }

  async function downloadMonthZip() {
    if (!month) return;
    setDownloadingZip(true);
    try {
      const res = await fetch(`/api/invoices/export?month=${month}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Could not create invoice ZIP");
      }
      const blob = await res.blob();
      const u = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = u;
      a.download = `Accord-Invoices-${month}.zip`;
      a.click();
      URL.revokeObjectURL(u);
      toast(`Downloaded ${month} invoice archive`, "success");
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setDownloadingZip(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <h1 className="font-heading mb-1 text-2xl font-bold text-slate-800">Invoices</h1>
          <p className="text-sm text-slate-500">Create, edit, download, share and archive client tax invoices.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" icon={FaFileArchive} loading={downloadingZip} onClick={downloadMonthZip}>Download Month ZIP</Button>
          <Link href="/admin/invoices/new" className="no-underline"><Button icon={FaPlus}>Manual Invoice</Button></Link>
        </div>
      </div>

      <form onSubmit={search} className="mb-5 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-[1fr_180px_auto] md:items-end">
        <div>
          <label className="mb-1.5 block text-[0.75rem] font-semibold text-slate-600">Search invoices</label>
          <div className="relative">
            <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" size={12} />
            <Input aria-label="Search invoices" placeholder="Invoice number, client or phone..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-7" />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-[0.75rem] font-semibold text-slate-600">Invoice month</label>
          <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
        </div>
        <Button type="submit">Filter</Button>
      </form>

      {loading ? <div className="flex justify-center py-16"><Spinner /></div> : invoices?.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white py-16 text-center text-sm text-slate-500">No invoices found for {month}. Create one manually or generate one from a booking.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-[0.68rem] uppercase tracking-wide text-slate-400">
              <tr><th className="px-4 py-3">Invoice</th><th className="px-4 py-3">Client</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr>
            </thead>
            <tbody>
              {invoices.map((i) => (
                <tr key={i._id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-3"><div className="font-semibold text-slate-700">{i.invoiceNo}</div>{i.bookingSnapshot?.bookingCode && <div className="mt-0.5 text-[0.68rem] text-slate-400">Booking {i.bookingSnapshot.bookingCode}</div>}</td>
                  <td className="px-4 py-3"><div className="font-medium text-slate-800">{i.client?.name}</div><div className="text-xs text-slate-400">{i.client?.phone || i.client?.email || ""}</div></td>
                  <td className="px-4 py-3 text-slate-600">{date(i.invoiceDate)}</td>
                  <td className="px-4 py-3 font-semibold">{money(i.total)}</td>
                  <td className="px-4 py-3"><StatusBadge status={i.paymentStatus || "unpaid"} /></td>
                  <td className="px-4 py-3"><div className="flex justify-end gap-1.5"><Link href={`/admin/invoices/new?invoiceId=${i._id}`} title="Edit" className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"><FaEye size={12} /></Link><button title="Download PDF" onClick={() => download(i._id, i.invoiceNo)} className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"><FaDownload size={12} /></button><button title="Share" onClick={() => share(i._id)} className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"><FaShareAlt size={12} /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
