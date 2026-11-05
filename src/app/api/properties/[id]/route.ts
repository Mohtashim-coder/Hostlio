/**
 * Property Detail API
 * GET    /api/properties/[id] — Fetch a single property
 * PUT    /api/properties/[id] — Update a property (owner only)
 * DELETE /api/properties/[id] — Delete a property (owner only, pending status only)
 */

import "@/lib/env";
import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/db";
import Property from "@/models/Property";
import { getAuthenticatedUser } from "@/lib/auth";
import { z } from "zod";

type RouteContext = { params: Promise<{ id: string }> };

/** Strip HTML tags from a string to prevent stored XSS */
function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, "").trim();
}

// ─── GET ──────────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    await dbConnect();

    const { id } = await context.params;

    const property = await Property.findById(id)
      .populate("owner_id", "full_name")
      .lean();

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    const auth = await getAuthenticatedUser(req);
    const isAdmin = auth?.role === "admin";
    const isOwner = auth?.userId === (property.owner_id as any)?._id?.toString();

    const {
      owner_whatsapp,
      admin_note,
      contact_unlocks,
      rejection_reason,
      ...publicProperty
    } = property as any;

    if (isAdmin) {
      return NextResponse.json(property);
    }

    if (isOwner) {
      const { admin_note: _adminNote, contact_unlocks: _unlocks, ...ownerProperty } = property as any;
      return NextResponse.json({
        ...ownerProperty,
        rejection_reason,
      });
    }

    return NextResponse.json(publicProperty);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch property" }, { status: 500 });
  }
}

// ─── PUT ──────────────────────────────────────────────────────────────────────
const ALLOWED_UPDATE_FIELDS = [
  "title",
  "description",
  "rent",
  "deposit",
  "maintenance_charges",
  "electricity_bill_per_unit",
  "address",
  "city",
  "pincode",
  "photos",
  "video",
  "availability_date",
  "opening_time",
  "closing_time",
  "bhk_type",
  "area_sqft",
  "furnishing",
  "amenities",
  "furniture_available",
  "preferred_tenants",
  "restrictions",
  "parking",
  "landmarks",
] as const;

const PropertyUpdateSchema = z
  .object({
    title: z.string().min(5).max(200).optional(),
    description: z.string().min(10).max(5000).optional(),
    rent: z.number().min(0).max(10_000_000).optional(),
    deposit: z.number().min(0).max(100_000_000).optional(),
    maintenance_charges: z.number().min(0).optional(),
    electricity_bill_per_unit: z.number().min(0).optional(),
    address: z.string().min(5).max(500).optional(),
    city: z.string().min(2).max(100).regex(/^[a-zA-Z\s\-]+$/).optional(),
    pincode: z
      .string()
      .regex(/^\d{6}$/)
      .optional(),
    photos: z.array(z.string().url()).min(3).max(20).optional(),
    video: z.array(z.string().url()).max(3).optional(),
    availability_date: z.string().optional(),
    opening_time: z.string().max(20).optional(),
    closing_time: z.string().max(20).optional(),
    bhk_type: z
      .enum(["1 BHK", "2 BHK", "3 BHK", "Studio", "Independent House"])
      .optional(),
    area_sqft: z.number().min(0).optional(),
    furnishing: z
      .enum(["Fully Furnished", "Semi Furnished", "Unfurnished"])
      .optional(),
    amenities: z.array(z.string().max(100)).max(50).optional(),
    furniture_available: z.array(z.string().max(100)).max(50).optional(),
    preferred_tenants: z
      .enum(["Everyone", "Boys Only", "Girls Only", "Families", "Bachelors"])
      .optional(),
    restrictions: z.array(z.string().max(100)).max(20).optional(),
    parking: z.enum(["None", "Two-Wheeler", "Four-Wheeler", "Both"]).optional(),
    landmarks: z.array(z.any()).max(10).optional(),
  })
  .strict();

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    await dbConnect();

    const auth = await getAuthenticatedUser(req);
    if (!auth) {
      return NextResponse.json(
        { error: "Authentication required. Please login." },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const property = await Property.findById(id);

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    if (property.owner_id.toString() !== auth.userId) {
      return NextResponse.json(
        { error: "Unauthorized — you can only edit your own listings" },
        { status: 403 }
      );
    }

    if (!["pending", "live"].includes(property.status)) {
      return NextResponse.json(
        { error: `Cannot edit property with status: ${property.status}` },
        { status: 400 }
      );
    }

    const rawBody = await req.json();

    const parsed = PropertyUpdateSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    if (property.status === "live") {
      property.status = "edit_requested";
    }

    const body = parsed.data;

    if (body.title) property.title = stripHtml(body.title);
    if (body.description) property.description = stripHtml(body.description);
    if (body.address) property.address = stripHtml(body.address);

    // Update remaining allowed fields
    const textFields = ["title", "description", "address"];
    for (const field of ALLOWED_UPDATE_FIELDS) {
      if (!textFields.includes(field) && body[field] !== undefined) {
        (property as any)[field] = body[field];
      }
    }

    property.updated_at = new Date();
    await property.save();

    return NextResponse.json({
      message: "Property updated successfully",
      property: { id: property._id, status: property.status, title: property.title },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update property" }, { status: 500 });
  }
}

// ─── DELETE ──────────────────────────────────────────────────────────────────
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    await dbConnect();

    const auth = await getAuthenticatedUser(req);
    if (!auth) {
      return NextResponse.json(
        { error: "Authentication required. Please login." },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const property = await Property.findById(id);

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    if (property.owner_id.toString() !== auth.userId) {
      return NextResponse.json(
        { error: "Unauthorized — you can only delete your own listings" },
        { status: 403 }
      );
    }

    if (property.status !== "pending") {
      return NextResponse.json(
        { error: "Cannot delete property with status: " + property.status },
        { status: 400 }
      );
    }

    await Property.findByIdAndDelete(id);

    return NextResponse.json({ message: "Property deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete property" }, { status: 500 });
  }
}
