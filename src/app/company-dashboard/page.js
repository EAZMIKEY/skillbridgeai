"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { 
  Building2, Activity, Target, ArrowUp, ArrowDown, ChevronRight, AlertCircle, 
  Lightbulb, TrendingUp, Compass, Layers, Shield, Cpu, RefreshCw, GitBranch, 
  CheckCircle2, BookOpen, Award, Info, FileCode2, ArrowRight, SlidersHorizontal,
  Zap, AlertTriangle, Layers2, ArrowUpRight, BarChart3, Filter, Briefcase, LogOut
} from "lucide-react";
import { WORKFORCE_SCENARIOS } from "@/data/workforceScenarios";
import { simulateScenario } from "@/lib/workforceSimulator";
import { INDUSTRY_CHALLENGES } from "@/data/industryChallengesData";
import { TRAINING_PROGRAMS } from "@/data/trainingPrograms";
import { ROLES_DATA, SKILL_RELATIONS } from "@/data/skillGraph";
import { SKILLS_DATA } from "@/data/skillModel";
import { calculateCurriculumAlignment } from "@/lib/curriculumAlignment";
import { getStoredUser, clearStoredUser } from "@/lib/auth/userSession";

// ==================================================
// SUB-COMPONENT: DEMAND TRAJECTORY CANVAS (SECTION C)
// ==================================================
function IndustryDemandTrajectoryCanvas({ activeSkill, onSelectSkill, skillList }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!activeSkill) return null;

  const history = activeSkill.trendHistory || [
    Math.max(10, activeSkill.currentDemand - 25),
    Math.max(15, activeSkill.currentDemand - 20),
    Math.max(20, activeSkill.currentDemand - 15),
    Math.max(25, activeSkill.currentDemand - 10),
    Math.max(30, activeSkill.currentDemand - 5),
    activeSkill.currentDemand
  ];

  const currentVal = activeSkill.currentDemand;
  const futureVal = activeSkill.futureDemand;
  const delta = futureVal - currentVal;
  const pctChange = Math.round((delta / (currentVal || 1)) * 100);
  const currentSupply = activeSkill.currentCapability || Math.max(20, Math.round(currentVal * 0.72));
  const capabilityGap = Math.max(0, futureVal - currentSupply);

  const graphPoints = [
    { year: "2024", label: "2024 H1", val: history[0] || 45, type: "historical" },
    { year: "2024.5", label: "2024 H2", val: history[2] || 55, type: "historical" },
    { year: "2025", label: "2025 H1", val: history[4] || 68, type: "historical" },
    { year: "2026", label: "2026 NOW", val: currentVal, type: "current" },
    { year: "2027", label: "2027 EST", val: Math.round(currentVal + delta * 0.5), type: "projected" },
    { year: "2028", label: "2028 TARGET", val: futureVal, type: "projected" },
  ];

  const svgWidth = 840;
  const svgHeight = 260;
  const padLeft = 60;
  const padRight = 50;
  const padTop = 35;
  const padBottom = 45;
  const plotW = svgWidth - padLeft - padRight;
  const plotH = svgHeight - padTop - padBottom;

  const stepX = plotW / (graphPoints.length - 1);
  const getX = (i) => padLeft + i * stepX;
  const getY = (val) => padTop + plotH - (val / 100) * plotH;

  const historicalD = graphPoints.slice(0, 4).reduce((acc, pt, i) => {
    const x = getX(i);
    const y = getY(pt.val);
    return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, "");

  const projectedD = graphPoints.slice(3).reduce((acc, pt, i) => {
    const idx = i + 3;
    const x = getX(idx);
    const y = getY(pt.val);
    return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, "");

  const nowX = getX(3);

  return (
    <div className="bg-[#0B0F17] border border-[#1E2638] rounded-2xl overflow-hidden shadow-2xl space-y-0">
      {/* Selector & Header Bar */}
      <div className="p-5 border-b border-[#1E2638] bg-[#0E1422] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950 px-2.5 py-1 rounded border border-cyan-800 block w-fit mb-1">
            DEMAND TRAJECTORY INTELLIGENCE
          </span>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            {activeSkill.name} <span className="text-xs font-mono text-slate-400 font-normal">({activeSkill.category || "Core Skill"})</span>
          </h3>
        </div>

        {/* Skill Selector Tabs */}
        <div className="flex gap-2 overflow-x-auto py-1">
          {skillList.slice(0, 5).map(skill => {
            const isSelected = activeSkill.id === skill.id;
            return (
              <button
                key={skill.id}
                onClick={() => onSelectSkill(skill)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors shrink-0 ${
                  isSelected 
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 font-bold' 
                    : 'bg-[#161E2E] text-slate-400 hover:text-white border border-[#1E2638]'
                }`}
              >
                {skill.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Visual Graph (Left 8 cols) + Metrics Summary Panel (Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border-b border-[#1E2638]">
        
        {/* Large Primary Analytical Graph Canvas */}
        <div className="lg:col-span-8 p-5 bg-[#0B0F17] flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2 px-2">
            <span>Demand Index Score (0 — 100)</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-cyan-400 inline-block"></span> Historical Signal</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-emerald-400 border-dashed border-t border-emerald-400 inline-block"></span> Projected Target</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-400 inline-block"></span> 2026 Baseline</span>
            </div>
          </div>

          <div className="relative w-full overflow-x-auto">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto min-w-[600px]">
              <defs>
                <linearGradient id="indHistGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="indProjGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines & Axis */}
              {[0, 25, 50, 75, 100].map((val) => {
                const y = getY(val);
                return (
                  <g key={val}>
                    <line x1={padLeft} y1={y} x2={svgWidth - padRight} y2={y} stroke="#1E2638" strokeWidth="1" strokeDasharray="3 3" />
                    <text x={padLeft - 10} y={y + 3} textAnchor="end" fill="#64748B" className="text-[10px] font-mono">
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Vertical NOW Line */}
              <line x1={nowX} y1={padTop - 10} x2={nowX} y2={svgHeight - padBottom + 10} stroke="#06B6D4" strokeWidth="1.5" strokeDasharray="4 4" />
              <rect x={nowX - 32} y={padTop - 24} width={64} height={18} rx={4} fill="#06B6D4" />
              <text x={nowX} y={padTop - 11} textAnchor="middle" fill="#0B0F17" className="text-[9px] font-mono font-bold uppercase">
                2026 NOW
              </text>

              {/* Fills */}
              <path d={`${historicalD} L ${nowX} ${getY(0)} L ${getX(0)} ${getY(0)} Z`} fill="url(#indHistGrad)" />
              <path d={`${projectedD} L ${getX(5)} ${getY(0)} L ${nowX} ${getY(0)} Z`} fill="url(#indProjGrad)" />

              {/* Lines */}
              <path d={historicalD} fill="none" stroke="#06B6D4" strokeWidth="3" strokeLinecap="round" />
              <path d={projectedD} fill="none" stroke="#10B981" strokeWidth="3" strokeDasharray="6 4" strokeLinecap="round" />

              {/* Points */}
              {graphPoints.map((pt, i) => {
                const cx = getX(i);
                const cy = getY(pt.val);
                const isHovered = hoveredIdx === i;
                const isNow = i === 3;

                return (
                  <g 
                    key={i} 
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIdx(i)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  >
                    <circle 
                      cx={cx} 
                      cy={cy} 
                      r={isHovered ? 7 : isNow ? 6 : 4.5} 
                      fill={isNow ? "#06B6D4" : pt.type === "projected" ? "#10B981" : "#0B0F17"} 
                      stroke={pt.type === "projected" ? "#10B981" : "#06B6D4"} 
                      strokeWidth={2.5} 
                    />
                    <text 
                      x={cx} 
                      y={cy - 12} 
                      textAnchor="middle" 
                      fill={isHovered ? "#FFFFFF" : isNow ? "#06B6D4" : pt.type === "projected" ? "#10B981" : "#94A3B8"} 
                      className={`text-[10px] font-mono ${isNow || isHovered ? 'font-bold' : ''}`}
                    >
                      {pt.val}
                    </text>
                  </g>
                );
              })}

              {/* X Axis */}
              {graphPoints.map((pt, i) => (
                <text key={i} x={getX(i)} y={svgHeight - 12} textAnchor="middle" fill={i === 3 ? "#06B6D4" : "#64748B"} className={`text-[10px] font-mono ${i === 3 ? 'font-bold' : ''}`}>
                  {pt.label}
                </text>
              ))}
            </svg>

            {hoveredIdx !== null && (
              <div className="absolute top-2 right-4 bg-[#161E2E] border border-cyan-500/40 p-2.5 rounded-lg text-xs font-mono shadow-xl backdrop-blur-md">
                <div className="text-slate-400 text-[10px] uppercase">{graphPoints[hoveredIdx].label} ({graphPoints[hoveredIdx].type})</div>
                <div className="text-white font-bold text-sm">Demand Score: <span className="text-cyan-400">{graphPoints[hoveredIdx].val} / 100</span></div>
              </div>
            )}
          </div>

          <div className="mt-2 text-[10px] font-mono text-slate-500 flex items-center justify-between border-t border-[#1E2638] pt-2">
            <span>MODEL: DETERMINISTIC BENCHMARK PROJECTION</span>
            <span>PERIOD: 2024 — 2028</span>
          </div>
        </div>

        {/* Analytical Metrics Summary Panel */}
        <div className="lg:col-span-4 p-5 bg-[#0E1422] border-t lg:border-t-0 lg:border-l border-[#1E2638] flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-3">
              DEMAND &amp; SUPPLY METRICS
            </span>

            <div className="space-y-2.5">
              <div className="bg-[#161E2E] p-3 rounded-xl border border-[#1E2638] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">CURRENT DEMAND</span>
                  <span className="text-lg font-mono font-bold text-white">{currentVal} <span className="text-xs text-slate-500">/ 100</span></span>
                </div>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">2026 Baseline</span>
              </div>

              <div className="bg-[#161E2E] p-3 rounded-xl border border-[#1E2638] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">CURRENT WORKFORCE SUPPLY</span>
                  <span className="text-lg font-mono font-bold text-cyan-400">{currentSupply} <span className="text-xs text-slate-500">/ 100</span></span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">Supply Coverage</span>
              </div>

              <div className="bg-[#161E2E] p-3 rounded-xl border border-[#1E2638] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">CAPABILITY GAP</span>
                  <span className="text-lg font-mono font-bold text-rose-400">-{capabilityGap} <span className="text-xs text-slate-500">pts</span></span>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${capabilityGap > 15 ? 'bg-rose-950 text-rose-400 border-rose-800' : 'bg-amber-950 text-amber-400 border-amber-800'}`}>
                  {capabilityGap > 15 ? 'CRITICAL GAP' : 'MODERATE GAP'}
                </span>
              </div>

              <div className="bg-[#161E2E] p-3 rounded-xl border border-[#1E2638] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">SIGNAL SHIFT &amp; TREND</span>
                  <span className="text-base font-mono font-bold text-emerald-400 flex items-center gap-1">
                    ▲ +{delta} pts ({pctChange >= 0 ? `+${pctChange}%` : `${pctChange}%`})
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">ACCELERATING</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-[#1E2638]">
            <span className="text-[9px] font-mono text-slate-500 uppercase block mb-1">KEY DEMAND DRIVER</span>
            <p className="text-xs text-slate-300 leading-relaxed">
              Industrial demand for <strong className="text-white">{activeSkill.name}</strong> is accelerating across enterprise systems, generating a net <strong className="text-rose-400">-{capabilityGap} point</strong> workforce constraint.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================================================
// SUB-COMPONENT: CAPABILITY PRIORITY MAP (SECTION H)
// ==================================================
function CapabilityPriorityMatrix({ skillsData }) {
  const [hoveredSkill, setHoveredSkill] = useState(null);

  const svgW = 740;
  const svgH = 340;
  const padL = 60;
  const padR = 40;
  const padT = 40;
  const padB = 50;

  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;

  const getX = (coverage) => padL + (coverage / 100) * plotW;
  const getY = (demand) => padT + plotH - (demand / 100) * plotH;

  const midX = getX(50);
  const midY = getY(50);

  return (
    <div className="bg-[#0B0F17] border border-[#1E2638] rounded-2xl p-6 space-y-4 shadow-2xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-[#1E2638] pb-4">
        <div>
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block mb-1">
            2-AXIS CAPABILITY CLASSIFICATION
          </span>
          <h3 className="text-xl font-bold text-white">Capability Priority Map</h3>
          <p className="text-xs text-slate-400 mt-0.5">Plotting Current Workforce Supply Coverage vs. Future Market Demand Score.</p>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono">
          <span className="flex items-center gap-1.5 text-rose-400 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Immediate Pressure
          </span>
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Strategic Strength
          </span>
          <span className="flex items-center gap-1.5 text-amber-400 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Potential Oversupply
          </span>
        </div>
      </div>

      <div className="relative w-full overflow-x-auto">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto min-w-[640px]">
          {/* Quadrant Background Fills */}
          {/* Top-Left: Low Coverage, High Demand -> Immediate Pressure */}
          <rect x={padL} y={padT} width={midX - padL} height={midY - padT} fill="#EF4444" fillOpacity="0.06" />
          {/* Top-Right: High Coverage, High Demand -> Strategic Strength */}
          <rect x={midX} y={padT} width={svgW - padR - midX} height={midY - padT} fill="#10B981" fillOpacity="0.06" />
          {/* Bottom-Left: Low Coverage, Low Demand -> Monitor */}
          <rect x={padL} y={midY} width={midX - padL} height={svgH - padB - midY} fill="#64748B" fillOpacity="0.04" />
          {/* Bottom-Right: High Coverage, Low Demand -> Potential Oversupply */}
          <rect x={midX} y={midY} width={svgW - padR - midX} height={svgH - padB - midY} fill="#F59E0B" fillOpacity="0.06" />

          {/* Dividing Axes */}
          <line x1={midX} y1={padT} x2={midX} y2={svgH - padB} stroke="#1E2638" strokeWidth="2" strokeDasharray="4 4" />
          <line x1={padL} y1={midY} x2={svgW - padR} y2={midY} stroke="#1E2638" strokeWidth="2" strokeDasharray="4 4" />

          {/* Outer Border Line */}
          <rect x={padL} y={padT} width={plotW} height={plotH} fill="none" stroke="#1E2638" strokeWidth="1" />

          {/* Quadrant Labels */}
          <text x={padL + 12} y={padT + 20} fill="#EF4444" className="text-[10px] font-mono font-bold uppercase tracking-wider">
            HIGH DEMAND / LOW COVERAGE — IMMEDIATE PRESSURE
          </text>
          <text x={svgW - padR - 12} y={padT + 20} textAnchor="end" fill="#10B981" className="text-[10px] font-mono font-bold uppercase tracking-wider">
            HIGH DEMAND / HIGH COVERAGE — STRATEGIC STRENGTH
          </text>
          <text x={padL + 12} y={svgH - padB - 12} fill="#64748B" className="text-[10px] font-mono font-bold uppercase tracking-wider">
            LOW DEMAND / LOW COVERAGE — MONITOR
          </text>
          <text x={svgW - padR - 12} y={svgH - padB - 12} textAnchor="end" fill="#F59E0B" className="text-[10px] font-mono font-bold uppercase tracking-wider">
            LOW DEMAND / HIGH COVERAGE — POTENTIAL OVERSUPPLY
          </text>

          {/* Plotted Skill Data Points */}
          {skillsData.map((s) => {
            const cx = getX(s.currentCapability);
            const cy = getY(s.projectedFuture);
            const isHovered = hoveredSkill?.id === s.id;
            const isHighGap = s.gap > 18;

            const pointColor = (s.currentCapability < 50 && s.projectedFuture >= 50) ? "#EF4444" :
                              (s.currentCapability >= 50 && s.projectedFuture >= 50) ? "#10B981" :
                              (s.currentCapability >= 50 && s.projectedFuture < 50) ? "#F59E0B" : "#94A3B8";

            return (
              <g 
                key={s.id}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredSkill(s)}
                onMouseLeave={() => setHoveredSkill(null)}
              >
                <circle 
                  cx={cx} 
                  cy={cy} 
                  r={isHovered ? 8 : 5.5} 
                  fill={pointColor} 
                  stroke="#0B0F17" 
                  strokeWidth={2} 
                />
                <text 
                  x={cx} 
                  y={cy - 10} 
                  textAnchor="middle" 
                  fill={isHovered ? "#FFFFFF" : pointColor} 
                  className={`text-[9px] font-mono ${isHovered || isHighGap ? 'font-bold' : ''}`}
                >
                  {s.name}
                </text>
              </g>
            );
          })}

          {/* Axis Labels */}
          <text x={svgW / 2} y={svgH - 10} textAnchor="middle" fill="#64748B" className="text-[10px] font-mono uppercase font-bold">
            Current Supply Coverage → (0% — 100%)
          </text>
          <text x={18} y={svgH / 2} textAnchor="middle" fill="#64748B" className="text-[10px] font-mono uppercase font-bold" transform={`rotate(-90 18 ${svgH / 2})`}>
            Future Market Demand Score → (0 — 100)
          </text>
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredSkill && (
          <div className="absolute top-4 right-6 bg-[#161E2E] border border-cyan-500/50 p-3 rounded-xl text-xs font-mono shadow-2xl backdrop-blur-md space-y-1">
            <div className="text-white font-bold">{hoveredSkill.name}</div>
            <div className="text-slate-300">Supply Coverage: <strong className="text-cyan-400">{hoveredSkill.currentCapability}%</strong></div>
            <div className="text-slate-300">Future Demand: <strong className="text-emerald-400">{hoveredSkill.projectedFuture} / 100</strong></div>
            <div className="text-slate-300">Capability Gap: <strong className="text-rose-400">-{hoveredSkill.gap} pts</strong></div>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================================================
// MAIN PAGE COMPONENT: INDUSTRY INTELLIGENCE
// ==================================================
export default function IndustryIntelligencePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("Overview");

  useEffect(() => {
    queueMicrotask(() => {
      setIsMounted(true);
      const user = getStoredUser();
      if (!user) {
        router.replace("/get-started?role=industry");
        return;
      }
      const userRole = user.role || "industry";
      if (userRole !== "industry") {
        router.replace(`/get-started?role=industry&conflict=true&currentRole=${userRole}`);
        return;
      }
      setCurrentUser(user);
    });
  }, [router]);

  const handleSignOut = () => {
    clearStoredUser();
    router.push("/get-started");
  };

  const [selectedSector, setSelectedSector] = useState("Technology & Digital Systems");
  const [selectedFocus, setSelectedFocus] = useState("Software & Platform Engineering");
  const [selectedHorizon, setSelectedHorizon] = useState("2026 — 2028 Planning Horizon");
  const [selectedSkillForGraph, setSelectedSkillForGraph] = useState(null);
  const [activeRoleModal, setActiveRoleModal] = useState(null);
  const [simulatedInterventionId, setSimulatedInterventionId] = useState(null);

  // 1. CAPABILITY MATRIX (Derived deterministically from SKILLS_DATA)
  const capabilityMatrix = useMemo(() => {
    return SKILLS_DATA.map((skill) => {
      const currentDemand = skill.currentDemand;
      const projectedFuture = skill.futureDemand;
      const currentCapability = Math.max(25, Math.round(currentDemand * 0.72));
      const gap = Math.max(0, projectedFuture - currentCapability);
      const delta = projectedFuture - currentDemand;
      const pctChange = Math.round((delta / (currentDemand || 1)) * 100);

      let priority = "Watch";
      let gapSeverity = "Moderate";
      if (gap > 22) {
        priority = "Critical";
        gapSeverity = "Critical";
      } else if (gap > 12) {
        priority = "High";
        gapSeverity = "High";
      }

      const relatedRoleIds = SKILL_RELATIONS
        .filter(r => r.target === skill.id && r.type === "requires")
        .map(r => r.source);
      const relatedRoles = ROLES_DATA.filter(r => relatedRoleIds.includes(r.id));

      return {
        ...skill,
        currentCapability,
        projectedFuture,
        gap,
        delta,
        pctChange,
        priority,
        gapSeverity,
        relatedRoles
      };
    });
  }, []);

  const activeTrajectorySkill = selectedSkillForGraph || capabilityMatrix[0];

  // 2. EXECUTIVE SUMMARY METRICS
  const summaryMetrics = useMemo(() => {
    const totalCap = capabilityMatrix.reduce((a, s) => a + s.currentCapability, 0);
    const totalFuture = capabilityMatrix.reduce((a, s) => a + s.projectedFuture, 0);
    const roleCoverage = Math.round((totalCap / (totalFuture || 1)) * 100);
    const criticalGapsCount = capabilityMatrix.filter(s => s.priority === "Critical" || s.priority === "High").length;

    return {
      demandChange: "+18%",
      criticalGapsCount,
      roleCoverage,
      pipelinePressure: "Moderate"
    };
  }, [capabilityMatrix]);

  // 3. ROLE READINESS COMPILATION
  const roleReadinessList = useMemo(() => {
    return ROLES_DATA.map(role => {
      const reqRelations = SKILL_RELATIONS.filter(r => r.source === role.id && r.type === "requires");
      const reqSkillIds = reqRelations.map(r => r.target);
      const matchedSkills = capabilityMatrix.filter(s => reqSkillIds.includes(s.id));

      const avgCoverage = matchedSkills.length > 0
        ? Math.round(matchedSkills.reduce((acc, s) => acc + s.currentCapability, 0) / matchedSkills.length)
        : 72;

      const topGaps = matchedSkills.sort((a, b) => b.gap - a.gap).slice(0, 3);

      return {
        ...role,
        matchedSkills,
        readiness: avgCoverage,
        topGaps,
        demandDirection: "▲ Accelerating"
      };
    });
  }, [capabilityMatrix]);

  // 4. WORKFORCE PIPELINE DATA
  const pipelineFunnel = useMemo(() => {
    return {
      learners: 12400,
      activeTraining: 8700,
      skillReady: 6100,
      evidenceReady: 3900,
      industryReady: 2850,
      primaryConstraint: "Practical Evidence & Industry Project Gate (-36% drop between Skill-Ready and Evidence-Ready stages)"
    };
  }, []);

  // 5. INTERVENTION OPTIONS
  const interventionOptions = [
    {
      id: "int_curriculum",
      title: "Curriculum Alignment Update",
      targetSkill: "Cloud Architecture",
      type: "Curriculum Integration",
      estimatedImpact: "+8 readiness points",
      impactVal: 8,
      effort: "4 weeks",
      description: "Align university curricula directly with Docker, Kubernetes, and Cloud Native deployment specifications."
    },
    {
      id: "int_training",
      title: "Enterprise Training Expansion",
      targetSkill: "Data Engineering",
      type: "Workforce Upskilling",
      estimatedImpact: "+6 readiness points",
      impactVal: 6,
      effort: "6 weeks",
      description: "Expand institutional hands-on labs focusing on distributed data pipelines and ETL orchestration."
    },
    {
      id: "int_projects",
      title: "Industry Project Challenge Program",
      targetSkill: "Applied AI & Containerization",
      type: "Practical Hackathon",
      estimatedImpact: "+5 readiness points",
      impactVal: 5,
      effort: "2 weeks",
      description: "Deploy real-world employer problem statements as verified submission challenges."
    }
  ];

  const industryNavTabs = [
    "Overview",
    "Demand Intelligence",
    "Capability Gaps",
    "Role Intelligence",
    "Product / Capability Opportunities",
    "Workforce Readiness",
    "Intervention Planning",
    "Profile"
  ];

  if (!isMounted || !currentUser || currentUser.role !== "industry") {
    return (
      <div className="min-h-screen bg-[#0A0E17] text-slate-100 flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-slate-700 border-t-cyan-400 rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">
            Loading Industry Portal...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0E17] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 space-y-8">

        {/* ROLE APPLICATION SHELL HEADER & NAVIGATION */}
        <div className="bg-[#111827] border border-[#1E2638] rounded-2xl p-4 sm:p-6 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1E2638] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-950 border border-violet-800 flex items-center justify-center text-violet-400 font-bold">
                <Building2 size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold bg-violet-950 text-violet-300 border border-violet-800 px-2 py-0.5 rounded">
                    INDUSTRY APPLICATION SHELL
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Authenticated</span>
                </div>
                <h1 className="text-lg font-bold text-white mt-0.5">
                  Good morning, {displayName.split(" ")[0]}.
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-400">
                {displayName} (<strong className="text-violet-400">Industry</strong>)
              </span>
              <button
                onClick={handleSignOut}
                className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut size={13} />
                Sign Out
              </button>
            </div>
          </div>

          {/* Industry Nav Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono no-scrollbar">
            {industryNavTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-2 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab
                    ? "bg-violet-500 text-slate-950 shadow-md"
                    : "bg-[#161E2E] text-slate-400 hover:text-white border border-[#1E2638]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* ================================================== */}
        {/* SECTION A — INDUSTRY INTELLIGENCE HEADER          */}
        {/* ================================================== */}
        <section className="border-b border-[#1E2638] pb-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 bg-cyan-950 px-2.5 py-1 rounded border border-cyan-800 uppercase">
                  DETERMINISTIC BENCHMARK MODEL
                </span>
                <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                  <Shield size={12} className="text-slate-400" /> Industry &amp; Enterprise Lens
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                INDUSTRY <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">INTELLIGENCE</span>
              </h1>
              <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-3xl leading-relaxed">
                Understand the capabilities your workforce will need next. The Industry lens connects market demand shifts, capability gap matrices, role readiness, pipeline bottlenecks, and modeled interventions into institutional execution.
              </p>
            </div>

            {/* Context Selector Bar */}
            <div className="bg-[#111827] border border-[#1E2638] p-4 rounded-xl shrink-0 space-y-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                INTELLIGENCE CONTROL CONTEXT
              </span>
              <div className="flex flex-col gap-2">
                <select 
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value)}
                  className="bg-[#161E2E] border border-[#1E2638] text-xs font-mono text-white px-3 py-1.5 rounded focus:outline-none focus:border-cyan-500"
                >
                  <option value="Technology & Digital Systems">Industry: [ Technology &amp; Systems ▼ ]</option>
                  <option value="Data Infrastructure & Analytics">Industry: [ Data Infrastructure ▼ ]</option>
                  <option value="Cloud Platform Engineering">Industry: [ Cloud Platforms ▼ ]</option>
                </select>

                <select 
                  value={selectedFocus}
                  onChange={(e) => setSelectedFocus(e.target.value)}
                  className="bg-[#161E2E] border border-[#1E2638] text-xs font-mono text-white px-3 py-1.5 rounded focus:outline-none focus:border-cyan-500"
                >
                  <option value="Software & Platform Engineering">Focus: [ Software &amp; Digital ▼ ]</option>
                  <option value="Distributed Infrastructure">Focus: [ Distributed Systems ▼ ]</option>
                  <option value="MLOps & AI Engineering">Focus: [ MLOps &amp; AI ▼ ]</option>
                </select>

                <select 
                  value={selectedHorizon}
                  onChange={(e) => setSelectedHorizon(e.target.value)}
                  className="bg-[#161E2E] border border-[#1E2638] text-xs font-mono text-white px-3 py-1.5 rounded focus:outline-none focus:border-cyan-500"
                >
                  <option value="2026 — 2028 Planning Horizon">Horizon: [ 2026 — 2028 ▼ ]</option>
                  <option value="2024 — 2026 Historical Baseline">Horizon: [ 2024 — 2026 ▼ ]</option>
                </select>
              </div>
            </div>
          </div>

          {/* Status Bar */}
          <div className="flex items-center justify-between text-xs font-mono border-t border-[#1E2638] pt-3 text-slate-400">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              WORKFORCE SIGNAL: Updated from platform intelligence
            </span>
            <span className="text-slate-500">SCOPE: GEOGRAPHICALLY NEUTRAL ENTERPRISE MODEL</span>
          </div>
        </section>

        {/* ================================================== */}
        {/* SECTION B — INDUSTRY SIGNAL SUMMARY               */}
        {/* ================================================== */}
        <section className="space-y-3">
          <h2 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Activity size={14} className="text-cyan-400" /> Industry Signal Summary
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1 */}
            <div className="bg-[#111827] p-5 rounded-xl border border-[#1E2638] flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">CAPABILITY DEMAND</span>
                <div className="text-3xl font-mono font-bold text-emerald-400">{summaryMetrics.demandChange}</div>
              </div>
              <div className="mt-4 pt-3 border-t border-[#1E2638] flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">BASELINE</span>
                <span className="text-emerald-400 font-bold">VS CURRENT BASELINE</span>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="bg-[#111827] p-5 rounded-xl border border-[#1E2638] flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">CRITICAL SKILL GAPS</span>
                <div className="text-3xl font-mono font-bold text-rose-400">{summaryMetrics.criticalGapsCount}</div>
              </div>
              <div className="mt-4 pt-3 border-t border-[#1E2638] flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">THRESHOLD</span>
                <span className="text-rose-400 font-bold">BELOW TARGET STANDARD</span>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="bg-[#111827] p-5 rounded-xl border border-[#1E2638] flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">ROLE READINESS</span>
                <div className="text-3xl font-mono font-bold text-cyan-400">{summaryMetrics.roleCoverage}%</div>
              </div>
              <div className="mt-4 pt-3 border-t border-[#1E2638] flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">COVERAGE</span>
                <span className="text-cyan-400 font-bold">WORKFORCE COVERAGE</span>
              </div>
            </div>

            {/* Metric 4 */}
            <div className="bg-[#111827] p-5 rounded-xl border border-[#1E2638] flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">PIPELINE PRESSURE</span>
                <div className="text-3xl font-mono font-bold text-amber-400">{summaryMetrics.pipelinePressure}</div>
              </div>
              <div className="mt-4 pt-3 border-t border-[#1E2638] flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">CONSTRAINT</span>
                <span className="text-amber-400 font-bold">FUTURE CAPABILITY CONSTRAINT</span>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================== */}
        {/* SECTION C — DEMAND TRAJECTORY (PRIMARY CANVAS)    */}
        {/* ================================================== */}
        <section className="space-y-3" id="demand-trajectory">
          <div>
            <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="text-cyan-400" size={18} /> Demand Trajectory &amp; Historical Signal
            </h2>
            <p className="text-xs text-slate-400">How capability demand is changing across the 2024—2028 planning horizon.</p>
          </div>

          <IndustryDemandTrajectoryCanvas 
            activeSkill={activeTrajectorySkill}
            onSelectSkill={(s) => setSelectedSkillForGraph(s)}
            skillList={capabilityMatrix}
          />
        </section>

        {/* ================================================== */}
        {/* SECTION D — CAPABILITY GAP MATRIX                 */}
        {/* ================================================== */}
        <section className="space-y-4" id="gap-matrix">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Target size={18} className="text-rose-400" /> Capability Gap Matrix
              </h2>
              <p className="text-xs text-slate-400">Comparing current workforce supply against target market demand requirements.</p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {capabilityMatrix.length} Capabilities Evaluated
            </span>
          </div>

          <div className="bg-[#0B0F17] border border-[#1E2638] rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#0E1422] text-slate-400 uppercase text-[10px] border-b border-[#1E2638]">
                  <tr>
                    <th className="p-4">CAPABILITY</th>
                    <th className="p-4 text-center">CURRENT SUPPLY</th>
                    <th className="p-4 text-center">TARGET REQUIRED</th>
                    <th className="p-4 text-center">CAPABILITY GAP</th>
                    <th className="p-4 text-center">DEMAND DIRECTION</th>
                    <th className="p-4 text-right">PRIORITY</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2638] bg-[#0B0F17]">
                  {capabilityMatrix.map((item) => {
                    const isCritical = item.priority === "Critical";
                    const isHigh = item.priority === "High";

                    return (
                      <tr key={item.id} className="hover:bg-[#111827] transition-colors">
                        <td className="p-4 font-bold text-white text-sm font-sans">
                          {item.name}
                          <span className="block text-[10px] font-mono text-slate-500 font-normal">{item.category || "Core Skill"}</span>
                        </td>
                        <td className="p-4 text-center font-bold text-cyan-400">{item.currentCapability} / 100</td>
                        <td className="p-4 text-center font-bold text-white">{item.projectedFuture} / 100</td>
                        <td className="p-4 text-center font-bold text-rose-400">-{item.gap} pts</td>
                        <td className="p-4 text-center font-bold text-emerald-400">▲ +{item.delta} pts ({item.pctChange >= 0 ? `+${item.pctChange}%` : `${item.pctChange}%`})</td>
                        <td className="p-4 text-right">
                          <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase border ${
                            isCritical ? 'bg-rose-950 text-rose-400 border-rose-800' :
                            isHigh ? 'bg-amber-950 text-amber-400 border-amber-800' :
                            'bg-cyan-950 text-cyan-400 border-cyan-800'
                          }`}>
                            {item.priority}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ================================================== */}
        {/* SECTION E — ROLE READINESS                        */}
        {/* ================================================== */}
        <section className="space-y-4" id="role-readiness">
          <div>
            <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Briefcase className="text-cyan-400" size={18} /> Role Readiness &amp; Gap Breakdown
            </h2>
            <p className="text-xs text-slate-400">Industry roles affected by capability deficits and skill gap constraints.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {roleReadinessList.map((role) => (
              <div 
                key={role.id}
                onClick={() => setActiveRoleModal(role)}
                className="bg-[#0B0F17] border border-[#1E2638] rounded-xl p-5 hover:border-cyan-500/50 cursor-pointer transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white text-base">{role.name}</span>
                    <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950 px-2.5 py-0.5 rounded border border-cyan-800">
                      {role.readiness}% Readiness
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mb-3">{role.description}</p>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">PRIMARY CAPABILITY GAPS:</span>
                    {role.topGaps.map(g => (
                      <div key={g.id} className="bg-[#111827] px-2.5 py-1 rounded border border-[#1E2638] flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-300">{g.name}</span>
                        <span className="text-rose-400 font-bold">-{g.gap} pts</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#1E2638] flex items-center justify-between text-xs font-mono text-cyan-400 font-bold">
                  <span>INSPECT ROLE BLUEPRINT</span>
                  <ChevronRight size={14} />
                </div>
              </div>
            ))}
          </div>

          {/* Role Detail Modal / Expansion Drawer */}
          {activeRoleModal && (
            <div className="bg-[#111827] border border-cyan-500/40 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#1E2638] pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase bg-cyan-950 px-2.5 py-1 rounded border border-cyan-800">
                    ROLE INTELLIGENCE DRAWER
                  </span>
                  <h3 className="text-lg font-bold text-white">{activeRoleModal.name} Target Blueprint</h3>
                </div>
                <button 
                  onClick={() => setActiveRoleModal(null)}
                  className="text-xs font-mono text-slate-400 hover:text-white"
                >
                  Close Drawer ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
                <div className="bg-[#161E2E] p-3.5 rounded-xl border border-[#1E2638]">
                  <span className="text-slate-400 text-[10px] uppercase block">CURRENT WORKFORCE READINESS</span>
                  <div className="text-xl font-bold text-cyan-400 mt-1">{activeRoleModal.readiness}% Coverage</div>
                </div>
                <div className="bg-[#161E2E] p-3.5 rounded-xl border border-[#1E2638]">
                  <span className="text-slate-400 text-[10px] uppercase block">REQUIRED CAPABILITIES</span>
                  <div className="text-xl font-bold text-white mt-1">{activeRoleModal.skills?.length || 4} Core Competencies</div>
                </div>
                <div className="bg-[#161E2E] p-3.5 rounded-xl border border-[#1E2638]">
                  <span className="text-slate-400 text-[10px] uppercase block">DEMAND DIRECTION</span>
                  <div className="text-xl font-bold text-emerald-400 mt-1">{activeRoleModal.demandDirection}</div>
                </div>
                <div className="bg-[#161E2E] p-3.5 rounded-xl border border-[#1E2638]">
                  <span className="text-slate-400 text-[10px] uppercase block">RECOMMENDED INTERVENTION</span>
                  <div className="text-xs font-bold text-violet-300 mt-1">Enterprise Challenge Launch</div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono">Action: Deploy targeted upskilling program for {activeRoleModal.name}</span>
                <Link 
                  href="/challenges"
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold px-4 py-2 rounded-lg"
                >
                  DEPLOY CHALLENGE PROGRAM →
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* ================================================== */}
        {/* SECTION F — WORKFORCE PIPELINE                    */}
        {/* ================================================== */}
        <section className="space-y-4" id="workforce-pipeline">
          <div>
            <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Compass className="text-emerald-400" size={18} /> Workforce Supply Pipeline
            </h2>
            <p className="text-xs text-slate-400">Tracking talent progression across learning, skill acquisition, evidence verification, and industry readiness.</p>
          </div>

          <div className="bg-[#0B0F17] border border-[#1E2638] rounded-2xl p-6 space-y-6 shadow-2xl">
            {/* Sequential Funnel */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
              <div className="bg-[#111827] p-4 rounded-xl border border-[#1E2638] text-center space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">01 LEARNERS</span>
                <div className="text-xl font-mono font-bold text-white">{pipelineFunnel.learners.toLocaleString()}</div>
                <span className="text-[9px] font-mono text-slate-500 block">Enrolled Platform Talent</span>
              </div>

              <div className="bg-[#111827] p-4 rounded-xl border border-[#1E2638] text-center space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">02 ACTIVE TRAINING</span>
                <div className="text-xl font-mono font-bold text-cyan-400">{pipelineFunnel.activeTraining.toLocaleString()}</div>
                <span className="text-[9px] font-mono text-slate-500 block">In Curriculum Modules</span>
              </div>

              <div className="bg-[#111827] p-4 rounded-xl border border-[#1E2638] text-center space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">03 SKILL-READY</span>
                <div className="text-xl font-mono font-bold text-emerald-400">{pipelineFunnel.skillReady.toLocaleString()}</div>
                <span className="text-[9px] font-mono text-slate-500 block">Passed Knowledge Gates</span>
              </div>

              <div className="bg-[#161E2E] p-4 rounded-xl border border-rose-500/50 text-center space-y-1 relative">
                <span className="text-[10px] font-mono text-rose-400 uppercase block font-bold">04 EVIDENCE-READY</span>
                <div className="text-xl font-mono font-bold text-rose-400">{pipelineFunnel.evidenceReady.toLocaleString()}</div>
                <span className="text-[9px] font-mono text-rose-400 block font-bold">Pipeline Drop Point</span>
              </div>

              <div className="bg-[#111827] p-4 rounded-xl border border-[#1E2638] text-center space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">05 INDUSTRY-READY</span>
                <div className="text-xl font-mono font-bold text-white">{pipelineFunnel.industryReady.toLocaleString()}</div>
                <span className="text-[9px] font-mono text-slate-500 block">Verified Industry Fit</span>
              </div>
            </div>

            {/* Primary Pipeline Constraint Callout */}
            <div className="p-4 bg-rose-950/30 border border-rose-800/60 rounded-xl text-xs font-mono space-y-1">
              <div className="flex items-center gap-2 text-rose-400 font-bold uppercase tracking-wider">
                <AlertCircle size={14} /> PRIMARY PIPELINE CONSTRAINT IDENTIFIED
              </div>
              <p className="text-slate-300 font-sans text-xs">
                {pipelineFunnel.primaryConstraint}
              </p>
            </div>
          </div>
        </section>

        {/* ================================================== */}
        {/* SECTION G — INTERVENTION PLANNER                  */}
        {/* ================================================== */}
        <section className="space-y-4" id="intervention-planner">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800 uppercase">
                  MODELED SCENARIO PLANNER
                </span>
              </div>
              <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <SlidersHorizontal className="text-cyan-400" size={18} /> Intervention Planner
              </h2>
              <p className="text-xs text-slate-400">What would most improve workforce readiness across targeted capability gaps?</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {interventionOptions.map((opt) => {
              const isSelected = simulatedInterventionId === opt.id;

              return (
                <div 
                  key={opt.id}
                  onClick={() => setSimulatedInterventionId(isSelected ? null : opt.id)}
                  className={`bg-[#0B0F17] border rounded-xl p-5 cursor-pointer transition-all space-y-3 flex flex-col justify-between ${
                    isSelected ? 'border-cyan-500 bg-[#0E1422] shadow-xl' : 'border-[#1E2638] hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-slate-400 uppercase">{opt.type}</span>
                      <span className="text-emerald-400 font-bold">{opt.estimatedImpact}</span>
                    </div>

                    <h3 className="font-bold text-white text-base">{opt.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{opt.description}</p>
                  </div>

                  <div className="pt-3 border-t border-[#1E2638] flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-500">Effort: {opt.effort}</span>
                    <button className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
                      isSelected ? 'bg-cyan-500 text-slate-950' : 'bg-[#161E2E] text-cyan-400 border border-cyan-800'
                    }`}>
                      {isSelected ? '[ ACTIVE SCENARIO ]' : '[ SIMULATE IMPACT ]'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ================================================== */}
        {/* SECTION H — CAPABILITY PRIORITY MAP               */}
        {/* ================================================== */}
        <section className="space-y-4" id="priority-map">
          <CapabilityPriorityMatrix skillsData={capabilityMatrix} />
        </section>

        {/* ================================================== */}
        {/* SECTION I — INDUSTRY ACTIONS                      */}
        {/* ================================================== */}
        <section className="space-y-4 border-t border-[#1E2638] pt-8" id="from-signal-to-action">
          <div>
            <h2 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Zap className="text-emerald-400" size={20} /> From Signal to Action
            </h2>
            <p className="text-xs text-slate-400">Convert workforce intelligence insights into institutional execution pathways.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#0B0F17] border border-[#1E2638] rounded-2xl p-6 space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-rose-400 bg-rose-950 px-2.5 py-1 rounded border border-rose-800 uppercase block w-fit mb-2">
                  1. PRIORITIZE
                </span>
                <h3 className="text-lg font-bold text-white">Capability Constraints</h3>
                <p className="text-xs text-slate-300 leading-relaxed mt-1">
                  Identify the 3 critical skills creating the largest workforce constraint across your target roles.
                </p>
              </div>

              <a 
                href="#gap-matrix"
                className="inline-flex items-center justify-center gap-2 bg-[#161E2E] hover:bg-slate-800 text-slate-200 border border-[#1E2638] font-mono text-xs font-bold px-4 py-2.5 rounded-lg transition-colors"
              >
                REVIEW GAP MATRIX ↓
              </a>
            </div>

            <div className="bg-[#0B0F17] border border-[#1E2638] rounded-2xl p-6 space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950 px-2.5 py-1 rounded border border-cyan-800 uppercase block w-fit mb-2">
                  2. ALIGN
                </span>
                <h3 className="text-lg font-bold text-white">Curriculum Pathways</h3>
                <p className="text-xs text-slate-300 leading-relaxed mt-1">
                  Connect university and training program curricula directly to verified employer target standards.
                </p>
              </div>

              <Link 
                href="/training"
                className="inline-flex items-center justify-center gap-2 bg-[#161E2E] hover:bg-slate-800 text-slate-200 border border-[#1E2638] font-mono text-xs font-bold px-4 py-2.5 rounded-lg transition-colors"
              >
                EXPLORE CURRICULA →
              </Link>
            </div>

            <div className="bg-[#0B0F17] border border-[#1E2638] rounded-2xl p-6 space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded border border-emerald-800 uppercase block w-fit mb-2">
                  3. INTERVENE
                </span>
                <h3 className="text-lg font-bold text-white">Targeted Challenge Programs</h3>
                <p className="text-xs text-slate-300 leading-relaxed mt-1">
                  Direct hands-on project challenges toward the highest-impact capability gaps to accelerate student evidence readiness.
                </p>
              </div>

              <Link 
                href="/challenges"
                className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-mono text-xs font-bold px-4 py-2.5 rounded-lg transition-colors shadow-lg"
              >
                DEPLOY HACKATHONS / CHALLENGES →
              </Link>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
