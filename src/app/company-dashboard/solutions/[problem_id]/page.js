"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Trophy, User, Code2, ExternalLink, Github,
  Star, Clock, Layers, TrendingUp, Award, ChevronDown, ChevronUp, Terminal
} from "lucide-react";

function ScoreBadge({ score }) {
  const color =
    score >= 80
      ? "from-emerald-500 to-teal-500 shadow-emerald-500/20"
      : score >= 60
        ? "from-blue-500 to-cyan-500 shadow-blue-500/20"
        : score >= 40
          ? "from-yellow-500 to-orange-500 shadow-yellow-500/20"
          : "from-rose-500 to-red-500 shadow-rose-500/20";

  const label =
    score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Average" : "Needs Work";

  return (
    <div className={`flex flex-col items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br ${color} shadow-lg flex-shrink-0`}>
      <span className="text-white font-black text-xl leading-none">{score}</span>
      <span className="text-white/70 text-[10px] font-semibold mt-0.5">{label}</span>
    </div>
  );
}

function RankBadge({ rank }) {
  if (rank === 1) return <span className="text-yellow-400 flex items-center gap-1 text-xs font-bold"><Trophy size={13} /> 1st</span>;
  if (rank === 2) return <span className="text-slate-300 flex items-center gap-1 text-xs font-bold"><Award size={13} /> 2nd</span>;
  if (rank === 3) return <span className="text-amber-600 flex items-center gap-1 text-xs font-bold"><Star size={13} /> 3rd</span>;
  return <span className="text-white/30 text-xs font-medium">#{rank}</span>;
}

