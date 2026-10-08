import { writeFile, unlink, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const MAX_BYTES = 5 * 1024 * 1024;

async function saveImage(file, folder, publicPrefix) {
  if (!file || typeof file === "string") return null;
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Unsupported image type. Use JPG, PNG, WEBP or AVIF.");
  }
  if (file.size > MAX_BYTES) throw new Error("Image is too large (max 5MB).");

  const dir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(dir, { recursive: true });
  const ext = file.type.split("/")[1];
  const filename = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);
  return { url: `${publicPrefix}/${filename}`, publicId: filename };
}

export async function saveFleetImage(file) {
  return saveImage(file, "fleet", "/uploads/fleet");
}

export async function deleteFleetImage(publicId) {
  return deleteImage(publicId, "fleet");
}

export async function saveSiteContentImage(file) {
  return saveImage(file, "site-content", "/uploads/site-content");
}

export async function deleteSiteContentImage(publicId) {
  return deleteImage(publicId, "site-content");
}

async function deleteImage(publicId, folder) {
  if (!publicId) return;
  try {
    await unlink(path.join(process.cwd(), "public", "uploads", folder, publicId));
  } catch (err) {
    if (err.code !== "ENOENT") console.error("[uploads] failed to delete image", err);
  }
}


