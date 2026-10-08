import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Booking from "@/lib/models/Booking";

// GET /api/feedback/[token] (public) - loads just enough to render the feedback form
export async function GET(_request, { params }) {
  await connectDB();
  const { token } = await params;
  const booking = await Booking.findOne({ "feedback.token": token }).select(
    "bookingCode name fleetName pickupDate feedback.submittedAt"
  );
  if (!booking) return NextResponse.json({ error: "Invalid or expired link" }, { status: 404 });
  if (booking.feedback?.submittedAt) {
    return NextResponse.json({ error: "Feedback already submitted for this trip" }, { status: 409 });
  }
  return NextResponse.json({
    bookingCode: booking.bookingCode,
    name: booking.name,
    fleetName: booking.fleetName,
    pickupDate: booking.pickupDate,
  });
}

// POST /api/feedback/[token] (public) - submit rating + comment
export async function POST(request, { params }) {
  await connectDB();
  const { token } = await params;
  const { rating, comment } = await request.json();

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
  }

  const booking = await Booking.findOne({ "feedback.token": token });
  if (!booking) return NextResponse.json({ error: "Invalid or expired link" }, { status: 404 });
  if (booking.feedback?.submittedAt) {
    return NextResponse.json({ error: "Feedback already submitted" }, { status: 409 });
  }

  booking.feedback.rating = rating;
  booking.feedback.comment = comment;
  booking.feedback.submittedAt = new Date();
  await booking.save();

  return NextResponse.json({ ok: true, message: "Thank you for your feedback!" });
}
