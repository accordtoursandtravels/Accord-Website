import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Fleet from "@/lib/models/Fleet";
import { requireAdmin } from "@/lib/requireAdmin";
import { saveFleetImage } from "@/lib/uploads";
import { FLEET, RATE_CARD_VERSION } from "@/lib/constants";

// GET /api/fleet            -> public: active fleet, homepage/fleet page
// GET /api/fleet?all=true   -> admin only: everything, for the admin table
async function ensureFleetSeed() {
  const count = await Fleet.countDocuments();
  if (count === 0) {
    for (let i = 0; i < FLEET.length; i++) {
      const car = FLEET[i];
      await Fleet.create({
        name: car.name,
        category: car.category,
        seats: car.seats,
        luggage: car.luggage || 2,
        fuel: car.fuel || "Diesel",
        ac: car.ac ?? true,
        image: car.img || `/images/fleet/${car.id}.png`,
        rates: car.rates,
        rateCardVersion: RATE_CARD_VERSION,
        features: car.features || [],
        popular: Boolean(car.popular),
        active: true,
        order: i,
      });
    }
    return;
  }

  // Migrate older/empty rate cards. A few existing installations had a v2
  // document with zeroed rates, which made the booking fare and invoice show ₹0.
  // Preserve genuinely edited rate cards, but repair a completely empty one.
  const legacy = await Fleet.find({ $or: [{ rateCardVersion: { $exists: false } }, { rateCardVersion: { $lt: RATE_CARD_VERSION } }] }).sort({ order: 1, createdAt: 1 });
  for (const existing of legacy) {
    const seed = FLEET.find((car) => car.name.toLowerCase() === existing.name.toLowerCase()) || FLEET[existing.order] || FLEET[0];
    if (!seed) continue;
    existing.rates = seed.rates;
    existing.rateCardVersion = RATE_CARD_VERSION;
    await existing.save();
  }

  const emptyV2 = await Fleet.find({
    rateCardVersion: RATE_CARD_VERSION,
    'rates.outstation': 0,
    'rates.local8h': 0,
    'rates.airport40': 0,
  }).sort({ order: 1, createdAt: 1 });
  for (const existing of emptyV2) {
    const seed = FLEET.find((car) => car.name.toLowerCase() === existing.name.toLowerCase()) || FLEET[existing.order] || FLEET[0];
    if (!seed) continue;
    existing.rates = seed.rates;
    existing.rateCardVersion = RATE_CARD_VERSION;
    await existing.save();
  }
}

export async function GET(request) {
  await connectDB();
  await ensureFleetSeed();
  const showAll = new URL(request.url).searchParams.get("all") === "true";

  if (showAll) {
    const denied = await requireAdmin();
    if (denied) return denied;
    const fleet = await Fleet.find().sort({ order: 1, createdAt: -1 });
    return NextResponse.json({ fleet });
  }

  const fleet = await Fleet.find({ active: true }).sort({ order: 1, createdAt: -1 });
  return NextResponse.json({ fleet });
}

// POST /api/fleet  (admin) - multipart/form-data with an optional "image" file
export async function POST(request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  await connectDB();

  const form = await request.formData();
  const payload = parseFleetForm(form);

  const imageFile = form.get("image");
  if (imageFile && imageFile.size > 0) {
    const saved = await saveFleetImage(imageFile);
    payload.image = saved.url;
    payload.imagePublicId = saved.publicId;
  }

  const fleet = await Fleet.create(payload);
  return NextResponse.json({ fleet }, { status: 201 });
}

export function parseFleetForm(form) {
  const num = (k, fallback = 0) => {
    const v = form.get(k);
    return v === null || v === "" ? fallback : Number(v);
  };
  return {
    name: form.get("name")?.trim(),
    category: form.get("category")?.trim(),
    seats: num("seats"),
    luggage: num("luggage", 2),
    fuel: form.get("fuel")?.trim() || "Diesel",
    ac: form.get("ac") === "true",
    popular: form.get("popular") === "true",
    active: form.get("active") !== "false",
    order: num("order", 0),
    features: (form.get("features") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    rates: {
      outstation: num("rates.outstation"),
      minKm: num("rates.minKm", 300),
      driverBata: num("rates.driverBata"),
      nightBata: num("rates.nightBata"),
      local4h: num("rates.local4h"),
      local4hKm: num("rates.local4hKm", 40),
      local6h: num("rates.local6h"),
      local6hKm: num("rates.local6hKm", 0),
      local8h: num("rates.local8h"),
      local8hKm: num("rates.local8hKm", 80),
      local12h: num("rates.local12h"),
      local12hKm: num("rates.local12hKm", 0),
      extraKm: num("rates.extraKm"),
      extraHour: num("rates.extraHour"),
      airport40: num("rates.airport40"),
      airport60: num("rates.airport60"),
      airport80: num("rates.airport80"),
    },
    rateCardVersion: 2,
  };
}
