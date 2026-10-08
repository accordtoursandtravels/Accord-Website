import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Booking from "@/lib/models/Booking";
import { requireAdmin } from "@/lib/requireAdmin";

export async function GET(_request, { params }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  await connectDB();
  const { id } = await params;
  const booking = await Booking.findById(id).select("+kycData kycMimeType name kycDeleteAt");
  if (!booking?.kycData) return NextResponse.json({ error: "KYC document not found" }, { status: 404 });
  return new NextResponse(booking.kycData, { headers: { "Content-Type": booking.kycMimeType || "image/jpeg", "Cache-Control": "private, no-store", "Content-Disposition": `inline; filename="${booking.name.replace(/[^a-z0-9_-]/gi, "_")}-kyc"` } });
}
