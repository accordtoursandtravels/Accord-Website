import mongoose from "mongoose";
import crypto from "crypto";

const InvoiceItemSchema = new mongoose.Schema(
  {
    description: { type: String, required: true, trim: true },
    qty: { type: Number, default: 1 },
    unit: { type: String, default: "item", trim: true },
    rate: { type: Number, default: 0 },
    amount: { type: Number, default: 0 },
  },
  { _id: true }
);

const ClientSnapshotSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    address: { type: String, default: "" },
    gstin: { type: String, default: "" },
  },
  { _id: false }
);

const InvoiceDetailsSchema = new mongoose.Schema(
  {
    vehicleType: { type: String, default: "" },
    totalKmsUsed: { type: Number, default: 0 },
    extraKms: { type: Number, default: 0 },
    extraHours: { type: Number, default: 0 },
    toll: { type: Number, default: 0 },
    parking: { type: Number, default: 0 },
    driverBataDay: { type: Number, default: 0 },
    driverBataNight: { type: Number, default: 0 },
    hsnSac: { type: String, default: "SAC 9966" },
  },
  { _id: false }
);

const InvoiceSchema = new mongoose.Schema(
  {
    invoiceNo: { type: String, unique: true, index: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", default: null, index: true },
    bookingSnapshot: { type: mongoose.Schema.Types.Mixed, default: null },
    invoiceDate: { type: Date, default: Date.now },
    bookingDate: { type: Date, default: null },
    client: { type: ClientSnapshotSchema, default: () => ({}) },
    details: { type: InvoiceDetailsSchema, default: () => ({}) },
    items: { type: [InvoiceItemSchema], default: [] },
    subtotal: { type: Number, default: 0 },
    taxRate: { type: Number, default: 5 },
    taxAmount: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    notes: { type: String, default: "", trim: true },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "partial", "paid", "cancelled"],
      default: "unpaid",
    },
    paymentMethod: { type: String, default: "" },
    transactionId: { type: String, default: "" },
    shareToken: {
      type: String,
      unique: true,
      index: true,
      default: () => crypto.randomBytes(18).toString("hex"),
    },
    lastSharedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.Invoice || mongoose.model("Invoice", InvoiceSchema);
