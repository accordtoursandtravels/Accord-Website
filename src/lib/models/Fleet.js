import mongoose from "mongoose";

const RatesSchema = new mongoose.Schema(
  {
    outstation: { type: Number, default: 0 },
    minKm: { type: Number, default: 300 },
    driverBata: { type: Number, default: 0 },
    nightBata: { type: Number, default: 0 },
    local4h: { type: Number, default: 0 },
    local4hKm: { type: Number, default: 40 },
    local8h: { type: Number, default: 0 },
    local8hKm: { type: Number, default: 80 },
    extraKm: { type: Number, default: 0 },
    extraHour: { type: Number, default: 0 },
    airport40: { type: Number, default: 0 },
    airport60: { type: Number, default: 0 },
    airport80: { type: Number, default: 0 },
  },
  { _id: false }
);

const FleetSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    seats: { type: Number, required: true },
    luggage: { type: Number, default: 2 },
    fuel: { type: String, default: "Diesel" },
    ac: { type: Boolean, default: true },
    image: { type: String, default: "" },
    imagePublicId: { type: String, default: "" },
    rates: { type: RatesSchema, default: () => ({}) },
    rateCardVersion: { type: Number, default: 2 },
    features: { type: [String], default: [] },
    popular: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

FleetSchema.index({ order: 1, createdAt: -1 });

export default mongoose.models.Fleet || mongoose.model("Fleet", FleetSchema);
