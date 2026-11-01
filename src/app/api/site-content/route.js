import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import SiteContent from "@/lib/models/SiteContent";
import { requireAdmin } from "@/lib/requireAdmin";

const DEFAULT_CITIES = [
  ["Bengaluru", "Karnataka", "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=900&q=80"],
  ["Hyderabad", "Telangana", "https://images.unsplash.com/photo-1609920658906-8223bd289001?auto=format&fit=crop&w=900&q=80"],
  ["Mumbai", "Maharashtra", "https://images.unsplash.com/photo-1566552881560-0be862a7c445?auto=format&fit=crop&w=900&q=80"],
  ["Pune", "Maharashtra", "https://images.unsplash.com/photo-1600181958094-d6f4f2c2e0c6?auto=format&fit=crop&w=900&q=80"],
  ["Delhi", "Delhi", "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=900&q=80"],
  ["Noida", "Uttar Pradesh", "https://images.unsplash.com/photo-1595846519845-68e298c2edd8?auto=format&fit=crop&w=900&q=80"],
  ["Gurugram", "Haryana", "https://images.unsplash.com/photo-1605106702734-205df224ecce?auto=format&fit=crop&w=900&q=80"],
  ["Ahmedabad", "Gujarat", "https://images.unsplash.com/photo-1599823885048-3b8f2f4f8f7b?auto=format&fit=crop&w=900&q=80"],
  ["Chennai", "Tamil Nadu", "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=900&q=80"],
  ["Kolkata", "West Bengal", "https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=900&q=80"],
  ["Kochi", "Kerala", "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=900&q=80"],
  ["Jaipur", "Rajasthan", "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=900&q=80"],
  ["Indore", "Madhya Pradesh", "https://images.unsplash.com/photo-1595658658481-d53d3f999875?auto=format&fit=crop&w=900&q=80"],
  ["Lucknow", "Uttar Pradesh", "https://images.unsplash.com/photo-1600100397608-f0107d5e1d13?auto=format&fit=crop&w=900&q=80"],
  ["Goa", "Goa", "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=900&q=80"],
  ["Mysuru", "Karnataka", "https://images.unsplash.com/photo-1600112356915-4f8e6c7d3d42?auto=format&fit=crop&w=900&q=80"],
  ["Coimbatore", "Tamil Nadu", "https://images.unsplash.com/photo-1595658658481-d53d3f999875?auto=format&fit=crop&w=900&q=80"],
  ["Visakhapatnam", "Andhra Pradesh", "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=80"],
];

const DEFAULT_PARTNERS = ["Corporate Partner 01", "Corporate Partner 02", "Corporate Partner 03", "Corporate Partner 04", "Corporate Partner 05", "Corporate Partner 06"];
const DEFAULT_TESTIMONIALS = [
  { name: "Priya Nair", role: "Traveller", company: "", city: "Bengaluru", rating: 5, text: "Booked an Innova Crysta for our Coorg trip. The driver was extremely professional and the whole journey was comfortable and enjoyable.", image: "/images/testimonials/review-roadtrip.png" },
  { name: "Rahul Menon", role: "Traveller", company: "", city: "Bengaluru", rating: 5, text: "Used Accord for my 5am airport drop. The driver was already waiting and the car was spotless. Pricing was exactly as quoted.", image: "/images/testimonials/review-airport.png" },
  { name: "Anjali Rao", role: "Travel Manager", company: "Corporate Client", city: "Bengaluru", rating: 5, text: "Accord has been our corporate cab partner for months. Reliable, punctual, professional and very responsive whenever we need a vehicle.", image: "/images/testimonials/review-corporate.png" },
  { name: "Vikram Shah", role: "Executive", company: "Corporate Client", city: "Mumbai", rating: 5, text: "Their coordination across cities has made employee and executive travel much easier for our team. Highly recommended.", image: "/images/testimonials/review-outstation.png" },
  { name: "Sneha Iyer", role: "Traveller", company: "", city: "Hyderabad", rating: 5, text: "Clean vehicle, courteous driver and a smooth family trip. Everything was handled professionally from pickup to drop.", image: "/images/testimonials/review-family.png" },
  { name: "Arjun Kapoor", role: "Event Guest", company: "", city: "Pune", rating: 5, text: "We booked multiple vehicles for an event and the team managed the schedule beautifully. Every vehicle arrived on time.", image: "/images/testimonials/review-wedding.png" },
  { name: "Meera Krishnan", role: "Traveller", company: "", city: "Chennai", rating: 5, text: "The entire outstation journey was smooth from pickup to return. The vehicle was clean and the driver was courteous throughout.", image: "/images/testimonials/review-outstation.png" },
  { name: "Rohan Desai", role: "Traveller", company: "", city: "Ahmedabad", rating: 5, text: "A very easy airport transfer experience. Clear communication, punctual pickup and no surprises in the quoted fare.", image: "/images/testimonials/review-airport-service.png" },
  { name: "Kavya Menon", role: "Family Traveller", company: "", city: "Kochi", rating: 5, text: "We had a comfortable pilgrimage trip with the family. The team was patient, helpful and kept the journey stress-free.", image: "/images/testimonials/review-pilgrimage.png" },
  { name: "Siddharth Rao", role: "Office Administrator", company: "Corporate Client", city: "Gurugram", rating: 5, text: "Excellent support for a multi-city business trip. Vehicle coordination was handled professionally and every pickup was on time.", image: "/images/testimonials/review-corporate.png" },
]

