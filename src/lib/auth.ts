/**
 * JWT Authentication & Security Utilities
 * Provides secure user verification and Redis-backed rate limiting for API routes.
 */

import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { JWT_SECRET } from "@/lib/env";

// ─── Upstash Redis Rate Limiter ───────────────────────────────────────────────

let upstashAvailable = false;

let loginRatelimit: any = null;
let uploadRatelimit: any = null;
let propertyRatelimit: any = null;

try {
  if (
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    const { Ratelimit } = require("@upstash/ratelimit");
    const { Redis } = require("@upstash/redis");

    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    loginRatelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "15 m"),
      prefix: "hostlio:login",
    });

    uploadRatelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, "1 h"),
      prefix: "hostlio:upload",
    });

    propertyRatelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, "24 h"),
      prefix: "hostlio:create_property",
    });

    upstashAvailable = true;
  }
} catch {
  // Upstash packages not installed or unavailable — rate limiting is disabled
}

/**
 * Internal helper: run a rate limit check against a module-scope Ratelimit instance.
 * Wrapped in try/catch. On Redis error, FAILS OPEN (allows the request through)
 * so that an Upstash outage does not take down the application.
 */
async function runRateLimit(
  ratelimiter: any,
  identifier: string,
  actionName: string
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  if (!upstashAvailable || !ratelimiter) {
    if (process.env.NODE_ENV === "production") {
      console.warn(
        `[Hostlio][RateLimit] Upstash not configured. Rate limiting DISABLED for: ${actionName}`
      );
    }
    return { allowed: true, remaining: 999, resetTime: Date.now() + 60000 };
  }

  try {
    const { success, remaining, reset } = await ratelimiter.limit(identifier);
    return { allowed: success, remaining, resetTime: reset };
  } catch (err) {
    console.error(
      `[RateLimit] Redis unavailable, failing open for action '${actionName}':`,
      (err as Error).message
    );
    return { allowed: true, remaining: 0, resetTime: Date.now() + 60000 };
  }
}

// ─── Public Rate-Limit Presets ────────────────────────────────────────────────

/** Login: 5 attempts per 15 minutes per IP */
export async function checkLoginRateLimit(ip: string) {
  return runRateLimit(loginRatelimit, ip, "login");
}

/** Upload: 20 per hour per authenticated user ID */
export async function checkUploadRateLimit(userId: string) {
  return runRateLimit(uploadRatelimit, userId, "upload");
}

/** Property creation: 3 per 24 hours per authenticated user ID */
export async function checkPropertyCreationRateLimit(userId: string) {
  return runRateLimit(propertyRatelimit, userId, "create_property");
}

// Legacy constants kept for any callers that reference them
export const PROPERTY_SUBMISSION_LIMIT = { maxRequests: 3, windowStr: "24 h" };
export const CONTACT_UNLOCK_LIMIT = { maxRequests: 25, windowStr: "30 d" };

// ─── JWT Verification ─────────────────────────────────────────────────────────

/**
 * Verify JWT token and extract payload.
 * Returns null on any failure — never throws.
 * Uses JWT_SECRET from env.ts
 */
export function verifyJWT(token: string | undefined): {
  userId: string;
  email: string;
  role: string;
} | null {
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      userId?: string;
      email?: string;
      role: string;
    };

    return {
      userId: decoded.id || decoded.userId || "",
      email: decoded.email || "",
      role: decoded.role,
    };
  } catch {
    return null;
  }
}

// ─── Auth Helpers ─────────────────────────────────────────────────────────────

/**
 * Get authenticated user from request.
 * Always fetches fresh role from DB (never trusts stale JWT role).
 * Returns null if token invalid, user not found, or account is banned.
 */
export async function getAuthenticatedUser(req: NextRequest): Promise<{
  userId: string;
  email: string;
  role: string;
  dbUser: any;
} | null> {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;

  const decoded = verifyJWT(token);
  if (!decoded) return null;

  await dbConnect();
  const dbUser = await User.findById(decoded.userId).select("-password");

  if (!dbUser) return null;

  // isActive check BEFORE returning role — banned users are blocked here
  if (dbUser.isActive === false) return null;

  return {
    userId: dbUser._id.toString(),
    email: dbUser.email,
    role: dbUser.role,
    dbUser,
  };
}

/**
 * Require authentication - returns error response if not authenticated
 */
export async function requireAuth(
  req: NextRequest,
): Promise<
  | { success: true; userId: string; email: string; role: string; dbUser: any }
  | { success: false; response: NextResponse }
> {
  const auth = await getAuthenticatedUser(req);

  if (!auth) {
    return {
      success: false,
      response: NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      ),
    };
  }

  return { success: true, ...auth };
}

/**
 * Require specific role - returns error response if role doesn't match
 */
export async function requireRole(
  req: NextRequest,
  allowedRoles: string[],
): Promise<
  | { success: true; userId: string; email: string; role: string; dbUser: any }
  | { success: false; response: NextResponse }
> {
  const auth = await requireAuth(req);

  if (!auth.success) {
    return auth;
  }

  if (!allowedRoles.includes(auth.role)) {
    return {
      success: false,
      response: NextResponse.json(
        { error: `Access denied. Required role: ${allowedRoles.join(" or ")}` },
        { status: 403 },
      ),
    };
  }

  return auth;
}
