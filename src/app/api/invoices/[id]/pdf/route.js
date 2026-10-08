import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Invoice from "@/lib/models/Invoice";
import { requireAdmin } from "@/lib/requireAdmin";
import { createInvoicePdf } from "@/lib/invoice/pdf";

export async function GET(_request, { params }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  await connectDB();
  const { id } = await params;
  const invoice = await Invoice.findById(id).lean();
  if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  const pdf = createInvoicePdf(invoice);
  return new NextResponse(pdf, { status: 200, headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${invoice.invoiceNo}.pdf"`, "Cache-Control": "no-store" } });
}
