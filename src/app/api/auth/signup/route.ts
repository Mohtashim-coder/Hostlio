/**
 * POST /api/auth/signup
 */

import "@/lib/env";
import { JWT_SECRET } from "@/lib/env";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";

const SignupSchema = z.object({
  email: z
    .string()
    .email({ message: "Enter a valid email address" })
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
  fullName: z
    .string()
    .trim()
    .min(2, { message: "Enter your full name" })
    .max(100),
});

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();
    const parsed = SignupSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.errors[0];
      return NextResponse.json(
        { error: firstError.message, code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    const { email, password, fullName } = parsed.data;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        {
          error: "This email is already registered. Try logging in instead.",
          code: "EMAIL_EXISTS",
        },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a unique username from email prefix + random suffix
    const username = email.split("@")[0] + Math.random().toString(36).substring(2, 8);

    const user = new User({
      email,
      username,
      full_name: fullName,
      password: hashedPassword,
      role: "tenant",
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    const response = NextResponse.json(
      {
        message: "Account created. Welcome to Hostlio.",
        user: {
          id: user._id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
        },
      },
      { status: 201 }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 86400,
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error: "Could not create account. Check your details and try again.",
        code: "SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}
