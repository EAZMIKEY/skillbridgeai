"use client";

import React, { use, useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Briefcase, 
  Target, 
  Sparkles, 
  Flame, 
  Clock, 
  ShieldCheck, 
  ArrowRight, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen, 
  Layers, 
  Rocket, 
  FileText,
  ChevronRight,
  Info,
  GitBranch,
  Network,
  X,
  Award,
  Zap,
  CheckSquare2,
  LockKeyhole
} from "lucide-react";
import { buildIndustryChallenge } from "@/lib/industryChallenges";
import { STUDENT_PROFILE } from "@/data/studentProfile";
import { generateSkillMissions } from "@/lib/skillMissions";
import { generateExplanation } from "@/lib/explainability";

export default function ChallengeDetailPage({ params }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const challengeId = resolvedParams?.id || "ic_fraud_detection";

  const [activeExplainModal, setActiveExplainModal] = useState(false);
  const [isStartFlowOpen, setIsStartFlowOpen] = useState(false);
  const [activeMissionModal, setActiveMissionModal] = useState(null);
  
  // Evidence submission state
  const [evidenceType, setEvidenceType] = useState("GitHub Repository");
  const [proofUrl, setProofUrl] = useState("");
  const [evidenceNotes, setEvidenceNotes] = useState("");
  const [submittedProof, setSubmittedProof] = useState(null);

  // Build Industry Challenge Intelligence Data
  const challenge = useMemo(() => {
    return buildIndustryChallenge(challengeId, STUDENT_PROFILE.capabilities);
  }, [challengeId]);

  // Skill Missions Engine integration
  const missionData = useMemo(() => {
    return generateSkillMissions("r_backend", STUDENT_PROFILE.capabilities);
  }, []);

  if (!challenge) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="text-center p-8 glass rounded-2xl">
          <AlertCircle className="mx-auto text-red-400 mb-4" size={48} />
          <h2 className="text-xl font-bold mb-2">Challenge Not Found</h2>
          <Link href="/challenges" className="text-xs text-emerald-400 underline">Return to Challenges</Link>
        </div>
      </div>
    );
  }

  const { fit, capabilityArchitecture, preparationPlan, evidenceRequirements, explanation } = challenge;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-[30%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 blur-[130px] rounded-full pointer-events-none" />

      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-16 relative z-10">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link href="/challenges" className="text-xs text-white/50 hover:text-white flex items-center gap-1.5 font-semibold">
            ← Back to Industry Challenges Marketplace
          </Link>
        </div>

        {/* 1. Challenge Overview Header */}
        <div className="glass rounded-3xl p-6 sm:p-8 border border-white/10 mb-8 bg-gradient-to-br from-black/60 via-black/40 to-emerald-950/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10 mb-6">
            <div>
              <span className="text-xs uppercase font-bold text-emerald-400 tracking-widest block mb-1">
                {challenge.organization} • {challenge.sector}
              </span>
              <h1 className="text-2xl sm:text-4xl font-black text-white mb-3">{challenge.title}</h1>
              <p className="text-xs sm:text-sm text-white/70 max-w-3xl leading-relaxed">{challenge.description}</p>
            </div>

            <div className="flex flex-col items-end gap-3 shrink-0">
              <span className={`text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-full border ${
                fit.fitLevel === 'READY' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                fit.fitLevel === 'NEARLY READY' ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' :
                fit.fitLevel === 'DEVELOPING' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                'bg-red-500/20 text-red-300 border-red-500/40'
              }`}>
                Your Fit: {fit.fitScore}/100 ({fit.fitLevel})
              </span>

              <button
                onClick={() => setIsStartFlowOpen(true)}
                className="w-full sm:w-auto text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all"
              >
                <Rocket size={16} /> Start Challenge
              </button>
            </div>
          </div>

          {/* Meta Info Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="bg-white/5 p-3.5 rounded-xl border border-white/5">
              <span className="text-white/40 block text-[10px] uppercase font-bold">Difficulty</span>
              <strong className="text-white text-sm">{challenge.difficulty}</strong>
            </div>
            <div className="bg-white/5 p-3.5 rounded-xl border border-white/5">
              <span className="text-white/40 block text-[10px] uppercase font-bold">Duration</span>
              <strong className="text-violet-300 text-sm">{challenge.duration}</strong>
            </div>
            <div className="bg-white/5 p-3.5 rounded-xl border border-white/5">
              <span className="text-white/40 block text-[10px] uppercase font-bold">Estimated Effort</span>
              <strong className="text-blue-300 text-sm">{challenge.estimatedEffort}</strong>
            </div>
            <div className="bg-white/5 p-3.5 rounded-xl border border-white/5">
              <span className="text-white/40 block text-[10px] uppercase font-bold">Enrollment</span>
              <strong className="text-emerald-400 text-sm">{challenge.deadline}</strong>
            </div>
          </div>
        </div>

        {/* 2. Industry Context Card */}
        <div className="glass rounded-3xl p-6 border border-white/10 mb-8 bg-black/40">
          <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-2">
            <Briefcase size={16} /> Industry Capability Context
          </h3>
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/5">
            {challenge.industryDemandContext}
          </p>
        </div>

        {/* 3. Required Capability Architecture */}
        <div className="glass rounded-3xl p-6 sm:p-8 border border-white/10 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <Layers size={16} className="text-emerald-400" /> Required Capability Architecture
            </h3>

            <Link 
              href={`/skill-graph?node=${capabilityArchitecture.requiredSkills[0]?.skillId || "s_python"}`}
              className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <Network size={14} /> View Skill Network
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Foundation */}
            <div className="bg-emerald-950/10 border border-emerald-500/30 p-4 rounded-2xl">
              <div className="text-xs font-black text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <ShieldCheck size={14} /> FOUNDATION ({capabilityArchitecture.foundationalSkills.length})
              </div>
              <div className="space-y-2">
                {capabilityArchitecture.foundationalSkills.map(s => (
                  <div key={s.skillId} className="bg-white/5 p-2.5 rounded-xl text-xs flex justify-between items-center">
                    <span className="font-bold text-white">{s.skillName}</span>
                    <span className="text-[10px] text-emerald-400 font-mono">{s.currentCapability}/{s.requiredCapability} pts</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Core */}
            <div className="bg-blue-950/10 border border-blue-500/30 p-4 rounded-2xl">
              <div className="text-xs font-black text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Zap size={14} /> CORE ({capabilityArchitecture.coreSkills.length})
              </div>
              <div className="space-y-2">
                {capabilityArchitecture.coreSkills.map(s => (
                  <div key={s.skillId} className="bg-white/5 p-2.5 rounded-xl text-xs flex justify-between items-center">
                    <span className="font-bold text-white">{s.skillName}</span>
                    <span className="text-[10px] text-blue-400 font-mono">{s.currentCapability}/{s.requiredCapability} pts</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Advanced */}
            <div className="bg-violet-950/10 border border-violet-500/30 p-4 rounded-2xl">
              <div className="text-xs font-black text-violet-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Award size={14} /> ADVANCED ({capabilityArchitecture.advancedSkills.length})
              </div>
              <div className="space-y-2">
                {capabilityArchitecture.advancedSkills.map(s => (
                  <div key={s.skillId} className="bg-white/5 p-2.5 rounded-xl text-xs flex justify-between items-center">
                    <span className="font-bold text-white">{s.skillName}</span>
                    <span className="text-[10px] text-violet-400 font-mono">{s.currentCapability}/{s.requiredCapability} pts</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 4. Student Fit & Preparation Plan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* Fit Breakdown */}
          <div className="glass rounded-3xl p-6 border border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Target size={16} /> Student Fit Analysis
                </h3>
                <button onClick={() => setActiveExplainModal(true)} className="text-[11px] text-white/50 hover:text-white flex items-center gap-1">
                  <Info size={12} /> Why This Score?
                </button>
              </div>

              <div className="text-4xl font-black text-white mb-1">{fit.fitScore} <span className="text-xs text-white/40 font-normal">/ 100</span></div>
              <div className="text-xs font-bold text-emerald-400 mb-4">{fit.fitLevel}</div>

              <div className="space-y-2 text-xs mb-4">
                <div className="flex justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-white/60">Matched Capabilities</span>
                  <strong className="text-emerald-400">{fit.matchedSkills.length} skills</strong>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-white/60">Needs Strengthening</span>
                  <strong className="text-amber-400">{fit.partialSkills.length} skills</strong>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-white/60">Blocking Gaps</span>
                  <strong className="text-red-400">{fit.blockingSkills.length} skills</strong>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-white/60 bg-black/40 p-3 rounded-xl border border-white/5 leading-relaxed">
              {fit.explanation}
            </p>
          </div>

          {/* Preparation Roadmap */}
          <div className="glass rounded-3xl p-6 border border-white/10 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                <BookOpen size={16} /> Challenge Preparation Roadmap
              </h3>

              <div className="text-xs text-white/50 mb-3">Estimated Preparation: <strong className="text-violet-300">{preparationPlan.estimatedPreparationEffort}</strong></div>

              <div className="space-y-2.5 mb-4">
                {preparationPlan.recommendedActions.length === 0 ? (
                  <div className="p-3 bg-emerald-950/20 text-emerald-300 text-xs rounded-xl border border-emerald-500/30">
                    No preliminary preparation required! You meet all challenge prerequisites.
                  </div>
                ) : (
                  preparationPlan.recommendedActions.map((action, idx) => (
                    <div key={idx} className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-white">{action.action}</div>
                        <div className="text-[10px] text-white/50">{action.estimatedHours}</div>
                      </div>

                      <button
                        onClick={() => {
                          const m = missionData.missions.find(m => m.targetSkill === action.skillId);
                          if (m) setActiveMissionModal(m);
                          else router.push(`/profile/alexchen#skill-missions`);
                        }}
                        className="text-[10px] bg-violet-600/30 hover:bg-violet-600/50 text-violet-200 border border-violet-500/40 px-3 py-1 rounded-lg font-bold"
                      >
                        Start Skill Mission
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-white/5">
              <Link href="/profile/alexchen#skill-missions" className="text-xs text-violet-400 hover:underline flex items-center gap-1 font-semibold">
                Explore All Skill Missions <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* 5. Practical Evidence Submission Layer */}
        <div className="glass rounded-3xl p-6 sm:p-8 border border-white/10 mb-8" id="evidence-submission">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <FileText size={16} /> Practical Evidence Submission
              </p>
              <h3 className="text-lg font-bold text-white">Record Practical Capability Artifact</h3>
            </div>
            <span className="text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-full font-bold">
              Prototype Evidence State
            </span>
          </div>

          <p className="text-xs text-white/70 mb-4 leading-relaxed">
            Submit self-reported prototype proof (e.g. GitHub Repository, Deployed Demo, Case Study) to simulate practical capability verification for your Student Skill Twin.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-[11px] font-bold text-white/70 mb-1">Evidence Type</label>
              <select
                value={evidenceType}
                onChange={(e) => setEvidenceType(e.target.value)}
                className="w-full bg-[#12131c] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="GitHub Repository">GitHub Repository (Source Code)</option>
                <option value="Live Deployed Demo">Live Deployed Demo URL</option>
                <option value="Technical Architecture Case Study">Technical Case Study / Architecture PDF</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-white/70 mb-1">Artifact URL / Proof Location</label>
              <input
                type="text"
                placeholder="https://github.com/alexchen/fraud-detection-service"
                value={proofUrl}
                onChange={(e) => setProofUrl(e.target.value)}
                className="w-full bg-[#12131c] border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-[11px] font-bold text-white/70 mb-1">Implementation Notes & Benchmark Performance</label>
            <textarea
              rows={2}
              placeholder="Described approach used for data pipelines, model optimization, latency benchmarks..."
              value={evidenceNotes}
              onChange={(e) => setEvidenceNotes(e.target.value)}
              className="w-full bg-[#12131c] border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <span className="text-[10px] text-white/40 font-mono">STATUS: {submittedProof ? "ARTIFACT SUBMITTED (PROTOTYPE VERIFIED)" : "UNSUBMITTED"}</span>
            <button
              onClick={() => {
                if (!proofUrl.trim()) return;
                setSubmittedProof({ type: evidenceType, url: proofUrl, notes: evidenceNotes, date: new Date().toLocaleDateString() });
                alert("Practical evidence recorded in session prototype!");
              }}
              disabled={!proofUrl.trim()}
              className="text-xs bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold px-4 py-2 rounded-xl transition-all shadow-lg flex items-center gap-1.5"
            >
              <CheckCircle2 size={14} /> Record Evidence Artifact
            </button>
          </div>
        </div>

        {/* 6. Evidence & Verification Criteria */}
        <div className="glass rounded-3xl p-6 sm:p-8 border border-white/10 mb-8">
          <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
            <CheckSquare2 size={16} className="text-emerald-400" /> Evidence & Capability Verification Criteria
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {evidenceRequirements.map((ev, idx) => (
              <div key={idx} className="bg-black/40 p-4 rounded-2xl border border-white/5 flex items-start gap-3">
                <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" size={18} />
                <div>
                  <div className="text-xs font-bold text-white">{ev.criterion}</div>
                  <div className="text-[10px] text-white/50 mt-1">Demonstrates: <strong className="text-emerald-300">{ev.demonstratedSkill}</strong> ({ev.confidenceGain})</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Start Challenge Flow Modal */}
      {isStartFlowOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass max-w-lg w-full rounded-3xl p-6 sm:p-8 border border-emerald-500/30 bg-[#0d0e17] text-white shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Rocket className="text-emerald-400" size={22} /> Start Industry Challenge
              </h3>
              <button onClick={() => setIsStartFlowOpen(false)} className="p-1 text-white/40 hover:text-white"><X size={20} /></button>
            </div>

            <div className="mb-4">
              <div className="text-xs text-white/60 mb-2">Target Challenge: <strong className="text-white">{challenge.title}</strong></div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mb-4">
                <div className="text-xs text-white/50 mb-1">Your Challenge Fit Score:</div>
                <div className="text-2xl font-black text-emerald-400">{fit.fitScore} / 100 ({fit.fitLevel})</div>
              </div>

              {fit.blockingSkills.length > 0 ? (
                <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 mb-4 text-xs">
                  <span className="text-amber-400 font-bold block mb-1">Preparation Recommended Before Attempting</span>
                  <p className="text-white/70">You have {fit.blockingSkills.length} critical skill gaps. Completing recommended preparation missions will maximize your execution outcome.</p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 mb-4 text-xs">
                  <span className="text-emerald-300 font-bold block mb-1">You Are Ready!</span>
                  <p className="text-white/70">Your capabilities meet the challenge requirements. You can proceed with practical execution.</p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-white/10">
              {fit.blockingSkills.length > 0 && (
                <Link href="/profile/alexchen#skill-missions" className="text-xs bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-2.5 rounded-xl border border-white/10">
                  Prepare for Challenge
                </Link>
              )}
              <button
                onClick={() => {
                  alert(`Challenge execution initialized in prototype session for ${challenge.title}. Practical work output will be recorded as capability evidence.`);
                  setIsStartFlowOpen(false);
                }}
                className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl"
              >
                Confirm & Proceed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Explainability Modal */}
      {activeExplainModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass max-w-xl w-full rounded-3xl p-6 border border-emerald-500/30 bg-[#0d0e17] text-white shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Info className="text-emerald-400" size={20} /> Challenge Recommendation Reason
              </h3>
              <button onClick={() => setActiveExplainModal(false)} className="p-1 text-white/40 hover:text-white"><X size={20} /></button>
            </div>

            <p className="text-xs text-white/80 leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/10 mb-4">
              {explanation.whyRecommended}
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
