import mongoose from "mongoose";

const CounterSchema = new mongoose.Schema(
  {
    _id: { type: String },
    value: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Counter || mongoose.model("Counter", CounterSchema);
