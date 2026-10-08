import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";

/**
 * Call at the top of any API route handler that should be admin-only.
 * Returns null if the caller is authenticated, or a 401 NextResponse
 * to return immediately otherwise:
 *
 *   const denied = await requireAdmin();
 *   if (denied) return denied;
 */
export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
