"use client";

import React, { use, useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Globe, 
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
  MapPin,
  BookOpen
} from "lucide-react";
import { buildRegionalSkillProfile } from "@/lib/regionalSkillIntelligence";

export default function RegionalDetailPage({ params }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const regionId = resolvedParams?.id || "reg_bengaluru";

  const [activeExplainModal, setActiveExplainModal] = useState(false);

  // Build Regional Intelligence Data
  const profile = useMemo(() => {
    return buildRegionalSkillProfile(regionId);
  }, [regionId]);

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="text-center p-8 glass rounded-2xl">
          <AlertTriangle className="mx-auto text-red-400 mb-4" size={48} />
          <h2 className="text-xl font-bold mb-2">Region Profile Not Found</h2>
          <Link href="/regional-intelligence" className="text-xs text-blue-400 underline">Return to Regional Intelligence</Link>
        </div>
      </div>
    );
  }

  const { alignment, shortages, opportunities, futureRisks, interventions, trainingSupply, relevantChallenges, explanation } = profile;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-[30%] right-[-10%] w-[500px] h-[500px] bg-violet-500/10 blur-[130px] rounded-full pointer-events-none" />

      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-16 relative z-10">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link href="/regional-intelligence" className="text-xs text-white/50 hover:text-white flex items-center gap-1.5 font-semibold">
            ← Back to Regional Skill Intelligence Exchange
          </Link>
        </div>

        {/* Synthetic Disclaimer */}
        <div className="mb-6 px-4 py-2 rounded-xl bg-blue-950/20 border border-blue-500/30 text-[11px] text-blue-300 flex items-center justify-between">
          <span>Data Mode: Prototype / Synthetic Regional Intelligence Model</span>
          <span className="font-mono text-[10px]">SYNTHETIC V1.0</span>
        </div>

        {/* 1. Region Overview Header */}
        <div className="glass rounded-3xl p-6 sm:p-8 border border-white/10 mb-8 bg-gradient-to-br from-black/60 via-black/40 to-blue-950/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10 mb-6">
            <div>
              <span className="text-xs uppercase font-bold text-blue-400 tracking-widest flex items-center gap-1 mb-1">
                <MapPin size={14} /> {profile.country} • {profile.stateOrProvince}
              </span>
              <h1 className="text-2xl sm:text-4xl font-black text-white mb-3">{profile.name}</h1>
              <p className="text-xs sm:text-sm text-white/70 max-w-3xl leading-relaxed">{profile.description}</p>
            </div>

            <div className="flex flex-col items-end gap-3 shrink-0">
              <span className={`text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-full border ${
                futureRisks.riskLevel === 'CRITICAL' ? 'bg-red-500/20 text-red-300 border-red-500/40' :
                futureRisks.riskLevel === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}>
                Future Risk: {futureRisks.riskLevel}
              </span>

              <button
                onClick={() => setActiveExplainModal(true)}
                className="text-xs bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 border border-white/10"
              >
                <Info size={14} /> Explain Regional Risk
              </button>
            </div>
          </div>

          {/* Meta Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="bg-white/5 p-3.5 rounded-xl border border-white/5">
              <span className="text-white/40 block text-[10px] uppercase font-bold">Workforce Size</span>
              <strong className="text-white text-sm">{profile.workforceSize}</strong>
            </div>
            <div className="bg-white/5 p-3.5 rounded-xl border border-white/5">
              <span className="text-white/40 block text-[10px] uppercase font-bold">Regional Alignment</span>
              <strong className="text-blue-300 text-sm">{alignment.alignmentScore}/100</strong>
            </div>
            <div className="bg-white/5 p-3.5 rounded-xl border border-white/5">
              <span className="text-white/40 block text-[10px] uppercase font-bold">Demand Coverage</span>
              <strong className="text-emerald-400 text-sm">{alignment.demandCoverage}%</strong>
            </div>
            <div className="bg-white/5 p-3.5 rounded-xl border border-white/5">
              <span className="text-white/40 block text-[10px] uppercase font-bold">Workforce Capability</span>
              <strong className="text-violet-300 text-sm">{alignment.workforceCapability}%</strong>
            </div>
          </div>
        </div>

        {/* 2. Regional Skill Matrix Table */}
        <div className="glass rounded-3xl p-6 sm:p-8 border border-white/10 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <BarChart2 size={16} className="text-blue-400" /> Regional Skill Matrix & Shortage Analysis
            </h3>
            <Link 
              href={`/skill-graph?node=${shortages[0]?.skillId || "s_python"}`}
              className="text-xs text-blue-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <Network size={14} /> View Skill Network
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-white/40 uppercase font-bold text-[10px]">
                  <th className="pb-3">Skill</th>
                  <th className="pb-3">Current Demand</th>
                  <th className="pb-3">Future Demand</th>
                  <th className="pb-3">Growth Rate</th>
                  <th className="pb-3">Available Capability</th>
                  <th className="pb-3">Gap Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {shortages.map((s) => (
                  <tr key={s.skillId} className="hover:bg-white/5">
                    <td className="py-3 font-bold text-white">{s.skillName}</td>
                    <td className="py-3 text-white/80">{s.currentDemand}%</td>
                    <td className="py-3 font-bold text-blue-300">{s.futureDemand}%</td>
                    <td className="py-3 text-emerald-400 font-bold">+{s.growthRate}%</td>
                    <td className="py-3 text-white/80">{s.availableCapability}%</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        s.gapLevel === 'CRITICAL' ? 'bg-red-500/20 text-red-300' :
                        s.gapLevel === 'HIGH' ? 'bg-amber-500/20 text-amber-300' :
                        'bg-blue-500/20 text-blue-300'
                      }`}>
                        {s.gapLevel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Emerging Opportunities & Priority Interventions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* Opportunities */}
          <div className="glass rounded-3xl p-6 border border-white/10">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <Zap size={16} /> Regional Capability Opportunities
            </h3>

            <div className="space-y-3">
              {opportunities.map((op, idx) => (
                <div key={idx} className="bg-white/5 p-3.5 rounded-xl border border-white/5 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-emerald-400 uppercase text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded">
                      {op.type}
                    </span>
                    <span className="text-[10px] text-white/40">Impact Score: {op.score}</span>
                  </div>
                  <div className="font-bold text-white mb-1">{op.title}</div>
                  <p className="text-[11px] text-white/70 mb-2">{op.reason}</p>
                  <div className="text-[10px] text-blue-300 font-semibold">{op.recommendedAction}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Interventions */}
          <div className="glass rounded-3xl p-6 border border-white/10">
            <h3 className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <CheckSquare2 size={16} /> Prioritized Regional Interventions
            </h3>

            <div className="space-y-3">
              {interventions.map((inv, idx) => (
                <div key={idx} className="bg-black/40 p-3.5 rounded-xl border border-white/5 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-violet-400 uppercase text-[10px] bg-violet-500/20 px-2 py-0.5 rounded">
                      {inv.type}
                    </span>
                    <span className="text-[10px] text-emerald-300 font-bold">{inv.expectedImpact}</span>
                  </div>
                  <div className="font-bold text-white mb-1">{inv.skillName}</div>
                  <p className="text-[11px] text-white/70 mb-2">{inv.reason}</p>
                  <div className="text-[10px] text-amber-300">Urgency: {inv.estimatedUrgency}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Local Training Supply Integration (Task 25) & Challenges (Task 24) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* Training Supply */}
          <div className="glass rounded-3xl p-6 border border-white/10">
            <h3 className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <BookOpen size={16} /> Local Training Supply (Task 25)
            </h3>

            <div className="space-y-3">
              {trainingSupply.map((t) => (
                <div key={t.programId} className="bg-white/5 p-3.5 rounded-xl border border-white/5 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-violet-400 font-bold uppercase block">{t.provider}</span>
                    <h4 className="font-bold text-white text-xs mb-1">{t.programName}</h4>
                    <div className="text-[10px] text-white/50 mb-2">Annual Capacity: {t.capacity} trainees • Alignment: {t.alignmentScore}%</div>
                  </div>
                  <Link href={`/training/${t.programId}`} className="text-[10px] text-violet-400 font-bold hover:underline flex items-center gap-1">
                    Analyze Curriculum Alignment <ChevronRight size={12} />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Industry Challenges */}
          <div className="glass rounded-3xl p-6 border border-white/10">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <Briefcase size={16} /> Regional Industry Challenges (Task 24)
            </h3>

            <div className="space-y-3">
              {relevantChallenges.slice(0, 3).map((ch) => (
                <div key={ch.challengeId} className="bg-white/5 p-3.5 rounded-xl border border-white/5 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-emerald-400 font-bold uppercase block">{ch.organization}</span>
                    <h4 className="font-bold text-white text-xs mb-1">{ch.title}</h4>
                    <div className="text-[10px] text-white/50 mb-2">{ch.domain} • {ch.difficulty}</div>
                  </div>
                  <Link href={`/challenges/${ch.challengeId}`} className="text-[10px] text-emerald-400 font-bold hover:underline flex items-center gap-1">
                    Explore Practical Evidence <ChevronRight size={12} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

      </main>

      {/* Explainability Modal */}
      {activeExplainModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass max-w-xl w-full rounded-3xl p-6 border border-blue-500/30 bg-[#0d0e17] text-white shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Info className="text-blue-400" size={20} /> Regional Risk & Alignment Explanation
              </h3>
              <button onClick={() => setActiveExplainModal(false)} className="p-1 text-white/40 hover:text-white"><X size={20} /></button>
            </div>

            <p className="text-xs text-white/80 leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/10 mb-4">
              {futureRisks.explanation}
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
