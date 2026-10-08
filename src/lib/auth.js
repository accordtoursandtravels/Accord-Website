import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "accord_admin_token";

function secretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function signAdminToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_EXPIRES_IN || "7d")
    .sign(secretKey());
}

/** Edge + Node safe verification. Returns the payload or null. */
export async function verifyAdminToken(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return payload;
  } catch {
    return null;
  }
}

/** Server Component / Route Handler helper (Node runtime, uses next/headers). */
export async function getAdminSession() {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE_NAME)?.value;
  return verifyAdminToken(token);
}

export async function setAdminCookie(token) {
  const store = await cookies();
  store.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAdminCookie() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE_NAME);
}
