import { FLEET } from "@/lib/constants";

export const GST_RATE = 5;
export const HSN_SAC = "SAC 9966";

export function round2(value) {
  return Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;
}

export function calculateInvoiceTotals(items = [], taxRate = GST_RATE, discount = 0) {
  const normalizedItems = items.map((item) => {
    const qty = Number(item.qty || 0);
    const rate = Number(item.rate || 0);
    return { ...item, qty, rate, amount: round2(qty * rate) };
  });
  const subtotal = round2(normalizedItems.reduce((sum, item) => sum + item.amount, 0));
  const discountAmount = round2(Math.max(0, Number(discount || 0)));
  const taxable = round2(Math.max(0, subtotal - discountAmount));
  const taxAmount = round2(taxable * (Number(taxRate || 0) / 100));
  const total = round2(taxable + taxAmount);
  return {
    items: normalizedItems,
    subtotal,
    discount: discountAmount,
    taxRate: Number(taxRate || 0),
    cgstRate: Number(taxRate || 0) / 2,
    sgstRate: Number(taxRate || 0) / 2,
    taxAmount,
    cgstAmount: round2(taxAmount / 2),
    sgstAmount: round2(taxAmount / 2),
    total,
  };
}

function airportNightApplies(booking) {
  return String(booking?.pickupTime || "") >= "22:00";
}

function findSeedRates(booking) {
  const name = String(booking?.fleetName || "").trim().toLowerCase();
  return FLEET.find((car) => car.name.toLowerCase() === name)?.rates || null;
}

function effectiveRates(booking) {
  const dbRates = booking?.fareBreakdown?.rates || booking?.fleet?.rates || {};
  const seed = findSeedRates(booking) || {};
  const keys = ["outstation", "minKm", "driverBata", "nightBata", "local4h", "local4hKm", "local8h", "local8hKm", "extraKm", "extraHour", "airport40", "airport60", "airport80"];
  return Object.fromEntries(keys.map((key) => [key, Number(dbRates[key] || 0) || Number(seed[key] || 0)]));
}

export function buildInvoiceDetailsFromBooking(booking) {
  const fare = booking?.fareBreakdown || {};
  const totalKmsUsed =
    Number(fare.requestedKm || 0) ||
    Number(fare.billedKm || 0) ||
    Number(fare.airportDistanceKm || 0) ||
    Number(fare.includedKm || 0);

  const extraKms = Number(fare.extraKms || 0) ||
    (booking?.tripType === "outstation"
      ? Math.max(0, Number(fare.requestedKm || 0) - Number(fare.minimumBilledKm || 0))
      : 0);

  return {
    vehicleType: booking?.fleetName || "",
    totalKmsUsed,
    extraKms,
    extraHours: Number(fare.extraHours || 0),
    toll: Number(fare.toll || 0),
    driverBataDay: Number(fare.driverBata || 0),
    driverBataNight: Number(fare.nightBata || fare.airportNightBata || 0),
    hsnSac: HSN_SAC,
    airportNightApplies: booking?.tripType === "airport" ? airportNightApplies(booking) : false,
  };
}

export function buildInvoiceItemsFromBooking(booking) {
  const fare = booking?.fareBreakdown || {};
  const details = buildInvoiceDetailsFromBooking(booking);
  const rates = effectiveRates(booking);
  const items = [];
  const cab = booking?.fleetName || "Vehicle hire";

  if (booking?.tripType === "outstation") {
    const days = Number(fare.days || 1);
    const requestedKm = Number(fare.requestedKm || details.totalKmsUsed || 0);
    const minimumBilledKm = Number(fare.minimumBilledKm || (Number(fare.minKm || rates.minKm || 300) * days));
    const extraKms = Number(fare.extraKms || Math.max(0, requestedKm - minimumBilledKm));
    const perKm = Number(fare.extraKmRate || rates.outstation || 0);
    const baseFare = Number(fare.baseFare || minimumBilledKm * perKm);
    const extraKmAmount = Number(fare.extraKmAmount || extraKms * perKm);

    items.push({ description: `${cab} - Vehicle hire (${Number(fare.minKm || rates.minKm || 300)} km/day included)`, qty: days, unit: "days", rate: days ? round2(baseFare / days) : baseFare });
    items.push({ description: `Total KM used: ${requestedKm} km`, qty: requestedKm, unit: "km", rate: 0 });
    if (extraKms > 0) items.push({ description: "Extra KM", qty: extraKms, unit: "km", rate: perKm || 0 });
    if (details.extraHours > 0) items.push({ description: "Extra hour charges", qty: details.extraHours, unit: "hrs", rate: Number(fare.extraHourRate || rates.extraHour || 0) });
    if (details.toll > 0) items.push({ description: "Toll / parking / permit", qty: 1, unit: "charge", rate: details.toll });
    if (details.driverBataDay > 0) items.push({ description: "Driver bata - day", qty: days, unit: "days", rate: round2(details.driverBataDay / days) });
    if (details.driverBataNight > 0) items.push({ description: "Driver bata - night", qty: Number(fare.nights || 0), unit: "nights", rate: Number(fare.nights) ? round2(details.driverBataNight / Number(fare.nights)) : details.driverBataNight });
    return items;
  }

  if (booking?.tripType === "local") {
    const baseFare = Number(fare.baseFare || 0);
    items.push({ description: `${cab} - ${fare.durationLabel || "Local city ride"}`, qty: 1, unit: "package", rate: baseFare });
    items.push({ description: `Total KM used: ${Number(details.totalKmsUsed || fare.includedKm || 0)} km`, qty: Number(details.totalKmsUsed || fare.includedKm || 0), unit: "km", rate: 0 });
    if (details.extraKms > 0) items.push({ description: "Extra KM", qty: details.extraKms, unit: "km", rate: Number(fare.extraKmRate || rates.extraKm || 0) });
    if (details.extraHours > 0) items.push({ description: "Extra hour charges", qty: details.extraHours, unit: "hrs", rate: Number(fare.extraHourRate || rates.extraHour || 0) });
    if (details.toll > 0) items.push({ description: "Toll / parking / permit", qty: 1, unit: "charge", rate: details.toll });
    return items;
  }

  if (booking?.tripType === "airport") {
    const distance = Number(fare.airportDistanceKm || booking.airportDistanceKm || details.totalKmsUsed || 0);
    const rateKey = fare.rateKey || (distance <= 40 ? "airport40" : distance <= 60 ? "airport60" : "airport80");
    const baseFare = Number(fare.baseFare || rates[rateKey] || 0);
    items.push({ description: `${cab} - Airport transfer (${fare.airportBand || "rate card"})`, qty: 1, unit: "trip", rate: baseFare });
    items.push({ description: `Total KM used: ${distance} km`, qty: distance, unit: "km", rate: 0 });
    if (details.driverBataNight > 0 && details.airportNightApplies) items.push({ description: "Driver bata - night (after 10 PM)", qty: 1, unit: "night", rate: details.driverBataNight });
    if (details.toll > 0) items.push({ description: "Toll / parking / permit", qty: 1, unit: "charge", rate: details.toll });
    return items;
  }

  if (booking?.estimatedFare) items.push({ description: `${cab} - ${booking.tripType || "cab service"}`, qty: 1, unit: "service", rate: round2(Number(booking.estimatedFare) / 1.05) });
  return items;
}
