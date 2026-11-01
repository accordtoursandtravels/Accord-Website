import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Fleet from "@/lib/models/Fleet";
import { requireAdmin } from "@/lib/requireAdmin";
import { saveFleetImage, deleteFleetImage } from "@/lib/uploads";
import { parseFleetForm } from "../route";

export async function GET(_request, { params }) {
  await connectDB();
  const { id } = await params;
  const fleet = await Fleet.findById(id);
  if (!fleet) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ fleet });
}

// PUT /api/fleet/[id]  (admin) - multipart/form-data. Sending a new "image"
// file replaces the old one on disk; the old file is removed to avoid
// orphaned uploads.
export async function PUT(request, { params }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  await connectDB();

  const { id } = await params;
  const existing = await Fleet.findById(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const form = await request.formData();
  const payload = parseFleetForm(form);

  const imageFile = form.get("image");
  if (imageFile && imageFile.size > 0) {
    const saved = await saveFleetImage(imageFile);
    if (existing.imagePublicId) await deleteFleetImage(existing.imagePublicId);
    payload.image = saved.url;
    payload.imagePublicId = saved.publicId;
  }

  const fleet = await Fleet.findByIdAndUpdate(id, payload, { new: true });
  return NextResponse.json({ fleet });
}

// DELETE /api/fleet/[id]  (admin) - also removes the stored image file, if any.
export async function DELETE(_request, { params }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  await connectDB();

  const { id } = await params;
  const fleet = await Fleet.findByIdAndDelete(id);
  if (!fleet) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (fleet.imagePublicId) await deleteFleetImage(fleet.imagePublicId);

  return NextResponse.json({ ok: true });
}
