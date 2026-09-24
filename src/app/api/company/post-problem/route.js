import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Problem from "@/models/Problem";

// POST /api/company/post-problem
export async function POST(request) {
  try {
    await connectDB();
    const { title, description, domain, expectedOutcome, companyId, companyName } =
      await request.json();

    if (!title || !description || !domain || !expectedOutcome || !companyId || !companyName) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    const problem = await Problem.create({
      title,
      description,
      domain,
      expectedOutcome,
      company: companyId,
      companyName,
      status: "open",
      solutionCount: 0,
    });

    return NextResponse.json(
      { message: "Problem posted successfully.", problem },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
