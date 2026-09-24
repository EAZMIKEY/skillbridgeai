"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { 
  Target, 
  CheckCircle2, 
  AlertCircle,
  Award,
  Layers,
  Zap,
  Maximize2,
  TrendingUp,
  ShieldCheck,
  Flame,
  Info,
  Rocket,
  ChevronRight,
  FileText,
  X,
  GitBranch,
  ArrowRight,
  LogOut
} from "lucide-react";
import { buildRoleBlueprint } from "@/lib/roleBlueprint";
import { getIndustryChallenges } from "@/lib/industryChallenges";
import { getTrainingPrograms } from "@/lib/curriculumAlignment";
import { getRegions } from "@/lib/regionalSkillIntelligence";
import { generateLearningPath } from "@/lib/learningPathGenerator";
import { getAdjacentRoles, compareRoles } from "@/lib/roleAdjacency";
import { buildStudentSkillTwin } from "@/lib/studentSkillTwin";
import { calculateIndustryReadiness } from "@/lib/industryReadiness";
import { analyzeSkillGaps } from "@/lib/skillGapIntelligence";
import { generateSkillInterventions } from "@/lib/skillIntervention";
import { generateSkillMissions } from "@/lib/skillMissions";
import { generateExplanation } from "@/lib/explainability";
import { STUDENT_PROFILE } from "@/data/studentProfile";
import { ROLES_DATA, SKILL_RELATIONS } from "@/data/skillGraph";
import { SKILLS_DATA } from "@/data/skillModel";
import { getStoredUser, clearStoredUser } from "@/lib/auth/userSession";

