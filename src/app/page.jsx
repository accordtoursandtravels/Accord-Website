"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import PublicHeader from "@/components/site/PublicHeader";
import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaWhatsapp,
  FaCheckCircle,
  FaQuoteLeft,
  FaArrowRight,
  FaChevronDown,
  FaChevronUp,
  FaStar,
  FaUsers,
  FaShieldAlt,
  FaFileInvoice,
  FaSnowflake,
  FaSuitcase,
  FaTachometerAlt,
  FaGasPump,
} from "react-icons/fa";
import { SERVICES, FAQS } from "@/lib/constants";
import FleetSlider from "@/components/fleet/FleetSlider";
import Testimonials from "@/components/home/Testimonials";
import {
  CitiesSection,
  PartnersMarquee,
} from "@/components/home/CitiesPartners";
import BusEnquiry from "@/components/home/BusEnquiry";

export default function Home() {
  const [faqOpen, setFaqOpen] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState("outstation");

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 70);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div className="bg-white text-slate-800 font-sans">
      <PublicHeader />

      {/* ── HERO ── */}
      <section className="relative flex min-h-[90vh] items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-[center_55%] brightness-100"
          style={{
            backgroundImage: "url(/images/homepage/hero.png)",
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(15,23,42,0.92)_0%,rgba(15,23,42,0.70)_55%,rgba(15,23,42,0.25)_100%)]" />

        <div className="relative z-2 mx-auto w-full max-w-6xl px-6 py-16">
          <div className="max-w-[640px]">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-600/38 bg-orange-600/18 px-4 py-[0.35rem]">
              <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-orange-600" />
              <span className="text-[0.72rem] font-semibold tracking-[0.08em] text-[#fca888] uppercase">
                India&apos;s Trusted Cab Partner Since 2016
              </span>
            </div>

            <h1 className="font-heading mb-5 text-[clamp(2rem,5.5vw,3.75rem)] leading-[1.15] font-extrabold text-white">
              Reliable Cab Service
              <br />
              <span className="text-orange-600">Across India &amp; Beyond</span>
            </h1>
            <p className="mb-8 max-w-[540px] text-base leading-[1.8] font-light text-white/70">
              Airport transfers, outstation trips, local city rides, pilgrimages
              and corporate travel — well-maintained fleet, professional
              drivers, honest pricing.
            </p>

            <div className="mb-10 flex flex-wrap gap-3">
              {[
                [FaCheckCircle, "100% Verified Drivers"],
                [FaShieldAlt, "No Hidden Charges"],
                [FaClock, "24×7 Available"],
              ].map(([Icon, text]) => (
                <div
                  key={text}
                  className="flex items-center gap-1.5 text-[0.8rem] font-medium text-white/80"
                >
                  <span className="text-orange-600">
                    <Icon size={13} />
                  </span>{" "}
                  {text}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3.5 -translate-y-3">
              <Link
                href="/booking"
                className="font-heading inline-flex items-center gap-2 rounded-lg bg-orange-600 px-8 py-[0.9rem] text-[0.95rem] font-bold text-white no-underline shadow-[0_8px_24px_rgba(234,88,12,0.4)] transition-all duration-250 hover:-translate-y-0.5 hover:bg-orange-700"
              >
                Book a Cab Now <FaArrowRight size={14} />
              </Link>
              <a
                href="#services"
                className="font-heading inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-8 py-[0.9rem] text-[0.95rem] font-semibold text-white no-underline backdrop-blur-[8px] transition-colors duration-250 hover:bg-white/18"
              >
                Our Services
              </a>
            </div>
          </div>
        </div>

        {/* stats bar */}
        <div className="absolute inset-x-0 bottom-0 bg-white/97 backdrop-blur-[12px]">
          <div className="mx-auto grid max-w-6xl grid-cols-5">
            {[
              ["30+", "Vehicles in Fleet"],
              ["50K+", "Happy Trips"],
              ["4.9", "Google Rating"],
              ["8+", "Years of Trust"],
              ["170+", "Cities Covered Across India"],
            ].map(([v, l], i) => (
              <div
                key={l}
                className={`px-4 py-[1.1rem] text-center ${i < 3 ? "border-r border-slate-200" : ""}`}
              >
                <div className="font-heading flex items-center justify-center gap-1 text-2xl font-bold text-orange-600">
                  {v}
                  {l === "Google Rating" && (
                    <FaStar size={14} className="mt-0.5 text-amber-500" />
                  )}
                </div>
                <div className="mt-0.5 text-[0.72rem] font-medium text-slate-500">
                  {l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" className="bg-white px-6 py-[clamp(4rem,7vw,6rem)]">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 md:grid-cols-2">
          <div>
            <span className="mb-4 inline-block rounded bg-orange-50 px-3.5 py-[0.35rem] text-[0.72rem] font-bold tracking-[0.12em] text-orange-600 uppercase">
              About Accord
            </span>
            <h2 className="font-heading mb-5 text-[clamp(1.75rem,3.5vw,2.5rem)] leading-[1.25] font-bold text-slate-800">
              Bengaluru&apos;s Most Trusted
              <br />
              <span className="text-orange-600">Cab Service</span>
            </h2>
            <p className="mb-4 text-[0.9375rem] leading-[1.85] text-slate-500">
              Founded in 2016 by Jagadish.I, Accord Tours &amp; Travels started
              with 2 cars and one unbreakable promise honest pricing,
              professional drivers, and zero surprises. Eight years later, we
              operate a fleet of 30+ vehicles serving thousands of rides every
              month across Bengaluru, Karnataka and India.
            </p>
            <p className="mb-8 text-[0.9375rem] leading-[1.85] text-slate-500">
              From a 4am Kempegowda Airport transfer to a 5-day Tirupati
              pilgrimage tour every booking is treated with the same attention
              and care.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                [FaCheckCircle, "No Hidden Charges"],
                [FaPhone, "24×7 Support"],
                [FaSnowflake, "AC Vehicles"],
                [FaFileInvoice, "GST Invoices Provided"],
              ].map(([Icon, text]) => (
                <div
                  key={text}
                  className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-[0.7rem] text-[0.8rem] font-medium text-slate-800"
                >
                  <span className="text-orange-600">
                    <Icon size={14} />
                  </span>{" "}
                  {text}
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="overflow-hidden rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/homepage/cab driver waiting to pick client.png"
                alt="Professional driver"
                className="block h-[420px] w-full object-cover"
              />
            </div>
            <div className="absolute -right-5 -bottom-5 rounded-[10px] bg-orange-600 px-7 py-5 text-center shadow-[0_16px_40px_rgba(234,88,12,0.35)]">
              <div className="font-heading text-[1.85rem] leading-none font-extrabold text-white">
                4.9
              </div>
              <div className="my-[3px] flex justify-center gap-[2px]">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} size={11} color="#fff" />
                ))}
              </div>
              <div className="text-[0.65rem] font-medium text-white/80">
                Google Rating
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section
        id="services"
        className="bg-slate-50 px-6 py-[clamp(4rem,7vw,6rem)]"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <span className="mb-3 inline-block rounded bg-orange-50 px-3.5 py-[0.35rem] text-[0.72rem] font-bold tracking-[0.12em] text-orange-600 uppercase">
              What We Offer
            </span>
            <h2 className="font-heading text-[clamp(1.75rem,3.5vw,2.4rem)] font-bold text-slate-800">
              Our Services
            </h2>
            <p className="mt-2 text-[0.9rem] text-slate-500">
              Every kind of road travel, handled with care.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s) => (
              <div
                key={s.title}
                className="group cursor-default overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-250 hover:-translate-y-1 hover:border-[#fbd5c0] hover:shadow-[0_12px_36px_rgba(234,88,12,0.1)]"
              >
                <div className="relative h-[190px] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.img}
                    alt={s.title}
                    className="h-full w-full object-cover transition-transform duration-400 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(15,23,42,0.55)_0%,transparent_60%)]" />
                </div>
                <div className="px-6 py-5">
                  <div className="mb-2 flex items-center gap-2.5">
                    <span className="text-orange-600">
                      <s.Icon size={18} />
                    </span>
                    <h3 className="font-heading text-base font-semibold text-slate-800">
                      {s.title}
                    </h3>
                  </div>
                  <p className="text-[0.845rem] leading-[1.7] text-slate-500">
                    {s.desc}
                  </p>
                  <Link
                    href="/booking"
                    className="mt-4 inline-flex items-center gap-1.5 text-[0.8rem] font-semibold text-orange-600 no-underline transition-all hover:gap-2.5"
                  >
                    Book Now <FaArrowRight size={11} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FLEET / RATE CARDS ── */}
      <section id="fleet" className="bg-white px-6 py-[clamp(4rem,7vw,6rem)]">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 text-center">
            <span className="mb-3 inline-block rounded bg-orange-50 px-3.5 py-[0.35rem] text-[0.72rem] font-bold tracking-[0.12em] text-orange-600 uppercase">
              Our Fleet &amp; Rates
            </span>
            <h2 className="font-heading mb-2 text-[clamp(1.75rem,3.5vw,2.4rem)] font-bold text-slate-800">
              Choose Your Cab
            </h2>
            <p className="text-[0.9rem] text-slate-500">
              Transparent rates. All prices inclusive of fuel &amp; driver. GST
              at 5% extra.
            </p>
          </div>

          {/* tab selector */}
          <div className="mb-10 flex flex-wrap justify-center gap-2">
            {[
              ["outstation", "Outstation / One-Way"],
              ["local", "Local Package"],
              ["airport", "Airport Transfer"],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`font-heading rounded-full border-[1.5px] px-5 py-[0.55rem] text-[0.8rem] font-semibold transition-all ${
                  activeTab === key
                    ? "border-orange-600 bg-orange-600 text-white"
                    : "border-slate-200 bg-white text-slate-500"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <FleetSlider activeTab={activeTab} />

          <div className="mt-6 flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-5 py-3.5 text-[0.82rem] text-amber-800">
            <FaShieldAlt size={14} className="mt-0.5 shrink-0 text-amber-600" />
            <span>
              <strong>Note:</strong> All rates are base fares. GST @ 5% extra.
              Toll charges are payable separately at actuals. Airport parking,
              where applicable, is also separate. Driver Bata is declared
              upfront in the quote.
            </span>
          </div>
          <div className="mt-6 text-center">
            <Link
              href="/rate-card"
              className="font-heading text-sm font-semibold text-orange-600 no-underline hover:text-orange-700"
            >
              View complete vehicle-wise rate card →
            </Link>
          </div>
        </div>
      </section>

      <BusEnquiry />

      <PartnersMarquee />

      <CitiesSection />

      {/* ── FOUNDER ── */}
      <section
        id="founder"
        className="bg-slate-50 px-6 py-[clamp(4rem,7vw,6rem)]"
      >
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 md:grid-cols-2">
          <div className="relative">
            <div className="overflow-hidden rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1607642857266-88f5f03e66c6?w=600&h=700&fit=crop&auto=format"
                alt="Jagadish G., Founder"
                className="block h-[480px] w-full object-cover"
              />
            </div>
            <div className="absolute top-6 -left-3 h-[72px] w-[5px] rounded-[3px] bg-orange-600" />
          </div>
          <div>
            <span className="mb-4 inline-block rounded bg-orange-50 px-3.5 py-[0.35rem] text-[0.72rem] font-bold tracking-[0.12em] text-orange-600 uppercase">
              Meet the Founder
            </span>
            <h2 className="font-heading mb-1 text-[clamp(1.75rem,3.5vw,2.4rem)] font-bold text-slate-800">
              Jagadish I.
            </h2>
            <p className="mb-5 text-[0.875rem] font-semibold text-orange-600">
              Founder &amp; Director, Accord Tours &amp; Travels
            </p>
            <div className="mb-5 flex gap-2">
              <FaQuoteLeft
                size={28}
                className="mt-0.5 shrink-0 text-orange-600 opacity-25"
              />
              <blockquote className="text-[0.9375rem] leading-[1.8] text-slate-500 italic">
                I drove cabs for over a decade on Bengaluru&apos;s roads before
                founding Accord. I know what passengers need, someone who shows
                up on time, takes the fastest route, and never cheats on the
                fare. That is the culture I have built into every driver on our
                team.
              </blockquote>
            </div>
            <p className="mb-8 text-[0.9rem] leading-[1.8] text-slate-500">
              Jagadish launched Accord in 2016 with 2 cars and a firm
              no-hidden-charges policy. Today the fleet covers 30+ vehicles and
              handles 1500+ trips monthly across Bengaluru, Pune, Mumbai,
              Hyderabad, and all major metro citiies.
            </p>
            <div className="grid grid-cols-3 gap-3.5">
              {[
                ["2016", "Founded"],
                ["30+", "Vehicles"],
                ["1500+", "Trips/Month"],
              ].map(([v, l]) => (
                <div
                  key={l}
                  className="rounded-lg border border-slate-200 bg-white p-4 text-center"
                >
                  <div className="font-heading text-[1.4rem] font-bold text-orange-600">
                    {v}
                  </div>
                  <div className="mt-1 text-[0.7rem] text-slate-500">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section
        id="testimonials"
        className="bg-slate-800 px-6 py-[clamp(4rem,7vw,6rem)]"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <span className="mb-3 inline-block rounded bg-orange-600/20 px-3.5 py-[0.35rem] text-[0.72rem] font-bold tracking-[0.12em] text-[#fca888] uppercase">
              Customer Reviews
            </span>
            <h2 className="font-heading text-[clamp(1.75rem,3.5vw,2.4rem)] font-bold text-white">
              What Our Riders Say
            </h2>
          </div>
          <Testimonials />
        </div>
      </section>

      <div className="bg-slate-800 pb-10 text-center">
        <Link
          href="/testimonials"
          className="font-heading rounded-lg border border-white/15 px-5 py-2.5 text-sm font-semibold text-white no-underline hover:border-orange-600 hover:text-orange-600"
        >
          View All Testimonials
        </Link>
      </div>

      {/* ── FAQ ── */}
      <section id="faq" className="bg-slate-50 px-6 py-[clamp(4rem,7vw,6rem)]">
        <div className="mx-auto max-w-[780px]">
          <div className="mb-12 text-center">
            <span className="mb-3 inline-block rounded bg-orange-50 px-3.5 py-[0.35rem] text-[0.72rem] font-bold tracking-[0.12em] text-orange-600 uppercase">
              FAQ
            </span>
            <h2 className="font-heading text-[clamp(1.75rem,3.5vw,2.4rem)] font-bold text-slate-800">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="flex flex-col gap-3">
            {FAQS.map((f, i) => (
              <div
                key={i}
                className={`overflow-hidden rounded-[10px] border-[1.5px] bg-white transition-colors ${
                  faqOpen === i ? "border-orange-600" : "border-slate-200"
                }`}
              >
                <button
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-[1.125rem] text-left"
                >
                  <span
                    className={`font-heading text-[0.9rem] font-semibold ${
                      faqOpen === i ? "text-orange-600" : "text-slate-800"
                    }`}
                  >
                    {f.q}
                  </span>
                  <span
                    className={`shrink-0 ${faqOpen === i ? "text-orange-600" : "text-slate-500"}`}
                  >
                    {faqOpen === i ? (
                      <FaChevronUp size={13} />
                    ) : (
                      <FaChevronDown size={13} />
                    )}
                  </span>
                </button>
                {faqOpen === i && (
                  <div className="px-6 pb-[1.125rem] text-sm leading-[1.8] text-slate-500">
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA strip */}
          <div className="mt-12 flex flex-wrap items-center justify-between gap-6 rounded-xl bg-orange-600 px-10 py-8">
            <div>
              <h3 className="font-heading mb-1 text-[1.2rem] font-bold text-white">
                Ready to travel?
              </h3>
              <p className="text-sm text-white/75">
                Book online or call us — we&apos;re available 24×7.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/booking"
                className="font-heading rounded-lg bg-white px-6 py-[0.7rem] text-sm font-bold text-orange-600 no-underline"
              >
                Book Online
              </Link>
              <a
                href="tel:+918123552002"
                className="font-heading flex items-center gap-1.5 rounded-lg border-[1.5px] border-white/50 bg-transparent px-6 py-[0.7rem] text-sm font-semibold text-white no-underline"
              >
                <FaPhone size={13} /> Call Now
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-slate-800 px-6 pt-[clamp(3rem,5vw,4rem)] pb-6 text-white/60">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 grid grid-cols-1 gap-10 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
            <div>
              <div className="font-heading mb-0.5 text-2xl font-extrabold text-orange-600">
                Accord
              </div>
              <div className="mb-1 text-[0.58rem] tracking-[0.12em] text-white/35 uppercase">
                Tours &amp; Travels
              </div>
              <div className="mb-4 text-[0.68rem] font-semibold text-orange-500">
                A unit of Accord Enterprises
              </div>
              <p className="mb-5 text-[0.82rem] leading-[1.75] text-white/40">
                Bengaluru&apos;s trusted cab service since 2016. Outstation,
                local, airport &amp; corporate travel. Honest rates, zero
                surprises.
              </p>
              <p className="mb-4 text-xs text-white/30">
                accordtoursandtravels.com
              </p>
              <div className="flex gap-2.5">
                {[
                  {
                    Icon: FaFacebookF,
                    href: "https://facebook.com/accordtoursandtravels",
                  },
                  {
                    Icon: FaInstagram,
                    href: "https://instagram.com/accordtoursandtravels",
                  },
                  {
                    Icon: FaLinkedinIn,
                    href: "https://linkedin.com/company/accordtoursandtravels",
                  },
                  { Icon: FaWhatsapp, href: "https://wa.me/918123552002" },
                ].map(({ Icon, href }) => (
                  <a
                    key={href}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-[34px] w-[34px] items-center justify-center rounded-lg bg-white/7 text-white/45 no-underline transition-colors hover:bg-orange-600 hover:text-white"
                  >
                    <Icon size={14} />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-heading mb-4 text-[0.82rem] font-semibold tracking-[0.08em] text-white uppercase">
                Quick Links
              </h4>
              {[
                ["About Us", "#about"],
                ["Our Fleet", "#fleet"],
                ["Services", "#services"],
                ["FAQ", "#faq"],
                ["Book a Cab", "/booking"],
                ["Bus & Group Enquiry", "#bus-enquiry"],
              ].map(([l, h]) =>
                h.startsWith("/") ? (
                  <Link
                    key={l}
                    href={h}
                    className="mb-[0.55rem] block text-[0.83rem] text-white/40 no-underline transition-colors hover:text-orange-600"
                  >
                    {l}
                  </Link>
                ) : (
                  <a
                    key={l}
                    href={h}
                    className="mb-[0.55rem] block text-[0.83rem] text-white/40 no-underline transition-colors hover:text-orange-600"
                  >
                    {l}
                  </a>
                ),
              )}
            </div>

            <div>
              <h4 className="font-heading mb-4 text-[0.82rem] font-semibold tracking-[0.08em] text-white uppercase">
                Contact
              </h4>
              {[
                [FaMapMarkerAlt, "Bengaluru, Karnataka — 560001"],
                [FaPhone, "+91 81235 52002"],
                [FaEnvelope, "info@accordtoursandtravels.com"],
                [FaClock, "24×7 Available"],
              ].map(([Icon, text]) => (
                <div
                  key={text}
                  className="mb-2.5 flex items-start gap-2.5 text-[0.8rem] text-white/40"
                >
                  <span className="mt-0.5 shrink-0 text-orange-600">
                    <Icon size={12} />
                  </span>
                  <span>{text}</span>
                </div>
              ))}
            </div>

            <div>
              <h4 className="font-heading mb-4 text-[0.82rem] font-semibold tracking-[0.08em] text-white uppercase">
                Popular Routes
              </h4>
              {[
                "Bengaluru → Mysuru",
                "Bengaluru → Coorg",
                "Bengaluru → Ooty",
                "Bengaluru → Tirupati",
                "Bengaluru → Chennai",
                "Bengaluru → Goa",
                "KIA Airport Transfers",
              ].map((r) => (
                <Link
                  key={r}
                  href="/booking"
                  className="mb-2 flex items-center gap-1.5 text-[0.8rem] text-white/40 no-underline transition-colors hover:text-orange-600"
                >
                  <FaArrowRight size={9} /> {r}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/6 pt-5">
            <span className="text-[0.72rem] text-white/22">
              © {new Date().getFullYear()} Accord Tours &amp; Travels,
              Bengaluru. All rights reserved.
            </span>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/terms"
                className="text-[0.72rem] text-white/40 no-underline hover:text-white/70"
              >
                Terms &amp; Conditions
              </Link>
              <Link
                href="/privacy"
                className="text-[0.72rem] text-white/40 no-underline hover:text-white/70"
              >
                Privacy Policy
              </Link>
              <span className="text-[0.72rem] text-white/22">
                GSTIN: 29ASNPJ2450Q1Z1
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* ── FIXED BUTTONS ── */}
      <div className="fixed right-6 bottom-6 z-999 flex flex-col gap-3">
        <a
          href="tel:+918123552002"
          aria-label="Call us"
          className="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-slate-800 text-white no-underline shadow-[0_4px_18px_rgba(0,0,0,0.3)] transition-all duration-200 hover:scale-110 hover:bg-orange-600"
        >
          <FaPhone size={18} />
        </a>
        <a
          href="https://wa.me/918123552002"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp"
          className="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-[#25D366] text-white no-underline shadow-[0_4px_18px_rgba(37,211,102,0.45)] transition-transform duration-200 hover:scale-110"
        >
          <FaWhatsapp size={24} />
        </a>
      </div>
    </div>
  );
}
