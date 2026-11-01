import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { signAdminToken, setAdminCookie } from "@/lib/auth";

export async function POST(request) {
  try {
    // ─────────────────────────────────────────────
    // Temporary environment diagnostics
    // ─────────────────────────────────────────────
    console.log("=================================");
    console.log("ADMIN LOGIN ATTEMPT");
    console.log("=================================");

    console.log(
      "ADMIN_EMAIL:",
      process.env.ADMIN_EMAIL || "MISSING"
    );

    console.log(
      "ADMIN_PASSWORD_HASH:",
      process.env.ADMIN_PASSWORD_HASH ? "LOADED" : "MISSING"
    );

    console.log(
      "JWT_SECRET:",
      process.env.JWT_SECRET ? "LOADED" : "MISSING"
    );

    // ─────────────────────────────────────────────
    // Read login request
    // ─────────────────────────────────────────────
    const body = await request.json();

    const email = body?.email;
    const password = body?.password;

    if (!email || !password) {
      return NextResponse.json(
        {
          error: "Email and password are required",
        },
        {
          status: 400,
        }
      );
    }

    // ─────────────────────────────────────────────
    // Read admin credentials from environment
    // ─────────────────────────────────────────────
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminHash = process.env.ADMIN_PASSWORD_HASH;

    if (!adminEmail || !adminHash) {
      console.error("Admin environment variables are missing.");

      console.error({
        ADMIN_EMAIL: adminEmail ? "LOADED" : "MISSING",
        ADMIN_PASSWORD_HASH: adminHash ? "LOADED" : "MISSING",
      });

      return NextResponse.json(
        {
          error: "Admin account not configured on the server yet",
        },
        {
          status: 500,
        }
      );
    }

    // ─────────────────────────────────────────────
    // Check email
    // ─────────────────────────────────────────────
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedAdminEmail = adminEmail.trim().toLowerCase();

    const emailMatches =
      normalizedEmail === normalizedAdminEmail;

    console.log(
      "EMAIL MATCH:",
      emailMatches ? "YES" : "NO"
    );

    // ─────────────────────────────────────────────
    // Check password
    // ─────────────────────────────────────────────
    let passwordMatches = false;

    if (emailMatches) {
      try {
        passwordMatches = await bcrypt.compare(
          password,
          adminHash
        );
      } catch (bcryptError) {
        console.error(
          "Bcrypt comparison failed:",
          bcryptError
        );

        return NextResponse.json(
          {
            error: "Server authentication configuration error",
          },
          {
            status: 500,
          }
        );
      }
    }

    console.log(
      "PASSWORD MATCH:",
      passwordMatches ? "YES" : "NO"
    );

    // ─────────────────────────────────────────────
    // Reject incorrect credentials
    // ─────────────────────────────────────────────
    if (!emailMatches || !passwordMatches) {
      console.log("LOGIN RESULT: FAILED");

      return NextResponse.json(
        {
          error: "Invalid email or password",
        },
        {
          status: 401,
        }
      );
    }

    // ─────────────────────────────────────────────
    // Create admin JWT
    // ─────────────────────────────────────────────
    console.log("Credentials verified.");

    const token = await signAdminToken({
      email: adminEmail,
      role: "admin",
    });

    // ─────────────────────────────────────────────
    // Set authentication cookie
    // ─────────────────────────────────────────────
    await setAdminCookie(token);

    console.log("LOGIN RESULT: SUCCESS");
    console.log("=================================");

    return NextResponse.json({
      ok: true,
      email: adminEmail,
    });
  } catch (error) {
    console.error("ADMIN LOGIN ERROR:", error);

    return NextResponse.json(
      {
        error: "Something went wrong while logging in",
      },
      {
        status: 500,
      }
    );
  }
}