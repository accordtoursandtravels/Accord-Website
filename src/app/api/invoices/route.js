import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Invoice from "@/lib/models/Invoice";
import Booking from "@/lib/models/Booking";
import { requireAdmin } from "@/lib/requireAdmin";
import { calculateInvoiceTotals, buildInvoiceItemsFromBooking, buildInvoiceDetailsFromBooking, HSN_SAC } from "@/lib/invoice/helpers";
import { nextInvoiceNumber } from "@/lib/invoice/number";

function cleanClient(client = {}) {
  return {
    name: String(client.name || "").trim(),
    phone: String(client.phone || "").trim(),
    email: String(client.email || "").trim().toLowerCase(),
    address: String(client.address || "").trim(),
    gstin: String(client.gstin || "").trim(),
  };
}

function bookingSnapshot(booking) {
  if (!booking) return null;
  const start = booking.pickupDate ? new Date(booking.pickupDate) : null;
  const end = booking.returnDate ? new Date(booking.returnDate) : start;
  return {
    bookingCode: booking.bookingCode,
    vehicle: booking.fleetName || "Vehicle hire",
    tripType: booking.tripType,
    tripDates: start ? `${start.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}${end && end.getTime() !== start?.getTime() ? ` to ${end.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}` : ""}` : "",
    pickupLocation: booking.pickupLocation || "",
    dropLocation: booking.dropLocation || "",
    airportDistanceKm: booking.airportDistanceKm || booking.fareBreakdown?.airportDistanceKm || null,
    outstationMode: booking.outstationMode || "oneWay",
  };
}

export async function GET(request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  await connectDB();
  const params = new URL(request.url).searchParams;
  const q = params.get("q") || "";
  const month = params.get("month") || "";
  const filter = q ? { $or: [{ invoiceNo: new RegExp(q, "i") }, { "client.name": new RegExp(q, "i") }, { "client.phone": new RegExp(q, "i") }] } : {};
  if (/^\d{4}-\d{2}$/.test(month)) {
    const [year, monthNumber] = month.split("-").map(Number);
    filter.invoiceDate = { $gte: new Date(Date.UTC(year, monthNumber - 1, 1)), $lt: new Date(Date.UTC(year, monthNumber, 1)) };
  }
  const invoices = await Invoice.find(filter).sort({ invoiceDate: -1, createdAt: -1 }).limit(500).lean();
  return NextResponse.json({ invoices });
}

export async function POST(request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  await connectDB();
  const body = await request.json();
  let booking = null;
  if (body.bookingId) booking = await Booking.findById(body.bookingId);

  const client = cleanClient(body.client || (booking ? { name: booking.name, phone: booking.phone, email: booking.email } : {}));
  if (!client.name) return NextResponse.json({ error: "Client name is required." }, { status: 400 });

  const itemsInput = Array.isArray(body.items) && body.items.length ? body.items : (booking ? buildInvoiceItemsFromBooking(booking) : []);
  const totals = calculateInvoiceTotals(itemsInput, body.taxRate ?? 5, body.discount);
  const details = body.details || (booking ? buildInvoiceDetailsFromBooking(booking) : {});
  const invoice = await Invoice.create({
    invoiceNo: await nextInvoiceNumber(),
    booking: booking?._id || null,
    bookingSnapshot: bookingSnapshot(booking),
    invoiceDate: body.invoiceDate ? new Date(body.invoiceDate) : new Date(),
    bookingDate: booking?.createdAt || (body.bookingDate ? new Date(body.bookingDate) : null),
    client,
    details: {
      vehicleType: String(details.vehicleType || booking?.fleetName || "").trim(),
      totalKmsUsed: Number(details.totalKmsUsed || 0),
      extraKms: Number(details.extraKms || 0),
      extraHours: Number(details.extraHours || 0),
      toll: Number(details.toll || 0),
      driverBataDay: Number(details.driverBataDay || 0),
      driverBataNight: Number(details.driverBataNight || 0),
      hsnSac: String(details.hsnSac || HSN_SAC).trim(),
    },
    items: totals.items,
    subtotal: totals.subtotal,
    taxRate: totals.taxRate,
    taxAmount: totals.taxAmount,
    discount: totals.discount,
    total: totals.total,
    notes: body.notes || "Toll, parking and state entry taxes are payable by the client unless stated otherwise.",
    paymentStatus: body.paymentStatus || "unpaid",
    paymentMethod: body.paymentMethod || "",
    transactionId: body.transactionId || "",
  });
  return NextResponse.json({ invoice }, { status: 201 });
}
