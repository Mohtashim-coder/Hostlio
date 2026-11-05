import { NextResponse, NextRequest } from "next/server";
import { getLocationFromCoords } from "@/lib/reverse-geocoding";

// GET - Reverse geocoding: Convert coordinates to address
// Query params: lat, lng
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");

    // Validate required params
    if (!lat || !lng) {
      return NextResponse.json(
        { error: "Latitude and longitude are required" },
        { status: 400 },
      );
    }

    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    if (isNaN(latNum) || isNaN(lngNum)) {
      return NextResponse.json(
        { error: "Invalid coordinates format" },
        { status: 400 },
      );
    }

    // Perform reverse geocoding
    const result = await getLocationFromCoords(latNum, lngNum);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to get location details" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      location: {
        display_name: result.data?.display_name,
        city: result.data?.city,
        state: result.data?.state,
        country: result.data?.country,
        pincode: result.data?.pincode,
        latitude: result.data?.latitude,
        longitude: result.data?.longitude,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
