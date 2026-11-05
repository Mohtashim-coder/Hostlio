/**
 * Admin Listings API
 * GET  /api/admin/listings — List properties by status
 * PATCH /api/admin/listings — Approve / Reject / Remove a property
 */

import "@/lib/env";
import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/db";
import Property from "@/models/Property";
import { requireRole } from "@/lib/auth";
import { z } from "zod";

function getRedisClient(): any | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null;
  try {
    const { Redis } = require("@upstash/redis");
    return new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  } catch {
    return null;
  }
}

async function cachedCount(query: Record<string, any>, cacheKey: string): Promise<number> {
  const redis = getRedisClient();
  if (redis) {
    try {
      const cached = await redis.get(cacheKey);
      if (cached !== null && cached !== undefined) return parseInt(String(cached), 10);
    } catch {
    }
  }
  const count = await Property.countDocuments(query);
  if (redis) {
    try {
      await redis.set(cacheKey, count.toString(), { ex: 60 });
    } catch {
      // Non-fatal
    }
  }
  return count;
}

// GET — Admin panel: List properties by status
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const auth = await requireRole(req, ["admin"]);
    if (!auth.success) return auth.response;

    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status") || "pending";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    // Cap limit to 100
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const city = searchParams.get("city");

    const skip = (page - 1) * limit;

    const query: Record<string, any> = { status };
    if (city) {
      // Sanitize city param to prevent NoSQL injection via regex operators
      query.city = { $regex: `^${city.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" };
    }

    const properties = await Property.find(query)
      .populate("owner_id", "full_name email")
      .select("title type rent status city created_at owner_id approved_by approved_at rejection_reason admin_note photos")
      .skip(skip)
      .limit(limit)
      .sort({ created_at: -1 })
      .lean();

    // Cache countDocuments for 60s
    const countKey = `count:admin:${status}:${city ?? "all"}`;
    const total = await cachedCount(query, countKey);

    return NextResponse.json({
      properties,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch properties" }, { status: 500 });
  }
}

// PATCH body schema
const PatchSchema = z.object({
  propertyId: z.string().min(1),
  newStatus: z.enum(["live", "rejected", "booked", "removed"]),
  adminNote: z.string().max(500).optional(),
});

// PATCH — Approve or Reject a property listing
export async function PATCH(req: NextRequest) {
  try {
    await dbConnect();

    const auth = await requireRole(req, ["admin"]);
    if (!auth.success) return auth.response;

    const body = await req.json();
    const parsed = PatchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { propertyId, newStatus, adminNote } = parsed.data;

    const property = await Property.findById(propertyId);
    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    if (newStatus === "live" && (!property.photos || property.photos.length < 3)) {
      return NextResponse.json(
        { error: "Cannot approve: Minimum 3 photos required" },
        { status: 400 }
      );
    }

    property.status = newStatus;

    if (adminNote) {
      property.admin_note = adminNote;
    }

    if (newStatus === "live") {
      property.approved_at = new Date();
      property.approved_by = auth.userId; 
    } else if (newStatus === "rejected") {
      property.rejection_reason = adminNote || "No reason provided";
    }

    await property.save();

    return NextResponse.json({
      message: `Property ${newStatus} successfully`,
      property: {
        id: property._id,
        status: property.status,
        title: property.title,
        city: property.city,
        approved_at: property.approved_at,
        rejection_reason: property.rejection_reason,
        admin_note: property.admin_note,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update property status" }, { status: 500 });
  }
}
