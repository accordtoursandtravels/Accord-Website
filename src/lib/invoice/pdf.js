import fs from "fs";
import path from "path";

const A4 = [595.28, 841.89];
const margin = 45;

const company = {
  name: "Accord Tours & Travels",
  unit: "A unit of Accord Enterprises",
  phone: "+91 81235 52002",
  gstin: "29ASNPJ2450Q1Z1",
  address: "4th Floor, 2nd Main, 3rd Cross Rd, B Channasandra,\nEast of NGEF Layout, Kasturi Nagar,\nBengaluru, Karnataka 560043",
  email: "billing@accordtoursandtravels.com",
};

function ascii(value) {
  return String(value ?? "")
    .replace(/[₹]/g, "")
    .replace(/[–—]/g, "-")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\u00a0/g, " ")
    .replace(/[^\x20-\x7E\n]/g, "?");
}

function esc(value) {
  return ascii(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function money(value) {
  return Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function date(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function textWidth(text, size, bold = false) {
  return ascii(text).length * size * (bold ? 0.55 : 0.5);
}

function imageSize(filePath) {
  const b = fs.readFileSync(filePath);
  let i = 2;
  while (i < b.length) {
    if (b[i] !== 0xff) { i++; continue; }
    const marker = b[i + 1];
    const len = b.readUInt16BE(i + 2);
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
      return { width: b.readUInt16BE(i + 7), height: b.readUInt16BE(i + 5) };
    }
    i += 2 + len;
  }
  return { width: 1, height: 1 };
}

function addText(cmds, x, y, value, size = 10, bold = false, align = "left") {
  const text = ascii(value);
  const font = bold ? "/F2" : "/F1";
  let xx = x;
  const w = textWidth(text, size, bold);
  if (align === "right") xx = x - w;
  if (align === "center") xx = x - w / 2;
  cmds.push(`BT ${font} ${size} Tf 0 g 1 0 0 1 ${xx.toFixed(2)} ${y.toFixed(2)} Tm (${esc(text)}) Tj ET`);
}

function addLine(cmds, x1, y1, x2, y2, width = 0.7, gray = 0.35) {
  cmds.push(`${gray} G ${width} w ${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S`);
}

function addRect(cmds, x, y, w, h, gray = 0.95) {
  cmds.push(`${gray} g ${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re f`);
}

function addImage(cmds, name, x, y, w, h) {
  cmds.push(`q ${w.toFixed(2)} 0 0 ${h.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)} cm ${name} Do Q`);
}

function addRupeeAmount(cmds, rupeeImageName, xRight, y, value, size = 9.2, bold = false) {
  const text = money(value);
  const imgW = 7;
  const imgH = 7;
  const textW = textWidth(text, size, bold);
  const start = xRight - textW - imgW - 2;
  addImage(cmds, rupeeImageName, start, y - 1.3, imgW, imgH);
  addText(cmds, start + imgW + 2, y, text, size, bold);
}

function wrap(value, maxChars) {
  const words = ascii(value).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

function drawKeyValue(cmds, x, y, label, value, valueX, size = 8.8) {
  addText(cmds, x, y, label, size, true);
  addText(cmds, valueX, y, value || "-", size);
}

function buildPageCommands(invoice, assets, pageItems, pageIndex, pageCount) {
  const cmds = [];
  const right = A4[0] - margin;
  const width = right - margin;
  let y = A4[1] - 38;

  addImage(cmds, assets.logoName, margin, y - 92, 92, 92);
  addText(cmds, right, y - 2, company.name, 12.5, true, "right");
  addText(cmds, right, y - 18, company.unit, 9.5, true, "right");
  company.address.split("\n").forEach((line, idx) => addText(cmds, right, y - 34 - idx * 13, line, 8.7, false, "right"));
  addText(cmds, right, y - 75, `${company.phone}  |  ${company.email}`, 8.7, false, "right");
  addText(cmds, right, y - 88, `GSTIN: ${company.gstin}`, 8.7, true, "right");
  addLine(cmds, margin, y - 100, right, y - 100, 0.9, 0.15);

  y -= 122;
  addText(cmds, A4[0] / 2, y, pageIndex === 0 ? "TAX INVOICE" : "TAX INVOICE - CONTINUED", 18, true, "center");
  y -= 28;

  if (pageIndex === 0) {
    // Client block
    addRect(cmds, margin, y - 84, width, 84, 0.97);
    addText(cmds, margin + 9, y - 15, "Billed to", 10, true);
    addText(cmds, margin + 9, y - 31, invoice.client?.name || "", 9.8);
    if (invoice.client?.phone) addText(cmds, margin + 9, y - 45, `Phone: ${invoice.client.phone}`, 8.7);
    if (invoice.client?.email) addText(cmds, margin + 9, y - 58, invoice.client.email, 8.7);
    if (invoice.client?.address) wrap(invoice.client.address, 48).slice(0, 2).forEach((line, i) => addText(cmds, margin + 9, y - 71 - i * 11, line, 8.1));
    if (invoice.client?.gstin) addText(cmds, 330, y - 15, `Client GSTIN: ${invoice.client.gstin}`, 8.7, true);

    const metaX = 350;
    addText(cmds, metaX, y - 31, "Invoice no.", 8.7);
    addText(cmds, right - 9, y - 31, invoice.invoiceNo || "", 8.7, true, "right");
    addText(cmds, metaX, y - 45, "Invoice date", 8.7);
    addText(cmds, right - 9, y - 45, date(invoice.invoiceDate), 8.7, false, "right");
    if (invoice.bookingDate) {
      addText(cmds, metaX, y - 59, "Date of booking", 8.7);
      addText(cmds, right - 9, y - 59, date(invoice.bookingDate), 8.7, false, "right");
    }
    addText(cmds, metaX, y - 73, "HSN / SAC", 8.7);
    addText(cmds, right - 9, y - 73, invoice.details?.hsnSac || "SAC 9966", 8.7, true, "right");
    y -= 100;
  } else {
    y -= 18;
  }

  if (pageIndex === 0 && invoice.bookingSnapshot) {
    addText(cmds, margin, y, `Vehicle: ${invoice.details?.vehicleType || invoice.bookingSnapshot.vehicle || "Vehicle hire"}`, 8.8, true);
    if (invoice.bookingSnapshot.tripDates) addText(cmds, margin, y - 13, `Trip dates: ${invoice.bookingSnapshot.tripDates}`, 8.5);
    if (invoice.bookingSnapshot.pickupLocation) addText(cmds, 310, y, `Pickup: ${invoice.bookingSnapshot.pickupLocation}`, 8.2);
    if (invoice.bookingSnapshot.dropLocation) addText(cmds, 310, y - 13, `Drop / terminal: ${invoice.bookingSnapshot.dropLocation}`, 8.2);
    y -= 28;
  }

  // Item table
  addLine(cmds, margin, y, right, y, 0.9, 0.15);
  addText(cmds, margin + 2, y - 16, "Description", 8.8, true);
  addText(cmds, 410, y - 16, "Qty", 8.8, true, "right");
  addText(cmds, 480, y - 16, "Rate (INR)", 8.8, true, "right");
  addText(cmds, right - 2, y - 16, "Amount (INR)", 8.8, true, "right");
  addLine(cmds, margin, y - 25, right, y - 25, 0.9, 0.15);
  y -= 46;

  for (const item of pageItems) {
    const lines = wrap(item.description, 52);
    const rowHeight = Math.max(26, lines.length * 12 + 10);
    lines.forEach((line, i) => addText(cmds, margin + 2, y - i * 12, line, 8.5));
    addText(cmds, 410, y, `${Number(item.qty || 0).toLocaleString("en-IN")} ${item.unit || ""}`.trim(), 8.5, false, "right");
    if (Number(item.rate || 0) > 0) addRupeeAmount(cmds, assets.rupeeName, 480, y, item.rate, 8.5);
    else addText(cmds, 480, y, "Included", 8.2, false, "right");
    addRupeeAmount(cmds, assets.rupeeName, right - 2, y, item.amount, 8.5);
    addLine(cmds, margin, y - rowHeight + 12, right, y - rowHeight + 12, 0.4, 0.7);
    y -= rowHeight;
  }

  if (pageIndex === pageCount - 1) {
    y -= 8;
    const totalX = 360;
    addText(cmds, totalX, y, "Subtotal", 9);
    addRupeeAmount(cmds, assets.rupeeName, right - 2, y, invoice.subtotal, 9);
    y -= 17;
    if (invoice.discount > 0) {
      addText(cmds, totalX, y, "Discount", 9);
      addRupeeAmount(cmds, assets.rupeeName, right - 2, y, invoice.discount, 9);
      y -= 17;
    }
    const taxRate = Number(invoice.taxRate || 5);
    const cgstRate = taxRate / 2;
    const sgstRate = taxRate / 2;
    const cgstAmount = Number(invoice.cgstAmount ?? Number(invoice.taxAmount || 0) / 2);
    const sgstAmount = Number(invoice.sgstAmount ?? Number(invoice.taxAmount || 0) / 2);
    addText(cmds, totalX, y, `CGST @ ${cgstRate}%`, 9);
    addRupeeAmount(cmds, assets.rupeeName, right - 2, y, cgstAmount, 9);
    y -= 17;
    addText(cmds, totalX, y, `SGST @ ${sgstRate}%`, 9);
    addRupeeAmount(cmds, assets.rupeeName, right - 2, y, sgstAmount, 9);
    y -= 20;
    addLine(cmds, totalX, y + 9, right, y + 9, 0.9, 0.15);
    addText(cmds, totalX, y - 5, "Total bill", 10.2, true);
    addRupeeAmount(cmds, assets.rupeeName, right - 2, y - 5, invoice.total, 10.2, true);
    addLine(cmds, totalX, y - 18, right, y - 18, 0.9, 0.15);

    const footerY = 96;
    const notes = invoice.notes || "Toll, parking and state entry taxes are payable by the client unless stated otherwise.";
    wrap(notes, 93).slice(0, 3).forEach((line, i) => addText(cmds, margin, footerY - i * 12, line, 7.8));
    addText(cmds, margin, footerY - 40, "This is a computer-generated tax invoice.", 7.8);
    if (invoice.paymentMethod) addText(cmds, margin, footerY - 53, `Payment method: ${invoice.paymentMethod}`, 7.8);
    if (invoice.transactionId) addText(cmds, margin, footerY - 66, `Reference: ${invoice.transactionId}`, 7.8);
    addImage(cmds, assets.sealName, right - 92, footerY - 77, 82, 82);
  }

  if (pageCount > 1) addText(cmds, right, 26, `Page ${pageIndex + 1} of ${pageCount}`, 7.2, false, "right");
  return cmds.join("\n");
}

export function createInvoicePdf(invoice) {
  const root = process.cwd();
  const logoPath = path.join(root, "public", "images", "invoice-logo.jpg");
  const rupeePath = path.join(root, "public", "images", "rupee.jpg");
  const sealPath = path.join(root, "public", "images", invoice.paymentStatus === "paid" ? "invoice-seal-paid.jpg" : "invoice-seal-unpaid.jpg");

  const files = [
    { path: logoPath, name: "logo", type: "jpeg" },
    { path: rupeePath, name: "rupee", type: "jpeg" },
    { path: sealPath, name: "seal", type: "jpeg" },
  ];

  const objects = [];
  const addObj = (content) => { objects.push(content); return objects.length; };
  const fontRegular = addObj("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
  const fontBold = addObj("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");

  const imageObjects = {};
  for (const file of files) {
    const data = fs.readFileSync(file.path);
    const dims = imageSize(file.path);
    imageObjects[file.name] = addObj(Buffer.concat([
      Buffer.from(`<< /Type /XObject /Subtype /Image /Width ${dims.width} /Height ${dims.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${data.length} >>\nstream\n`),
      data,
      Buffer.from("\nendstream"),
    ]));
  }

  const items = (invoice.items || []).map((item) => ({
    ...item,
    amount: Number(item.amount ?? Number(item.qty || 0) * Number(item.rate || 0)),
  }));

  const chunks = [];
  let current = [];
  for (const item of items) {
    if (current.length >= 12) {
      chunks.push(current);
      current = [];
    }
    current.push(item);
  }
  if (current.length) chunks.push(current);
  if (!chunks.length) chunks.push([]);

  const pageCount = chunks.length;
  const pageRefs = [];
  const contentRefs = [];

  for (let i = 0; i < pageCount; i++) {
    const content = buildPageCommands(
      invoice,
      { logoName: "/ImLogo", rupeeName: "/ImRupee", sealName: "/ImSeal" },
      chunks[i],
      i,
      pageCount
    );
    const contentObj = addObj(Buffer.from(`<< /Length ${Buffer.byteLength(content, "binary")} >>\nstream\n${content}\nendstream`));
    contentRefs.push(contentObj);
    const pageObj = addObj(
      `<< /Type /Page /Parent PAGES /MediaBox [0 0 ${A4[0]} ${A4[1]}] /Resources << /Font << /F1 ${fontRegular} 0 R /F2 ${fontBold} 0 R >> /XObject << /ImLogo ${imageObjects.logo} 0 R /ImRupee ${imageObjects.rupee} 0 R /ImSeal ${imageObjects.seal} 0 R >> >> /Contents ${contentObj} 0 R >>`
    );
    pageRefs.push(pageObj);
  }

  const pagesObj = addObj(`<< /Type /Pages /Kids [${pageRefs.map((r) => `${r} 0 R`).join(" ")}] /Count ${pageRefs.length} >>`);
  pageRefs.forEach((ref) => {
    objects[ref - 1] = objects[ref - 1].replace("PAGES", `${pagesObj} 0 R`);
  });
  const catalogObj = addObj(`<< /Type /Catalog /Pages ${pagesObj} 0 R >>`);

  const chunksOut = [Buffer.from("%PDF-1.4\n%\xFF\xFF\xFF\xFF\n")];
  const offsets = [0];
  let offset = chunksOut[0].length;

  objects.forEach((obj, idx) => {
    const data = Buffer.isBuffer(obj) ? obj : Buffer.from(obj, "binary");
    const head = Buffer.from(`${idx + 1} 0 obj\n`);
    const tail = Buffer.from("\nendobj\n");
    offsets.push(offset);
    chunksOut.push(head, data, tail);
    offset += head.length + data.length + tail.length;
  });

  const xrefOffset = offset;
  const xref = ["xref", `0 ${objects.length + 1}`, "0000000000 65535 f "];
  for (let i = 1; i <= objects.length; i++) {
    xref.push(`${String(offsets[i]).padStart(10, "0")} 00000 n `);
  }
  xref.push(
    "trailer",
    `<< /Size ${objects.length + 1} /Root ${catalogObj} 0 R >>`,
    "startxref",
    String(xrefOffset),
    "%%EOF"
  );
  chunksOut.push(Buffer.from(xref.join("\n")));
  return Buffer.concat(chunksOut);
}
