/**
 * PATCH /api/auth/user/role
 * Allow authenticated user to switch their role between tenant and owner.
 */

import "@/lib/env";
import { JWT_SECRET } from "@/lib/env";
import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { getAuthenticatedUser } from "@/lib/auth";
import jwt from "jsonwebtoken";
import { z } from "zod";

const RoleUpdateSchema = z.object({
  newRole: z.enum(["tenant", "owner"]),
});

export async function PATCH(req: NextRequest) {
  try {
    await dbConnect();

    const auth = await getAuthenticatedUser(req);
    if (!auth) {
      return NextResponse.json(
        { error: "Authentication required. Please login." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = RoleUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid role. Must be "tenant" or "owner".' },
        { status: 400 }
      );
    }

    const { newRole } = parsed.data;

    const user = await User.findByIdAndUpdate(
      auth.userId,
      { role: newRole },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Issue a new token with the updated role
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    const response = NextResponse.json({
      message: `Role updated to ${newRole}`,
      user: {
        id: user._id,
        email: user.email,
        full_name: user.full_name,
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
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to update role" },
      { status: 500 }
    );
  }
}
