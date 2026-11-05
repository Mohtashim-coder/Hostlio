/**
 * POST /api/auth/login
 */

import "@/lib/env";
import { JWT_SECRET } from "@/lib/env";
import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { checkLoginRateLimit } from "@/lib/auth";
import { z } from "zod";

// Zod schema for login body
const LoginSchema = z.object({
  email: z.string().email({ message: "Enter a valid email address" }).toLowerCase(),
  password: z.string().min(1, { message: "Password is required" }),
});

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    // Rate limit by IP before doing anything else
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const rateLimit = await checkLoginRateLimit(ip);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(Math.ceil((rateLimit.resetTime - Date.now()) / 1000)) },
        }
      );
    }

    // Validate body with Zod
    const body = await req.json();
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid email or password", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    const user = await User.findOne({ email });

    // Same message for "user not found" AND "wrong password" to prevent enumeration
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password", code: "AUTH_FAILED" },
        { status: 401 }
      );
    }

    // Reject banned accounts
    if (user.isActive === false) {
      return NextResponse.json(
        { error: "This account has been disabled. Contact support." },
        { status: 403 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid email or password", code: "AUTH_FAILED" },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    const response = NextResponse.json({
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
      },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 86400,
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong. Try again.", code: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
