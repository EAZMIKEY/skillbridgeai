import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

// POST /api/auth/register
export async function POST(request) {
  try {
    await connectDB();
    const { name, email, password, role, username } = await request.json();

    // 1. Validate required input fields
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Name, email, password, and role are required." },
        { status: 400 }
      );
    }

    // 2. Validate role enum
    const normalizedRole = String(role).toLowerCase().trim();
    if (!["student", "industry", "workforce"].includes(normalizedRole)) {
      return NextResponse.json(
        { error: "Invalid role specified. Supported roles: student, industry, workforce." },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).toLowerCase().trim();

    // 3. Check duplicate user email
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email address already exists." },
        { status: 400 }
      );
    }

    // 4. Create user in MongoDB
    const handle = username || cleanEmail.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
    
    const user = new User({
      name: String(name).trim(),
      email: cleanEmail,
      username: handle,
      password: password,
      passwordHash: password,
      role: normalizedRole,
    });

    await user.save();

    // 5. Safe JSON user payload
    const safeUser = user.toJSON();

    return NextResponse.json(
      { message: "Registration successful.", user: safeUser },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup API error:", error);
    return NextResponse.json(
      { error: "Failed to register user. Please try again." },
      { status: 500 }
    );
  }
}
