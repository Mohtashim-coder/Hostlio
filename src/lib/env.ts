/**
 * Environment Variable Configuration
 * Centralized, typed access to critical environment variables.
 * Provides fallback defaults for development and static build analysis so that
 * builds succeed even if env vars are not set during static page generation.
 */

const FALLBACK_JWT_SECRET = "fallback-secret-do-not-use-in-production-min-32-chars";

export const JWT_SECRET: string = process.env.JWT_SECRET || FALLBACK_JWT_SECRET;

export const MONGODB_URI: string = process.env.MONGODB_URI || "mongodb://localhost:27017/hostlio";

export const CLOUDINARY_CLOUD_NAME: string = process.env.CLOUDINARY_CLOUD_NAME || "";
export const CLOUDINARY_API_KEY: string = process.env.CLOUDINARY_API_KEY || "";
export const CLOUDINARY_API_SECRET: string = process.env.CLOUDINARY_API_SECRET || "";

export function getJwtSecret(): string {
  return process.env.JWT_SECRET || JWT_SECRET;
}

export function getMongodbUri(): string {
  return process.env.MONGODB_URI || MONGODB_URI;
}

export function getCloudinaryCloudName(): string {
  return process.env.CLOUDINARY_CLOUD_NAME || CLOUDINARY_CLOUD_NAME;
}

export function getCloudinaryApiKey(): string {
  return process.env.CLOUDINARY_API_KEY || CLOUDINARY_API_KEY;
}

export function getCloudinaryApiSecret(): string {
  return process.env.CLOUDINARY_API_SECRET || CLOUDINARY_API_SECRET;
}

const OPTIONAL_ENV_VARS = [
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
];

// Warn about missing optional vars once per process in production runtime (not during build)
let _optionalVarsChecked = false;
if (
  typeof process !== "undefined" &&
  process.env.NODE_ENV === "production" &&
  process.env.NEXT_PHASE !== "phase-production-build" &&
  !_optionalVarsChecked
) {
  _optionalVarsChecked = true;
  for (const key of OPTIONAL_ENV_VARS) {
    if (!process.env[key]) {
      console.warn(
        `[Hostlio] WARNING: Optional env var ${key} is not set. ` +
          `Redis-backed rate limiting will be disabled — brute-force protection is OFF.`
      );
    }
  }
}
