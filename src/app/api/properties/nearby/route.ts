import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/db";
import Property from "@/models/Property";

// GET - Search for nearby properties
// Query params: lat, lng, radius (in meters, default 5000)
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const searchParams = req.nextUrl.searchParams;
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const radius = parseInt(searchParams.get("radius") || "5000");

    // Validate required params
    if (!lat || !lng) {
      return NextResponse.json(
        { error: "Latitude and longitude are required" },
        { status: 400 }
      );
    }

    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    if (isNaN(latNum) || isNaN(lngNum)) {
      return NextResponse.json(
        { error: "Invalid coordinates" },
        { status: 400 }
      );
    }

    // Use MongoDB geospatial query with $near
    const properties = await Property.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lngNum, latNum],
          },
          $maxDistance: radius,
        },
      },
      status: "live",
    })
      .select(
        "title type rent deposit address city pincode photos location bhk_type area_sqft furnishing amenities"
      )
      .limit(50)
      .lean();

    return NextResponse.json({
      success: true,
      count: properties.length,
      center: { lat: latNum, lng: lngNum },
      radius,
      properties,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to search nearby properties" },
      { status: 500 }
    );
  }
}