import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Problem from "@/models/Problem";

// GET /api/company/problems?companyId=xxx
export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");

    if (!companyId) {
      return NextResponse.json(
        { error: "companyId is required." },
        { status: 400 }
      );
    }

    const problems = await Problem.find({ company: companyId }).sort({ createdAt: -1 });

    return NextResponse.json({ problems });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
