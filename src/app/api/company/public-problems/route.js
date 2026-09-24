import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Problem from "@/models/Problem";

// GET /api/company/public-problems  — lists all open problems for students
export async function GET() {
  try {
    await connectDB();
    const problems = await Problem.find({ status: "open" }).sort({ createdAt: -1 });
    return NextResponse.json({ problems });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
