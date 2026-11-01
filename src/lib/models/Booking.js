import mongoose from "mongoose";
import crypto from "crypto";

const FeedbackSchema = new mongoose.Schema(
  {
    token: { type: String, index: true, sparse: true }, // used in the feedback link
    requested: { type: Boolean, default: false },
    requestedAt: { type: Date },
    channel: { type: [String], default: [] }, // ["email", "whatsapp"]
    submittedAt: { type: Date },
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String, trim: true },
    // admin decision on whether this appears in the public testimonials section
    testimonialStatus: {
      type: String,
      enum: ["not_reviewed", "approved", "rejected"],
      default: "not_reviewed",
    },
  },
  { _id: false }
);

const PaymentSchema = new mongoose.Schema(
  {
    // "not_required" while the site is cash/pay-driver only; flip to "pending"/"paid"
    // once the gateway (Razorpay) is wired up on top of this schema.
    status: {
      type: String,
      enum: ["not_required", "pending", "paid", "failed", "refunded"],
      default: "not_required",
    },
    amount: { type: Number },
    currency: { type: String, default: "INR" },
    gateway: { type: String, default: "" }, // "razorpay"
    gatewayOrderId: { type: String, default: "" },
    gatewayPaymentId: { type: String, default: "" },
  },
  { _id: false }
);

const BookingSchema = new mongoose.Schema(
  {
    bookingCode: { type: String, unique: true, index: true }, // e.g. ACC-A1B2C3
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },

    tripType: {
      type: String,
      enum: ["outstation", "roundtrip", "local", "airport", "rental"],
      required: true,
    },
    outstationMode: { type: String, enum: ["oneWay", "roundTrip"], default: "oneWay" },
    airportDirection: { type: String, enum: ["pickup", "drop"] },
    flightNumber: { type: String, trim: true },
    roundTripDropMode: { type: String, enum: ["pickup", "preferred"], default: "pickup" },
    pickupLocation: { type: String, required: true, trim: true },
    dropLocation: { type: String, trim: true },
    pickupDate: { type: Date, required: true },
    pickupTime: { type: String }, // "HH:mm" display value
    returnDate: { type: Date }, // drop-off date for outstation; kept as returnDate for compatibility
    dropoffTime: { type: String }, // "HH:mm" display value
    airportDistanceKm: { type: Number },
    estimatedFare: { type: Number, default: 0 },
    fareBreakdown: { type: mongoose.Schema.Types.Mixed, default: null },
    passengers: { type: Number, default: 1 },
    notes: { type: String, trim: true },

    // KYC is stored privately on the server and scheduled for deletion 30 days after trip end.
    kycData: { type: Buffer, default: null, select: false },
    kycMimeType: { type: String, default: "" },
    kycDeleteAt: { type: Date, default: null, index: true },

    fleet: { type: mongoose.Schema.Types.ObjectId, ref: "Fleet" },
    fleetName: { type: String }, // snapshot, survives fleet deletion

    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
      index: true,
    },

    payment: { type: PaymentSchema, default: () => ({}) },
    feedback: { type: FeedbackSchema, default: () => ({}) },
  },
  { timestamps: true }
);

BookingSchema.index({ createdAt: -1 });
BookingSchema.index({ pickupDate: -1 });

BookingSchema.pre("validate", function (next) {
  if (!this.bookingCode) {
    this.bookingCode = "ACC-" + crypto.randomBytes(3).toString("hex").toUpperCase();
  }
  next();
});

/** Effective end-of-trip timestamp, used to schedule the feedback request. */
BookingSchema.methods.tripEndAt = function () {
  const endDate = new Date(this.returnDate || this.pickupDate);
  const endTime = this.dropoffTime || "23:59";
  const [hours, minutes] = endTime.split(":").map(Number);
  if (!Number.isNaN(hours) && !Number.isNaN(minutes)) {
    endDate.setHours(hours, minutes, 0, 0);
  }
  return endDate;
};

export default mongoose.models.Booking || mongoose.model("Booking", BookingSchema);
