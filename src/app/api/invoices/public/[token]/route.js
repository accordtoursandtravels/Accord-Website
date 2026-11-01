import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Invoice from "@/lib/models/Invoice";
import { createInvoicePdf } from "@/lib/invoice/pdf";

export async function GET(_request, { params }) {
  await connectDB();
  const { token } = await params;
  const invoice = await Invoice.findOne({ shareToken: token }).lean();
  if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  const pdf = createInvoicePdf(invoice);
  return new NextResponse(pdf, { status: 200, headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="${invoice.invoiceNo}.pdf"`, "Cache-Control": "private, max-age=300" } });
}
