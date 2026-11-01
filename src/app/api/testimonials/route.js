import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Booking from "@/lib/models/Booking";
import { requireAdmin } from "@/lib/requireAdmin";

// GET /api/testimonials              -> public: approved feedback, for the homepage
// GET /api/testimonials?all=true     -> admin: every submitted feedback awaiting a decision
export async function GET(request) {
  await connectDB();
  const showAll = new URL(request.url).searchParams.get("all") === "true";

  if (showAll) {
    const denied = await requireAdmin();
    if (denied) return denied;
    const bookings = await Booking.find({ "feedback.submittedAt": { $exists: true } })
      .select("bookingCode name fleetName feedback pickupDate")
      .sort({ "feedback.submittedAt": -1 });
    return NextResponse.json({ testimonials: bookings });
  }

  const bookings = await Booking.find({ "feedback.testimonialStatus": "approved" })
    .select("name fleetName feedback.rating feedback.comment")
    .sort({ "feedback.submittedAt": -1 })
    .limit(12);
  return NextResponse.json({ testimonials: bookings });
}

// PATCH /api/testimonials  (admin) - { bookingId, testimonialStatus: "approved"|"rejected"|"not_reviewed" }
export async function PATCH(request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  await connectDB();

  const { bookingId, testimonialStatus } = await request.json();
  if (!["approved", "rejected", "not_reviewed"].includes(testimonialStatus)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const booking = await Booking.findByIdAndUpdate(
    bookingId,
    { "feedback.testimonialStatus": testimonialStatus },
    { new: true }
  );
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ booking });
}
