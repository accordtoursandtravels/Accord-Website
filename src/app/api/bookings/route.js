import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Booking from "@/lib/models/Booking";
import Fleet from "@/lib/models/Fleet";
import { requireAdmin } from "@/lib/requireAdmin";
import {
  sendBookingNotificationToAdmin,
  sendBookingConfirmationToCustomer,
} from "@/lib/mailer";

// GET /api/bookings  (admin only) - supports filter/sort/date-range for the
// admin table: ?status=pending&from=2026-08-01&to=2026-08-31&sort=-createdAt&q=search
export async function GET(request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  await connectDB();

  const params = new URL(request.url).searchParams;
  const status = params.get("status");
  const from = params.get("from");
  const to = params.get("to");
  const q = params.get("q");
  const sort = params.get("sort") || "-createdAt";

  const filter = {};
  if (status && status !== "all") filter.status = status;
  if (from || to) {
    filter.pickupDate = {};
    if (from) filter.pickupDate.$gte = new Date(from);
    if (to) filter.pickupDate.$lte = new Date(to + "T23:59:59.999Z");
  }
  if (q) {
    filter.$or = [
      { name: new RegExp(q, "i") },
      { phone: new RegExp(q, "i") },
      { email: new RegExp(q, "i") },
      { bookingCode: new RegExp(q, "i") },
      { pickupLocation: new RegExp(q, "i") },
    ];
  }

  const bookings = await Booking.find(filter).sort(sort).populate("fleet", "name image");
  return NextResponse.json({ bookings });
}

// POST /api/bookings  (public) - creates the booking, snapshots the fleet
// name, emails the admin, and confirms to the customer. Front-end shows the
// "confirmed within 3 hours" message immediately on success.
export async function POST(request) {
  await connectDB();
  const contentType = request.headers.get("content-type") || "";
  let body;
  let kycFile = null;

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    body = JSON.parse(String(form.get("booking") || "{}"));
    const uploaded = form.get("kyc");
    if (uploaded && typeof uploaded !== "string" && uploaded.size > 0) kycFile = uploaded;
  } else {
    body = await request.json();
  }

  const required = ["name", "phone", "tripType", "pickupLocation", "pickupDate"];
  const missing = required.filter((k) => !body[k]);
  if (missing.length) {
    return NextResponse.json(
      { error: `Missing required fields: ${missing.join(", ")}` },
      { status: 400 }
    );
  }

  if ((body.tripType === "outstation" || body.tripType === "local") && !body.dropLocation) {
    return NextResponse.json({ error: "A drop-off location is required for this trip type." }, { status: 400 });
  }
  if (body.tripType === "outstation" && (!body.returnDate || !body.dropoffTime)) {
    return NextResponse.json({ error: "Outstation bookings require a drop-off date and drop-off time." }, { status: 400 });
  }
  if (body.tripType === "outstation" && !["oneWay", "roundTrip"].includes(body.outstationMode)) {
    return NextResponse.json({ error: "Select one-way or round-trip for outstation." }, { status: 400 });
  }
  if (body.tripType === "airport") {
    const airportDistanceKm = Number(body.airportDistanceKm || body.fareBreakdown?.airportDistanceKm || 0);
    if (!airportDistanceKm || airportDistanceKm <= 0 || airportDistanceKm > 80) {
      return NextResponse.json({ error: "Airport bookings require a distance from KIA between 1 and 80 km." }, { status: 400 });
    }
  }

  if (!kycFile) {
    return NextResponse.json({ error: "Aadhaar card photo is required for KYC." }, { status: 400 });
  }
  if (!["image/jpeg", "image/png", "image/webp"].includes(kycFile.type)) {
    return NextResponse.json({ error: "Unsupported Aadhaar image type. Use JPG, PNG or WEBP." }, { status: 400 });
  }
  if (kycFile.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Aadhaar image is too large. Maximum size is 5MB." }, { status: 400 });
  }

  let fleetName = body.fleetName || "";
  if (body.fleet) {
    const fleetDoc = await Fleet.findById(body.fleet);
    if (fleetDoc) fleetName = fleetDoc.name;
  }

  const kycBuffer = Buffer.from(await kycFile.arrayBuffer());
  const tripEnd = new Date(body.returnDate || body.pickupDate);
  if (body.returnDate && body.dropoffTime) {
    const [hours, minutes] = String(body.dropoffTime).split(":").map(Number);
    if (!Number.isNaN(hours) && !Number.isNaN(minutes)) tripEnd.setHours(hours, minutes, 0, 0);
  }
  const kycDeleteAt = new Date(tripEnd.getTime() + 30 * 24 * 60 * 60 * 1000);

  const booking = await Booking.create({
    name: body.name,
    phone: body.phone,
    email: body.email,
    tripType: body.tripType,
    outstationMode: body.outstationMode || "oneWay",
    roundTripDropMode: body.roundTripDropMode || "pickup",
    pickupLocation: body.pickupLocation,
    dropLocation: body.dropLocation,
    pickupDate: body.pickupDate,
    pickupTime: body.pickupTime,
    returnDate: body.returnDate || undefined,
    dropoffTime: body.dropoffTime || undefined,
    airportDistanceKm: body.airportDistanceKm ? Number(body.airportDistanceKm) : undefined,
    estimatedFare: Number(body.estimatedFare || 0),
    fareBreakdown: body.fareBreakdown || null,
    passengers: body.passengers || 1,
    notes: body.notes,
    kycData: kycBuffer,
    kycMimeType: kycFile.type,
    kycDeleteAt,
    fleet: body.fleet || undefined,
    fleetName,
  });

  // Fire-and-forget: don't block the response on email delivery.
  sendBookingNotificationToAdmin(booking).catch((e) => console.error("[bookings] admin email failed", e));
  sendBookingConfirmationToCustomer(booking).catch((e) => console.error("[bookings] customer email failed", e));

  return NextResponse.json(
    { booking, message: "Booking received. Our team will confirm within 3 hours." },
    { status: 201 }
  );
}
