import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Booking from "@/lib/models/Booking";
import Fleet from "@/lib/models/Fleet";
import { requireAdmin } from "@/lib/requireAdmin";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  await connectDB();

  const [statusCounts, fleetCount, pendingFeedback] = await Promise.all([
    Booking.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Fleet.countDocuments({ active: true }),
    Booking.countDocuments({
      "feedback.submittedAt": { $exists: true },
      "feedback.testimonialStatus": "not_reviewed",
    }),
  ]);

  const byStatus = { pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
  statusCounts.forEach((s) => (byStatus[s._id] = s.count));

  return NextResponse.json({
    bookings: byStatus,
    totalBookings: Object.values(byStatus).reduce((a, b) => a + b, 0),
    activeFleet: fleetCount,
    pendingFeedback,
  });
}
