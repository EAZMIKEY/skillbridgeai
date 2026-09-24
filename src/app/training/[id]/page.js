"use client";

import React, { use, useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  BookOpen, 
  Target, 
  Sparkles, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  ChevronRight, 
  Info, 
  Network, 
  X, 
  Award, 
  Zap, 
  CheckSquare2, 
  Briefcase, 
  BarChart2, 
  SlidersHorizontal,
  Flame
} from "lucide-react";
import { buildCurriculumAlignment } from "@/lib/curriculumAlignment";
import { STUDENT_PROFILE } from "@/data/studentProfile";

export default function TrainingDetailPage({ params }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const programId = resolvedParams?.id || "tp_fullstack_ai";

  const [activeExplainModal, setActiveExplainModal] = useState(false);

  // Build Curriculum Alignment Intelligence Data
  const program = useMemo(() => {
    return buildCurriculumAlignment(programId, STUDENT_PROFILE.capabilities);
  }, [programId]);

  if (!program) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="text-center p-8 glass rounded-2xl">
          <AlertTriangle className="mx-auto text-red-400 mb-4" size={48} />
          <h2 className="text-xl font-bold mb-2">Program Not Found</h2>
          <Link href="/training" className="text-xs text-violet-400 underline">Return to Training Programs</Link>
        </div>
      </div>
    );
  }

  const { alignment, gaps, interventions, projectedImpact, relevantChallenges, explanation } = program;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-violet-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-[30%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />

      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-16 relative z-10">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link href="/training" className="text-xs text-white/50 hover:text-white flex items-center gap-1.5 font-semibold">
            ← Back to Curriculum Intelligence Exchange
          </Link>
        </div>

        {/* 1. Program Overview Header */}
        <div className="glass rounded-3xl p-6 sm:p-8 border border-white/10 mb-8 bg-gradient-to-br from-black/60 via-black/40 to-violet-950/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10 mb-6">
            <div>
              <span className="text-xs uppercase font-bold text-violet-400 tracking-widest block mb-1">
                {program.provider} • {program.domain}
              </span>
              <h1 className="text-2xl sm:text-4xl font-black text-white mb-3">{program.name}</h1>
              <p className="text-xs sm:text-sm text-white/70 max-w-3xl leading-relaxed">{program.description}</p>
            </div>

            <div className="flex flex-col items-end gap-3 shrink-0">
              <span className={`text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-full border ${
                alignment.trajectory === 'IMPROVING' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                alignment.trajectory === 'STABLE' ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' :
                'bg-red-500/20 text-red-300 border-red-500/40'
              }`}>
                Trajectory: {alignment.trajectory}
              </span>

              <button
                onClick={() => setActiveExplainModal(true)}
                className="text-xs bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 border border-white/10"
              >
                <Info size={14} /> Explain Alignment
              </button>
            </div>
          </div>

          {/* Meta Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="bg-white/5 p-3.5 rounded-xl border border-white/5">
              <span className="text-white/40 block text-[10px] uppercase font-bold">Level</span>
              <strong className="text-white text-sm">{program.level}</strong>
            </div>
            <div className="bg-white/5 p-3.5 rounded-xl border border-white/5">
              <span className="text-white/40 block text-[10px] uppercase font-bold">Duration</span>
              <strong className="text-violet-300 text-sm">{program.duration}</strong>
            </div>
            <div className="bg-white/5 p-3.5 rounded-xl border border-white/5">
              <span className="text-white/40 block text-[10px] uppercase font-bold">Delivery Mode</span>
              <strong className="text-blue-300 text-sm">{program.deliveryMode}</strong>
            </div>
            <div className="bg-white/5 p-3.5 rounded-xl border border-white/5">
              <span className="text-white/40 block text-[10px] uppercase font-bold">Version</span>
              <strong className="text-emerald-400 text-sm">{program.curriculumVersion} ({program.lastUpdated})</strong>
            </div>
          </div>
        </div>

        {/* 2. Current vs Future Alignment Visualization Matrix */}
        <div className="glass rounded-3xl p-6 sm:p-8 border border-white/10 mb-8">
          <h3 className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <BarChart2 size={16} /> Current vs Future Industry Alignment Matrix
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
            {/* Current Alignment */}
            <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-white uppercase">Current Industry Demand Alignment</span>
                <span className="text-xl font-black text-white">{alignment.currentAlignment}%</span>
              </div>
              <div className="w-full h-3 bg-black/60 rounded-full overflow-hidden mb-3">
                <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${alignment.currentAlignment}%` }} />
              </div>
              <p className="text-[11px] text-white/60">Prepares learners for skills currently in active market demand across target roles.</p>
            </div>

            {/* Future Alignment */}
            <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-violet-300 uppercase">Future Industry Trajectory Alignment</span>
                <span className="text-xl font-black text-violet-400">{alignment.futureAlignment}%</span>
              </div>
              <div className="w-full h-3 bg-black/60 rounded-full overflow-hidden mb-3">
                <div className="h-full bg-violet-500 rounded-full transition-all duration-500" style={{ width: `${alignment.futureAlignment}%` }} />
              </div>
              <p className="text-[11px] text-white/60">Prepares learners for emerging skills whose industry demand is accelerating.</p>
            </div>
          </div>

          {/* Alignment Breakdown Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-black/40 p-3 rounded-xl border border-white/5">
              <span className="text-white/40 block text-[10px]">Skill Coverage</span>
              <strong className="text-white">{alignment.skillCoverageScore}%</strong>
            </div>
            <div className="bg-black/40 p-3 rounded-xl border border-white/5">
              <span className="text-white/40 block text-[10px]">Skill Depth</span>
              <strong className="text-white">{alignment.skillDepthScore}%</strong>
            </div>
            <div className="bg-black/40 p-3 rounded-xl border border-white/5">
              <span className="text-white/40 block text-[10px]">Practical Exposure</span>
              <strong className="text-white">{alignment.practicalExposureScore}%</strong>
            </div>
            <div className="bg-black/40 p-3 rounded-xl border border-white/5">
              <span className="text-white/40 block text-[10px]">Staleness Penalty</span>
              <strong className="text-red-400">-{alignment.stalenessPenalty} pts</strong>
            </div>
          </div>
        </div>

        {/* 3. Skill Coverage Matrix Table */}
        <div className="glass rounded-3xl p-6 sm:p-8 border border-white/10 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <Layers size={16} className="text-violet-400" /> Curriculum Skill Coverage Matrix
            </h3>
            <Link 
              href={`/skill-graph?node=${program.coveredSkills[0]?.skillId || "s_python"}`}
              className="text-xs text-violet-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <Network size={14} /> View Skill Network
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-white/40 uppercase font-bold text-[10px]">
                  <th className="pb-3">Skill</th>
                  <th className="pb-3">Coverage Level</th>
                  <th className="pb-3">Depth</th>
                  <th className="pb-3">Current Demand</th>
                  <th className="pb-3">Future Demand</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {alignment.skillDetails.map((s) => (
                  <tr key={s.skillId} className="hover:bg-white/5">
                    <td className="py-3 font-bold text-white">{s.skillName}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-black/60 rounded-full overflow-hidden">
                          <div className="h-full bg-violet-400 rounded-full" style={{ width: `${s.coverageLevel}%` }} />
                        </div>
                        <span>{s.coverageLevel}%</span>
                      </div>
                    </td>
                    <td className="py-3 text-white/80">{s.depth}%</td>
                    <td className="py-3 text-white/80">{s.currentDemand}%</td>
                    <td className="py-3 text-violet-300 font-bold">{s.futureDemand}%</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        s.status.includes('STRONG') ? 'bg-emerald-500/20 text-emerald-300' :
                        s.status === 'COVERED' ? 'bg-blue-500/20 text-blue-300' :
                        'bg-amber-500/20 text-amber-300'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. Curriculum Gaps & Recommended Interventions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* Gaps */}
          <div className="glass rounded-3xl p-6 border border-white/10">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <AlertTriangle size={16} /> Curriculum Skill Gaps
            </h3>

            <div className="space-y-3">
              {gaps.criticalGaps.map(g => (
                <div key={g.skillId} className="bg-red-950/20 p-3 rounded-xl border border-red-500/30 text-xs">
                  <div className="font-bold text-red-300 mb-1">Critical Missing Skill: {g.name}</div>
                  <p className="text-[11px] text-white/70">{g.reason}</p>
                </div>
              ))}

              {gaps.futureGaps.map(g => (
                <div key={g.skillId} className="bg-amber-950/20 p-3 rounded-xl border border-amber-500/30 text-xs">
                  <div className="font-bold text-amber-300 mb-1">Future Acceleration Gap: {g.name}</div>
                  <p className="text-[11px] text-white/70">{g.reason}</p>
                </div>
              ))}

              {gaps.weakCoverage.map(g => (
                <div key={g.skillId} className="bg-white/5 p-3 rounded-xl border border-white/5 text-xs">
                  <div className="font-bold text-white mb-1">Weak Depth: {g.name}</div>
                  <p className="text-[11px] text-white/60">{g.reason}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Interventions */}
          <div className="glass rounded-3xl p-6 border border-white/10">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <Zap size={16} /> Recommended Curriculum Interventions
            </h3>

            <div className="space-y-3">
              {interventions.map((inv, idx) => (
                <div key={idx} className="bg-black/40 p-3.5 rounded-xl border border-white/5 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-emerald-400 uppercase text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded">
                      {inv.type}
                    </span>
                    <span className="text-[10px] text-violet-300 font-bold">{inv.expectedImpact}</span>
                  </div>
                  <div className="font-bold text-white mb-1">{inv.skillName}</div>
                  <p className="text-[11px] text-white/70">{inv.reason}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 5. Industry Challenges Connection & Student Impact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* Industry Challenges */}
          <div className="glass rounded-3xl p-6 border border-white/10">
            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <Briefcase size={16} /> Relevant Industry Challenges
            </h3>

            <div className="space-y-3">
              {relevantChallenges.map(ch => (
                <div key={ch.challengeId} className="bg-white/5 p-3.5 rounded-xl border border-white/5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white text-xs">{ch.title}</span>
                      <span className="text-[10px] text-emerald-400 font-mono">{ch.readinessPct}% Readiness</span>
                    </div>
                    <p className="text-[11px] text-white/60 mb-2">{ch.evidenceOpportunity}</p>
                  </div>
                  <Link href={`/challenges/${ch.challengeId}`} className="text-[10px] text-blue-400 font-bold hover:underline flex items-center gap-1">
                    Explore Challenge Evidence <ChevronRight size={12} />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Student Projected Impact */}
          <div className="glass rounded-3xl p-6 border border-white/10 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                <Target size={16} /> Projected Student Capability Impact
              </h3>

              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 mb-4 text-xs">
                <span className="text-emerald-300 font-bold block mb-1">Projected Improvement</span>
                <p className="text-white/80">{projectedImpact.projectedReadinessImpact} upon full program completion.</p>
              </div>

              <div className="space-y-2 mb-4 text-xs">
                <div className="text-[10px] text-white/40 uppercase font-bold">Addressed Capability Gaps</div>
                {projectedImpact.addressedGaps.map(g => (
                  <div key={g.skillId} className="bg-white/5 p-2.5 rounded-xl flex items-center justify-between">
                    <span className="font-bold text-white">{g.name}</span>
                    <span className="text-[10px] text-emerald-400 font-mono">{g.currentCap}% → {g.projectedCap}% (+{g.gain} pts)</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[10px] text-white/40 italic">Note: Projected impact represents potential capability growth, not verified industry certification.</p>
          </div>
        </div>

      </main>

      {/* Explainability Modal */}
      {activeExplainModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass max-w-xl w-full rounded-3xl p-6 border border-violet-500/30 bg-[#0d0e17] text-white shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Info className="text-violet-400" size={20} /> Curriculum Alignment Explanation
              </h3>
              <button onClick={() => setActiveExplainModal(false)} className="p-1 text-white/40 hover:text-white"><X size={20} /></button>
            </div>

            <p className="text-xs text-white/80 leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/10 mb-4">
              {explanation.alignmentWhy}
            </p>

            <div className="flex justify-end pt-3 border-t border-white/10">
              <button onClick={() => setActiveExplainModal(false)} className="text-xs bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-2 rounded-xl">Close</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
