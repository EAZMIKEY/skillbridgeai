import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Solution from "@/models/Solution";
import Problem from "@/models/Problem";
import { evaluateWithAI } from "@/lib/evaluateWithAI";

// POST /api/company/submit-solution
export async function POST(request) {
  try {
    await connectDB();
    const origin = request.headers.get("origin") || request.nextUrl.origin;
    
    // Parse incoming request payload
    const {
      problemId,
      studentId,
      studentName,
      studentEmail,
      solutionText,
      repoUrl,
      demoUrl,
      techStack,
    } = await request.json();

    if (!problemId || !studentId || !studentName || !solutionText) {
      return NextResponse.json(
        { error: "Problem ID, student info, and solution text are required." },
        { status: 400 }
      );
    }
    
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return NextResponse.json({ error: "Problem not found." }, { status: 404 });
    }
    
    // Create preliminary solution to get the ID for evaluation (optional, but AI might need an ID context)
    const newSolution = new Solution({
      problem: problemId,
      student: studentId,
      studentName,
      studentEmail,
      solutionText,
      repoUrl: repoUrl || "",
      demoUrl: demoUrl || "",
      techStack: techStack || [],
    });
    
    const aiScores = await evaluateWithAI(
      problem.title, 
      newSolution._id.toString(), 
      solutionText, 
      origin
    );
    
    newSolution.aiScore = aiScores?.finalScore || 0;
    newSolution.aiFeedback = aiScores ? JSON.stringify(aiScores) : "Evaluation complete";
    
    await newSolution.save();
    
    // Increment problem counter live
    problem.solutionCount = (problem.solutionCount || 0) + 1;
    await problem.save();

    return NextResponse.json(
      { message: "Solution submitted successfully.", solution: newSolution },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
