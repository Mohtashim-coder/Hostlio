/**
 * GET /api/auth/me
 * Returns the authenticated user's profile.
 */

import "@/lib/env";
import { JWT_SECRET } from "@/lib/env";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import jwt from "jsonwebtoken";

export async function GET() {
  await dbConnect();

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      role: string;
    };

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.isActive === false) {
      return NextResponse.json(
        { error: "Account is disabled" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      _id: user._id,
      id: user._id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      credits: user.credits,
      whatsapp_number: user.whatsapp_number,
      username: user.username,
      isActive: user.isActive,
      created_at: user.created_at,
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
