"use client";

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const date = (v) => v ? new Date(v).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "";
const company = {
  name: "Accord Tours & Travels",
  unit: "A unit of Accord Enterprises",
  phone: "+91 81235 52002",
  gstin: "29ASNPJ2450Q1Z1",
  address: "4th Floor, 2nd Main, 3rd Cross Rd, B Channasandra,\nEast of NGEF Layout, Kasturi Nagar,\nBengaluru, Karnataka 560043",
  email: "billing@accordtoursandtravels.com",
};

export default function InvoicePreview({ invoice }) {
  const items = invoice.items || [];
  const paid = invoice.paymentStatus === "paid";
  const seal = paid ? "/images/invoice-seal-paid.jpg" : "/images/invoice-seal-unpaid.jpg";

  return (
    <div className="mx-auto min-h-[842px] w-full max-w-[595px] bg-white p-7 text-slate-900 shadow-[0_18px_60px_rgba(15,23,42,0.14)] sm:p-9" style={{ fontFamily: "Arial, sans-serif" }}>
      <div className="flex items-start justify-between gap-5 border-b border-slate-900 pb-4">
        <img src="/images/invoice-logo.jpg" alt="Accord Tours & Travels" className="h-24 w-24 object-contain" />
        <div className="text-right text-[9.5px] leading-[1.42] text-slate-800">
          <div className="text-[13px] font-bold">{company.name}</div>
          <div className="font-semibold text-orange-700">{company.unit}</div>
          <div className="mt-1 whitespace-pre-line">{company.address}</div>
          <div>{company.phone} · {company.email}</div>
          <div className="font-semibold">GSTIN: {company.gstin}</div>
        </div>
      </div>

      <h1 className="mt-6 text-center text-[20px] font-extrabold tracking-wide">TAX INVOICE</h1>

      <div className="mt-5 grid grid-cols-2 gap-7 text-[10.5px]">
        <div>
          <div className="font-bold">Billed to</div>
          <div className="mt-1">{invoice.client?.name || "Client name"}</div>
          {invoice.client?.phone && <div>Phone: {invoice.client.phone}</div>}
          {invoice.client?.email && <div className="break-all">{invoice.client.email}</div>}
          {invoice.client?.address && <div className="mt-1 whitespace-pre-line text-[9.5px] text-slate-600">{invoice.client.address}</div>}
          {invoice.client?.gstin && <div className="mt-1 font-semibold">GSTIN: {invoice.client.gstin}</div>}
        </div>
        <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-right">
          <span>Invoice no.</span><strong>{invoice.invoiceNo || "ACC-XX-00000"}</strong>
          <span>Invoice date</span><span>{date(invoice.invoiceDate) || "—"}</span>
          {invoice.bookingDate && <><span>Date of booking</span><span>{date(invoice.bookingDate)}</span></>}
          <span>HSN / SAC</span><strong>{invoice.details?.hsnSac || "SAC 9966"}</strong>
        </div>
      </div>

      {invoice.bookingSnapshot && (
        <div className="mt-5 rounded border border-slate-200 bg-slate-50 px-3 py-2 text-[9.5px] leading-4">
          {invoice.bookingSnapshot.tripDates && <div><strong>Trip dates:</strong> {invoice.bookingSnapshot.tripDates}</div>}
          {invoice.bookingSnapshot.pickupLocation && <div><strong>Pickup:</strong> {invoice.bookingSnapshot.pickupLocation}</div>}
          {invoice.bookingSnapshot.dropLocation && <div><strong>Drop / terminal:</strong> {invoice.bookingSnapshot.dropLocation}</div>}
        </div>
      )}

      <div className="mt-4 border-y border-slate-900">
        <div className="grid grid-cols-[1fr_58px_82px_94px] gap-2 py-2 text-[9.5px] font-bold">
          <span>Description</span><span className="text-right">Qty</span><span className="text-right">Rate (₹)</span><span className="text-right">Amount (₹)</span>
        </div>
        {items.map((item, index) => (
          <div key={item._id || index} className="grid grid-cols-[1fr_58px_82px_94px] gap-2 border-t border-slate-300 py-2 text-[9.5px]">
            <span className="whitespace-pre-wrap">{item.description || "Item"}</span>
            <span className="text-right">{item.qty} {item.unit || ""}</span>
            <span className="text-right">{Number(item.rate || 0) ? money(item.rate) : "Included"}</span>
            <span className="text-right">{money(item.amount ?? Number(item.qty || 0) * Number(item.rate || 0))}</span>
          </div>
        ))}
      </div>

      <div className="mt-5 ml-auto w-full max-w-[245px] text-[9.5px]">
        <div className="flex justify-between py-1"><span>Subtotal</span><span>{money(invoice.subtotal)}</span></div>
        {Number(invoice.discount) > 0 && <div className="flex justify-between py-1"><span>Discount</span><span>- {money(invoice.discount)}</span></div>}
        <div className="flex justify-between py-1"><span>CGST @ 2.5%</span><span>{money(invoice.cgstAmount ?? Number(invoice.taxAmount || 0) / 2)}</span></div>
        <div className="flex justify-between py-1"><span>SGST @ 2.5%</span><span>{money(invoice.sgstAmount ?? Number(invoice.taxAmount || 0) / 2)}</span></div>
        <div className="mt-1 flex justify-between border-y border-slate-900 py-2 text-[10.5px] font-bold"><span>Total bill</span><span>{money(invoice.total)}</span></div>
      </div>

      <div className="mt-7 flex items-end justify-between gap-5 border-t border-slate-200 pt-4">
        <div className="max-w-[385px] text-[8.5px] leading-4 text-slate-500">
          <div className="whitespace-pre-line">{invoice.notes || "Toll, parking and state entry taxes are payable by the client unless stated otherwise."}</div>
          <div className="mt-1">This is a computer-generated tax invoice.</div>
          {invoice.paymentMethod && <div>Payment method: {invoice.paymentMethod}</div>}
          {invoice.transactionId && <div>Reference: {invoice.transactionId}</div>}
        </div>
        <img src={seal} alt="Accord invoice seal" className="h-[92px] w-[92px] shrink-0 object-contain" />
      </div>
    </div>
  );
}
