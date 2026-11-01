import nodemailer from "nodemailer";

let transporter;
let transporterKey = "";

function getTransporter() {
  const provider = String(process.env.MAIL_PROVIDER || "smtp").toLowerCase();
  const key = provider === "gmail"
    ? `gmail:${process.env.GMAIL_USER || ""}`
    : `smtp:${process.env.SMTP_HOST || ""}:${process.env.SMTP_PORT || ""}:${process.env.SMTP_USER || ""}`;
  if (transporter && transporterKey === key) return transporter;

  if (provider === "gmail") {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return null;
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
    });
    transporterKey = key;
    return transporter;
  }

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) return null;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: process.env.SMTP_SECURE !== "false",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
  });
  transporterKey = key;
  return transporter;
}

async function send({ to, subject, html, text, attachments }) {
  const t = getTransporter();
  if (!t) {
    console.warn(`[mailer] Email provider is not configured - skipped email "${subject}" to ${to}`);
    return { skipped: true };
  }
  const from = process.env.MAIL_FROM || process.env.GMAIL_USER || process.env.SMTP_USER;
  return t.sendMail({ from, to, subject, html, text, attachments });
}

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export async function sendBookingNotificationToAdmin(booking) {
  const to = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!to) return { skipped: true };

  const rows = [
    ["Booking ID", booking.bookingCode],
    ["Trip type", booking.tripType],
    ...(booking.tripType === "airport" ? [["Airport service", booking.airportDirection === "pickup" ? "Airport pickup" : "Airport drop"], ["Flight number", booking.flightNumber || "—"]] : []),
    ["Customer", `${booking.name} (${booking.phone}${booking.email ? ", " + booking.email : ""})`],
    ["Pickup", `${booking.pickupLocation} — ${new Date(booking.pickupDate).toLocaleDateString("en-IN")} ${booking.pickupTime || ""}`],
    ["Drop", booking.dropLocation || "—"],
    ["Drop-off date", booking.returnDate ? new Date(booking.returnDate).toLocaleDateString("en-IN") : "—"],
    ["Drop-off time", booking.dropoffTime || "—"],
    ["Estimated fare", booking.estimatedFare ? inr(booking.estimatedFare) : "—"],
    ["Passengers", booking.passengers],
    ["Vehicle requested", booking.fleetName || "Not specified"],
    ["Notes", booking.notes || "—"],
  ];

  const html = `
    <h2 style="font-family:sans-serif;color:#ea580c;">New booking received — ${booking.bookingCode}</h2>
    <table style="font-family:sans-serif;border-collapse:collapse;">
      ${rows
        .map(
          ([k, v]) =>
            `<tr><td style="padding:4px 12px 4px 0;color:#64748b;">${k}</td><td style="padding:4px 0;font-weight:600;">${v}</td></tr>`
        )
        .join("")}
    </table>
    <p style="font-family:sans-serif;color:#64748b;">Open the admin panel to confirm, assign a vehicle and update the status.</p>
  `;

  return send({ to, subject: `New booking ${booking.bookingCode} — ${booking.name}`, html });
}

export async function sendBookingConfirmationToCustomer(booking) {
  if (!booking.email) return { skipped: true };
  const confirmationWindow = booking.tripType === "outstation" ? "24 hours" : booking.tripType === "airport" && booking.airportDirection === "pickup" ? "1 hour" : "3 hours";
  const html = `
    <h2 style="font-family:sans-serif;color:#ea580c;">Thanks, ${booking.name}!</h2>
    <p style="font-family:sans-serif;">We've received your booking <strong>${booking.bookingCode}</strong> and our team will confirm it within <strong>${confirmationWindow}</strong>.</p>
    <p style="font-family:sans-serif;">Pickup: ${booking.pickupLocation} on ${new Date(booking.pickupDate).toLocaleDateString("en-IN")} ${booking.pickupTime || ""}</p>
    ${booking.tripType === "airport" ? `<p style="font-family:sans-serif;">Airport service: ${booking.airportDirection === "pickup" ? "Airport pickup" : "Airport drop"}. ${booking.flightNumber ? `Flight: ${booking.flightNumber}` : ""}</p>` : ""}
    <p style="font-family:sans-serif;">Need help sooner? Call us at +91 81235 52002.</p>
  `;
  return send({ to: booking.email, subject: `Booking received — ${booking.bookingCode}`, html });
}

export async function sendFeedbackRequestEmail(booking, feedbackUrl) {
  if (!booking.email) return { skipped: true };
  const html = `
    <h2 style="font-family:sans-serif;color:#ea580c;">How was your trip, ${booking.name}?</h2>
    <p style="font-family:sans-serif;">Thanks for riding with Accord Tours &amp; Travels. Could you spare a minute to rate your trip (${booking.bookingCode})?</p>
    <p><a href="${feedbackUrl}" style="font-family:sans-serif;background:#ea580c;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;">Share your feedback</a></p>
  `;
  return send({ to: booking.email, subject: "Tell us about your trip with Accord", html });
}

export async function sendStatusUpdateToCustomer(booking) {
  if (!booking.email) return { skipped: true };
  const messages = {
    confirmed: "Your booking has been confirmed! We'll share driver details closer to pickup.",
    completed: "Your trip has been marked complete. We hope you had a great ride with us.",
    cancelled: "Your booking has been cancelled. Contact us if this wasn't expected.",
  };
  const line = messages[booking.status];
  if (!line) return { skipped: true };
  const html = `<p style="font-family:sans-serif;">Hi ${booking.name}, an update on booking <strong>${booking.bookingCode}</strong>: ${line}</p>`;
  return send({ to: booking.email, subject: `Booking ${booking.bookingCode} — ${booking.status}`, html });
}


export async function sendInvoiceEmail({ to, invoice, pdfBuffer, recipient = "client" }) {
  if (!to) return { skipped: true };
  const greeting = recipient === "admin" ? "A new invoice has been generated." : `Hi ${invoice.client?.name || "there"},`;
  const html = `
    <div style="font-family:Arial,sans-serif;color:#0f172a;max-width:680px;line-height:1.6">
      <h2 style="color:#ea580c;margin-bottom:8px">Accord Tours &amp; Travels</h2>
      <p>${greeting}</p>
      <p>Please find invoice <strong>${invoice.invoiceNo}</strong> attached.</p>
      <p><strong>Total:</strong> ₹${Number(invoice.total || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
      <p style="color:#64748b;font-size:12px">This is a computer-generated invoice.</p>
    </div>`;
  return send({
    to,
    subject: `Invoice ${invoice.invoiceNo} — Accord Tours & Travels`,
    html,
    attachments: [{ filename: `${invoice.invoiceNo}.pdf`, content: pdfBuffer, contentType: "application/pdf" }],
  });
}