function DemandIntelligenceCanvas({ skill, studentCapability = 54, targetRoleName, onTriggerExplain, onNavigateToMilestone }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  if (!skill) return null;

  const history = skill.trendHistory || [
    Math.max(10, skill.currentDemand - 25),
    Math.max(15, skill.currentDemand - 20),
    Math.max(20, skill.currentDemand - 15),
    Math.max(25, skill.currentDemand - 10),
    Math.max(30, skill.currentDemand - 5),
    skill.currentDemand
  ];

  const currentVal = skill.currentDemand;
  const futureVal = skill.futureDemand;
  const delta = futureVal - currentVal;
  const pctChange = Math.round((delta / (currentVal || 1)) * 100);
  const capabilityGap = Math.max(0, futureVal - studentCapability);

  const graphPoints = [
    { year: "2024", label: "2024 H1", val: history[0] || 45, type: "historical" },
    { year: "2024.5", label: "2024 H2", val: history[2] || 55, type: "historical" },
    { year: "2025", label: "2025 H1", val: history[4] || 68, type: "historical" },
    { year: "2026", label: "2026 NOW", val: currentVal, type: "current" },
    { year: "2027", label: "2027 EST", val: Math.round(currentVal + delta * 0.5), type: "projected" },
    { year: "2028", label: "2028 TARGET", val: futureVal, type: "projected" },
  ];

  const svgWidth = 800;
  const svgHeight = 250;
  const padLeft = 55;
  const padRight = 45;
  const padTop = 30;
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
      <div className="p-5 border-b border-[#1E2638] bg-[#0E1422] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded border border-cyan-800">
              DEMAND TRAJECTORY INTELLIGENCE
            </span>
            <span className="text-xs font-mono text-slate-400">Target Role: <strong className="text-white">{targetRoleName}</strong></span>
          </div>
          <h3 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
            {skill.name} <span className="text-sm font-mono text-slate-400 font-normal">({skill.category || "Core Skill"})</span>
          </h3>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-[#161E2E] px-3.5 py-1.5 rounded-lg border border-[#1E2638] text-right">
            <span className="text-[9px] font-mono text-slate-400 uppercase block">MARKET TRAJECTORY</span>
            <span className="text-sm font-mono font-bold text-emerald-400 flex items-center justify-end gap-1">
              ▲ +{delta} pts ({pctChange >= 0 ? `+${pctChange}%` : `${pctChange}%`})
            </span>
          </div>

          <button 
            onClick={() => onTriggerExplain && onTriggerExplain(skill.id)}
            className="text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-950/80 border border-cyan-800 px-3 py-2 rounded-lg transition-all"
          >
            [ EXPLAIN DRIVERS ]
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border-b border-[#1E2638]">
        <div className="lg:col-span-8 p-5 bg-[#0B0F17] flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2 px-2">
            <span>Demand Score (0 — 100)</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-cyan-400 inline-block"></span> Historical Signal</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-emerald-400 border-dashed border-t border-emerald-400 inline-block"></span> Projected Target</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-400 inline-block"></span> 2026 Baseline</span>
            </div>
          </div>

          <div className="relative w-full overflow-x-auto">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto min-w-[550px]">
              <defs>
                <linearGradient id="historicalGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="projectedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

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

              <line x1={nowX} y1={padTop - 10} x2={nowX} y2={svgHeight - padBottom + 10} stroke="#06B6D4" strokeWidth="1.5" strokeDasharray="4 4" />
              <rect x={nowX - 30} y={padTop - 22} width={60} height={16} rx={3} fill="#06B6D4" />
              <text x={nowX} y={padTop - 10} textAnchor="middle" fill="#0B0F17" className="text-[9px] font-mono font-bold uppercase">
                2026 NOW
              </text>

              <path d={`${historicalD} L ${nowX} ${getY(0)} L ${getX(0)} ${getY(0)} Z`} fill="url(#historicalGrad)" />
              <path d={`${projectedD} L ${getX(5)} ${getY(0)} L ${nowX} ${getY(0)} Z`} fill="url(#projectedGrad)" />

              <path d={historicalD} fill="none" stroke="#06B6D4" strokeWidth="3" strokeLinecap="round" />
              <path d={projectedD} fill="none" stroke="#10B981" strokeWidth="3" strokeDasharray="6 4" strokeLinecap="round" />

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

              {graphPoints.map((pt, i) => (
                <text key={i} x={getX(i)} y={svgHeight - 12} textAnchor="middle" fill={i === 3 ? "#06B6D4" : "#64748B"} className={`text-[10px] font-mono ${i === 3 ? 'font-bold' : ''}`}>
                  {pt.label}
                </text>
              ))}
            </svg>

            {hoveredIdx !== null && (
              <div className="absolute top-2 right-4 bg-[#161E2E] border border-cyan-500/40 p-2.5 rounded-lg text-xs font-mono shadow-xl backdrop-blur-md">
                <div className="text-slate-400 text-[10px] uppercase">{graphPoints[hoveredIdx].label} ({graphPoints[hoveredIdx].type})</div>
                <div className="text-white font-bold text-sm">Demand Index: <span className="text-cyan-400">{graphPoints[hoveredIdx].val} / 100</span></div>
              </div>
            )}
          </div>

          <div className="mt-2 text-[10px] font-mono text-slate-500 flex items-center justify-between border-t border-[#1E2638] pt-2">
            <span>DATA PROJECTION: DETERMINISTIC BENCHMARK MODEL</span>
            <span>UPDATED: Q1 2026</span>
          </div>
        </div>

        <div className="lg:col-span-4 p-5 bg-[#0E1422] border-t lg:border-t-0 lg:border-l border-[#1E2638] flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-3">
              DEMAND &amp; CAPABILITY METRICS
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
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">YOUR CAPABILITY</span>
                  <span className="text-lg font-mono font-bold text-cyan-400">{studentCapability} <span className="text-xs text-slate-500">/ 100</span></span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">Skill Twin</span>
              </div>

              <div className="bg-[#161E2E] p-3 rounded-xl border border-[#1E2638] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">CAPABILITY GAP</span>
                  <span className="text-lg font-mono font-bold text-rose-400">-{capabilityGap} <span className="text-xs text-slate-500">pts</span></span>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${capabilityGap > 15 ? 'bg-rose-950 text-rose-400 border-rose-800' : 'bg-amber-950 text-amber-400 border-amber-800'}`}>
                  {capabilityGap > 15 ? 'CRITICAL GAP' : 'MINOR GAP'}
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
              Market demand for <strong className="text-white">{skill.name}</strong> is expanding rapidly, creating a net <strong className="text-rose-400">-{capabilityGap} point</strong> skill gap.
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 bg-[#0A0E17] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-t border-cyan-900/40">
        <div className="flex items-center gap-3 flex-wrap text-xs font-mono">
          <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950 px-2.5 py-1 rounded border border-cyan-800 tracking-wider">
            INTELLIGENCE BRIDGE
          </span>
          <div className="flex items-center gap-2 text-slate-300 flex-wrap">
            <span>Demand Signal (<strong className="text-emerald-400">+{delta} pts</strong>)</span>
            <span className="text-slate-600">➔</span>
            <span>Capability Gap (<strong className="text-rose-400">-{capabilityGap} pts</strong>)</span>
            <span className="text-slate-600">➔</span>
            <span>Next Milestone (<strong className="text-cyan-400">{skill.name}</strong>)</span>
          </div>
        </div>

        <button 
          onClick={onNavigateToMilestone}
          className="text-xs font-mono font-bold text-white bg-cyan-600 hover:bg-cyan-500 px-4 py-2 rounded-lg transition-all shadow-md shrink-0 flex items-center gap-1.5 cursor-pointer"
        >
          GO TO RELEVANT MILESTONE ↓
        </button>
      </div>
    </div>
  );
}

function MilestoneJourneyRoadmap({ learningPath, student, onStartMission }) {
  const [selectedMilestoneIdx, setSelectedMilestoneIdx] = useState(1);
  const roadmapItems = useMemo(() => learningPath?.roadmap || [], [learningPath]);

  const activeIdx = useMemo(() => {
    const idx = roadmapItems.findIndex(item => {
      const cap = student?.capabilities?.[item.skillId] || 0;
      return cap < 75;
    });
    return idx !== -1 ? idx : 0;
  }, [roadmapItems, student?.capabilities]);

  if (roadmapItems.length === 0) return null;

  const activeMilestone = roadmapItems[activeIdx] || roadmapItems[0];
  const phaseNames = [
    "FOUNDATION",
    "CORE CAPABILITIES",
    "SPECIALIZATION",
    "PRACTICAL PROJECT",
    "VERIFIED EVIDENCE",
    "INDUSTRY READINESS"
  ];

  return (
    <div className="bg-[#0B0F17] border border-[#1E2638] rounded-2xl p-6 space-y-8 shadow-2xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E2638] pb-5">
        <div>
          <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest block mb-1">
            SEQUENTIAL LEARNING PIPELINE
          </span>
          <h3 className="text-2xl font-bold text-white">Milestone Learning Roadmap</h3>
          <p className="text-xs text-slate-400 mt-0.5">Connected capability path mapping foundation through verified industry readiness.</p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Completed
          </span>
          <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span> Active (You Are Here)
          </span>
          <span className="flex items-center gap-1.5 text-slate-500">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-700"></span> Upcoming
          </span>
        </div>
      </div>

      <div className="hidden lg:block relative py-6 px-4">
        <div className="absolute top-[52px] left-12 right-12 h-[3px] bg-[#1E2638] z-0">
          <div 
            className="h-full bg-emerald-500 transition-all duration-500" 
            style={{ width: `${(activeIdx / (phaseNames.length - 1)) * 100}%` }}
          />
        </div>

        <div className="grid grid-cols-6 gap-2 relative z-10">
          {phaseNames.map((phaseTitle, idx) => {
            const item = roadmapItems[idx] || {
              skillName: phaseTitle,
              why: "Structured phase competency",
              estimatedEffort: "2-3 weeks",
              skillId: `phase_${idx}`
            };

            const cap = student.capabilities[item.skillId] || (idx < activeIdx ? 85 : idx === activeIdx ? 68 : 30);
            const isCompleted = idx < activeIdx || cap >= 80;
            const isActive = idx === activeIdx;
            const isSelected = selectedMilestoneIdx === idx;

            return (
              <div 
                key={idx}
                onClick={() => setSelectedMilestoneIdx(idx)}
                className={`cursor-pointer group flex flex-col items-center text-center p-3 rounded-xl transition-all ${
                  isActive ? 'bg-cyan-950/40 border border-cyan-500/50 shadow-lg shadow-cyan-950/50' :
                  isSelected ? 'bg-[#161E2E] border border-slate-700' :
                  'hover:bg-[#111827] border border-transparent'
                }`}
              >
                <span className={`text-[9px] font-mono uppercase mb-2 ${isActive ? 'text-cyan-400 font-bold' : 'text-slate-500'}`}>
                  0{idx + 1} — {phaseTitle}
                </span>

                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold mb-3 border-2 transition-all ${
                  isCompleted ? 'bg-emerald-500 border-emerald-400 text-slate-950' :
                  isActive ? 'bg-cyan-500 border-cyan-300 text-slate-950 ring-4 ring-cyan-500/20' :
                  'bg-[#0B0F17] border-[#1E2638] text-slate-500'
                }`}>
                  {isCompleted ? '✓' : `0${idx + 1}`}
                </div>

                {isActive && (
                  <span className="text-[9px] font-mono font-bold text-cyan-400 bg-cyan-950 border border-cyan-800 px-2 py-0.5 rounded-full mb-2 uppercase tracking-tight animate-pulse">
                    YOU ARE HERE
                  </span>
                )}

                <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                  {item.skillName}
                </div>

                <span className={`text-[10px] font-mono mt-1 font-bold ${
                  isCompleted ? 'text-emerald-400' : isActive ? 'text-cyan-400' : 'text-slate-500'
                }`}>
                  {cap}% Complete
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="block lg:hidden relative pl-6 space-y-6 before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-[3px] before:bg-[#1E2638]">
        {phaseNames.map((phaseTitle, idx) => {
          const item = roadmapItems[idx] || {
            skillName: phaseTitle,
            why: "Structured phase competency",
            estimatedEffort: "2-3 weeks",
            skillId: `phase_${idx}`
          };

          const cap = student.capabilities[item.skillId] || (idx < activeIdx ? 85 : idx === activeIdx ? 68 : 30);
          const isCompleted = idx < activeIdx || cap >= 80;
          const isActive = idx === activeIdx;
          const isSelected = selectedMilestoneIdx === idx;

          return (
            <div key={idx} className="relative pl-6">
              <div className={`absolute left-0 top-1 -translate-x-1/2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold border-2 ${
                isCompleted ? 'bg-emerald-500 border-emerald-400 text-slate-950' :
                isActive ? 'bg-cyan-500 border-cyan-300 text-slate-950 ring-4 ring-cyan-500/20' :
                'bg-[#0B0F17] border-[#1E2638] text-slate-500'
              }`}>
                {isCompleted ? '✓' : `0${idx + 1}`}
              </div>

              <div 
                onClick={() => setSelectedMilestoneIdx(idx)}
                className={`p-4 rounded-xl border cursor-pointer ${
                  isActive ? 'bg-cyan-950/40 border-cyan-500/60' :
                  isSelected ? 'bg-[#161E2E] border-slate-700' :
                  'bg-[#111827] border-[#1E2638]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">0{idx + 1} — {phaseTitle}</span>
                  {isActive && (
                    <span className="text-[9px] font-mono font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800 uppercase">
                      YOU ARE HERE
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">{item.skillName}</span>
                  <span className="text-xs font-mono text-cyan-400 font-bold">{cap}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-[#0E1422] border border-cyan-500/40 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950 px-2.5 py-1 rounded border border-cyan-800 uppercase tracking-widest">
                NEXT BEST ACTION
              </span>
              <span className="text-xs font-mono text-slate-400">Phase 0{activeIdx + 1}: {activeMilestone.skillName}</span>
            </div>

            <h4 className="text-xl font-bold text-white">
              Execute <span className="text-cyan-400">{activeMilestone.skillName}</span> Mission
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-[#161E2E] p-2.5 rounded-lg border border-[#1E2638]">
                <span className="text-[9px] font-mono text-slate-400 uppercase block">YOUR CAPABILITY</span>
                <span className="text-sm font-mono font-bold text-cyan-400">{student.capabilities[activeMilestone.skillId] || 54} / 100</span>
              </div>
              <div className="bg-[#161E2E] p-2.5 rounded-lg border border-[#1E2638]">
                <span className="text-[9px] font-mono text-slate-400 uppercase block">TARGET REQUIRED</span>
                <span className="text-sm font-mono font-bold text-white">78 / 100</span>
              </div>
              <div className="bg-[#161E2E] p-2.5 rounded-lg border border-[#1E2638]">
                <span className="text-[9px] font-mono text-slate-400 uppercase block">CAPABILITY GAP</span>
                <span className="text-sm font-mono font-bold text-rose-400">-{78 - (student.capabilities[activeMilestone.skillId] || 54)} pts</span>
              </div>
              <div className="bg-[#161E2E] p-2.5 rounded-lg border border-[#1E2638]">
                <span className="text-[9px] font-mono text-slate-400 uppercase block">DEMAND SIGNAL</span>
                <span className="text-sm font-mono font-bold text-emerald-400">▲ +18% Growth</span>
              </div>
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row md:flex-col justify-center gap-3">
            <button
              onClick={() => {
                if (onStartMission) onStartMission(activeMilestone.skillId);
              }}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs px-6 py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 font-mono uppercase tracking-wider cursor-pointer"
            >
              [ CONTINUE MISSION ]
            </button>
            <span className="text-[10px] font-mono text-slate-400 text-center">Estimated Effort: {activeMilestone.estimatedEffort || "2 weeks"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export const STUDENT_NAV_ITEMS = [
  { id: "overview", label: "Overview", href: "/student", sectionId: "student-section-overview" },
  { id: "skill-twin", label: "My Skill Twin", href: "/student/skill-twin", sectionId: "student-section-skill-twin" },
  { id: "learning-roadmap", label: "Learning Roadmap", href: "/student/learning-roadmap", sectionId: "student-section-learning-roadmap" },
  { id: "skill-gaps", label: "Skill Gaps", href: "/student/skill-gaps", sectionId: "student-section-skill-gaps" },
  { id: "missions", label: "Missions", href: "/student/missions", sectionId: "student-section-missions" },
  { id: "career-paths", label: "Career Paths", href: "/student/career-paths", sectionId: "student-section-career-paths" },
  { id: "demand-signals", label: "Demand Signals", href: "/student/demand-signals", sectionId: "student-section-demand-signals" },
  { id: "profile", label: "Profile", href: "/student/profile", sectionId: "student-section-profile" }
];

export default function StudentApplicationShell() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [currentUser, setCurrentUser] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setIsMounted(true);
      const user = getStoredUser();
      if (!user) {
        router.replace("/get-started?role=student");
        return;
      }
      const userRole = user.role || "student";
      if (userRole !== "student") {
        router.replace(`/get-started?role=student&conflict=true&currentRole=${userRole}`);
        return;
      }
      setCurrentUser(user);
    });
  }, [router]);

  const handleSignOut = () => {
    clearStoredUser();
    router.push("/");
  };

  const skillParam = searchParams?.get("skill");
  const roleParam = searchParams?.get("role");

  const initialRoleId = useMemo(() => {
    if (roleParam && ROLES_DATA.some(r => r.id === roleParam)) {
      return roleParam;
    }
    if (skillParam) {
      const matchingRelation = SKILL_RELATIONS.find(
        rel => rel.target === skillParam && rel.type === "requires"
      );
      if (matchingRelation) {
        return matchingRelation.source;
      }
    }
    return ROLES_DATA[0].id;
  }, [roleParam, skillParam]);

  const [targetRoleId, setTargetRoleId] = useState(initialRoleId);
  const [activeExplainabilityQuery, setActiveExplainabilityQuery] = useState(null);
  const [activeMissionModal, setActiveMissionModal] = useState(null);
  const [isFullBlueprintOpen, setIsFullBlueprintOpen] = useState(false);

  const [completedStepsState, setCompletedStepsState] = useState(() => {
    if (typeof window === "undefined") return {};
    try {
      const saved = localStorage.getItem("innoverse_completed_steps");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const toggleStepCompletion = (missionId, stepId) => {
    const key = `${missionId}_${stepId}`;
    setCompletedStepsState(prev => {
      const updated = {
        ...prev,
        [key]: !prev[key]
      };
      try {
        localStorage.setItem("innoverse_completed_steps", JSON.stringify(updated));
      } catch {
        // Ignore storage error
      }
      return updated;
    });
  };

  const student = useMemo(() => {
    const base = STUDENT_PROFILE;
    if (currentUser?.name) {
      return {
        ...base,
        name: currentUser.name,
        username: currentUser.username || base.username
      };
    }
    return base;
  }, [currentUser]);

  const blueprint = useMemo(() => {
    return buildRoleBlueprint(targetRoleId, student.capabilities);
  }, [targetRoleId, student]);

  const missionData = useMemo(() => {
    return generateSkillMissions(targetRoleId, student.capabilities);
  }, [targetRoleId, student]);

  const activeExplanation = useMemo(() => {
    if (!activeExplainabilityQuery) return null;
    return generateExplanation({ ...activeExplainabilityQuery, studentCapabilities: student.capabilities });
  }, [activeExplainabilityQuery, student]);

  const gapIntelligence = useMemo(() => {
    return analyzeSkillGaps(targetRoleId, student.capabilities);
  }, [targetRoleId, student]);

  const readiness = useMemo(() => {
    return calculateIndustryReadiness(targetRoleId, student.capabilities);
  }, [targetRoleId, student]);

  const skillTwin = useMemo(() => {
    return buildStudentSkillTwin(student.capabilities, targetRoleId);
  }, [targetRoleId, student]);

  const learningPath = useMemo(() => {
    return generateLearningPath(targetRoleId, student.capabilities);
  }, [targetRoleId, student]);

  const adjacentData = useMemo(() => {
    return getAdjacentRoles(targetRoleId, student.capabilities);
  }, [targetRoleId, student]);

  const [selectedTrajectorySkillId, setSelectedTrajectorySkillId] = useState(null);

  const selectRole = (newRoleId) => {
    setTargetRoleId(newRoleId);
    setSelectedTrajectorySkillId(null);
  };

  const activeTrajectorySkill = useMemo(() => {
    const targetSkillId = selectedTrajectorySkillId || readiness?.nextHighestValueSkill?.skillId || "s_genai";
    return SKILLS_DATA.find(s => s.id === targetSkillId) || SKILLS_DATA[0];
  }, [selectedTrajectorySkillId, readiness]);

  const targetRoleSkillList = useMemo(() => {
    const relations = SKILL_RELATIONS.filter(r => r.source === targetRoleId && r.type === "requires");
    const skillIds = relations.map(r => r.target);
    return SKILLS_DATA.filter(s => skillIds.includes(s.id));
  }, [targetRoleId]);

  // Smooth scroll into target section when pathname changes
  useEffect(() => {
    const currentItem = STUDENT_NAV_ITEMS.find(item => {
      if (item.href === "/student") return pathname === "/student" || pathname === "/student/";
      return pathname === item.href || pathname.startsWith(item.href + "/");
    });
    if (currentItem?.sectionId && currentItem.href !== "/student") {
      const timer = setTimeout(() => {
        const el = document.getElementById(currentItem.sectionId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  if (!isMounted || !currentUser || currentUser.role !== "student") {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-slate-100 flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-slate-700 border-t-emerald-400 rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">
            Loading Student Portal...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-24 pb-20 space-y-6">
        
        {/* ROLE APPLICATION SHELL HEADER & NAVIGATION */}
        <div className="bg-[#111827] border border-[#1E2638] rounded-2xl p-4 sm:p-6 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1E2638] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 font-bold">
                <Target size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded">
                    STUDENT APPLICATION SHELL
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Authenticated</span>
                </div>
                <h1 className="text-lg font-bold text-white mt-0.5">
                  Good morning, {student.name.split(" ")[0]}.
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-400">
                {student.name} (<strong className="text-emerald-400">Student</strong>)
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

          {/* Student Specific Nav Links — Derived from pathname */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono no-scrollbar relative z-10">
            {STUDENT_NAV_ITEMS.map((navItem) => {
              const isActive = navItem.href === "/student" 
                ? (pathname === "/student" || pathname === "/student/") 
                : (pathname === navItem.href || pathname.startsWith(navItem.href + "/"));
              return (
                <Link
                  key={navItem.id}
                  href={navItem.href}
                  className={`px-3.5 py-2 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                    isActive
                      ? "bg-emerald-500 text-slate-950 shadow-md"
                      : "bg-[#161E2E] text-slate-400 hover:text-white border border-[#1E2638]"
                  }`}
                >
                  {navItem.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* SECTION — OVERVIEW */}
        <div className="mb-10 border-b border-slate-800/80 pb-8" id="student-section-overview">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 rounded-md text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                STUDENT INTELLIGENCE PORTAL
              </span>
              <span className="px-3 py-1 rounded-md text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800">
                DETERMINISTIC STUDENT INTELLIGENCE
              </span>
            </div>

            <div className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
              Student ID: <strong className="text-emerald-400">{student.username}</strong>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-3">
            STUDENT INTELLIGENCE
          </h1>
          <p className="text-slate-400 text-base md:text-lg max-w-3xl leading-relaxed">
            Understand your capability. Build what comes next. Connect current skills, capability gaps, missions, learning paths, and proof of evidence for <strong className="text-white">{student.name}</strong>.
          </p>
        </div>

        {/* SECTION — SKILL TWIN & READINESS */}
        <section className="mb-10">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800 mb-6">
              <div>
                <span className="text-xs font-mono text-slate-500 uppercase tracking-wider block mb-1">
                  STUDENT PROFILE &amp; TWIN CONTEXT
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {student.name}
                </h2>
                <p className="text-slate-400 text-xs mt-1">
                  Mapped across {Object.keys(student.capabilities).length} verified capability dimensions
                </p>
              </div>

              <div className="w-full md:w-80">
                <label htmlFor="student-target-role" className="block text-[11px] uppercase font-mono text-emerald-400 mb-1.5">
                  TARGET CAREER ROLE CONTEXT
                </label>
                <select 
                  id="student-target-role"
                  value={targetRoleId}
                  onChange={(e) => selectRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 font-semibold focus:outline-none focus:border-emerald-500/70 cursor-pointer"
                >
                  {ROLES_DATA.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-5 bg-slate-950/80 border border-slate-800/80 rounded-xl p-6 text-center flex flex-col justify-center">
                <div className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-widest mb-2">
                  INDUSTRY READINESS SCORE
                </div>
                <div className="text-5xl sm:text-6xl font-extrabold font-mono text-white mb-2">
                  {readiness.overallScore} <span className="text-2xl text-slate-500 font-normal">/ 100</span>
                </div>
                <div className="inline-block mx-auto px-3.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mb-3">
                  {readiness.readinessLevel}
                </div>
                <p className="text-slate-400 text-xs max-w-sm mx-auto leading-relaxed">
                  {readiness.explanation}
                </p>
              </div>

              <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl">
                  <div className="text-[10px] uppercase font-mono text-slate-500 mb-1">Capability Coverage</div>
                  <div className="text-xl font-mono font-bold text-slate-100">{readiness.capabilityCoverage}%</div>
                  <div className="text-[10px] text-slate-500 mt-1">Core skill match</div>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl">
                  <div className="text-[10px] uppercase font-mono text-slate-500 mb-1">Transferability</div>
                  <div className="text-xl font-mono font-bold text-blue-400">{readiness.transferabilityScore}%</div>
                  <div className="text-[10px] text-slate-500 mt-1">Cross-role mobility</div>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl">
                  <div className="text-[10px] uppercase font-mono text-slate-500 mb-1">Skill Coverage</div>
                  <div className="text-xl font-mono font-bold text-violet-400">
                    {blueprint.studentFit.matchedSkills.length} / {blueprint.skillRequirements.length}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">Requirements met</div>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl">
                  <div className="text-[10px] uppercase font-mono text-slate-500 mb-1">Gap Penalty</div>
                  <div className="text-xl font-mono font-bold text-rose-400">-{readiness.gapPenalty} pts</div>
                  <div className="text-[10px] text-slate-500 mt-1">Unmet prerequisites</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION — MISSIONS */}
        {readiness.nextHighestValueSkill && (
          <section className="mb-10" id="student-section-missions">
            <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-emerald-950/20 via-slate-900 to-slate-900">
              <div className="flex items-center justify-between gap-4 mb-4">
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                  <Flame size={16} /> YOUR NEXT BEST MOVE
                </span>
                <span className="text-xs font-mono text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
                  Highest Impact Priority
                </span>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
                    Build <span className="text-emerald-400">{readiness.nextHighestValueSkill.skillName}</span> Competency
                  </h3>
                  <p className="text-slate-300 text-sm max-w-2xl leading-relaxed mb-4">
                    {readiness.nextHighestValueSkill.learningPriorityReason}
                  </p>
                  
                  <div className="flex flex-wrap gap-4 text-xs font-mono text-slate-400">
                    <span>Current Gap: <strong className="text-rose-400">-{readiness.nextHighestValueSkill.gap} pts</strong></span>
                    <span>Estimated Effort: <strong className="text-violet-300">{readiness.nextHighestValueSkill.estimatedEffort}</strong></span>
                    <span>Future Market Demand: <strong className="text-emerald-400">{readiness.nextHighestValueSkill.futureDemand}%</strong></span>
                  </div>
                </div>

                <div className="shrink-0 flex flex-col sm:flex-row gap-3">
                  <button 
                    onClick={() => {
                      const m = missionData.missions.find(m => m.targetSkill === readiness.nextHighestValueSkill.skillId);
                      if (m) setActiveMissionModal(m);
                    }}
                    className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-5 py-3 rounded-lg transition-colors shadow-lg cursor-pointer"
                  >
                    <Rocket size={16} /> START MISSION
                  </button>
                  <Link 
                    href={`/explore/${readiness.nextHighestValueSkill.skillId}`}
                    className="inline-flex items-center justify-center gap-2 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold text-xs px-4 py-3 rounded-lg transition-colors"
                  >
                    INSPECT SKILL NODE
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* SECTION — DEMAND SIGNALS */}
        <section className="mb-10" id="student-section-demand-signals">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="text-cyan-400" size={18} /> Demand Trajectory &amp; Historical Signal Graph
            </h3>
            <p className="text-slate-400 text-xs">Deterministic demand shifts mapped across historical trends and future projected targets.</p>
          </div>

          <div className="space-y-4">
            <div className="bg-[#0B0F17] border border-[#1E2638] rounded-xl p-3 flex items-center gap-2 overflow-x-auto">
              <span className="text-[10px] font-mono text-slate-500 uppercase px-2 shrink-0">SELECT COMPETENCY:</span>
              <div className="flex gap-2">
                {targetRoleSkillList.map(skill => {
                  const isSelected = activeTrajectorySkill.id === skill.id;
                  return (
                    <button
                      key={skill.id}
                      onClick={() => setSelectedTrajectorySkillId(skill.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors shrink-0 cursor-pointer ${
                        isSelected 
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-bold' 
                          : 'bg-[#111827] text-slate-400 hover:text-white border border-[#1E2638]'
                      }`}
                    >
                      {skill.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <DemandIntelligenceCanvas 
              skill={activeTrajectorySkill} 
              studentCapability={student.capabilities[activeTrajectorySkill.id] || 54}
              targetRoleName={blueprint.roleName}
              onTriggerExplain={(skillId) => {
                const exp = generateExplanation({ type: "SKILL_READINESS", targetRole: blueprint.roleName, currentScore: student.capabilities[skillId] || 50, requiredScore: 78 });
                setActiveExplainabilityQuery(exp);
              }}
              onNavigateToMilestone={() => {
                router.push("/student/learning-roadmap");
              }}
            />
          </div>
        </section>

        {/* SECTION — MY SKILL TWIN */}
        <section className="mb-10" id="student-section-skill-twin">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="text-violet-400" size={18} /> Student Skill Twin Capability Matrix
            </h3>
            <span className="text-xs font-mono text-slate-500">Deterministic Classification</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(skillTwin?.skills || []).map((s) => {
              let statusBorder = "border-slate-800";
              let statusBadge = "bg-slate-950 text-slate-400 border-slate-800";
              let textScore = "text-slate-300";

              if (s.capability >= 80) {
                statusBorder = "border-emerald-500/30";
                statusBadge = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
                textScore = "text-emerald-400";
              } else if (s.capability >= 65) {
                statusBorder = "border-blue-500/30";
                statusBadge = "bg-blue-500/10 text-blue-400 border-blue-500/30";
                textScore = "text-blue-400";
              } else if (s.capability >= 40) {
                statusBorder = "border-amber-500/30";
                statusBadge = "bg-amber-500/10 text-amber-400 border-amber-500/30";
                textScore = "text-amber-400";
              } else {
                statusBorder = "border-rose-500/30";
                statusBadge = "bg-rose-500/10 text-rose-400 border-rose-500/30";
                textScore = "text-rose-400";
              }

              return (
                <div key={s.skillId} className={`bg-slate-900/90 border ${statusBorder} rounded-xl p-4 flex flex-col justify-between`}>
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-bold text-white">{s.skillName}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${statusBadge}`}>
                        {s.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                      <span>Capability Score</span>
                      <span className={`font-bold ${textScore}`}>{s.capability} / 100</span>
                    </div>

                    <div className="w-full bg-slate-950 rounded-full h-1.5 mb-3 border border-slate-800/80">
                      <div 
                        className={`h-full rounded-full ${textScore.replace('text-', 'bg-')}`}
                        style={{ width: `${s.capability}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/60 text-xs">
                    <span className="text-[11px] font-mono text-slate-500">Sector: {s.sector}</span>
                    <Link href={`/explore/${s.skillId}`} className="text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-1">
                      Details <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION — SKILL GAPS */}
        <section className="mb-10" id="student-section-skill-gaps">
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <AlertCircle className="text-rose-400" size={18} /> Capability Gap Analysis
              </h3>
              <p className="text-slate-400 text-xs">Target Role: <strong className="text-white">{blueprint.roleName}</strong></p>
            </div>
            <span className="text-xs font-mono text-slate-500">
              {gapIntelligence?.summary?.highPriorityGaps ?? gapIntelligence?.categories?.highImpactGaps?.length ?? 0} High Priority Gaps
            </span>
          </div>

          <div className="space-y-3">
            {(gapIntelligence?.gaps || []).map((gap) => {
              const currentCap = gap.currentCapability ?? gap.capability ?? 0;
              const priorityText = gap.priorityCategory || gap.priority || "MEDIUM PRIORITY";
              return (
                <div key={gap.skillId} className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-base font-bold text-white">{gap.skillName}</span>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                        priorityText.includes('CRITICAL') ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                        priorityText.includes('HIGH') ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                        'bg-blue-500/10 text-blue-400 border-blue-500/30'
                      }`}>
                        {priorityText}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed max-w-3xl">
                      {gap.explanation}
                    </p>
                  </div>

                  <div className="flex items-center gap-6 shrink-0 border-t md:border-t-0 border-slate-800 pt-3 md:pt-0">
                    <div className="text-center font-mono">
                      <div className="text-[10px] text-slate-500 uppercase">CURRENT → REQUIRED</div>
                      <div className="text-sm font-bold text-slate-200">
                        {currentCap} <span className="text-slate-500">→</span> {gap.requiredCapability}
                      </div>
                    </div>

                    <div className="text-center font-mono">
                      <div className="text-[10px] text-slate-500 uppercase">GAP DELTA</div>
                      <div className="text-sm font-bold text-rose-400">-{gap.gap} pts</div>
                    </div>

                    <button 
                      onClick={() => {
                        const m = missionData.missions.find(m => m.targetSkill === gap.skillId);
                        if (m) setActiveMissionModal(m);
                      }}
                      className="bg-violet-600/10 hover:bg-violet-600/20 text-violet-300 border border-violet-500/30 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors shrink-0 cursor-pointer"
                    >
                      RESOLVE GAP
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION — CAREER PATHS */}
        <section className="mb-10" id="student-section-career-paths">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <span className="text-xs font-mono text-slate-500 uppercase tracking-widest block mb-1">
                  ROLE REQUIREMENT BLUEPRINT
                </span>
                <h3 className="text-2xl font-bold text-white">{blueprint.roleName} Target Blueprint</h3>
              </div>
              
              <button 
                onClick={() => setIsFullBlueprintOpen(true)}
                className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors shrink-0 cursor-pointer"
              >
                <Maximize2 size={14} /> Full Blueprint Architecture
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-950 border border-emerald-500/20 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck size={14} /> FOUNDATION
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">{(blueprint?.foundationalSkills || []).length} Skills</span>
                </div>
                <div className="space-y-2">
                  {(blueprint?.foundationalSkills || []).map((s) => (
                    <div key={s.skillId} className="bg-slate-900 p-2.5 rounded border border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">{s.skillName}</span>
                      <span className={`font-mono font-bold ${s.currentCapability >= 65 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {s.currentCapability} / 100
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-950 border border-blue-500/20 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Zap size={14} /> CORE
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">{(blueprint?.coreSkills || []).length} Skills</span>
                </div>
                <div className="space-y-2">
                  {(blueprint?.coreSkills || []).map((s) => (
                    <div key={s.skillId} className="bg-slate-900 p-2.5 rounded border border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">{s.skillName}</span>
                      <span className={`font-mono font-bold ${s.currentCapability >= 65 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {s.currentCapability} / 100
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-950 border border-violet-500/20 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-violet-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Award size={14} /> ADVANCED
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">{(blueprint?.advancedSkills || []).length} Skills</span>
                </div>
                <div className="space-y-2">
                  {(blueprint?.advancedSkills || []).map((s) => (
                    <div key={s.skillId} className="bg-slate-900 p-2.5 rounded border border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">{s.skillName}</span>
                      <span className={`font-mono font-bold ${s.currentCapability >= 65 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {s.currentCapability} / 100
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800/80 pt-6">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <GitBranch className="text-violet-400" size={16} /> Career Adjacency &amp; Role Mobility Options
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(adjacentData?.topAdjacentRoles || []).slice(0, 3).map((adj) => (
                  <div key={adj.roleId} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-white text-sm">{adj.roleName}</span>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                          {adj.adjacencyScore ?? adj.transferabilityScore}% Fit
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs mb-3">Transition Effort: {adj.estimatedTransitionEffort || adj.estimatedEffort}</p>
                    </div>

                    <button 
                      onClick={() => selectRole(adj.roleId)}
                      className="text-xs text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-1 text-left cursor-pointer"
                    >
                      Switch Target Role <ChevronRight size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION — LEARNING ROADMAP */}
        <section className="mb-10" id="student-section-learning-roadmap">
          <MilestoneJourneyRoadmap 
            learningPath={learningPath}
            student={student}
            onStartMission={(skillId) => {
              const m = missionData.missions.find(m => m.targetSkill === skillId) || missionData.missions[0];
              if (m) setActiveMissionModal(m);
            }}
          />
        </section>

        {/* SECTION — PROFILE & EVIDENCE LAYER */}
        <section className="mb-10" id="student-section-profile">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <span className="text-xs font-mono text-slate-500 uppercase tracking-widest block mb-1">
                  VERIFICATION &amp; EVIDENCE LAYER
                </span>
                <h3 className="text-2xl font-bold text-white">Proof of Capability &amp; Progress Journey</h3>
              </div>
              
              <span className="text-xs font-mono text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-lg shrink-0">
                SELF-REPORTED / PROTOTYPE EVIDENCE
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="text-xs font-bold text-slate-300 uppercase mb-1">Python Data Analytics Pipeline</div>
                <div className="text-[11px] font-mono text-emerald-400 mb-2">Self-Reported Evidence</div>
                <p className="text-slate-400 text-xs mb-3">Implemented pandas ETL script and scikit-learn model evaluation notebook.</p>
                <Link href="/challenges" className="text-xs text-emerald-400 hover:underline font-semibold flex items-center gap-1">
                  View Challenge Submissions <ChevronRight size={14} />
                </Link>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="text-xs font-bold text-slate-300 uppercase mb-1">SQL Query &amp; Schema Optimization</div>
                <div className="text-[11px] font-mono text-emerald-400 mb-2">Self-Reported Evidence</div>
                <p className="text-slate-400 text-xs mb-3">Optimized relational indexes and wrote complex window query functions.</p>
                <Link href="/challenges" className="text-xs text-emerald-400 hover:underline font-semibold flex items-center gap-1">
                  View Challenge Submissions <ChevronRight size={14} />
                </Link>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="text-xs font-bold text-slate-300 uppercase mb-1">React Frontend State Architecture</div>
                <div className="text-[11px] font-mono text-blue-400 mb-2">In Progress</div>
                <p className="text-slate-400 text-xs mb-3">Building full component hierarchy with context state management.</p>
                <Link href="/challenges" className="text-xs text-violet-400 hover:underline font-semibold flex items-center gap-1">
                  Complete Verification Challenge <ChevronRight size={14} />
                </Link>
              </div>
            </div>

            <div className="border-t border-slate-800/80 pt-6">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">
                Capability Progress Flow
              </h4>

              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-center">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex-1">
                  <div className="text-[10px] uppercase font-mono text-slate-500">STAGE 1</div>
                  <div className="text-xs font-bold text-slate-200 mt-1">Current Capability</div>
                  <div className="text-[11px] font-mono text-emerald-400 mt-0.5">Verified Profile</div>
                </div>

                <ArrowRight className="hidden md:block text-slate-600 shrink-0" size={16} />

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex-1">
                  <div className="text-[10px] uppercase font-mono text-slate-500">STAGE 2</div>
                  <div className="text-xs font-bold text-slate-200 mt-1">Active Mission</div>
                  <div className="text-[11px] font-mono text-violet-400 mt-0.5">Execution Steps</div>
                </div>

                <ArrowRight className="hidden md:block text-slate-600 shrink-0" size={16} />

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex-1">
                  <div className="text-[10px] uppercase font-mono text-slate-500">STAGE 3</div>
                  <div className="text-xs font-bold text-slate-200 mt-1">Proof Evidence</div>
                  <div className="text-[11px] font-mono text-amber-400 mt-0.5">Challenge Submission</div>
                </div>

                <ArrowRight className="hidden md:block text-slate-600 shrink-0" size={16} />

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex-1">
                  <div className="text-[10px] uppercase font-mono text-slate-500">STAGE 4</div>
                  <div className="text-xs font-bold text-slate-200 mt-1">Target Readiness</div>
                  <div className="text-[11px] font-mono text-blue-400 mt-0.5">{blueprint.roleName}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* FULL BLUEPRINT DRAWER MODAL */}
      {isFullBlueprintOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 max-w-4xl w-full rounded-2xl p-6 sm:p-8 text-slate-100 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6 sticky top-0 bg-slate-900 z-10 pt-2">
              <div>
                <span className="text-xs uppercase font-mono text-emerald-400 tracking-widest block mb-1">Full Role Blueprint Architecture</span>
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <FileText className="text-emerald-400" size={24} /> {blueprint.roleName} Blueprint
                </h3>
              </div>
              <button onClick={() => setIsFullBlueprintOpen(false)} className="p-1 rounded-full text-slate-400 hover:text-white cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <div className="mb-6">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Skill Requirements Matrix</h4>
              <div className="space-y-2">
                {blueprint.skillRequirements.map((req) => (
                  <div key={req.skillId} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${req.category === 'FOUNDATION' ? 'bg-emerald-500/10 text-emerald-400' : (req.category === 'CORE' ? 'bg-blue-500/10 text-blue-400' : 'bg-violet-500/10 text-violet-400')}`}>
                          {req.category}
                        </span>
                        <span className="font-bold text-white">{req.skillName}</span>
                      </div>
                      <p className="text-slate-400 text-[11px]">{req.reason}</p>
                    </div>

                    <div className="text-right font-mono shrink-0">
                      <span className="text-slate-400">Current / Target: </span>
                      <strong className="text-slate-100">{req.currentCapability} / {req.requiredCapability} pts</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button 
                onClick={() => setIsFullBlueprintOpen(false)}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-white font-semibold px-4 py-2.5 rounded-lg cursor-pointer"
              >
                Close Blueprint
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MISSION DETAIL MODAL */}
      {activeMissionModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 max-w-xl w-full rounded-2xl p-6 text-slate-100 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
                <Rocket size={16} /> Skill Mission Execution Steps
              </div>
              <button onClick={() => setActiveMissionModal(null)} className="p-1 text-slate-400 hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-xl font-bold text-white">{activeMissionModal.title}</h3>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded border border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                  {activeMissionModal.state}
                </span>
              </div>
              <p className="text-xs text-slate-400">{activeMissionModal.reason}</p>
            </div>

            <div className="mb-6 space-y-2">
              {activeMissionModal.steps.map((step) => {
                const isChecked = completedStepsState[`${activeMissionModal.missionId}_${step.stepId}`] || false;
                return (
                  <div 
                    key={step.stepId}
                    onClick={() => toggleStepCompletion(activeMissionModal.missionId, step.stepId)}
                    className={`p-3 rounded-xl border transition-colors cursor-pointer flex items-start gap-3 ${
                      isChecked ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className={`mt-0.5 shrink-0 ${isChecked ? 'text-emerald-400' : 'text-slate-600'}`}>
                      <CheckCircle2 size={16} />
                    </div>
                    <div>
                      <h5 className={`text-xs font-bold ${isChecked ? 'text-emerald-300 line-through' : 'text-white'}`}>
                        {step.title}
                      </h5>
                      <p className="text-[11px] text-slate-400">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
              <button 
                onClick={() => setActiveMissionModal(null)}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-white font-semibold px-4 py-2 rounded-lg cursor-pointer"
              >
                Close
              </button>
              <Link 
                href={`/explore/${activeMissionModal.targetSkill}`}
                className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2 rounded-lg"
              >
                Inspect Skill Node
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* EXPLAINABILITY MODAL */}
      {activeExplanation && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 max-w-xl w-full rounded-2xl p-6 text-slate-100 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest block mb-1">
                  Source: {activeExplanation.traceableSource}
                </span>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Info className="text-emerald-400" size={18} /> {activeExplanation.subject}
                </h3>
              </div>
              <button onClick={() => setActiveExplainabilityQuery(null)} className="p-1 text-slate-400 hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-6">
              <span className="text-[10px] font-mono text-emerald-400 uppercase block mb-1">System Reasoning</span>
              <p className="text-xs text-slate-300 leading-relaxed">{activeExplanation.conciseWhy}</p>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button onClick={() => setActiveExplainabilityQuery(null)} className="text-xs bg-slate-800 hover:bg-slate-700 text-white font-semibold px-4 py-2 rounded-lg cursor-pointer">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
