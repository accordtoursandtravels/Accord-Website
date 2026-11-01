import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Booking from "@/lib/models/Booking";

export async function GET(request) {
  const querySecret = new URL(request.url).searchParams.get("secret");
  const headerSecret = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const secret = querySecret || headerSecret;
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const due = await Booking.find({ kycData: { $ne: null }, kycDeleteAt: { $lte: new Date() } }).select("_id").limit(100);
  for (const booking of due) {
    await Booking.updateOne(
      { _id: booking._id },
      { $set: { kycData: null, kycMimeType: "", kycDeleteAt: null } }
    );
  }
  return NextResponse.json({ ok: true, deleted: due.length });
}
