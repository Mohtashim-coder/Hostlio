/**
 * Properties API
 * POST /api/properties — Create a new property listing (owner only)
 * GET  /api/properties — List live properties with filters
 */

import "@/lib/env";
import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/db";
import Property from "@/models/Property";
import { getAuthenticatedUser, checkPropertyCreationRateLimit } from "@/lib/auth";
import { geocodeAddress, buildFullAddress } from "@/lib/geocoding";
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

/**
 * Redis-cached countDocuments — 60 second TTL.
 * Falls back to a live DB query on Redis error.
 */
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
      await redis.set(cacheKey, count.toString(), { ex: 60 }); // 60-second TTL
    } catch {
      // Non-fatal cache write failure
    }
  }
  return count;
}

/** Strip HTML tags from a string to prevent stored XSS */
function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, "").trim();
}

const LandmarkSchema = z.object({
  name: z.string().max(200).optional(),
  type: z.string().max(100).optional(),
  distance: z.string().max(50).optional(),
  maps_link: z.string().url().optional().or(z.literal("")),
});

const PropertyCreateSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200),
  description: z.string().min(10, "Description too short").max(5000),
  type: z.enum(["Flat", "PG", "Room", "Hostel", "Hotel", "Godam", "Lodge", "Office"]),
  rent: z.number().min(0).max(10_000_000),
  deposit: z.number().min(0).max(100_000_000),
  maintenance_charges: z.number().min(0).max(1_000_000).optional().default(0),
  electricity_bill_per_unit: z.number().min(0).max(100).optional().default(0),
  address: z.string().min(5).max(500),
  city: z.string().min(2).max(100).regex(/^[a-zA-Z\s\-]+$/, "Invalid city name"),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits"),
  photos: z.array(z.string().url()).min(3, "Minimum 3 photos required").max(20),
  video: z.array(z.string().url()).max(3).optional().default([]),
  availability_date: z.string().datetime().or(z.string().min(1)),
  opening_time: z.string().max(20).optional(),
  closing_time: z.string().max(20).optional(),
  owner_whatsapp: z
    .string()
    .regex(/^\+?[\d\s\-]{10,15}$/, "Invalid WhatsApp number"),
  location: z
    .object({
      type: z.literal("Point").optional(),
      coordinates: z.tuple([z.number(), z.number()]),
    })
    .optional(),
  bhk_type: z
    .enum(["1 BHK", "2 BHK", "3 BHK", "Studio", "Independent House"])
    .optional(),
  area_sqft: z.number().min(0).max(100_000).optional(),
  furnishing: z
    .enum(["Fully Furnished", "Semi Furnished", "Unfurnished"])
    .optional(),
  amenities: z.array(z.string().max(100)).max(50).optional().default([]),
  furniture_available: z.array(z.string().max(100)).max(50).optional().default([]),
  preferred_tenants: z
    .enum(["Everyone", "Boys Only", "Girls Only", "Families", "Bachelors"])
    .optional(),
  restrictions: z.array(z.string().max(100)).max(20).optional().default([]),
  parking: z.enum(["None", "Two-Wheeler", "Four-Wheeler", "Both"]).optional(),
  landmarks: z.array(LandmarkSchema).max(10).optional().default([]),
});

