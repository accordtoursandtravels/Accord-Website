import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Invoice from "@/lib/models/Invoice";
import { requireAdmin } from "@/lib/requireAdmin";
import { createInvoicePdf } from "@/lib/invoice/pdf";
import { sendInvoiceEmail } from "@/lib/mailer";
import { sendWhatsAppDocument } from "@/lib/whatsapp";

export async function POST(request, { params }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  await connectDB();
  const { id } = await params;
  const invoice = await Invoice.findById(id).lean();
  if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

  const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
  const publicUrl = `${origin.replace(/\/$/, "")}/api/invoices/public/${invoice.shareToken}`;
  const pdf = createInvoicePdf(invoice);
  const results = {};

  results.adminEmail = await sendInvoiceEmail({ to: process.env.ADMIN_NOTIFICATION_EMAIL, invoice, pdfBuffer: pdf, recipient: "admin" });
  results.clientEmail = await sendInvoiceEmail({ to: invoice.client?.email, invoice, pdfBuffer: pdf, recipient: "client" });
  results.whatsapp = await sendWhatsAppDocument(invoice.client?.phone, publicUrl, `${invoice.invoiceNo}.pdf`, `Invoice ${invoice.invoiceNo} from Accord Tours & Travels. Total: ₹${Number(invoice.total || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`);

  await Invoice.updateOne({ _id: invoice._id }, { $set: { lastSharedAt: new Date() } });
  return NextResponse.json({ ok: true, publicUrl, results });
}
