// One-time migration of the hardcoded FLEET list (src/lib/constants.js)
// into MongoDB. Safe to re-run - it upserts by name.
// Usage: npm run seed   (needs MONGODB_URI in .env.local)
import "dotenv/config";
import mongoose from "mongoose";
import Fleet from "../src/lib/models/Fleet.js";
import { FLEET } from "../src/lib/constants.js";

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is not set - copy .env.example to .env.local first.");
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGODB_URI);

  let i = 0;
  for (const car of FLEET) {
    await Fleet.findOneAndUpdate(
      { name: car.name },
      {
        name: car.name,
        category: car.category,
        seats: car.seats,
        luggage: car.luggage,
        fuel: car.fuel,
        ac: car.ac,
        image: car.img, // existing files already live in /public/images/fleet
        rates: car.rates,
        features: car.features,
        popular: Boolean(car.popular),
        active: true,
        order: i++,
      },
      { upsert: true, new: true }
    );
  }

  console.log(`Seeded ${FLEET.length} fleet vehicles.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
