/**
 * Owner Listings API
 * GET /api/owner/listings — Owner views their own listings
 */

import "@/lib/env";
import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/db";
import Property from "@/models/Property";
import { getAuthenticatedUser } from "@/lib/auth";

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
      // Redis unavailable — fall through to DB
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

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const auth = await getAuthenticatedUser(req);
    if (!auth) {
      return NextResponse.json(
        { error: "Authentication required. Please login." },
        { status: 401 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const skip = (page - 1) * limit;

    // Scope query to the authenticated owner — no way to see another owner's listings
    const query: Record<string, any> = { owner_id: auth.userId };
    if (status) query.status = status;

    const properties = await Property.find(query)
      .select("title type rent status city created_at photos pincode availability_date rejection_reason admin_note")
      .skip(skip)
      .limit(limit)
      .sort({ created_at: -1 })
      .lean();

    // Cache countDocuments for 60s (per owner + status filter)
    const countKey = `count:owner:${auth.userId}:${status ?? "all"}`;
    const total = await cachedCount(query, countKey);

    const statusCounts = await Property.aggregate([
      { $match: { owner_id: auth.userId as any } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const counts = {
      pending: 0,
      live: 0,
      booked: 0,
      rejected: 0,
      removed: 0,
      edit_requested: 0,
    };

    statusCounts.forEach((item: any) => {
      if (item._id in counts) {
        counts[item._id as keyof typeof counts] = item.count;
      }
    });

    return NextResponse.json({
      properties,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
      statusCounts: counts,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch your listings" }, { status: 500 });
  }
}
