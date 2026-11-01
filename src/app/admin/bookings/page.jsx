"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FaSearch,
  FaEye,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaPhone,
  FaCar,
  FaRoute,
  FaExternalLinkAlt,
  FaUser,
  FaIdCard,
  FaTrash,
  FaFileInvoiceDollar,
} from "react-icons/fa";
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";
import DateRangePicker from "@/components/ui/DateRangePicker";
import StatusBadge from "@/components/ui/StatusBadge";
import Spinner from "@/components/ui/Spinner";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";

const STATUS_OPTIONS = ["all", "pending", "confirmed", "completed", "cancelled"];

const SORT_OPTIONS = [
  ["-createdAt", "Newest first"],
  ["createdAt", "Oldest first"],
  ["-pickupDate", "Pickup date (latest)"],
  ["pickupDate", "Pickup date (earliest)"],
];

const toISO = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "");

const mapsUrl = (location) =>
  location
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        location
      )}`
    : "#";

const formatDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

function MapLink({ location, compact = false }) {
  if (!location) return <span className="text-slate-400">Not specified</span>;

  return (
    <a
      href={mapsUrl(location)}
      target="_blank"
      rel="noopener noreferrer"
      title={`Open ${location} in Google Maps`}
      onClick={(event) => event.stopPropagation()}
      className={`group inline-flex max-w-full items-center gap-1.5 text-orange-600 hover:text-orange-700 ${
        compact ? "text-xs" : "text-sm"
      }`}
    >
      <FaMapMarkerAlt className="shrink-0 text-orange-500" size={compact ? 11 : 13} />
      <span className="truncate underline decoration-orange-200 underline-offset-2 group-hover:decoration-orange-500">
        {location}
      </span>
      <FaExternalLinkAlt className="shrink-0 opacity-60" size={9} />
    </a>
  );
}

function LocationCard({ label, location, accent = "orange" }) {
  const accentClasses =
    accent === "blue"
      ? "border-blue-100 bg-blue-50/50"
      : "border-orange-100 bg-orange-50/50";

  const dotClasses =
    accent === "blue" ? "bg-blue-500" : "bg-orange-500";

  return (
    <div className={`rounded-xl border p-3.5 ${accentClasses}`}>
      <div className="mb-1.5 flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-slate-500">
        <span className={`h-2 w-2 rounded-full ${dotClasses}`} />
        {label}
      </div>
      <MapLink location={location} />
      <p className="mt-2 text-[0.68rem] text-slate-400">
        Click to open in Google Maps
      </p>
    </div>
  );
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState(null);
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("-createdAt");
  const [range, setRange] = useState({ from: null, to: null });
  const [q, setQ] = useState("");
  const [active, setActive] = useState(null);
  const [loadingId, setLoadingId] = useState(null);
  const toast = useToast();

  const load = async () => {
    try {
      const params = new URLSearchParams({ status, sort });
      if (range.from) params.set("from", toISO(range.from));
      if (range.to) params.set("to", toISO(range.to));
      if (q) params.set("q", q);

      const res = await fetch(`/api/bookings?${params}`);
      const data = await res.json();

      setBookings(data.bookings || []);
    } catch (error) {
      console.error("Failed to load bookings:", error);
      toast("Could not load bookings", "error");
      setBookings([]);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, sort, range.from, range.to]);

  useEffect(() => {
    const t = setTimeout(load, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  async function updateStatus(id, newStatus) {
    setLoadingId(id);

    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        toast("Could not update status", "error");
        return;
      }

      toast(`Marked as ${newStatus}`, "success");
      setActive(null);
      await load();
    } catch (error) {
      console.error("Status update failed:", error);
      toast("Could not update status", "error");
    } finally {
      setLoadingId(null);
    }
  }

  async function deleteBooking(id) {
    if (!window.confirm("Delete this booking permanently? This cannot be undone.")) return;
    setLoadingId(id);
    try {
      const res = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not delete booking");
      toast("Booking deleted", "success");
      setActive(null);
      await load();
    } catch (error) {
      console.error("Booking delete failed:", error);
      toast(error.message || "Could not delete booking", "error");
    } finally {
      setLoadingId(null);
    }
  }

  const counts = useMemo(() => {
    const list = bookings || [];

    return {
      total: list.length,
      pending: list.filter((b) => b.status === "pending").length,
      confirmed: list.filter((b) => b.status === "confirmed").length,
      completed: list.filter((b) => b.status === "completed").length,
    };
  }, [bookings]);

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <h1 className="font-heading mb-1 text-2xl font-bold text-slate-800">
            Bookings
          </h1>
          <p className="text-sm text-slate-500">
            Manage customer requests, routes and cab assignments.
          </p>
        </div>

        {bookings && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <SummaryCard label="Total" value={counts.total} />
            <SummaryCard label="Pending" value={counts.pending} />
            <SummaryCard label="Confirmed" value={counts.confirmed} />
            <SummaryCard label="Completed" value={counts.completed} />
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_6px_rgba(0,0,0,0.03)]">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-slate-600">
          <FaSearch size={11} className="text-orange-500" />
          Find a booking
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <Input
            label="Search"
            placeholder="Name, phone, booking ID, location…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full sm:w-64"
          />

          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full sm:w-40"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s === "all"
                  ? "All statuses"
                  : s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </Select>

          <DateRangePicker
            label="Pickup date range"
            value={range}
            onChange={setRange}
          />

          <Select
            label="Sort by"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full sm:w-48"
          >
            {SORT_OPTIONS.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {!bookings ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : bookings.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white py-16 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <FaSearch size={16} />
          </div>
          <p className="text-sm font-semibold text-slate-700">
            No bookings found
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Try changing the filters or search term.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-[0_1px_6px_rgba(0,0,0,0.03)] lg:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[0.68rem] uppercase tracking-wide text-slate-400">
                  <th className="px-4 py-3 font-semibold">Booking</th>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Route</th>
                  <th className="px-4 py-3 font-semibold">Pickup</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold"></th>
                </tr>
              </thead>

              <tbody>
                {bookings.map((b) => (
                  <tr
                    key={b._id}
                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60"
                  >
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-700">
                        {b.bookingCode}
                      </div>
                      <div className="mt-0.5 text-[0.68rem] text-slate-400">
                        {formatDate(b.createdAt)}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">{b.name}</div>
                      <a
                        href={`tel:${b.phone}`}
                        className="mt-0.5 inline-flex items-center gap-1 text-[0.75rem] text-slate-400 hover:text-orange-600"
                      >
                        <FaPhone size={9} />
                        {b.phone}
                      </a>
                    </td>

                    <td className="px-4 py-3">
                      <div className="capitalize text-slate-600">
                        {b.tripType}
                      </div>
                      {b.dropLocation ? (
                        <div className="mt-1 max-w-[210px]">
                          <MapLink location={b.dropLocation} compact />
                        </div>
                      ) : (
                        <div className="mt-1 text-[0.68rem] text-slate-400">
                          Local trip
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <div className="text-slate-600">
                        {formatDate(b.pickupDate)}
                      </div>
                      <div className="mt-1 max-w-[220px]">
                        <MapLink location={b.pickupLocation} compact />
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <StatusBadge status={b.status} />
                    </td>

                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setActive(b)}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                        aria-label="View booking details"
                      >
                        <FaEye size={12} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile / tablet cards */}
          <div className="grid gap-3 lg:hidden">
            {bookings.map((b) => (
              <button
                key={b._id}
                type="button"
                onClick={() => setActive(b)}
                className="w-full rounded-xl border border-slate-200 bg-white p-4 text-left shadow-[0_1px_6px_rgba(0,0,0,0.03)] transition hover:border-orange-200"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-slate-800">
                      {b.bookingCode}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-400">
                      {b.name} · {b.phone}
                    </div>
                  </div>
                  <StatusBadge status={b.status} />
                </div>

                <div className="grid gap-2">
                  <MapLink location={b.pickupLocation} compact />
                  {b.dropLocation && (
                    <MapLink location={b.dropLocation} compact />
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-400">
                  <span>{formatDate(b.pickupDate)}</span>
                  <span className="font-semibold text-orange-600">
                    View details →
                  </span>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Booking details */}
      <Modal
        open={!!active}
        onClose={() => setActive(null)}
        title={active?.bookingCode || "Booking details"}
      >
        {active && (
          <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col gap-3 rounded-xl bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-1 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-slate-400">
                  Booking request
                </div>
                <div className="font-heading text-lg font-bold capitalize text-slate-800">
                  {active.tripType} trip{active.tripType === "outstation" ? ` · ${active.outstationMode === "roundTrip" ? "Round trip" : "One way"}` : active.tripType === "airport" ? ` · ${active.airportDirection === "pickup" ? "Airport pickup" : "Airport drop"}` : ""}
                </div>
              </div>
              <StatusBadge status={active.status} />
            </div>

            {/* Customer */}
            <section>
              <SectionTitle icon={<FaUser size={11} />} title="Customer" />
              <div className="grid gap-3 rounded-xl border border-slate-100 bg-white sm:grid-cols-2">
                <InfoBlock label="Name" value={active.name} />
                <InfoBlock
                  label="Phone"
                  value={
                    <a
                      href={`tel:${active.phone}`}
                      className="text-orange-600 hover:underline"
                    >
                      {active.phone}
                    </a>
                  }
                />
                {active.email && (
                  <InfoBlock label="Email" value={active.email} />
                )}
                {active.passengers && (
                  <InfoBlock
                    label="Passengers"
                    value={active.passengers}
                  />
                )}
              </div>
            </section>

            {/* Route */}
            <section>
              <SectionTitle icon={<FaRoute size={11} />} title="Route" />

              <div className="grid gap-3 sm:grid-cols-2">
                <LocationCard
                  label="Pickup location"
                  location={active.pickupLocation}
                  accent="orange"
                />

                {active.dropLocation ? (
                  <LocationCard
                    label="Drop-off location"
                    location={active.dropLocation}
                    accent="blue"
                  />
                ) : (
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                    <div className="mb-1.5 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-slate-400">
                      Drop-off
                    </div>
                    <p className="text-sm font-medium text-slate-500">
                      Local / not specified
                    </p>
                  </div>
                )}
              </div>
              {active.flightNumber && <div className="mt-3 rounded-lg bg-orange-50 px-3 py-2 text-sm"><span className="text-slate-500">Flight number: </span><strong className="text-orange-700">{active.flightNumber}</strong></div>}
            </section>

            {/* Schedule & vehicle */}
            <section>
              <SectionTitle
                icon={<FaCalendarAlt size={11} />}
                title="Schedule & vehicle"
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <InfoBlock
                  label="Pickup date"
                  value={formatDate(active.pickupDate)}
                  icon={<FaCalendarAlt size={10} />}
                />
                <InfoBlock
                  label="Pickup time"
                  value={
                    active.pickupTime ||
                    formatDateTime(active.pickupDate)
                  }
                  icon={<FaClock size={10} />}
                />
                {active.returnDate && (
                  <InfoBlock
                    label="Drop-off date"
                    value={formatDate(active.returnDate)}
                    icon={<FaCalendarAlt size={10} />}
                  />
                )}
                {active.dropoffTime && (
                  <InfoBlock
                    label="Drop-off time"
                    value={active.dropoffTime}
                    icon={<FaClock size={10} />}
                  />
                )}
                {active.estimatedFare > 0 && (
                  <InfoBlock
                    label="Estimated fare"
                    value={`₹${Number(active.estimatedFare).toLocaleString("en-IN")}`}
                  />
                )}
                <InfoBlock
                  label="Vehicle requested"
                  value={active.fleetName || "Not specified"}
                  icon={<FaCar size={10} />}
                />
                {active.airportDistanceKm && (
                  <InfoBlock label="Airport distance" value={`${active.airportDistanceKm} km`} />
                )}
                {active.kms && (
                  <InfoBlock label="Estimated distance" value={`${active.kms} km`} />
                )}
              </div>
            </section>

            {active.fareBreakdown && (
              <section>
                <SectionTitle title="Fare breakdown" />
                <div className="rounded-xl border border-orange-100 bg-orange-50/50 p-4 text-sm">
                  <div className="flex justify-between py-1"><span className="text-slate-500">Base fare</span><strong>₹{Number(active.fareBreakdown.baseFare || 0).toLocaleString("en-IN")}</strong></div>
                  {active.fareBreakdown.days && <div className="flex justify-between py-1"><span className="text-slate-500">Trip duration</span><strong>{active.fareBreakdown.days} days / {active.fareBreakdown.nights || 0} nights</strong></div>}
                  {active.fareBreakdown.billedKm && <div className="flex justify-between py-1"><span className="text-slate-500">Billed distance</span><strong>{active.fareBreakdown.billedKm} km</strong></div>}
                  {active.fareBreakdown.driverBata !== undefined && <div className="flex justify-between py-1"><span className="text-slate-500">Driver Bata</span><strong>₹{Number(active.fareBreakdown.driverBata || 0).toLocaleString("en-IN")}</strong></div>}
                  {active.fareBreakdown.airportBand && <div className="flex justify-between py-1"><span className="text-slate-500">Airport band</span><strong>{active.fareBreakdown.airportBand}</strong></div>}
                  {active.fareBreakdown.nightBata !== undefined && <div className="flex justify-between py-1"><span className="text-slate-500">Night Bata</span><strong>₹{Number(active.fareBreakdown.nightBata || 0).toLocaleString("en-IN")}</strong></div>}{active.fareBreakdown.airportNightBata !== undefined && <div className="flex justify-between py-1"><span className="text-slate-500">Airport Night Bata (after 10 PM)</span><strong>₹{Number(active.fareBreakdown.airportNightBata || 0).toLocaleString("en-IN")}</strong></div>}
                  <div className="mt-2 border-t border-orange-200 pt-2 flex justify-between py-1"><span className="text-slate-500">GST @ 5%</span><strong>₹{Number(active.fareBreakdown.gst || 0).toLocaleString("en-IN")}</strong></div>
                  <div className="flex justify-between pt-1 font-semibold"><span>Estimated total</span><strong className="text-orange-600">₹{Number(active.estimatedFare || active.fareBreakdown.total || 0).toLocaleString("en-IN")}</strong></div>
                </div>
              </section>
            )}

            {/* KYC */}
            <section>
              <SectionTitle icon={<FaIdCard size={11} />} title="KYC document" />
              <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                {active.kycDeleteAt ? (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div><div className="text-sm font-semibold text-slate-800">Aadhaar photo received</div><div className="mt-1 text-xs text-slate-500">Scheduled for deletion {active.kycDeleteAt ? formatDate(active.kycDeleteAt) : "30 days after trip end"}.</div></div>
                    <a href={`/api/bookings/${active._id}/kyc`} target="_blank" rel="noopener noreferrer" className="inline-flex w-fit items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-orange-600 no-underline shadow-sm ring-1 ring-blue-100 hover:bg-orange-50">View KYC</a>
                  </div>
                ) : <div className="text-sm text-slate-500">KYC document has been deleted or is unavailable.</div>}
              </div>
            </section>

            {/* Notes */}
            {active.notes && (
              <section>
                <SectionTitle title="Customer notes" />
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 text-sm leading-6 text-slate-600">
                  {active.notes}
                </div>
              </section>
            )}

            {/* Payment */}
            <section>
              <SectionTitle title="Payment" />
              <div className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3">
                <span className="text-sm text-slate-500">Payment status</span>
                <StatusBadge
                  status={active.payment?.status || "not_required"}
                />
              </div>
            </section>

            <section className="border-t border-slate-100 pt-4">
              <div className="mb-2 text-[0.8rem] font-semibold text-slate-700">Invoice</div>
              <p className="mb-3 text-xs text-slate-500">Start with this booking's customer and calculated fare, then edit anything before generating the PDF.</p>
              <Button size="sm" icon={FaFileInvoiceDollar} onClick={() => { window.location.href = `/admin/invoices/new?bookingId=${active._id}`; }}>Generate Invoice</Button>
            </section>

            {/* Status */}
            <section className="border-t border-slate-100 pt-4">
              <div className="mb-2 text-[0.8rem] font-semibold text-slate-700">
                Update booking status
              </div>
              <div className="flex flex-wrap gap-2">
                {["pending", "confirmed", "completed", "cancelled"].map(
                  (newStatus) => (
                    <Button
                      key={newStatus}
                      size="sm"
                      variant={
                        active.status === newStatus ? "primary" : "outline"
                      }
                      disabled={loadingId === active._id}
                      onClick={() => updateStatus(active._id, newStatus)}
                    >
                      {newStatus.charAt(0).toUpperCase() +
                        newStatus.slice(1)}
                    </Button>
                  )
                )}
              </div>
            </section>

            <section className="border-t border-slate-100 pt-4">
              <Button
                size="sm"
                variant="danger"
                icon={FaTrash}
                disabled={loadingId === active._id}
                onClick={() => deleteBooking(active._id)}
              >
                Delete Booking
              </Button>
            </section>
          </div>
        )}
      </Modal>
    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="min-w-[82px] rounded-lg border border-slate-100 bg-white px-3 py-2 text-center">
      <div className="text-[0.62rem] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </div>
      <div className="font-heading mt-0.5 text-base font-bold text-slate-800">
        {value}
      </div>
    </div>
  );
}

function SectionTitle({ icon, title }) {
  return (
    <div className="mb-2.5 flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-[0.08em] text-slate-500">
      {icon && <span className="text-orange-500">{icon}</span>}
      {title}
    </div>
  );
}

function InfoBlock({ label, value, icon }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
      <div className="mb-1 flex items-center gap-1.5 text-[0.65rem] font-medium uppercase tracking-wide text-slate-400">
        {icon}
        {label}
      </div>
      <div className="break-words text-sm font-semibold capitalize text-slate-800">
        {value || "—"}
      </div>
    </div>
  );
}
