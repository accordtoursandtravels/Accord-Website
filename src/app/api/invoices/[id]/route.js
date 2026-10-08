import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Invoice from "@/lib/models/Invoice";
import { requireAdmin } from "@/lib/requireAdmin";
import { calculateInvoiceTotals, HSN_SAC } from "@/lib/invoice/helpers";

export async function GET(_request, { params }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  await connectDB();
  const { id } = await params;
  const invoice = await Invoice.findById(id).populate("booking").lean();
  if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  return NextResponse.json({ invoice });
}

export async function PUT(request, { params }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  await connectDB();
  const { id } = await params;
  const invoice = await Invoice.findById(id);
  if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  const body = await request.json();
  const totals = calculateInvoiceTotals(body.items || [], body.taxRate, body.discount);
  invoice.client = {
    name: String(body.client?.name || "").trim(), phone: String(body.client?.phone || "").trim(),
    email: String(body.client?.email || "").trim().toLowerCase(), address: String(body.client?.address || "").trim(), gstin: String(body.client?.gstin || "").trim(),
  };
  invoice.invoiceDate = body.invoiceDate ? new Date(body.invoiceDate) : invoice.invoiceDate;
  if (body.bookingDate) invoice.bookingDate = new Date(body.bookingDate);
  const details = body.details || {};
  invoice.details = {
    vehicleType: String(details.vehicleType || "").trim(),
    totalKmsUsed: Number(details.totalKmsUsed || 0),
    extraKms: Number(details.extraKms || 0),
    extraHours: Number(details.extraHours || 0),
    toll: Number(details.toll || 0),
    driverBataDay: Number(details.driverBataDay || 0),
    driverBataNight: Number(details.driverBataNight || 0),
    hsnSac: String(details.hsnSac || HSN_SAC).trim(),
  };
  invoice.items = totals.items;
  invoice.subtotal = totals.subtotal; invoice.taxRate = totals.taxRate; invoice.taxAmount = totals.taxAmount; invoice.discount = totals.discount; invoice.total = totals.total;
  invoice.notes = body.notes || ""; invoice.paymentStatus = body.paymentStatus || "unpaid"; invoice.paymentMethod = body.paymentMethod || ""; invoice.transactionId = body.transactionId || "";
  await invoice.save();
  return NextResponse.json({ invoice });
}
