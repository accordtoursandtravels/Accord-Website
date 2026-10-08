import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import SiteContent from "@/lib/models/SiteContent";
import { requireAdmin } from "@/lib/requireAdmin";
import { saveSiteContentImage } from "@/lib/uploads";

const TYPES = new Set(["cities", "partners", "testimonials"]);

function normaliseItem(type, raw) {
  const item = { ...raw };
  delete item._id;
  if (type === "testimonials") item.rating = Math.max(1, Math.min(5, Number(item.rating || 5)));
  if (type === "cities") item.name = String(item.name || "").trim();
  if (type === "partners") item.name = String(item.name || "").trim();
  return item;
}

async function parseRequest(request, typeFromBody = null) {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const type = String(form.get("type") || typeFromBody || "");
    const id = form.get("id") ? String(form.get("id")) : null;
    const item = JSON.parse(String(form.get("item") || "{}"));
    const image = form.get("image");
    return { type, id, item, image };
  }
  const body = await request.json();
  return { type: body.type, id: body.id || null, item: body.item || {}, image: null };
}

export async function POST(request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  await connectDB();
  const { type, item: rawItem, image } = await parseRequest(request);
  if (!TYPES.has(type)) return NextResponse.json({ error: "Invalid type" }, { status: 400 });

  const item = normaliseItem(type, rawItem);
  if (image && image.size > 0) {
    const saved = await saveSiteContentImage(image);
    if (type === "cities" || type === "testimonials") {
      item.image = saved.url;
      item.imagePublicId = saved.publicId;
    } else {
      item.logo = saved.url;
      item.logoPublicId = saved.publicId;
    }
  }

  const content = await SiteContent.findOne({ key: "main" });
  if (!content) return NextResponse.json({ error: "Site content not initialized" }, { status: 500 });
  content[type].push(item);
  await content.save();
  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function PUT(request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  await connectDB();
  const { type, id, item: rawItem, image } = await parseRequest(request);
  if (!TYPES.has(type) || !id) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const content = await SiteContent.findOne({ key: "main" });
  if (!content) return NextResponse.json({ error: "Site content not initialized" }, { status: 500 });
  const found = content[type].id(id);
  if (!found) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const item = normaliseItem(type, rawItem);
  if (image && image.size > 0) {
    const saved = await saveSiteContentImage(image);
    if (type === "cities" || type === "testimonials") {
      item.image = saved.url;
      item.imagePublicId = saved.publicId;
    } else {
      item.logo = saved.url;
      item.logoPublicId = saved.publicId;
    }
  } else {
    // Keep the existing uploaded file id when the URL/image itself was not changed.
    if (type === "cities" || type === "testimonials") {
      if (!item.image) item.image = found.image || "";
      item.imagePublicId = found.imagePublicId || item.imagePublicId || "";
    } else {
      if (!item.logo) item.logo = found.logo || "";
      item.logoPublicId = found.logoPublicId || item.logoPublicId || "";
    }
  }

  Object.assign(found, item);
  await content.save();
  return NextResponse.json({ ok: true });
}

export async function DELETE(request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  await connectDB();
  const { type, id } = await request.json();
  if (!TYPES.has(type) || !id) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const content = await SiteContent.findOne({ key: "main" });
  if (!content) return NextResponse.json({ error: "Site content not initialized" }, { status: 500 });
  content[type].pull(id);
  await content.save();
  return NextResponse.json({ ok: true });
}
