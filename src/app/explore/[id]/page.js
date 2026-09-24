"use client";

import { use, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Rocket, 
  TrendingUp, 
  Circle, 
  AlertTriangle, 
  ArrowDown, 
  Briefcase, 
  Target, 
  Info, 
  Activity, 
  CheckCircle2, 
  Compass, 
  GitBranch, 
  FileText, 
  ChevronRight, 
  X,
  Globe,
  BookOpen,
  HelpCircle,
  RotateCcw
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { SKILLS_DATA } from "@/data/skillModel";
import { SKILL_RELATIONS, ROLES_DATA } from "@/data/skillGraph";
import { enrichSkillData } from "@/lib/skillLogic";

const STATUS_UI = {
  "Emerging": { icon: Rocket, color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/30", badge: "bg-violet-500/20 text-violet-300 border-violet-500/40" },
  "Growing": { icon: TrendingUp, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30", badge: "bg-blue-500/20 text-blue-300 border-blue-500/40" },
  "Stable": { icon: Circle, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" },
  "Transforming": { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30", badge: "bg-amber-500/20 text-amber-300 border-amber-500/40" },
  "Declining": { icon: ArrowDown, color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/30", badge: "bg-rose-500/20 text-rose-300 border-rose-500/40" }
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

export default function SkillDetailPage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const id = resolvedParams?.id;

  const [isRoleSelectorOpen, setIsRoleSelectorOpen] = useState(false);

  // Safely find and enrich target skill
  const skill = useMemo(() => {
    if (!id) return null;
    try {
      const enriched = enrichSkillData(SKILLS_DATA || []);
      return enriched.find(s => s.id === id) || null;
    } catch {
      return null;
    }
  }, [id]);

  // Associated roles in Skill Graph
  const associatedRoles = useMemo(() => {
    if (!skill) return [];
    try {
      const relations = (SKILL_RELATIONS || []).filter(rel => rel.target === skill.id && rel.type === "requires");
      return relations.map(rel => ROLES_DATA.find(r => r.id === rel.source)).filter(Boolean);
    } catch {
      return [];
    }
  }, [skill]);

  // Skill-to-Skill related connections
  const relatedSkills = useMemo(() => {
    if (!skill) return [];
    try {
      const relations = (SKILL_RELATIONS || []).filter(
        rel => (rel.source === skill.id || rel.target === skill.id) && rel.type === "related"
      );
      const enriched = enrichSkillData(SKILLS_DATA || []);
      return relations.map(rel => {
        const otherId = rel.source === skill.id ? rel.target : rel.source;
        const targetSkill = enriched.find(s => s.id === otherId);
        return targetSkill ? { skill: targetSkill, explanation: rel.explanation } : null;
      }).filter(Boolean);
    } catch {
      return [];
    }
  }, [skill]);

  // Fallback view if skill ID is invalid or missing
  if (!skill) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-slate-100 flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 max-w-4xl w-full mx-auto px-6 pt-32 pb-20 flex flex-col items-center justify-center text-center">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 max-w-md w-full">
            <AlertTriangle className="text-amber-400 mx-auto mb-4" size={40} />
            <h1 className="text-2xl font-bold text-white mb-2">Skill Intelligence Not Found</h1>
            <p className="text-slate-400 text-sm mb-6">
              The requested skill identifier <code className="text-violet-400 font-mono">{id || "unknown"}</code> does not exist in the SkillBridge intelligence graph.
            </p>
            <Link 
              href="/explore" 
              className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs px-5 py-2.5 rounded-lg transition-colors"
            >
              <RotateCcw size={14} />
              Return to Skill Ecosystem
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const UI = STATUS_UI[skill.status] || STATUS_UI["Stable"];
  const StatusIcon = UI.icon;
  const maxDemand = Math.max(...(skill.trendHistory || [100]), skill.futureDemand || 100, 100);

  const handleRoleBlueprintNavigation = () => {
    if (associatedRoles.length === 1) {
      router.push(`/profile/alexchen?role=${associatedRoles[0].id}#industry-role-blueprint`);
    } else if (associatedRoles.length > 1) {
      setIsRoleSelectorOpen(true);
    } else {
      router.push(`/profile/alexchen?role=${ROLES_DATA[0]?.id || "r_backend"}#industry-role-blueprint`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-28 pb-20">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-8">
          <Link 
            href="/explore" 
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-xs font-semibold uppercase tracking-wider"
          >
            <ArrowLeft size={16} /> Back to Skill Discovery
          </Link>
          <span className="text-xs font-mono text-slate-500 bg-slate-900 px-3 py-1 rounded border border-slate-800">
            DETERMINISTIC INTELLIGENCE MODEL
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* MAIN COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Header Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-widest block mb-1">
                    {skill.sector}
                  </span>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                    {skill.name}
                  </h1>
                </div>
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${UI.badge}`}>
                  <StatusIcon size={16} />
                  {skill.status}
                </div>
              </div>

              {/* Dynamic Explanation */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-5 flex gap-3 items-start mb-6">
                <Info className="text-violet-400 shrink-0 mt-0.5" size={18} />
                <p className="text-slate-300 text-sm leading-relaxed">
                  {skill.explanation}
                </p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl">
                  <div className="text-[11px] uppercase text-slate-500 font-semibold mb-1">Current Demand</div>
                  <div className="text-2xl font-bold font-mono text-slate-100">{skill.currentDemand}</div>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl">
                  <div className="text-[11px] uppercase text-slate-500 font-semibold mb-1">Future Demand</div>
                  <div className={`text-2xl font-bold font-mono ${UI.color}`}>{skill.futureDemand}</div>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl">
                  <div className="text-[11px] uppercase text-slate-500 font-semibold mb-1">Growth Signal</div>
                  <div className={`text-2xl font-bold font-mono ${skill.growth > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {skill.growth > 0 ? `+${skill.growth.toFixed(1)}%` : `${skill.growth.toFixed(1)}%`}
                  </div>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl">
                  <div className="text-[11px] uppercase text-slate-500 font-semibold mb-1">Classification</div>
                  <div className={`text-sm font-bold mt-1 ${UI.color}`}>{skill.status}</div>
                </div>
              </div>
            </div>

            {/* Demand History Chart */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Target className="text-violet-400" size={20} />
                  <h2 className="text-lg font-bold text-white">Demand Trajectory &amp; Historical Signal</h2>
                </div>
                <span className="text-xs font-mono text-slate-500">6-Month Baseline</span>
              </div>
              
              <div className="h-56 mt-6 w-full flex items-end justify-between gap-3 sm:gap-6 relative pt-6 border-b border-slate-800 pb-2">
                {(skill.trendHistory || [20, 40, 60, 80, 90]).map((val, idx) => {
                  const heightPercent = (val / maxDemand) * 100;
                  return (
                    <div key={idx} className="flex flex-col items-center flex-1 z-10 group cursor-pointer">
                      <div className="text-xs font-mono font-bold text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 mb-2 opacity-80 group-hover:opacity-100 transition-opacity">
                        {val}
                      </div>
                      <div 
                        className={`w-full max-w-[36px] rounded-t transition-all duration-300 group-hover:brightness-125 ${UI.color.replace('text-', 'bg-')}`}
                        style={{ height: `${heightPercent}%`, minHeight: '6px' }}
                      />
                      <div className="mt-3 text-slate-400 text-xs font-mono font-medium">{MONTHS[idx] || `M${idx+1}`}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Related Skill Connections */}
            {relatedSkills.length > 0 && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <GitBranch className="text-blue-400" size={20} /> Related &amp; Connected Skills
                </h2>
                <div className="space-y-3">
                  {relatedSkills.map((rel, idx) => (
                    <div key={idx} className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Link href={`/explore/${rel.skill.id}`} className="font-bold text-white hover:text-violet-300 text-sm">
                            {rel.skill.name}
                          </Link>
                          <span className="text-[10px] font-mono bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-800">
                            {rel.skill.sector}
                          </span>
                        </div>
                        <p className="text-slate-400 text-xs">{rel.explanation}</p>
                      </div>
                      <Link 
                        href={`/explore/${rel.skill.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-violet-400 hover:text-violet-300 shrink-0"
                      >
                        Inspect Skill <ChevronRight size={14} />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* SIDEBAR NAVIGATION & CONNECTED SYSTEM CTAs */}
          <div className="space-y-6">

            {/* Relevant Target Roles */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="text-blue-400" size={18} />
                <h3 className="text-base font-bold text-white">Target Career Roles</h3>
              </div>
              {skill.roles && skill.roles.length > 0 ? (
                <ul className="space-y-2">
                  {skill.roles.map((role, idx) => (
                    <li key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 text-slate-200 text-xs font-medium flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                      <span>{role}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-500 text-xs">No direct roles cataloged.</p>
              )}
            </div>

            {/* Connected Product Workflows */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-base font-bold text-white mb-2">Connected System Workflows</h3>
              <p className="text-slate-400 text-xs mb-4">
                Navigate directly into SkillBridge modules for this competency.
              </p>

              <div className="space-y-2.5">
                <Link 
                  href={`/regional-intelligence?skill=${skill.id}`}
                  className="w-full flex items-center justify-between bg-slate-950 hover:bg-slate-800 text-slate-200 text-xs font-semibold p-3 rounded-xl border border-slate-800 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Globe size={16} className="text-blue-400" /> Regional Demand
                  </span>
                  <ChevronRight size={14} className="text-slate-500" />
                </Link>

                <Link 
                  href={`/training?skill=${skill.id}`}
                  className="w-full flex items-center justify-between bg-slate-950 hover:bg-slate-800 text-slate-200 text-xs font-semibold p-3 rounded-xl border border-slate-800 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen size={16} className="text-violet-400" /> Training Programs
                  </span>
                  <ChevronRight size={14} className="text-slate-500" />
                </Link>

                <Link 
                  href={`/challenges?skill=${skill.id}`}
                  className="w-full flex items-center justify-between bg-slate-950 hover:bg-slate-800 text-slate-200 text-xs font-semibold p-3 rounded-xl border border-slate-800 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Briefcase size={16} className="text-emerald-400" /> Industry Challenges
                  </span>
                  <ChevronRight size={14} className="text-slate-500" />
                </Link>

                <button 
                  onClick={handleRoleBlueprintNavigation}
                  className="w-full flex items-center justify-between bg-slate-950 hover:bg-slate-800 text-slate-200 text-xs font-semibold p-3 rounded-xl border border-slate-800 transition-colors text-left"
                >
                  <span className="flex items-center gap-2">
                    <FileText size={16} className="text-teal-400" /> Role Blueprint
                  </span>
                  <ChevronRight size={14} className="text-slate-500" />
                </button>

                <Link 
                  href={`/skill-graph?node=${skill.id}`}
                  className="w-full flex items-center justify-between bg-slate-950 hover:bg-slate-800 text-slate-200 text-xs font-semibold p-3 rounded-xl border border-slate-800 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Target size={16} className="text-amber-400" /> Graph Connections
                  </span>
                  <ChevronRight size={14} className="text-slate-500" />
                </Link>

                <Link 
                  href="/company-dashboard"
                  className="w-full flex items-center justify-between bg-slate-950 hover:bg-slate-800 text-slate-200 text-xs font-semibold p-3 rounded-xl border border-slate-800 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Activity size={16} className="text-purple-400" /> Workforce Simulator
                  </span>
                  <ChevronRight size={14} className="text-slate-500" />
                </Link>
              </div>
            </div>

          </div>
          
        </div>
      </main>

      {/* Role Selection Modal when skill belongs to multiple roles */}
      {isRoleSelectorOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 max-w-md w-full rounded-2xl p-6 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="text-emerald-400" size={18} /> Select Role Blueprint
              </h3>
              <button onClick={() => setIsRoleSelectorOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              <strong className="text-slate-200">{skill.name}</strong> is required across multiple industry roles. Select a Role Blueprint to explore:
            </p>
            <div className="space-y-2 mb-2">
              {associatedRoles.map(role => (
                <button
                  key={role.id}
                  onClick={() => {
                    setIsRoleSelectorOpen(false);
                    router.push(`/profile/alexchen?role=${role.id}#industry-role-blueprint`);
                  }}
                  className="w-full text-left p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 flex items-center justify-between transition-colors"
                >
                  <span>{role.name}</span>
                  <ChevronRight size={14} className="text-emerald-400" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
