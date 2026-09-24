import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

// POST /api/auth/login
export async function POST(request) {
  try {
    await connectDB();
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).toLowerCase().trim();

    // 1. Find user by email (selecting hidden password fields)
    const user = await User.findOne({ email: cleanEmail }).select("+password +passwordHash");
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // 2. Verify password securely
    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // 3. Return trusted safe user object (role comes from server DB record)
    const safeUser = user.toJSON();

    return NextResponse.json({
      message: "Login successful.",
      user: safeUser,
    });
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { error: "Authentication failed. Please check server configuration." },
      { status: 500 }
    );
  }
}
