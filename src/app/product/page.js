"use client";

import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { 
  Rocket, Activity, Target, ArrowUp, ArrowDown, ChevronRight, AlertCircle, 
  Lightbulb, TrendingUp, Compass, Layers, Shield, Cpu, RefreshCw, GitBranch, 
  CheckCircle2, BookOpen, Award, Info, FileCode2, ArrowRight, SlidersHorizontal,
  Zap, AlertTriangle, Layers2, ArrowUpRight, BarChart3, Filter, Box, Crosshair,
  Package, LayoutGrid, CheckSquare, Sparkles, FolderKanban, Briefcase
} from "lucide-react";
import { ROLES_DATA, SKILL_RELATIONS } from "@/data/skillGraph";
import { SKILLS_DATA } from "@/data/skillModel";
import { TRAINING_PROGRAMS } from "@/data/trainingPrograms";
import { INDUSTRY_CHALLENGES } from "@/data/industryChallengesData";

// ==================================================
// SUB-COMPONENT: OPPORTUNITY RADAR CANVAS (SECTION B)
// ==================================================
function QuadrantCardList({ title, subtitle, dotClass, titleColor, opportunities, selectedOpp, onSelectOpp }) {
  return (
    <div className="bg-[#0E1422] border border-slate-800/80 rounded-lg p-3.5 flex flex-col justify-between space-y-3 min-h-[220px]">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${dotClass}`}></span>
          <span className={`text-xs font-sans font-bold uppercase tracking-wider ${titleColor}`}>
            {title}
          </span>
        </div>
        <span className="text-[10px] font-sans text-slate-500">{subtitle}</span>
      </div>

      <div className="space-y-2 flex-1 flex flex-col justify-start">
        {opportunities.length === 0 ? (
          <div className="text-xs text-slate-500 italic py-4 text-center">No opportunities in zone</div>
        ) : (
          opportunities.map((opp) => {
            const isSelected = selectedOpp?.id === opp.id;
            const gap = Math.max(0, opp.demandScore - opp.readiness);

            return (
              <div
                key={opp.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelectOpp(opp)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectOpp(opp);
                  }
                }}
                className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-slate-800 border-cyan-500 ring-1 ring-cyan-500/50 shadow-md'
                    : 'bg-[#111827] border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs font-sans font-semibold text-white leading-snug">
                    {opp.title}
                  </span>
                  {isSelected && (
                    <span className="text-[9px] font-sans font-semibold text-cyan-400 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-800/80 shrink-0">
                      Selected
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-1 text-[11px] pt-1.5 border-t border-slate-800/60 text-slate-400">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-sans">Demand</span>
                    <strong className="font-mono text-slate-200">{opp.demandScore}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-sans">Readiness</span>
                    <strong className="font-mono text-cyan-400">{opp.readiness}%</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-sans">Gap</span>
                    <strong className="font-mono text-rose-400">-{gap} pts</strong>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function MobileQuadrantGroup({ title, badgeText, badgeClass, opportunities, selectedOpp, onSelectOpp }) {
  if (opportunities.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-sans font-bold text-white">{title}</span>
        <span className={`text-[10px] font-sans font-semibold px-2 py-0.5 rounded border ${badgeClass}`}>
          {badgeText}
        </span>
      </div>

      <div className="space-y-2">
        {opportunities.map((opp) => {
          const isSelected = selectedOpp?.id === opp.id;
          const gap = Math.max(0, opp.demandScore - opp.readiness);

          return (
            <div
              key={opp.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelectOpp(opp)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectOpp(opp);
                }
              }}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all space-y-2 ${
                isSelected ? 'bg-slate-800 border-cyan-500 ring-1 ring-cyan-500/50' : 'bg-[#111827] border-slate-800'
              }`}
            >
              <div className="text-sm font-semibold text-white">{opp.title}</div>
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-1">
                <span>Demand: <strong className="text-white">{opp.demandScore}</strong></span>
                <span>Readiness: <strong className="text-cyan-400">{opp.readiness}%</strong></span>
                <span>Gap: <strong className="text-rose-400">-{gap} pts</strong></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OpportunityRadarCanvas({ opportunities, selectedOpp, onSelectOpp }) {
  // Summary strip statistics computed dynamically from dataset
  const summary = useMemo(() => {
    const total = opportunities.length;
    const capabilityConstrained = opportunities.filter(
      o => (o.demandScore >= 65 && o.readiness < 65) || o.status === "CONSTRAINED"
    ).length;
    const productReady = opportunities.filter(
      o => o.demandScore >= 65 && o.readiness >= 65
    ).length;
    const priorityGaps = opportunities.filter(
      o => o.demandScore > o.readiness
    ).length;

    return { total, capabilityConstrained, productReady, priorityGaps };
  }, [opportunities]);

  const getStatusInfo = (opp) => {
    if (opp.demandScore >= 65 && opp.readiness < 65) {
      return {
        zone: "BUILD / INVEST",
        subtitle: "HIGH DEMAND / CAPABILITY CONSTRAINED",
        badge: "bg-rose-950/60 text-rose-300 border-rose-800/60",
        dotBg: "bg-rose-500",
        actionText: "Build capability before product scale."
      };
    }
    if (opp.demandScore >= 65 && opp.readiness >= 65) {
      return {
        zone: "PRODUCT READY",
        subtitle: "HIGH DEMAND / PRODUCT READY",
        badge: "bg-emerald-950/60 text-emerald-300 border-emerald-800/60",
        dotBg: "bg-emerald-500",
        actionText: "Proceed to immediate product build."
      };
    }
    if (opp.demandScore < 65 && opp.readiness < 65) {
      return {
        zone: "EXPLORE",
        subtitle: "LOW DEMAND / EXPLORE",
        badge: "bg-slate-800/80 text-slate-300 border-slate-700/60",
        dotBg: "bg-slate-400",
        actionText: "Monitor emerging signals before investing capability."
      };
    }
    return {
      zone: "OPTIMIZE",
      subtitle: "LOW DEMAND / OPTIMIZE",
      badge: "bg-amber-950/60 text-amber-300 border-amber-800/60",
      dotBg: "bg-amber-500",
      actionText: "Maintain and optimize existing capability."
    };
  };

  // Group opportunities into the 4 conceptual quadrants
  const quadrants = useMemo(() => {
    return {
      buildInvest: opportunities.filter(o => o.demandScore >= 65 && o.readiness < 65),
      productReady: opportunities.filter(o => o.demandScore >= 65 && o.readiness >= 65),
      explore: opportunities.filter(o => o.demandScore < 65 && o.readiness < 65),
      optimize: opportunities.filter(o => o.demandScore < 65 && o.readiness >= 65),
    };
  }, [opportunities]);

  const activeStatus = selectedOpp ? getStatusInfo(selectedOpp) : null;
  const activeGap = selectedOpp ? Math.max(0, selectedOpp.demandScore - selectedOpp.readiness) : 0;

  return (
    <div className="bg-[#0B0F17] border border-slate-800 rounded-2xl p-5 md:p-6 space-y-6 shadow-xl">
      {/* Top Header & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-sans font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-950/80 px-2.5 py-0.5 rounded border border-cyan-800/80">
              Strategy &amp; Product Intelligence
            </span>
            <span className="text-xs text-slate-400">2-Axis Matrix</span>
          </div>
          <h3 className="text-xl font-bold text-white">Product Opportunity Radar</h3>
          <p className="text-xs text-slate-400 mt-0.5">Evaluating Opportunity Demand vs. Capability Readiness across product concepts.</p>
        </div>

        {/* Status Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-sans">
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Build / Invest
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Product Ready
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Optimize
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span> Explore
          </span>
        </div>
      </div>

      {/* SUMMARY STRIP (PART 8) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800/80">
          <span className="text-[11px] font-sans font-medium text-slate-400 block mb-1">OPPORTUNITIES</span>
          <span className="text-2xl font-mono font-bold text-white">{summary.total}</span>
        </div>
        <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800/80">
          <span className="text-[11px] font-sans font-medium text-rose-400 block mb-1">CAPABILITY-CONSTRAINED</span>
          <span className="text-2xl font-mono font-bold text-rose-400">{summary.capabilityConstrained}</span>
        </div>
        <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800/80">
          <span className="text-[11px] font-sans font-medium text-emerald-400 block mb-1">PRODUCT-READY</span>
          <span className="text-2xl font-mono font-bold text-emerald-400">{summary.productReady}</span>
        </div>
        <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800/80">
          <span className="text-[11px] font-sans font-medium text-cyan-400 block mb-1">PRIORITY GAPS</span>
          <span className="text-2xl font-mono font-bold text-cyan-400">{summary.priorityGaps}</span>
        </div>
      </div>

      {/* DESKTOP & TABLET VIEW: 2-AXIS MATRIX + DETAIL PANEL */}
      <div className="hidden md:grid md:grid-cols-12 gap-6 items-start">
        {/* Left Side: 2-Axis Matrix (7 cols) */}
        <div className="md:col-span-7 bg-[#0E1422] border border-slate-800 rounded-xl p-4 space-y-3">
          {/* Axis Header Labels */}
          <div className="flex items-center justify-between text-xs font-sans text-slate-400 px-1 pb-1 border-b border-slate-800/60">
            <span className="flex items-center gap-1 font-medium">
              <span className="text-slate-500">Y-Axis:</span> Opportunity Demand (0 — 100)
            </span>
            <span className="flex items-center gap-1 font-medium">
              <span className="text-slate-500">X-Axis:</span> Capability Readiness (0% — 100%)
            </span>
          </div>

          {/* Matrix 2x2 Grid */}
          <div className="grid grid-cols-2 grid-rows-2 gap-3 min-h-[460px] bg-slate-950 p-3 rounded-lg border border-slate-800/80">
            {/* Top-Left Quadrant: BUILD / INVEST */}
            <QuadrantCardList
              title="BUILD / INVEST"
              subtitle="High Demand • Low Readiness"
              dotClass="bg-rose-500"
              titleColor="text-rose-400"
              opportunities={quadrants.buildInvest}
              selectedOpp={selectedOpp}
              onSelectOpp={onSelectOpp}
            />

            {/* Top-Right Quadrant: PRODUCT READY */}
            <QuadrantCardList
              title="PRODUCT READY"
              subtitle="High Demand • High Readiness"
              dotClass="bg-emerald-500"
              titleColor="text-emerald-400"
              opportunities={quadrants.productReady}
              selectedOpp={selectedOpp}
              onSelectOpp={onSelectOpp}
            />

            {/* Bottom-Left Quadrant: EXPLORE */}
            <QuadrantCardList
              title="EXPLORE"
              subtitle="Low Demand • Low Readiness"
              dotClass="bg-slate-400"
              titleColor="text-slate-400"
              opportunities={quadrants.explore}
              selectedOpp={selectedOpp}
              onSelectOpp={onSelectOpp}
            />

            {/* Bottom-Right Quadrant: OPTIMIZE */}
            <QuadrantCardList
              title="OPTIMIZE"
              subtitle="Low Demand • High Readiness"
              dotClass="bg-amber-500"
              titleColor="text-amber-400"
              opportunities={quadrants.optimize}
              selectedOpp={selectedOpp}
              onSelectOpp={onSelectOpp}
            />
          </div>
        </div>

        {/* Right Side: Selected Opportunity Detail Panel (5 cols) */}
        {selectedOpp && (
          <div className="md:col-span-5 bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-5 shadow-xl">
            {/* Header Zone */}
            <div className="border-b border-slate-800/80 pb-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-sans font-bold px-2.5 py-1 rounded border ${activeStatus.badge} flex items-center gap-1.5`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${activeStatus.dotBg}`}></span>
                  {activeStatus.subtitle}
                </span>
                <span className="text-[10px] font-mono text-slate-500">ID: {selectedOpp.id}</span>
              </div>

              <h4 className="text-xl font-bold text-white leading-snug">{selectedOpp.title}</h4>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">{selectedOpp.why}</p>
            </div>

            {/* Decision-Oriented Metrics Grid (PART 9 & 6) */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-[#161E2E] p-3 rounded-lg border border-slate-800/80">
                <span className="text-[10px] font-sans text-slate-400 uppercase block mb-1">Demand</span>
                <span className="text-lg font-mono font-bold text-white">{selectedOpp.demandScore}</span>
              </div>
              <div className="bg-[#161E2E] p-3 rounded-lg border border-slate-800/80">
                <span className="text-[10px] font-sans text-slate-400 uppercase block mb-1">Readiness</span>
                <span className="text-lg font-mono font-bold text-cyan-400">{selectedOpp.readiness}%</span>
              </div>
              <div className="bg-[#161E2E] p-3 rounded-lg border border-slate-800/80">
                <span className="text-[10px] font-sans text-slate-400 uppercase block mb-1">Capability Gap</span>
                <span className="text-lg font-mono font-bold text-rose-400">{activeGap} pts</span>
              </div>
            </div>

            {/* Primary Constraint */}
            {selectedOpp.primaryConstraint && (
              <div className="bg-[#161E2E] p-3.5 rounded-lg border border-slate-800/80 space-y-1">
                <span className="text-[10px] font-sans text-slate-400 uppercase block">PRIMARY BOTTLENECK CONSTRAINT</span>
                <span className="text-xs font-mono font-semibold text-rose-300">{selectedOpp.primaryConstraint}</span>
              </div>
            )}

            {/* Required Capability Modules */}
            <div className="space-y-2.5">
              <span className="text-xs font-sans font-semibold text-slate-200 block">Required capabilities</span>
              <div className="space-y-2">
                {(selectedOpp.modules || []).map((mod) => (
                  <div key={mod.id} className="bg-[#161E2E] p-3 rounded-lg border border-slate-800/80 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">{mod.name}</span>
                      <span className={`font-mono font-bold text-xs ${mod.coverage >= 75 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {mod.coverage}% coverage
                      </span>
                    </div>
                    {mod.subSkills && mod.subSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {mod.subSkills.map((sub) => (
                          <span key={sub.id} className="text-[11px] font-sans text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                            • {sub.name} ({sub.score}%)
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Action Directive */}
            <div className="pt-3 border-t border-slate-800 space-y-3">
              <div className="text-xs text-slate-300 font-sans">
                <span className="text-slate-400 block text-[11px] font-medium uppercase mb-0.5">Recommended action</span>
                <span className="text-white font-medium">{activeStatus.actionText}</span>
              </div>

              <button
                onClick={() => {
                  const el = document.getElementById("capability-stack");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="w-full bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 hover:border-cyan-500/50 font-sans font-semibold text-xs py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>View Capability Stack</span>
                <ArrowDown size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MOBILE STACKED LIST (< 768px) (REQUIREMENT 10) */}
      <div className="block md:hidden space-y-6 pt-4 border-t border-slate-800">
        <span className="text-xs font-sans font-semibold text-slate-400 uppercase tracking-wider block">
          Opportunity Concepts Grouped by Matrix Zone
        </span>

        {/* Group 1: BUILD / INVEST */}
        <MobileQuadrantGroup
          title="BUILD / INVEST"
          badgeText="● High Demand / Low Readiness"
          badgeClass="bg-rose-950/60 text-rose-300 border-rose-800/60"
          opportunities={quadrants.buildInvest}
          selectedOpp={selectedOpp}
          onSelectOpp={onSelectOpp}
        />

        {/* Group 2: PRODUCT READY */}
        <MobileQuadrantGroup
          title="PRODUCT READY"
          badgeText="● High Demand / High Readiness"
          badgeClass="bg-emerald-950/60 text-emerald-300 border-emerald-800/60"
          opportunities={quadrants.productReady}
          selectedOpp={selectedOpp}
          onSelectOpp={onSelectOpp}
        />

        {/* Group 3: EXPLORE */}
        <MobileQuadrantGroup
          title="EXPLORE"
          badgeText="● Low Demand / Low Readiness"
          badgeClass="bg-slate-800 text-slate-300 border-slate-700"
          opportunities={quadrants.explore}
          selectedOpp={selectedOpp}
          onSelectOpp={onSelectOpp}
        />

        {/* Group 4: OPTIMIZE */}
        <MobileQuadrantGroup
          title="OPTIMIZE"
          badgeText="● Low Demand / High Readiness"
          badgeClass="bg-amber-950/60 text-amber-300 border-amber-800/60"
          opportunities={quadrants.optimize}
          selectedOpp={selectedOpp}
          onSelectOpp={onSelectOpp}
        />

        {/* Mobile Selected Detail Panel */}
        {selectedOpp && (
          <div className="bg-[#111827] border border-cyan-500/50 rounded-xl p-5 space-y-4 shadow-xl mt-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className={`text-[10px] font-sans font-bold px-2 py-0.5 rounded border ${activeStatus.badge}`}>
                ● {activeStatus.zone}
              </span>
              <span className="text-[10px] font-mono text-slate-500">ID: {selectedOpp.id}</span>
            </div>

            <div>
              <h4 className="text-lg font-bold text-white">{selectedOpp.title}</h4>
              <p className="text-xs text-slate-300 mt-1">{selectedOpp.why}</p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-[#161E2E] p-2.5 rounded border border-slate-800">
                <span className="text-[9px] text-slate-400 block uppercase font-sans">Demand</span>
                <span className="font-mono font-bold text-white">{selectedOpp.demandScore}</span>
              </div>
              <div className="bg-[#161E2E] p-2.5 rounded border border-slate-800">
                <span className="text-[9px] text-slate-400 block uppercase font-sans">Readiness</span>
                <span className="font-mono font-bold text-cyan-400">{selectedOpp.readiness}%</span>
              </div>
              <div className="bg-[#161E2E] p-2.5 rounded border border-slate-800">
                <span className="text-[9px] text-slate-400 block uppercase font-sans">Gap</span>
                <span className="font-mono font-bold text-rose-400">{activeGap} pts</span>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <span className="text-xs font-semibold text-slate-300 block">Recommended action</span>
              <p className="text-xs text-slate-300">{activeStatus.actionText}</p>
              <button
                onClick={() => {
                  const el = document.getElementById("capability-stack");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="w-full bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-sans font-semibold text-xs py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>View Capability Stack</span>
                <ArrowDown size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================================================
// SUB-COMPONENT: PRODUCT CAPABILITY STACK (SECTION D)
// ==================================================
function ProductCapabilityStack({ activeInitiative }) {
  const [selectedNode, setSelectedNode] = useState(null);

  if (!activeInitiative) return null;

  return (
    <div className="bg-[#0B0F17] border border-[#1E2638] rounded-2xl p-6 space-y-6 shadow-2xl">
      <div className="flex items-center justify-between border-b border-[#1E2638] pb-4">
        <div>
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block mb-1">
            ARCHITECTURAL CAPABILITY TREE
          </span>
          <h3 className="text-xl font-bold text-white">Product Capability Stack</h3>
          <p className="text-xs text-slate-400 mt-0.5">Deconstructing product initiatives into required capability modules and supporting skill gates.</p>
        </div>
        <span className="text-xs font-mono text-cyan-400 bg-cyan-950 px-3 py-1 rounded border border-cyan-800">
          Initiative: {activeInitiative.title}
        </span>
      </div>

      {/* Visual Multi-Tier Tree Stack */}
      <div className="space-y-6">
        {/* Tier 1: Product Initiative Root Node */}
        <div className="bg-[#0E1422] border border-cyan-500/50 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 font-bold">
              <Box size={20} />
            </div>
            <div>
              <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-widest block">PRODUCT INITIATIVE ROOT</span>
              <h4 className="text-base font-bold text-white">{activeInitiative.title}</h4>
            </div>
          </div>

          <div className="text-right font-mono">
            <span className="text-[9px] text-slate-400 uppercase block">PRODUCT READINESS</span>
            <span className="text-lg font-bold text-cyan-400">{activeInitiative.readiness}%</span>
          </div>
        </div>

        {/* Tier 2: Core Capability Modules (Branches) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-4 border-l-2 border-cyan-800/40">
          {activeInitiative.modules.map((mod, idx) => {
            const isSelected = selectedNode?.id === mod.id;

            return (
              <div 
                key={mod.id}
                onClick={() => setSelectedNode(isSelected ? null : mod)}
                className={`p-4 rounded-xl border cursor-pointer transition-all space-y-3 ${
                  isSelected ? 'bg-cyan-950/40 border-cyan-500 shadow-lg' : 'bg-[#111827] border-[#1E2638] hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono text-slate-400 uppercase">MODULE 0{idx + 1}</span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                    mod.coverage >= 75 ? 'bg-emerald-950 text-emerald-400 border-emerald-800' : 'bg-rose-950 text-rose-400 border-rose-800'
                  }`}>
                    {mod.coverage}% Coverage
                  </span>
                </div>

                <h5 className="font-bold text-white text-sm">{mod.name}</h5>

                <div className="space-y-1.5 pt-2 border-t border-[#1E2638]">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">SUPPORTING SKILL GATES:</span>
                  {mod.subSkills.map(sub => (
                    <div key={sub.id} className="bg-[#161E2E] px-2.5 py-1 rounded border border-[#1E2638] flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-300">{sub.name}</span>
                      <span className={sub.score >= 70 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {sub.score}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedNode && (
        <div className="p-4 bg-[#111827] border border-cyan-500/40 rounded-xl space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between">
            <span className="text-cyan-400 font-bold">MODULE DETAIL: {selectedNode.name}</span>
            <button onClick={() => setSelectedNode(null)} className="text-slate-400 hover:text-white cursor-pointer">Close ✕</button>
          </div>
          <p className="text-slate-300 font-sans">
            Required for product architecture validation. Current coverage is <strong className="text-cyan-400">{selectedNode.coverage}%</strong> vs target standard <strong className="text-white">80%</strong>.
          </p>
        </div>
      )}
    </div>
  );
}

// ==================================================
// MAIN PAGE COMPONENT: PRODUCT INTELLIGENCE
// ==================================================
export default function ProductIntelligencePage() {
  const [selectedDomain, setSelectedDomain] = useState("Data & AI Platform Systems");
  const [selectedHorizon, setSelectedHorizon] = useState("Q1 — Q4 2026 Product Cycle");
  const [selectedOpportunityId, setSelectedOpportunityId] = useState("opp_data_auto");

  // 1. DETERMINISTIC PRODUCT OPPORTUNITIES DATA
  const opportunities = useMemo(() => {
    return [
      {
        id: "opp_data_auto",
        title: "Applied Data Automation Platform",
        why: "Enterprise demand for automated ETL pipelines and real-time streaming data ingestion.",
        demandScore: 88,
        demandDelta: 24,
        readiness: 72,
        primaryConstraint: "Cloud Architecture Gap (-18 pts)",
        status: "READY",
        modules: [
          {
            id: "mod_data_eng",
            name: "Data Pipeline Engineering",
            coverage: 82,
            subSkills: [
              { id: "sk_pipeline", name: "ETL Orchestration", score: 85 },
              { id: "sk_sql", name: "Data Modeling", score: 80 }
            ]
          },
          {
            id: "mod_cloud_arch",
            name: "Cloud Infrastructure",
            coverage: 64,
            subSkills: [
              { id: "sk_docker", name: "Container Deployment", score: 68 },
              { id: "sk_infra", name: "Distributed Systems", score: 60 }
            ]
          },
          {
            id: "mod_analytics",
            name: "Analytics & Monitoring",
            coverage: 76,
            subSkills: [
              { id: "sk_metrics", name: "Telemetry & Logs", score: 78 }
            ]
          }
        ]
      },
      {
        id: "opp_dist_event",
        title: "Distributed Event Processing Engine",
        why: "High-throughput event streaming architecture for enterprise cloud microservices.",
        demandScore: 82,
        demandDelta: 18,
        readiness: 64,
        primaryConstraint: "Distributed Systems Deficit (-22 pts)",
        status: "CONSTRAINED",
        modules: [
          {
            id: "mod_dist_sys",
            name: "Distributed Consensus & Messaging",
            coverage: 58,
            subSkills: [
              { id: "sk_kafka", name: "Event Bus Design", score: 55 },
              { id: "sk_grpc", name: "RPC Communication", score: 60 }
            ]
          },
          {
            id: "mod_k8s",
            name: "Kubernetes Orchestration",
            coverage: 70,
            subSkills: [
              { id: "sk_k8s_deploy", name: "Cluster Scaling", score: 70 }
            ]
          }
        ]
      },
      {
        id: "opp_mlops",
        title: "Autonomous MLOps Orchestrator",
        why: "Model deployment pipeline automation and feature store management.",
        demandScore: 92,
        demandDelta: 31,
        readiness: 58,
        primaryConstraint: "Model Deployment & Monitoring (-26 pts)",
        status: "CONSTRAINED",
        modules: [
          {
            id: "mod_ml_pipe",
            name: "Model Training & Serving",
            coverage: 54,
            subSkills: [
              { id: "sk_serve", name: "API Endpoint Serving", score: 50 },
              { id: "sk_store", name: "Feature Store Architecture", score: 58 }
            ]
          }
        ]
      },
      {
        id: "opp_sec_engine",
        title: "Zero-Trust Security Gateway",
        why: "Policy enforcement, identity federation, and automated vulnerability scanning.",
        demandScore: 78,
        demandDelta: 14,
        readiness: 84,
        primaryConstraint: "IAM Policy Enforcement (-8 pts)",
        status: "READY",
        modules: [
          {
            id: "mod_sec_auth",
            name: "Identity & Access Control",
            coverage: 86,
            subSkills: [
              { id: "sk_auth", name: "OAuth2 / OIDC", score: 88 }
            ]
          }
        ]
      },
      {
        id: "opp_edge_compute",
        title: "Edge Stream Analytics Gateway",
        why: "Real-time micro-analytics on edge IoT devices and low-latency nodes.",
        demandScore: 46,
        demandDelta: 12,
        readiness: 38,
        primaryConstraint: "Embedded Hardware & Security (-28 pts)",
        status: "EXPLORE",
        modules: [
          {
            id: "mod_edge",
            name: "Edge Runtime Architecture",
            coverage: 38,
            subSkills: [
              { id: "sk_rust", name: "Embedded Rust / C++", score: 35 }
            ]
          }
        ]
      },
      {
        id: "opp_legacy_db",
        title: "Legacy Schema Migration Utility",
        why: "Automated relational database schema transformation and sync tooling.",
        demandScore: 42,
        demandDelta: 6,
        readiness: 78,
        primaryConstraint: "Market Demand Stagnant (-4 pts)",
        status: "OPTIMIZE",
        modules: [
          {
            id: "mod_legacy",
            name: "Schema Parsing & AST Translation",
            coverage: 78,
            subSkills: [
              { id: "sk_sql_parse", name: "SQL Parsing", score: 80 }
            ]
          }
        ]
      }
    ];
  }, []);

  const activeOpportunity = opportunities.find(o => o.id === selectedOpportunityId) || opportunities[0];

  // 2. PRODUCT READINESS SUMMARY METRICS
  const productReadinessSummary = useMemo(() => {
    return {
      capabilityCoverage: activeOpportunity.readiness,
      roleAvailability: 71,
      evidenceReadiness: 64,
      overallReadiness: Math.round((activeOpportunity.readiness * 0.5) + (71 * 0.3) + (64 * 0.2)),
      status: activeOpportunity.status
    };
  }, [activeOpportunity]);

  return (
    <div className="min-h-screen bg-[#0A0E17] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 space-y-12">

        {/* ================================================== */}
        {/* SECTION A — PRODUCT INTELLIGENCE HEADER           */}
        {/* ================================================== */}
        <section className="border-b border-[#1E2638] pb-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 bg-cyan-950 px-2.5 py-1 rounded border border-cyan-800 uppercase">
                  DETERMINISTIC OPPORTUNITY MODEL
                </span>
                <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                  <Box size={12} className="text-slate-400" /> Product Architecture Lens
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                PRODUCT <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">INTELLIGENCE</span>
              </h1>
              <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-3xl leading-relaxed">
                Translate capability signals into product opportunities. Discover emerging market needs, map architectural capability stacks, evaluate product readiness, and navigate the capability-driven product delivery roadmap.
              </p>
            </div>

            {/* Context Controls */}
            <div className="bg-[#111827] border border-[#1E2638] p-4 rounded-xl shrink-0 space-y-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                PRODUCT CONTEXT SELECTOR
              </span>
              <div className="flex flex-col gap-2">
                <select 
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="bg-[#161E2E] border border-[#1E2638] text-xs font-mono text-white px-3 py-1.5 rounded focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value="Data & AI Platform Systems">Domain: [ Data &amp; AI Platforms ▼ ]</option>
                  <option value="Cloud Native Infrastructure">Domain: [ Cloud Infrastructure ▼ ]</option>
                  <option value="Enterprise Security Systems">Domain: [ Enterprise Security ▼ ]</option>
                </select>

                <select 
                  value={selectedHorizon}
                  onChange={(e) => setSelectedHorizon(e.target.value)}
                  className="bg-[#161E2E] border border-[#1E2638] text-xs font-mono text-white px-3 py-1.5 rounded focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value="Q1 — Q4 2026 Product Cycle">Horizon: [ Q1 — Q4 2026 ▼ ]</option>
                  <option value="2027 Long-term Roadmap">Horizon: [ 2027 Long-term ▼ ]</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-mono border-t border-[#1E2638] pt-3 text-slate-400">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              PRODUCT OPPORTUNITY SIGNAL: Derived from platform capability matrix
            </span>
            <span className="text-slate-500">SCOPE: PRODUCT ARCHITECTURE &amp; DELIVERY</span>
          </div>
        </section>

        {/* ================================================== */}
        {/* SECTION B — OPPORTUNITY RADAR (PRIMARY VISUAL)    */}
        {/* ================================================== */}
        <section className="space-y-3" id="opportunity-radar">
          <OpportunityRadarCanvas 
            opportunities={opportunities}
            selectedOpp={activeOpportunity}
            onSelectOpp={(opp) => setSelectedOpportunityId(opp.id)}
          />
        </section>

        {/* ================================================== */}
        {/* SECTION C — PRODUCT OPPORTUNITY CARDS             */}
        {/* ================================================== */}
        <section className="space-y-4" id="product-opportunities">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Package className="text-cyan-400" size={18} /> Product Opportunity Concepts
              </h2>
              <p className="text-xs text-slate-400">Modeled product initiatives matched to emerging market capability opportunities.</p>
            </div>
            <span className="text-xs font-mono text-slate-400">{opportunities.length} Concepts Identified</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {opportunities.map((opp) => {
              const isSelected = activeOpportunity.id === opp.id;

              return (
                <div 
                  key={opp.id}
                  onClick={() => setSelectedOpportunityId(opp.id)}
                  className={`bg-[#0B0F17] border rounded-2xl p-6 cursor-pointer transition-all space-y-4 flex flex-col justify-between ${
                    isSelected ? 'border-cyan-500 bg-[#0E1422] shadow-2xl' : 'border-[#1E2638] hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-emerald-400 font-bold">Demand Signal: ▲ +{opp.demandDelta}%</span>
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        opp.demandScore >= 65 && opp.readiness >= 65 ? 'bg-emerald-950 text-emerald-400 border-emerald-800' :
                        opp.demandScore >= 65 && opp.readiness < 65 ? 'bg-rose-950 text-rose-400 border-rose-800' :
                        opp.demandScore < 65 && opp.readiness >= 65 ? 'bg-amber-950 text-amber-400 border-amber-800' :
                        'bg-slate-900 text-slate-400 border-slate-700'
                      }`}>
                        {opp.demandScore >= 65 && opp.readiness >= 65 ? 'PRODUCT READY' :
                         opp.demandScore >= 65 && opp.readiness < 65 ? 'BUILD / INVEST' :
                         opp.demandScore < 65 && opp.readiness >= 65 ? 'OPTIMIZE' : 'EXPLORE'}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white">{opp.title}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">{opp.why}</p>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-[#1E2638]">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">Readiness Score:</span>
                      <span className="text-cyan-400 font-bold">{opp.readiness}%</span>
                    </div>
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">Primary Constraint:</span>
                      <span className="text-rose-400 font-bold">{opp.primaryConstraint}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ================================================== */}
        {/* SECTION D — PRODUCT CAPABILITY STACK             */}
        {/* ================================================== */}
        <section className="space-y-4" id="capability-stack">
          <ProductCapabilityStack 
            activeInitiative={activeOpportunity}
            studentCapabilities={{}}
          />
        </section>

        {/* ================================================== */}
        {/* SECTION E — PRODUCT READINESS                     */}
        {/* ================================================== */}
        <section className="space-y-4" id="product-readiness">
          <div>
            <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <CheckSquare className="text-emerald-400" size={18} /> Product Readiness Assessment
            </h2>
            <p className="text-xs text-slate-400">Multi-dimensional capability coverage and readiness evaluation for {activeOpportunity.title}.</p>
          </div>

          <div className="bg-[#0B0F17] border border-[#1E2638] rounded-2xl p-6 space-y-6 shadow-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#111827] p-4 rounded-xl border border-[#1E2638] space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">CAPABILITY COVERAGE</span>
                <div className="text-2xl font-mono font-bold text-cyan-400">{productReadinessSummary.capabilityCoverage}%</div>
                <span className="text-[9px] font-mono text-slate-500 block">Core Module Alignment</span>
              </div>

              <div className="bg-[#111827] p-4 rounded-xl border border-[#1E2638] space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">ROLE AVAILABILITY</span>
                <div className="text-2xl font-mono font-bold text-white">{productReadinessSummary.roleAvailability}%</div>
                <span className="text-[9px] font-mono text-slate-500 block">Engineering Talent Fit</span>
              </div>

              <div className="bg-[#111827] p-4 rounded-xl border border-[#1E2638] space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">EVIDENCE READINESS</span>
                <div className="text-2xl font-mono font-bold text-amber-400">{productReadinessSummary.evidenceReadiness}%</div>
                <span className="text-[9px] font-mono text-slate-500 block">Verified Practical Projects</span>
              </div>

              <div className="bg-[#111827] p-4 rounded-xl border border-[#1E2638] space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">OVERALL MODELED READINESS</span>
                <div className="text-2xl font-mono font-bold text-emerald-400">{productReadinessSummary.overallReadiness}%</div>
                <span className="text-[9px] font-mono text-emerald-400 block font-bold">STATUS: {productReadinessSummary.status}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================== */}
        {/* SECTION F — PRODUCT ROADMAP                       */}
        {/* ================================================== */}
        <section className="space-y-4" id="product-roadmap">
          <div>
            <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FolderKanban className="text-cyan-400" size={18} /> Product Capability Delivery Roadmap
            </h2>
            <p className="text-xs text-slate-400">5-Stage Product Stage-Gate connected to required capability validations.</p>
          </div>

          <div className="bg-[#0B0F17] border border-[#1E2638] rounded-2xl p-6 space-y-6 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div className="bg-[#111827] p-4 rounded-xl border border-emerald-500/40 text-center space-y-1">
                <span className="text-[9px] font-mono text-emerald-400 uppercase block font-bold">01 DISCOVERY</span>
                <div className="text-sm font-bold text-white">Market Need</div>
                <span className="text-[9px] font-mono text-emerald-400 block">PASSED</span>
              </div>

              <div className="bg-[#111827] p-4 rounded-xl border border-emerald-500/40 text-center space-y-1">
                <span className="text-[9px] font-mono text-emerald-400 uppercase block font-bold">02 VALIDATION</span>
                <div className="text-sm font-bold text-white">Capability Architecture</div>
                <span className="text-[9px] font-mono text-emerald-400 block">PASSED</span>
              </div>

              <div className="bg-[#161E2E] p-4 rounded-xl border border-cyan-500/60 text-center space-y-1 relative">
                <span className="text-[9px] font-mono text-cyan-400 uppercase block font-bold">03 PROTOTYPE</span>
                <div className="text-sm font-bold text-white">Proof of Concept</div>
                <span className="text-[9px] font-mono text-cyan-400 block font-bold">CURRENT STAGE</span>
              </div>

              <div className="bg-[#111827] p-4 rounded-xl border border-rose-500/40 text-center space-y-1">
                <span className="text-[9px] font-mono text-rose-400 uppercase block font-bold">04 PILOT</span>
                <div className="text-sm font-bold text-white">Customer Pilot</div>
                <span className="text-[9px] font-mono text-rose-400 block font-bold">BLOCKED BY GAP</span>
              </div>

              <div className="bg-[#111827] p-4 rounded-xl border border-[#1E2638] text-center space-y-1">
                <span className="text-[9px] font-mono text-slate-500 uppercase block">05 SCALE</span>
                <div className="text-sm font-bold text-slate-400">Enterprise Deployment</div>
                <span className="text-[9px] font-mono text-slate-500 block">UPCOMING</span>
              </div>
            </div>

            <div className="p-4 bg-amber-950/30 border border-amber-800/60 rounded-xl text-xs font-mono space-y-1">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-amber-400 font-bold uppercase">
                <span>CURRENT DELIVERY CONSTRAINT: {activeOpportunity.primaryConstraint}</span>
                <Link href="/challenges" className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-3 py-1 rounded text-[10px]">
                  [ RESOLVE VIA CHALLENGE PROGRAM ]
                </Link>
              </div>
              <p className="text-slate-300 font-sans text-xs pt-1">
                Transition from Prototype to Pilot stage requires eliminating the {activeOpportunity.primaryConstraint} deficit across engineering teams.
              </p>
            </div>
          </div>
        </section>

        {/* ================================================== */}
        {/* SECTION G — BUILD VS CAPABILITY GAP MATRIX        */}
        {/* ================================================== */}
        <section className="space-y-4" id="build-matrix">
          <div>
            <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <LayoutGrid className="text-cyan-400" size={18} /> Build vs. Capability Decision Matrix
            </h2>
            <p className="text-xs text-slate-400">Decision matrix mapping Product Opportunity vs Capability Readiness.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#111827] p-5 rounded-xl border border-emerald-500/40 space-y-2">
              <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">HIGH OPPORTUNITY / HIGH READINESS</span>
              <h3 className="text-base font-bold text-white">BUILD NOW</h3>
              <p className="text-xs text-slate-300">
                Initiatives with strong market demand and solid internal capability coverage ({activeOpportunity.title}).
              </p>
            </div>

            <div className="bg-[#111827] p-5 rounded-xl border border-rose-500/40 space-y-2">
              <span className="text-[10px] font-mono text-rose-400 uppercase font-bold">HIGH OPPORTUNITY / LOW READINESS</span>
              <h3 className="text-base font-bold text-white">CAPABILITY BUILD FIRST</h3>
              <p className="text-xs text-slate-300">
                High-potential products blocked by critical capability deficits. Execute targeted challenge upskilling prior to full build.
              </p>
            </div>
          </div>
        </section>

        {/* ================================================== */}
        {/* SECTION H — PRODUCT ACTIONS                       */}
        {/* ================================================== */}
        <section className="space-y-4 border-t border-[#1E2638] pt-8" id="from-signal-to-product">
          <div>
            <h2 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Zap className="text-cyan-400" size={20} /> From Signal to Product
            </h2>
            <p className="text-xs text-slate-400">Convert capability intelligence into prioritized product delivery pathways.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#0B0F17] border border-[#1E2638] rounded-2xl p-6 space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950 px-2.5 py-1 rounded border border-cyan-800 uppercase block w-fit mb-2">
                  1. EXPLORE
                </span>
                <h3 className="text-lg font-bold text-white">Emerging Opportunities</h3>
                <p className="text-xs text-slate-300 leading-relaxed mt-1">
                  Identify product opportunities supported by strong market demand signals.
                </p>
              </div>

              <a 
                href="#opportunity-radar"
                className="inline-flex items-center justify-center gap-2 bg-[#161E2E] hover:bg-slate-800 text-slate-200 border border-[#1E2638] font-mono text-xs font-bold px-4 py-2.5 rounded-lg transition-colors"
              >
                VIEW OPPORTUNITY RADAR ↓
              </a>
            </div>

            <div className="bg-[#0B0F17] border border-[#1E2638] rounded-2xl p-6 space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded border border-emerald-800 uppercase block w-fit mb-2">
                  2. VALIDATE
                </span>
                <h3 className="text-lg font-bold text-white">Capability Stack</h3>
                <p className="text-xs text-slate-300 leading-relaxed mt-1">
                  Verify whether required architectural capabilities and engineering roles are present.
                </p>
              </div>

              <a 
                href="#capability-stack"
                className="inline-flex items-center justify-center gap-2 bg-[#161E2E] hover:bg-slate-800 text-slate-200 border border-[#1E2638] font-mono text-xs font-bold px-4 py-2.5 rounded-lg transition-colors"
              >
                INSPECT CAPABILITY STACK ↓
              </a>
            </div>

            <div className="bg-[#0B0F17] border border-[#1E2638] rounded-2xl p-6 space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-violet-400 bg-violet-950 px-2.5 py-1 rounded border border-violet-800 uppercase block w-fit mb-2">
                  3. BUILD
                </span>
                <h3 className="text-lg font-bold text-white">Prioritize Product Initiatives</h3>
                <p className="text-xs text-slate-300 leading-relaxed mt-1">
                  Prioritize build programs where readiness aligns with demand opportunities.
                </p>
              </div>

              <Link 
                href="/challenges"
                className="inline-flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold px-4 py-2.5 rounded-lg transition-colors shadow-lg"
              >
                LAUNCH PRODUCT CHALLENGE →
              </Link>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
