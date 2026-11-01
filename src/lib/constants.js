import {
  FaCheckCircle,
  FaPhone,
  FaSnowflake,
  FaFileInvoice,
} from "react-icons/fa";
import {
  MdAirplanemodeActive,
  MdDirectionsCar,
  MdBusiness,
  MdEvent,
  MdOutlineRoute,
} from "react-icons/md";
import { GiMountainRoad } from "react-icons/gi";


/* ─── Services ─── */
export const SERVICES = [
  {
    title: "Airport Transfers",
    desc: "On-time pick-up and drop to Kempegowda International Airport. ",
    img: "/images/services/airport.png",
    Icon: MdAirplanemodeActive,
  },
  {
    title: "Outstation Trips",
    desc: "One-way and round-trip cabs to Mysuru, Coorg, Ooty, Tirupati, Chennai, Goa and beyond.",
    img: "/images/services/outstation.png",
    Icon: MdOutlineRoute,
  },
  {
    title: "Local City Rides",
    desc: "4, 6, 8 and 12-hour packages for office errands, shopping, hospital visits and events within Bengaluru.",
    img: "/images/services/local.png",
    Icon: MdDirectionsCar,
  },
  {
    title: "Pilgrimage Tours",
    desc: "Comfortable travel to Tirupati, Kukke Subramanya, Dharmasthala, Sabarimala and all major shrines.",
    img: "/images/services/pilgrimage.png",
    Icon: GiMountainRoad,
  },
  {
    title: "Corporate Travel",
    desc: "Monthly accounts, GST invoices, and dedicated vehicles. Trusted by 100+ PAN India businesses.",
    img: "/images/services/corporate.png",
    Icon: MdBusiness,
  },
  {
    title: "Wedding & Events",
    desc: "Decorated and un-decorated vehicle packages for weddings, receptions, and family functions.",
    img: "/images/services/wedding.png",
    Icon: MdEvent,
  },
];

export const TESTIMONIALS = [
  {
    name: "Priya Nair",
    city: "Koramangala, Bengaluru",
    rating: 5,
    text: "Booked an Innova Crysta for our Coorg trip. Driver was extremely professional, knew every ghat road and made the whole journey enjoyable. Will absolutely book again!",
    trip: "Bengaluru → Coorg",
  },
  {
    name: "Rahul Menon",
    city: "Whitefield, Bengaluru",
    rating: 5,
    text: "Used Accord for my 5am Kempegowda Airport drop. Driver was already waiting in the lobby. Car was spotless. Pricing exactly as quoted.",
    trip: "KIA Airport Transfer",
  },
  {
    name: "Anjali Rao",
    city: "Jayanagar, Bengaluru",
    rating: 5,
    text: "Jagadish sir and his team have been our corporate cab partner for 6 months. Reliable, punctual, and always professional. Excellent service.",
    trip: "Monthly Corporate Account",
  },
];

export const FAQS = [
  {
    q: "What is Driver Bata and why is it charged?",
    a: "Driver Bata is the driver's daily allowance on outstation trips. It is charged per trip day and shown separately from Night Bata, which applies to applicable overnight stays.",
  },
  {
    q: "Is GST applicable on the fare?",
    a: "Yes, GST at 5% is applicable on all cab services and will be clearly shown on your invoice. We provide full GST invoices for corporate accounts.",
  },
  {
    q: "Can I book a one-way outstation cab?",
    a: "Yes. One-way outstation bookings are available with a minimum billing of 300 km. Return km will not be charged to you.",
  },
  {
    q: "How far in advance should I book?",
    a: "Please book at least 1 hour in advance for airport pickups, 3 hours for airport drops and local bookings, and 24 hours for outstation trips. For peak season travel and group bookings, 3–5 days advance is ideal.",
  },
  {
    q: "Do you serve Electronic City and Whitefield routes?",
    a: "Yes. We cover all areas within BBMP limits, including Electronic City and Whitefield.",
  },
];

export const NAV_LINKS = [
  ["About", "#about"],
  ["Fleet", "#fleet"],
  ["Services", "#services"],
  ["FAQ", "#faq"],
];

/* ─── Booking page data ─── */
export const TRIP_TYPES = [
  { id: "airport", label: "Airport", Icon: MdAirplanemodeActive, desc: "Airport pickup / drop" },
  { id: "local", label: "Local", Icon: MdDirectionsCar, desc: "4 / 6 / 8 / 12 hrs" },
  { id: "outstation", label: "Outstation", Icon: MdOutlineRoute, desc: "One-way / multi-day" },
];

// Rate-card version 2 — based on the Accord India Tours & Travels rate sheet
// supplied for this update. Airport bands are 40 km, 60 km and 80 km.
export const RATE_CARD_VERSION = 2;

export const FLEET = [
  { id: "dzire", name: "Maruti Swift Dzire", seats: 4, category: "Sedan", rate: 14, rates: { outstation: 14, minKm: 300, driverBata: 300, nightBata: 200, local4h: 1090, local4hKm: 40, local8h: 2000, local8hKm: 80, extraKm: 14, extraHour: 140, airport40: 990, airport60: 1190, airport80: 1390 } },
  { id: "ertiga", name: "Maruti Ertiga", seats: 6, category: "MPV", rate: 21, rates: { outstation: 21, minKm: 300, driverBata: 400, nightBata: 250, local4h: 2490, local4hKm: 40, local8h: 3500, local8hKm: 80, extraKm: 21, extraHour: 210, airport40: 1790, airport60: 1990, airport80: 2190 } },
  { id: "innova", name: "Toyota Innova Crysta", seats: 6, category: "MUV", rate: 21, rates: { outstation: 21, minKm: 300, driverBata: 400, nightBata: 250, local4h: 2490, local4hKm: 40, local8h: 3500, local8hKm: 80, extraKm: 21, extraHour: 210, airport40: 1790, airport60: 1990, airport80: 2190 } },
  { id: "hycross", name: "Innova Hycross", seats: 7, category: "Premium MUV", rate: 23, rates: { outstation: 23, minKm: 300, driverBata: 400, nightBata: 250, local4h: 2990, local4hKm: 40, local8h: 3800, local8hKm: 80, extraKm: 23, extraHour: 250, airport40: 1890, airport60: 2090, airport80: 2290 } },
  { id: "fortuner", name: "Toyota Fortuner", seats: 6, category: "Premium SUV", rate: 35, rates: { outstation: 35, minKm: 300, driverBata: 500, nightBata: 300, local4h: 0, local4hKm: 40, local8h: 5990, local8hKm: 80, extraKm: 35, extraHour: 750, airport40: 4990, airport60: 5590, airport80: 5990 } },
  { id: "tempo", name: "Tempo Traveller", seats: 12, category: "Mini Bus", rate: 23, rates: { outstation: 23, minKm: 300, driverBata: 500, nightBata: 250, local4h: 0, local4hKm: 40, local8h: 3990, local8hKm: 80, extraKm: 23, extraHour: 250, airport40: 1890, airport60: 2090, airport80: 2290 } },
];

export const DURATIONS = [
  { label: "4 Hours / 40 Km", key: "4h", priceKey: "local4h", kmKey: "local4hKm" },
  { label: "6 Hours", key: "6h", priceKey: "local6h", kmKey: "local6hKm" },
  { label: "8 Hours / 80 Km", key: "8h", priceKey: "local8h", kmKey: "local8hKm" },
  { label: "12 Hours", key: "12h", priceKey: "local12h", kmKey: "local12hKm" },
];

/* icons used across pages */
export { FaCheckCircle, FaPhone, FaSnowflake, FaFileInvoice };
