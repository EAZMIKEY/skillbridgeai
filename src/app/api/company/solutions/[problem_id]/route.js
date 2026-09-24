import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Solution from "@/models/Solution";

// GET /api/company/solutions/[problem_id]
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { problem_id } = await params;
    if (!problem_id) {
      return NextResponse.json({ error: "Missing problem ID" }, { status: 400 });
    }

    const solutions = await Solution.find({ problem: problem_id }).sort({ aiScore: -1 });
    return NextResponse.json({ solutions });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