async function getContent() {
  let content = await SiteContent.findOne({ key: "main" });
  if (!content) {
    content = await SiteContent.create({
      key: "main",
      cities: DEFAULT_CITIES.map(([name, state, image], i) => ({ name, state, image, order: i })),
      partners: DEFAULT_PARTNERS.map((name, i) => ({ name, order: i })),
      testimonials: DEFAULT_TESTIMONIALS.map((t, i) => ({ ...t, order: i })),
    });
  } else {
    // Backfill images only for cities that don't have one; never overwrite an admin-uploaded image.
    let changed = false;
    for (const [name, state, image] of DEFAULT_CITIES) {
      const city = content.cities.find((c) => c.name.toLowerCase() === name.toLowerCase());
      if (city && !city.image) {
        city.image = image;
        if (!city.state) city.state = state;
        changed = true;
      }
    }

    // Recover content collections if an earlier deployment created the main
    // document but left one or more arrays empty. Existing admin entries are
    // never replaced.
    if (!content.cities?.length) {
      content.cities = DEFAULT_CITIES.map(([name, state, image], i) => ({ name, state, image, order: i }));
      changed = true;
    }
    if (!content.partners?.length) {
      content.partners = DEFAULT_PARTNERS.map((name, i) => ({ name, order: i }));
      changed = true;
    }
    if (!content.testimonials?.length) {
      content.testimonials = DEFAULT_TESTIMONIALS.map((t, i) => ({ ...t, order: i }));
      changed = true;
    } else {
      // Add photo-backed review images to older default reviews only when
      // their image field is empty; custom images are left untouched.
      for (let i = 0; i < content.testimonials.length; i++) {
        const item = content.testimonials[i];
        if (!item.image && DEFAULT_TESTIMONIALS[i]?.image) {
          item.image = DEFAULT_TESTIMONIALS[i].image;
          changed = true;
        }
      }
      // Bring the initial set up to ten reviews without overwriting custom reviews.
      if (content.testimonials.length < DEFAULT_TESTIMONIALS.length) {
        const existingNames = new Set(content.testimonials.map((x) => String(x.name || '').toLowerCase()));
        for (const seed of DEFAULT_TESTIMONIALS) {
          if (content.testimonials.length >= DEFAULT_TESTIMONIALS.length) break;
          if (existingNames.has(seed.name.toLowerCase())) continue;
          content.testimonials.push({ ...seed, order: content.testimonials.length });
          existingNames.add(seed.name.toLowerCase());
          changed = true;
        }
      }
    }
    if (changed) await content.save();
  }
  return content;
}

export async function GET(request) {
  await connectDB();
  const all = new URL(request.url).searchParams.get("all") === "true";
  if (all) {
    const denied = await requireAdmin();
    if (denied) return denied;
  }
  const content = await getContent();
  return NextResponse.json({
    cities: (content.cities || []).filter((x) => all || x.active).sort((a, b) => a.order - b.order),
    partners: (content.partners || []).filter((x) => all || x.active).sort((a, b) => a.order - b.order),
    testimonials: (content.testimonials || []).filter((x) => all || x.active).sort((a, b) => a.order - b.order),
  });
}

export async function PUT(request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  await connectDB();
  const body = await request.json();
  const content = await getContent();
  for (const key of ["cities", "partners", "testimonials"]) {
    if (Array.isArray(body[key])) content[key] = body[key];
  }
  await content.save();
  return NextResponse.json({ ok: true });
}
