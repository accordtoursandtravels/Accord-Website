import { NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/db";
import Booking from "@/lib/models/Booking";
import { requireAdmin } from "@/lib/requireAdmin";
import { sendStatusUpdateToCustomer } from "@/lib/mailer";

const VALID_STATUS = ["pending", "confirmed", "completed", "cancelled"];

// PATCH /api/bookings/[id]  (admin) - update status and/or other fields.
// Marking a booking "completed" issues the feedback token (the actual
// send happens from the /api/cron/feedback-requests job, 12h after trip end).
export async function PATCH(request, { params }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  await connectDB();

  const { id } = await params;
  const body = await request.json();
  const booking = await Booking.findById(id);
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (body.status) {
    if (!VALID_STATUS.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    booking.status = body.status;
    if (body.status === "completed" && !booking.feedback?.token) {
      booking.feedback.token = crypto.randomBytes(16).toString("hex");
    }
  }

  ["name", "phone", "email", "pickupLocation", "dropLocation", "notes", "passengers"].forEach((k) => {
    if (body[k] !== undefined) booking[k] = body[k];
  });
  if (body.pickupDate) booking.pickupDate = body.pickupDate;
  if (body.returnDate) booking.returnDate = body.returnDate;
  if (body.dropoffTime !== undefined) booking.dropoffTime = body.dropoffTime;
  if (body.outstationMode !== undefined) booking.outstationMode = body.outstationMode;
  if (body.roundTripDropMode !== undefined) booking.roundTripDropMode = body.roundTripDropMode;
  if (body.estimatedFare !== undefined) booking.estimatedFare = Number(body.estimatedFare || 0);
  if (body.fareBreakdown !== undefined) booking.fareBreakdown = body.fareBreakdown;

  if (booking.kycDeleteAt || booking.kycData) {
    const tripEnd = new Date(booking.returnDate || booking.pickupDate);
    if (booking.returnDate && booking.dropoffTime) {
      const [hours, minutes] = String(booking.dropoffTime).split(":").map(Number);
      if (!Number.isNaN(hours) && !Number.isNaN(minutes)) tripEnd.setHours(hours, minutes, 0, 0);
    }
    booking.kycDeleteAt = new Date(tripEnd.getTime() + 30 * 24 * 60 * 60 * 1000);
  }

  await booking.save();

  if (body.status) {
    sendStatusUpdateToCustomer(booking).catch((e) => console.error("[bookings] status email failed", e));
  }

  return NextResponse.json({ booking });
}

export async function GET(_request, { params }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  await connectDB();
  const { id } = await params;
  const booking = await Booking.findById(id).populate("fleet", "name image");
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ booking });
}


export async function DELETE(_request, { params }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  await connectDB();
  const { id } = await params;
  const booking = await Booking.findByIdAndDelete(id);
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
