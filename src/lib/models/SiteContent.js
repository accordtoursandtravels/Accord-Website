import mongoose from "mongoose";

const CitySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  state: { type: String, default: "", trim: true },
  image: { type: String, default: "" },
  imagePublicId: { type: String, default: "" },
  active: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { _id: true });

const PartnerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  logo: { type: String, default: "" },
  logoPublicId: { type: String, default: "" },
  active: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { _id: true });

const TestimonialSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  role: { type: String, default: "" },
  company: { type: String, default: "" },
  city: { type: String, default: "" },
  rating: { type: Number, min: 1, max: 5, default: 5 },
  text: { type: String, required: true, trim: true },
  image: { type: String, default: "" },
  imagePublicId: { type: String, default: "" },
  active: { type: Boolean, default: true },
  featured: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { _id: true, timestamps: true });

const SiteContentSchema = new mongoose.Schema({
  key: { type: String, unique: true, default: "main" },
  cities: { type: [CitySchema], default: [] },
  partners: { type: [PartnerSchema], default: [] },
  testimonials: { type: [TestimonialSchema], default: [] },
}, { timestamps: true });

export default mongoose.models.SiteContent || mongoose.model("SiteContent", SiteContentSchema);
