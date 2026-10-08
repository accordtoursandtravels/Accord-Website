import { NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/db";
import Booking from "@/lib/models/Booking";
import { sendFeedbackRequestEmail } from "@/lib/mailer";
import { sendWhatsAppMessage, feedbackWhatsAppText } from "@/lib/whatsapp";

/**
 * Sends the feedback request 12h+ after a trip's end, once per booking.
 * Not triggered by user traffic - point an external scheduler
 * (Vercel Cron, cron-job.org, GitHub Actions) at this URL, e.g. hourly:
 *   GET /api/cron/feedback-requests?secret=CRON_SECRET
 */
export async function GET(request) {
  const secret = new URL(request.url).searchParams.get("secret");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const cutoff = new Date(Date.now() - 12 * 60 * 60 * 1000);

  const candidates = await Booking.find({
    status: "completed",
    "feedback.requested": { $ne: true },
    $or: [
      { returnDate: { $lte: cutoff } },
      { returnDate: { $exists: false }, pickupDate: { $lte: cutoff } },
    ],
  }).limit(100);

  const results = [];
  for (const booking of candidates) {
    if (!booking.feedback.token) {
      booking.feedback.token = crypto.randomBytes(16).toString("hex");
    }
    const feedbackUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/feedback/${booking.feedback.token}`;
    const channel = [];

    const emailResult = await sendFeedbackRequestEmail(booking, feedbackUrl);
    if (!emailResult.skipped) channel.push("email");

    const waResult = await sendWhatsAppMessage(booking.phone, feedbackWhatsAppText(booking, feedbackUrl));
    if (!waResult.skipped && !waResult.error) channel.push("whatsapp");

    booking.feedback.requested = true;
    booking.feedback.requestedAt = new Date();
    booking.feedback.channel = channel;
    await booking.save();

    results.push({ bookingCode: booking.bookingCode, channel });
  }

  return NextResponse.json({ processed: results.length, results });
}
