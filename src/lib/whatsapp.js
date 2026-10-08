/**
 * Thin wrapper around Meta's WhatsApp Cloud API. Requires WHATSAPP_TOKEN and
 * WHATSAPP_PHONE_NUMBER_ID (see .env.example). Fails soft when not configured
 * so the rest of the app keeps working before this is set up.
 */
export async function sendWhatsAppMessage(toPhone, message) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneId) {
    console.warn(`[whatsapp] Not configured - skipped message to ${toPhone}`);
    return { skipped: true };
  }

  const to = toPhone.replace(/[^\d]/g, "");
  const res = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: message, preview_url: true },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("[whatsapp] send failed", res.status, body);
    return { error: true, status: res.status };
  }
  return res.json();
}

export function feedbackWhatsAppText(booking, feedbackUrl) {
  return `Hi ${booking.name}, thanks for riding with Accord Tours & Travels! Could you rate your trip (${booking.bookingCode})? ${feedbackUrl}`;
}


export async function sendWhatsAppDocument(toPhone, documentUrl, filename, caption = "") {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneId) {
    console.warn(`[whatsapp] Not configured - skipped document to ${toPhone}`);
    return { skipped: true };
  }
  let to = String(toPhone || "").replace(/\D/g, "");
  if (to.length === 10 && /^[6-9]/.test(to)) to = `91${to}`;
  if (!to) return { skipped: true };
  const res = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "document",
      document: { link: documentUrl, filename, caption },
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    console.error("[whatsapp] document send failed", res.status, body);
    return { error: true, status: res.status, details: body };
  }
  return res.json();
}