function SolutionCard({ solution, rank }) {
  const [expanded, setExpanded] = useState(false);
  const date = new Date(solution.createdAt).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });

  const isLong = solution.solutionText?.length > 300;
  const displayText = isLong && !expanded
    ? solution.solutionText.slice(0, 300) + "…"
    : solution.solutionText;

  return (
    <div className={`glass rounded-2xl p-6 transition-all duration-300 hover:border-white/15 ${rank === 1 ? "border-yellow-400/20 bg-yellow-400/3" : ""}`}>
      <div className="flex flex-col sm:flex-row gap-5">
        {/* Rank + score */}
        <div className="flex sm:flex-col items-center gap-4 sm:gap-3 flex-shrink-0">
          <div className="text-center">
            <RankBadge rank={rank} />
          </div>
          <ScoreBadge score={solution.aiScore || 0} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                <User size={13} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">{solution.studentName}</p>
                {solution.studentEmail && (
                  <p className="text-white/30 text-xs">{solution.studentEmail}</p>
                )}
              </div>
            </div>
            <span className="text-white/20 text-xs ml-auto">{date}</span>
          </div>

          {/* Solution text */}
          <div className="bg-white/3 rounded-xl p-4 mb-4">
            <p className="text-white/70 text-sm leading-relaxed whitespace-pre-line">{displayText}</p>
            {isLong && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1 text-violet-400 hover:text-violet-300 text-xs font-medium mt-2 transition-colors"
              >
                {expanded ? <><ChevronUp size={13} /> Show less</> : <><ChevronDown size={13} /> Read more</>}
              </button>
            )}
          </div>

          {/* AI Feedback */}
          {solution.aiFeedback && (() => {
            try {
              const aiData = JSON.parse(solution.aiFeedback);
              return (
                <div className="rounded-2xl bg-gradient-to-br from-violet-500/10 to-blue-500/10 border border-violet-500/30 p-5 mb-5 shadow-lg shadow-violet-500/5 transition-all">
                  <div className="flex items-center gap-2 mb-3">
                    <Star size={18} className="text-violet-400" />
                    <h4 className="text-white font-bold text-sm tracking-wide">Fine-Tuned AI Evaluation</h4>
                  </div>
                  <p className="text-white/80 text-sm leading-relaxed mb-4">{aiData.summary || "Evaluation completed."}</p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    {[
                      { l: "Innovation", v: aiData.innovation, m: 25 },
                      { l: "Feasibility", v: aiData.feasibility, m: 25 },
                      { l: "Clarity", v: aiData.clarity, m: 20 },
                      { l: "Market Fit", v: aiData.marketPotential, m: 30 }
                    ].map(metric => (
                      <div key={metric.l} className="bg-black/20 rounded-xl p-3 border border-white/5">
                        <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider mb-1">{metric.l}</p>
                        <div className="flex items-end gap-1">
                          <span className="text-white font-bold text-lg leading-none">{metric.v}</span>
                          <span className="text-white/30 text-xs font-medium pb-0.5">/{metric.m}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                    <p className="text-white/40 text-[10px] uppercase font-bold tracking-wider mb-1 flex items-center gap-1.5"><Terminal size={10} /> Reasoning Trace</p>
                    <p className="text-violet-300/70 text-xs leading-relaxed">{aiData.reasoning}</p>
                  </div>
                </div>
              );
            } catch (e) {
              return (
                <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-violet-500/8 border border-violet-500/15 mb-4">
                  <TrendingUp size={13} className="text-violet-400 mt-0.5 flex-shrink-0" />
                  <p className="text-violet-300/80 text-xs leading-relaxed">{solution.aiFeedback}</p>
                </div>
              );
            }
          })()}

          <div className="flex flex-wrap gap-4 items-center">
            {/* Tech stack */}
            {solution.techStack?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {solution.techStack.map((t) => (
                  <span key={t} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/8 text-white/50 text-xs">
                    {t}
                  </span>
                ))}
              </div>
            )}

            {/* Links */}
            <div className="flex gap-3 ml-auto">
              {solution.repoUrl && (
                <a
                  href={solution.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-white/40 hover:text-white text-xs font-medium transition-colors"
                >
                  <Github size={13} /> Repo
                </a>
              )}
              {solution.demoUrl && (
                <a
                  href={solution.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-white/40 hover:text-white text-xs font-medium transition-colors"
                >
                  <ExternalLink size={13} /> Demo
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SolutionsPage() {
  const router = useRouter();
  const params = useParams();
  const problemId = params.problem_id;

  const [company] = useState(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem("innoverse_company");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [solutions, setSolutions] = useState([]);
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSolutions = useCallback(async () => {
    try {
      const res = await fetch(`/api/company/solutions/${problemId}`);
      const data = await res.json();
      if (res.ok) setSolutions(data.solutions || []);
    } catch { /* noop */ }
  }, [problemId]);

  useEffect(() => {
    const stored = localStorage.getItem("innoverse_company");
    if (!stored) { router.replace("/company-login"); return; }

    // Fetch problems to get problem details for breadcrumb
    const fetchProblem = async (companyId) => {
      try {
        const res = await fetch(`/api/company/problems?companyId=${companyId}`);
        const data = await res.json();
        if (res.ok) {
          const found = data.problems.find((p) => p._id === problemId);
          if (found) setProblem(found);
        }
      } catch { /* noop */ }
    };

    const loadData = async () => {
      const c = JSON.parse(stored);
      try {
        await Promise.all([fetchSolutions(), fetchProblem(c._id)]);
      } catch {
        /* noop */
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [problemId, router, fetchSolutions]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-white/10 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  const avgScore =
    solutions.length > 0
      ? Math.round(solutions.reduce((a, s) => a + (s.aiScore || 0), 0) / solutions.length)
      : 0;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="fixed top-0 left-1/3 w-96 h-96 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />
      <div className="fixed bottom-10 right-1/4 w-80 h-80 rounded-full bg-blue-600/8 blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-5 py-10">
        {/* Breadcrumb + back */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/company-dashboard"
            className="flex items-center gap-2 text-white/40 hover:text-white text-sm font-medium transition-colors"
          >
            <ArrowLeft size={16} />
            Dashboard
          </Link>
          <span className="text-white/20">/</span>
          <span className="text-white/50 text-sm">Solutions</span>
          {problem && (
            <>
              <span className="text-white/20">/</span>
              <span className="text-white/70 text-sm font-medium truncate max-w-xs">
                {problem.title}
              </span>
            </>
          )}
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Code2 size={14} className="text-violet-400" />
            <span className="text-violet-400 text-xs font-semibold uppercase tracking-widest">
              Solutions
            </span>
          </div>

          {problem ? (
            <>
              <h1 className="text-3xl font-bold text-white mb-2">{problem.title}</h1>
              <p className="text-white/40 text-sm flex items-center gap-2">
                <Layers size={13} />
                {problem.domain} · {company?.name}
              </p>
            </>
          ) : (
            <h1 className="text-3xl font-bold text-white mb-1">Problem Solutions</h1>
          )}
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Submissions", value: solutions.length, icon: User },
            { label: "Avg AI Score", value: `${avgScore}/100`, icon: TrendingUp },
            {
              label: "Top Score",
              value: solutions.length > 0 ? `${solutions[0].aiScore}/100` : "—",
              icon: Trophy,
            },
          ].map((s) => (
            <div key={s.label} className="glass rounded-2xl p-4 text-center">
              <s.icon size={16} className="text-violet-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-white/30 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Solutions list */}
        {solutions.length === 0 ? (
          <div className="glass rounded-2xl p-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
              <Clock size={24} className="text-white/30" />
            </div>
            <h3 className="font-bold text-white text-lg mb-2">No solutions yet</h3>
            <p className="text-white/40 text-sm max-w-xs mx-auto">
              Students haven&apos;t submitted solutions for this problem yet. Share it to get started!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Trophy size={14} className="text-yellow-400" />
              <span className="text-white/40 text-xs font-medium">
                Ranked by AI Score — highest first
              </span>
            </div>
            {solutions.map((sol, i) => (
              <SolutionCard key={sol._id} solution={sol} rank={i + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