// ─── POST — Create property listing ──────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const auth = await getAuthenticatedUser(req);
    if (!auth) {
      return NextResponse.json(
        { error: "Authentication required. Please login." },
        { status: 401 }
      );
    }

    if (auth.role !== "owner") {
      return NextResponse.json(
        { error: "Only owners can create listings" },
        { status: 403 }
      );
    }

    const rateLimit = await checkPropertyCreationRateLimit(auth.userId);
    if (!rateLimit.allowed) {
      const resetDate = new Date(rateLimit.resetTime).toISOString();
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: "You can only submit 3 properties per 24 hours.",
          resetAt: resetDate,
        },
        { status: 429 }
      );
    }

    const rawBody = await req.json();

    const parsed = PropertyCreateSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const body = parsed.data;

    const safeTitle = stripHtml(body.title);
    const safeDescription = stripHtml(body.description);
    const safeAddress = stripHtml(body.address);

    // Resolve location
    const fullAddress = buildFullAddress(safeAddress, body.city, body.pincode);
    const geoResult = await geocodeAddress(fullAddress);
    let finalLocation = null;

    if (
      body.location &&
      Array.isArray(body.location.coordinates) &&
      body.location.coordinates.length === 2 &&
      typeof body.location.coordinates[0] === "number" &&
      typeof body.location.coordinates[1] === "number"
    ) {
      finalLocation = { type: "Point", coordinates: body.location.coordinates };
    } else if (geoResult.success) {
      finalLocation = { type: "Point", coordinates: [geoResult.lng, geoResult.lat] };
    }

    if (!finalLocation) {
      return NextResponse.json(
        { error: "Location is required. Please fetch location." },
        { status: 400 }
      );
    }

    const property = new Property({
      owner_id: auth.userId,
      title: safeTitle,
      description: safeDescription,
      type: body.type,
      rent: body.rent,
      deposit: body.deposit,
      maintenance_charges: body.maintenance_charges,
      electricity_bill_per_unit: body.electricity_bill_per_unit,
      address: safeAddress,
      city: body.city,
      pincode: body.pincode,
      photos: body.photos,
      video: body.video,
      availability_date: body.availability_date,
      opening_time: body.opening_time,
      closing_time: body.closing_time,
      owner_whatsapp: body.owner_whatsapp,
      bhk_type: body.bhk_type,
      area_sqft: body.area_sqft,
      furnishing: body.furnishing,
      amenities: body.amenities,
      furniture_available: body.furniture_available,
      preferred_tenants: body.preferred_tenants,
      restrictions: body.restrictions,
      parking: body.parking,
      landmarks: body.landmarks,
      status: "pending",
      location: finalLocation,
    });

    await property.save();
    await property.populate("owner_id", "full_name email");

    return NextResponse.json(
      {
        message: "Property submitted successfully for admin verification",
        property: {
          id: property._id,
          status: property.status,
          title: property.title,
          city: property.city,
          created_at: property.created_at,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.name === "ValidationError") {
      const details = Object.values(error.errors).map((e: any) => e.message);
      return NextResponse.json({ error: "Validation failed", details }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create property listing" }, { status: 500 });
  }
}

// ─── GET — List live properties ───────────────────────────────────────────────

const QueryParamCity = z
  .string()
  .max(100)
  .regex(/^[a-zA-Z\s\-]+$/)
  .optional();

const QueryParamType = z
  .enum(["Flat", "PG", "Room", "Hostel", "Hotel", "Godam", "Lodge", "Office"])
  .optional();

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const searchParams = req.nextUrl.searchParams;

    const cityParsed = QueryParamCity.safeParse(searchParams.get("city") ?? undefined);
    const typeParsed = QueryParamType.safeParse(searchParams.get("type") ?? undefined);

    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const skip = (page - 1) * limit;

    const query: Record<string, any> = { status: "live" };

    if (cityParsed.success && cityParsed.data) {
      query.city = { $regex: `^${cityParsed.data}$`, $options: "i" };
    }
    if (typeParsed.success && typeParsed.data) {
      query.type = typeParsed.data;
    }

    const properties = await Property.find(query)
      .select("-owner_whatsapp -owner_id -admin_note -__v -updated_at")
      .skip(skip)
      .limit(limit)
      .sort({ created_at: -1 })
      .lean();

    // Cache countDocuments result for 60s (avoids redundant full-collection count)
    const cityParam = cityParsed.success && cityParsed.data ? cityParsed.data : "all";
    const typeParam = typeParsed.success && typeParsed.data ? typeParsed.data : "all";
    const countKey = `count:properties:live:${cityParam}:${typeParam}`;
    const total = await cachedCount(query, countKey);

    return NextResponse.json({
      properties,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch properties" }, { status: 500 });
  }
}
