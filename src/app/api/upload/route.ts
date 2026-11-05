/**
 * POST /api/upload
 * Secure image upload to Cloudinary.
 */

import "@/lib/env";
import { NextResponse, NextRequest } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { getAuthenticatedUser, checkUploadRateLimit } from "@/lib/auth";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

/**
 * Validate actual file type by inspecting magic bytes from the buffer.
 * This is more reliable than checking the Content-Type header or base64 prefix,
 * which can be easily spoofed.
 */
function validateMimeFromBuffer(buffer: Buffer): string | null {
  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "image/png";
  }

  // WebP: RIFF????WEBP
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return "image/webp";
  }

  return null; // Unknown, then not allowed
}

const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request: NextRequest) {
  // Require authentication
  const auth = await getAuthenticatedUser(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contentLength = request.headers.get("content-length");
  if (contentLength && parseInt(contentLength) > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json(
      { error: "File too large. Maximum size is 10MB." },
      { status: 413 }
    );
  }

  const rateLimit = await checkUploadRateLimit(auth.userId);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Upload limit reached. You can upload up to 20 images per hour." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rateLimit.resetTime - Date.now()) / 1000)),
        },
      }
    );
  }

  try {
    const { image } = await request.json();

    if (!image || typeof image !== "string") {
      return NextResponse.json({ error: "No image data provided" }, { status: 400 });
    }

    // Extract base64 data from data URI (e.g., "data:image/jpeg;base64,/9j/4AAQ...")
    const base64Data = image.includes(",") ? image.split(",")[1] : image;

    if (!base64Data) {
      return NextResponse.json({ error: "Invalid image format" }, { status: 400 });
    }

    const buffer = Buffer.from(base64Data, "base64");

    if (buffer.length > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 413 }
      );
    }

    const detectedMime = validateMimeFromBuffer(buffer);

    if (!detectedMime || !ALLOWED_MIMES.includes(detectedMime)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, and WebP images are allowed." },
        { status: 415 }
      );
    }

    // Upload to Cloudinary (server-side signed upload — api_secret stays on server)
    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: "hostlio_properties",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      resource_type: "image",
      max_bytes: MAX_FILE_SIZE_BYTES,
    });

    return NextResponse.json({
      url: uploadResponse.secure_url,
      publicId: uploadResponse.public_id,
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}
