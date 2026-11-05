/**
 * Credits API
 * GET  /api/credits — Get authenticated user's credit balance
 * POST /api/credits — Add credits (ADMIN ONLY)
 */

import "@/lib/env";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { getAuthenticatedUser, requireRole } from "@/lib/auth";
import { z } from "zod";

const CreditsAddSchema = z.object({
  creditsToAdd: z
    .number()
    .int({ message: "Credits must be a whole number" })
    .positive({ message: "Credits to add must be positive" })
    .max(10000, { message: "Cannot add more than 10,000 credits at once" }),
  targetUserId: z
    .string()
    .optional(),
});

// GET — Any authenticated user can check their own balance
export async function GET(request: Request) {
  const auth = await getAuthenticatedUser(request as any);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  try {
    const user = await User.findById(auth.userId).select("credits");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ credits: user.credits });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch credits" }, { status: 500 });
  }
}

// POST — ADMIN ONLY: Add credits to a user account
export async function POST(request: Request) {
  const auth = await requireRole(request as any, ["admin"]);
  if (!auth.success) return auth.response;

  await dbConnect();

  try {
    const body = await request.json();
    const parsed = CreditsAddSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { creditsToAdd, targetUserId } = parsed.data;

    const userId = targetUserId || auth.userId;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $inc: { credits: creditsToAdd } },
      { new: true, select: "credits email full_name" }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: `Added ${creditsToAdd} credits`,
      userId,
      newBalance: updatedUser.credits,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update credits" }, { status: 400 });
  }
}
