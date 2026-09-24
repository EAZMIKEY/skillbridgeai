"use client";

import React, { useState, useEffect, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { 
  ArrowRight, 
  Activity, 
  ChevronRight, 
  Zap, 
  Globe, 
  Building2, 
  UserCheck
} from "lucide-react";
import { SKILLS_DATA } from "@/data/skillModel";
import { useRouter } from "next/navigation";
import { handleLensNavigation, getStoredUser, clearStoredUser, getRoleDestinationPath } from "@/lib/auth/userSession";

export default function Homepage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    queueMicrotask(() => {
      const user = getStoredUser();
      setCurrentUser(user);
    });
  }, []);

  const topEmergingSkills = useMemo(() => {
    const drivers = [
      "LLM Deployment & RAG (+34%)",
      "Multi-Cloud Infrastructure (+29%)",
      "Real-time Streaming Pipelines (+22%)",
      "Zero Trust Architecture (+18%)"
    ];
    return SKILLS_DATA.slice(0, 4).map((s, idx) => ({
      ...s,
      delta: s.futureDemand - s.currentDemand,
      driver: drivers[idx] || "Industry Adoption (+20%)"
    }));
  }, []);

  const handleSignOut = () => {
    clearStoredUser();
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-[#F8FAFC] font-sans selection:bg-[#06B6D4]/30 selection:text-white relative">
      <Navbar />

      <main className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 space-y-20">
        
        {/* ================================================== */}
        {/* SECTION 1 — HERO WITH CAPABILITY FLOW DIAGRAM      */}
        {/* ================================================== */}
        <section className="pt-6 pb-8 border-b border-[#1E2638]">
          <div className="text-center max-w-4xl mx-auto space-y-4 mb-10">
            <div className="inline-flex items-center gap-2 bg-[#111827] border border-[#1E2638] px-3.5 py-1.5 rounded-full text-xs font-mono text-[#06B6D4]">
              <Zap size={14} />
              <span>WORKFORCE INTELLIGENCE SYSTEM</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white uppercase leading-tight">
              UNDERSTAND WHERE WORKFORCE <br className="hidden sm:block" />
              <span className="text-[#06B6D4]">CAPABILITY IS HEADING.</span>
            </h1>

            <p className="text-sm sm:text-base text-[#94A3B8] max-w-2xl mx-auto leading-relaxed">
              Align industry demand, workforce capability and skill development before tomorrow&apos;s gaps become structural.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              {currentUser ? (
                <Link 
                  href={getRoleDestinationPath(currentUser.role)}
                  className="text-xs font-bold font-mono bg-[#06B6D4] hover:bg-[#06B6D4]/90 text-black px-6 py-3 rounded-md transition-all shadow-lg flex items-center gap-2 uppercase tracking-wider cursor-pointer"
                >
                  [ OPEN {currentUser.role?.toUpperCase() || "STUDENT"} WORKSPACE ] <ArrowRight size={14} />
                </Link>
              ) : (
                <>
                  <button 
                    onClick={() => handleLensNavigation("industry", router)}
                    className="text-xs font-bold bg-[#06B6D4] hover:bg-[#06B6D4]/90 text-black px-6 py-3 rounded-md transition-all shadow-lg flex items-center gap-2 cursor-pointer uppercase"
                  >
                    EXPLORE THE SYSTEM <ArrowRight size={14} />
                  </button>
                  <button 
                    onClick={() => handleLensNavigation("workforce", router)}
                    className="text-xs font-bold bg-[#111827] hover:bg-[#151D2D] text-white border border-[#1E2638] px-6 py-3 rounded-md transition-all flex items-center gap-2 cursor-pointer uppercase"
                  >
                    EXPLORE WORKFORCE INTELLIGENCE <ChevronRight size={14} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Hero Signature Visual: Analytical Capability Flow Diagram */}
          <div className="bg-[#111827] border border-[#1E2638] rounded-xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1E2638] pb-4 mb-6">
              <div className="flex items-center gap-2 text-xs font-mono text-[#94A3B8]">
                <Activity size={14} className="text-[#06B6D4]" />
                <span>CAPABILITY SUPPLY PIPELINE VISUALIZATION</span>
              </div>
              <span className="text-[10px] font-mono uppercase bg-[#151D2D] text-[#10B981] border border-[#10B981]/30 px-2.5 py-0.5 rounded">
                PROTOTYPE SIMULATION MODEL
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center text-center font-mono-val">
              <div className="bg-[#151D2D] p-4 rounded-lg border border-[#1E2638]">
                <span className="text-[10px] text-[#64748B] uppercase block mb-1">FUTURE DEMAND</span>
                <span className="text-2xl font-black text-white">86</span>
                <span className="text-[10px] text-[#10B981] block mt-1">▲ +18% Index</span>
              </div>

              <div className="hidden md:flex justify-center text-[#1E2638]">
                <ArrowRight size={20} className="text-[#06B6D4]" />
              </div>

              <div className="bg-[#151D2D] p-4 rounded-lg border border-[#1E2638]">
                <span className="text-[10px] text-[#64748B] uppercase block mb-1">CAPABILITY SUPPLY</span>
                <span className="text-2xl font-black text-[#06B6D4]">64.2K</span>
                <span className="text-[10px] text-[#94A3B8] block mt-1">Active Trainees</span>
              </div>

              <div className="hidden md:flex justify-center text-[#1E2638]">
                <ArrowRight size={20} className="text-[#06B6D4]" />
              </div>

              <div className="bg-[#151D2D] p-4 rounded-lg border border-[#1E2638]">
                <span className="text-[10px] text-[#64748B] uppercase block mb-1">PIPELINE CAPACITY</span>
                <span className="text-2xl font-black text-[#F59E0B]">71%</span>
                <span className="text-[10px] text-[#F59E0B] block mt-1">Utilization Rate</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-[#1E2638] text-xs font-mono-val">
              <div className="bg-[#192235]/60 p-3 rounded border border-[#1E2638] flex justify-between items-center">
                <span className="text-[#94A3B8]">TIME-TO-CAPABILITY</span>
                <strong className="text-white text-sm">14 MO</strong>
              </div>
              <div className="bg-[#192235]/60 p-3 rounded border border-[#1E2638] flex justify-between items-center">
                <span className="text-[#94A3B8]">STRUCTURAL LAG</span>
                <strong className="text-[#EF4444] text-sm">+6 MO LAG</strong>
              </div>
              <div className="bg-[#192235]/60 p-3 rounded border border-[#1E2638] flex justify-between items-center">
                <span className="text-[#94A3B8]">PROJECTED SUPPLY</span>
                <strong className="text-[#10B981] text-sm">+18.4K YIELD</strong>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================== */}
        {/* SECTION 2 — AUTH-AWARE WORKSPACE PANEL / LENS      */}
        {/* ================================================== */}
        {currentUser ? (
          <section className="space-y-6">
            <div className="bg-[#111827] border border-[#06B6D4]/40 rounded-xl p-6 sm:p-8 space-y-6 shadow-2xl bg-gradient-to-r from-[#111827] via-[#151D2D] to-[#111827]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-[#1E2638] pb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#06B6D4] bg-[#06B6D4]/10 border border-[#06B6D4]/30 px-2.5 py-1 rounded">
                      AUTHENTICATED {currentUser.role?.toUpperCase() || "STUDENT"} SESSION
                    </span>
                    <span className="text-xs font-mono text-[#94A3B8]">Active Role: <strong className="text-white capitalize">{currentUser.role || "student"}</strong></span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                    Welcome back, {currentUser.name || currentUser.username || "User"}.
                  </h2>
                  <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
                    You are signed in as a <strong className="text-white capitalize">{currentUser.role || "student"}</strong>. Access your dedicated workspace intelligence portal below.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  {currentUser.role === "student" && (
                    <Link
                      href="/student"
                      className="text-xs font-bold font-mono bg-[#10B981] hover:bg-[#10B981]/90 text-slate-950 px-5 py-3 rounded-lg transition-all shadow-lg flex items-center gap-2 uppercase tracking-wider"
                    >
                      [ OPEN STUDENT WORKSPACE ] <ArrowRight size={14} />
                    </Link>
                  )}
                  {currentUser.role === "industry" && (
                    <Link
                      href="/company-dashboard"
                      className="text-xs font-bold font-mono bg-[#06B6D4] hover:bg-[#06B6D4]/90 text-slate-950 px-5 py-3 rounded-lg transition-all shadow-lg flex items-center gap-2 uppercase tracking-wider"
                    >
                      [ OPEN INDUSTRY WORKSPACE ] <ArrowRight size={14} />
                    </Link>
                  )}
                  {currentUser.role === "workforce" && (
                    <Link
                      href="/regional-intelligence"
                      className="text-xs font-bold font-mono bg-[#8B5CF6] hover:bg-[#8B5CF6]/90 text-white px-5 py-3 rounded-lg transition-all shadow-lg flex items-center gap-2 uppercase tracking-wider"
                    >
                      [ OPEN WORKFORCE WORKSPACE ] <ArrowRight size={14} />
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="text-xs font-mono text-rose-400 hover:text-rose-300 bg-rose-950/40 border border-rose-800/60 px-4 py-3 rounded-lg transition-all cursor-pointer font-bold uppercase"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#1E2638] pb-4">
              <div>
                <span className="text-[10px] font-mono text-[#06B6D4] uppercase tracking-widest block">WHO ARE YOU?</span>
                <h2 className="text-2xl font-bold text-white tracking-tight">CHOOSE YOUR LENS</h2>
              </div>
              <span className="text-xs text-[#64748B] hidden sm:block">Three entry doors into one intelligence system</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Student Lens */}
              <div className="bg-[#111827] border border-[#1E2638] hover:border-[#10B981]/50 rounded-xl p-6 flex flex-col justify-between transition-all group">
                <div>
                  <div className="w-10 h-10 rounded-md bg-[#151D2D] border border-[#1E2638] flex items-center justify-center text-[#10B981] mb-4">
                    <UserCheck size={20} />
                  </div>
                  <span className="text-[10px] font-mono text-[#10B981] uppercase tracking-wider block mb-1">STUDENT LENS</span>
                  <h3 className="text-base font-bold text-white mb-2 group-hover:text-[#10B981] transition-colors">
                    FIND YOUR FASTEST PATH TO INDUSTRY READINESS.
                  </h3>
                  <p className="text-xs text-[#94A3B8] mb-6 leading-relaxed">
                    Understand your capabilities, identify your highest-impact gaps, build the right skills and prove your readiness.
                  </p>

                  <div className="space-y-2 mb-6 font-mono-val text-xs">
                    <div className="flex justify-between p-2.5 rounded bg-[#151D2D] border border-[#1E2638]">
                      <span className="text-[#94A3B8]">SKILL TWIN SCORE</span>
                      <strong className="text-white">72 / 100</strong>
                    </div>
                    <div className="flex justify-between p-2.5 rounded bg-[#151D2D] border border-[#1E2638]">
                      <span className="text-[#94A3B8]">NEXT BEST GAP</span>
                      <strong className="text-[#F59E0B]">Cloud Architecture</strong>
                    </div>
                    <div className="flex justify-between p-2.5 rounded bg-[#151D2D] border border-[#1E2638]">
                      <span className="text-[#94A3B8]">READINESS INDEX</span>
                      <strong className="text-[#10B981]">68%</strong>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => handleLensNavigation("student", router)}
                  className="w-full text-center text-xs font-bold bg-[#151D2D] hover:bg-[#10B981] text-white hover:text-black border border-[#1E2638] py-2.5 rounded-md transition-all flex items-center justify-center gap-2 cursor-pointer uppercase"
                >
                  ENTER STUDENT <ChevronRight size={14} />
                </button>
              </div>

              {/* Industry Lens */}
              <div className="bg-[#111827] border border-[#1E2638] hover:border-[#06B6D4]/50 rounded-xl p-6 flex flex-col justify-between transition-all group">
                <div>
                  <div className="w-10 h-10 rounded-md bg-[#151D2D] border border-[#1E2638] flex items-center justify-center text-[#06B6D4] mb-4">
                    <Building2 size={20} />
                  </div>
                  <span className="text-[10px] font-mono text-[#06B6D4] uppercase tracking-wider block mb-1">INDUSTRY LENS</span>
                  <h3 className="text-base font-bold text-white mb-2 group-hover:text-[#06B6D4] transition-colors">
                    SEE THE CAPABILITIES YOUR ORGANIZATION WILL NEED NEXT.
                  </h3>
                  <p className="text-xs text-[#94A3B8] mb-6 leading-relaxed">
                    Understand future skill demand, capability shortages, role requirements and talent pipelines.
                  </p>

                  <div className="space-y-2 mb-6 font-mono-val text-xs">
                    <div className="flex justify-between p-2.5 rounded bg-[#151D2D] border border-[#1E2638]">
                      <span className="text-[#94A3B8]">FUTURE DEMAND</span>
                      <strong className="text-white">87 INDEX</strong>
                    </div>
                    <div className="flex justify-between p-2.5 rounded bg-[#151D2D] border border-[#1E2638]">
                      <span className="text-[#94A3B8]">WORKFORCE CAPABILITY</span>
                      <strong className="text-[#06B6D4]">68%</strong>
                    </div>
                    <div className="flex justify-between p-2.5 rounded bg-[#151D2D] border border-[#1E2638]">
                      <span className="text-[#94A3B8]">SHORTAGE GAP</span>
                      <strong className="text-[#EF4444]">19% SHORTAGE</strong>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => handleLensNavigation("industry", router)}
                  className="w-full text-center text-xs font-bold bg-[#151D2D] hover:bg-[#06B6D4] text-white hover:text-black border border-[#1E2638] py-2.5 rounded-md transition-all flex items-center justify-center gap-2 cursor-pointer uppercase"
                >
                  ENTER INDUSTRY <ChevronRight size={14} />
                </button>
              </div>

              {/* Government / Workforce Lens */}
              <div className="bg-[#111827] border border-[#1E2638] hover:border-[#8B5CF6]/50 rounded-xl p-6 flex flex-col justify-between transition-all group">
                <div>
                  <div className="w-10 h-10 rounded-md bg-[#151D2D] border border-[#1E2638] flex items-center justify-center text-[#8B5CF6] mb-4">
                    <Globe size={20} />
                  </div>
                  <span className="text-[10px] font-mono text-[#8B5CF6] uppercase tracking-wider block mb-1">WORKFORCE INTELLIGENCE</span>
                  <h3 className="text-base font-bold text-white mb-2 group-hover:text-[#8B5CF6] transition-colors">
                    SEE WHERE WORKFORCE SUPPLY WILL FALL SHORT.
                  </h3>
                  <p className="text-xs text-[#94A3B8] mb-6 leading-relaxed">
                    Understand regional capability, structural lag, pipeline bottlenecks and interventions that can change future supply.
                  </p>

                  <div className="space-y-2 mb-6 font-mono-val text-xs">
                    <div className="flex justify-between p-2.5 rounded bg-[#151D2D] border border-[#1E2638]">
                      <span className="text-[#94A3B8]">REGIONAL DEMAND INDEX</span>
                      <strong className="text-white">86 INDEX</strong>
                    </div>
                    <div className="flex justify-between p-2.5 rounded bg-[#151D2D] border border-[#1E2638]">
                      <span className="text-[#94A3B8]">PROJECTED SUPPLY</span>
                      <strong className="text-[#8B5CF6]">64 INDEX</strong>
                    </div>
                    <div className="flex justify-between p-2.5 rounded bg-[#151D2D] border border-[#1E2638]">
                      <span className="text-[#94A3B8]">STRUCTURAL LAG</span>
                      <strong className="text-[#EF4444]">+6 MO LAG</strong>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => handleLensNavigation("workforce", router)}
                  className="w-full text-center text-xs font-bold bg-[#151D2D] hover:bg-[#8B5CF6] text-white border border-[#1E2638] py-2.5 rounded-md transition-all flex items-center justify-center gap-2 cursor-pointer uppercase"
                >
                  ENTER WORKFORCE INTELLIGENCE <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ================================================== */}
        {/* SECTION 3 — THE SYSTEM MAP                         */}
        {/* ================================================== */}
        <section className="bg-[#111827] border border-[#1E2638] rounded-xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#1E2638] pb-4 gap-2">
            <div>
              <span className="text-[10px] font-mono text-[#06B6D4] uppercase tracking-widest block">SYSTEM ARCHITECTURE</span>
              <h2 className="text-xl font-bold text-white uppercase tracking-tight">ONE SYSTEM. MULTIPLE INTELLIGENCE LAYERS.</h2>
            </div>
            <span className="text-[10px] font-mono uppercase bg-[#151D2D] text-[#06B6D4] border border-[#06B6D4]/30 px-2.5 py-0.5 rounded">
              CONCEPTUAL SYSTEM LOOP
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-9 gap-2 text-center text-[10px] font-mono-val">
            {[
              { label: "INDUSTRY DEMAND", color: "border-[#06B6D4] text-[#06B6D4]", status: "ACTIVE ENGINE" },
              { label: "REQUIRED CAPABILITIES", color: "border-[#1E2638] text-white", status: "ACTIVE ENGINE" },
              { label: "WORKFORCE SUPPLY", color: "border-[#1E2638] text-[#94A3B8]", status: "ACTIVE ENGINE" },
              { label: "SKILL GAPS", color: "border-[#EF4444] text-[#EF4444]", status: "ACTIVE ENGINE" },
              { label: "TRAINING PIPELINE", color: "border-[#F59E0B] text-[#F59E0B]", status: "ACTIVE ENGINE" },
              { label: "CAPABILITY YIELD", color: "border-[#1E2638] text-white", status: "CONCEPTUAL" },
              { label: "TIME-TO-CAPABILITY", color: "border-[#8B5CF6] text-[#8B5CF6]", status: "CONCEPTUAL" },
              { label: "INTERVENTION", color: "border-[#10B981] text-[#10B981]", status: "ACTIVE ENGINE" },
              { label: "FUTURE WORKFORCE", color: "border-[#10B981] text-[#10B981]", status: "CONCEPTUAL" },
            ].map((node, i) => (
              <div key={i} className={`bg-[#151D2D] p-3 rounded border ${node.color} flex flex-col items-center justify-between h-24 shadow-sm`}>
                <span className="font-bold leading-tight">{node.label}</span>
                <span className="text-[8px] text-[#64748B] block mt-1 uppercase">{node.status}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ================================================== */}
        {/* SECTION 4 — REGIONAL WORKFORCE PULSE              */}
        {/* ================================================== */}
        <section className="bg-[#111827] border border-[#1E2638] rounded-xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#1E2638] pb-4 gap-2">
            <div>
              <span className="text-[10px] font-mono text-[#06B6D4] uppercase tracking-widest block">GEOGRAPHIC INTELLIGENCE</span>
              <h2 className="text-xl font-bold text-white uppercase tracking-tight">REGIONAL WORKFORCE PULSE</h2>
            </div>
            <span className="text-[10px] font-mono uppercase bg-[#151D2D] text-[#10B981] border border-[#10B981]/30 px-2.5 py-0.5 rounded">
              PROTOTYPE / SYNTHETIC INTELLIGENCE MODEL
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 text-center font-mono-val">
            <div className="bg-[#151D2D] p-3.5 rounded-lg border border-[#1E2638]">
              <span className="text-[10px] text-[#64748B] block mb-1 uppercase">ALIGNMENT</span>
              <span className="text-xl font-black text-white">72 / 100</span>
            </div>
            <div className="bg-[#151D2D] p-3.5 rounded-lg border border-[#1E2638]">
              <span className="text-[10px] text-[#64748B] block mb-1 uppercase">CURRENT DEMAND</span>
              <span className="text-xl font-black text-white">78</span>
            </div>
            <div className="bg-[#151D2D] p-3.5 rounded-lg border border-[#1E2638]">
              <span className="text-[10px] text-[#64748B] block mb-1 uppercase">FUTURE DEMAND</span>
              <span className="text-xl font-black text-[#06B6D4]">86</span>
            </div>
            <div className="bg-[#151D2D] p-3.5 rounded-lg border border-[#1E2638]">
              <span className="text-[10px] text-[#64748B] block mb-1 uppercase">TRAINING ALIGNMENT</span>
              <span className="text-xl font-black text-[#10B981]">64%</span>
            </div>
            <div className="bg-[#151D2D] p-3.5 rounded-lg border border-[#1E2638]">
              <span className="text-[10px] text-[#64748B] block mb-1 uppercase">CRITICAL SHORTAGES</span>
              <span className="text-xl font-black text-[#EF4444]">07</span>
            </div>
            <div className="bg-[#151D2D] p-3.5 rounded-lg border border-[#1E2638]">
              <span className="text-[10px] text-[#64748B] block mb-1 uppercase">EMERGING RISKS</span>
              <span className="text-xl font-black text-[#F59E0B]">04</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            {[
              { name: "Region A — Tech Cluster", align: "78%", gap: "Cloud & AI", risk: "CRITICAL", color: "text-[#EF4444]" },
              { name: "Region B — Commercial Hub", align: "74%", gap: "Cybersecurity", risk: "HIGH", color: "text-[#F59E0B]" },
              { name: "Region C — Industrial Zone", align: "68%", gap: "Data Eng & IoT", risk: "MODERATE", color: "text-[#10B981]" },
              { name: "Region D — Emerging Hub", align: "62%", gap: "Full Stack Dev", risk: "HIGH", color: "text-[#F59E0B]" },
            ].map((reg, idx) => (
              <div key={idx} className="bg-[#151D2D] p-4 rounded-lg border border-[#1E2638] text-xs font-mono-val">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-bold">{reg.name}</span>
                  <span className={`text-[10px] font-bold ${reg.color}`}>{reg.risk}</span>
                </div>
                <div className="space-y-1 text-[#94A3B8]">
                  <div className="flex justify-between"><span>Alignment:</span> <strong className="text-white">{reg.align}</strong></div>
                  <div className="flex justify-between"><span>Top Shortage:</span> <strong className="text-[#F59E0B]">{reg.gap}</strong></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================================================== */}
        {/* SECTION 5 — FUTURE SIGNALS                        */}
        {/* ================================================== */}
        <section className="bg-[#111827] border border-[#1E2638] rounded-xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-[#1E2638] pb-4">
            <div>
              <span className="text-[10px] font-mono text-[#06B6D4] uppercase tracking-widest block">INDUSTRY SIGNALS → CAPABILITY IMPLICATIONS</span>
              <h2 className="text-xl font-bold text-white uppercase tracking-tight">FUTURE SIGNALS</h2>
            </div>
            <span className="text-[10px] font-mono text-[#94A3B8] uppercase">SYNTHETIC BENCHMARK DATA</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {topEmergingSkills.map((skill, i) => (
              <div key={i} className="bg-[#151D2D] p-4 rounded-lg border border-[#1E2638] space-y-3 font-mono-val">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{skill.name}</span>
                  <span className="text-xs font-bold text-[#10B981]">▲ +{skill.delta}</span>
                </div>
                <div className="flex justify-between items-baseline text-xs text-[#94A3B8]">
                  <span>Index Trajectory:</span>
                  <span className="text-white font-bold">{skill.currentDemand} → {skill.futureDemand}</span>
                </div>
                <div className="w-full bg-[#192235] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#06B6D4] h-full" style={{ width: `${(skill.futureDemand / 100) * 100}%` }}></div>
                </div>
                <div className="text-[10px] text-[#64748B] pt-1 border-t border-[#1E2638]">
                  Driver: <strong className="text-[#94A3B8]">{skill.driver}</strong>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================================================== */}
        {/* SECTION 6 — CAPABILITY PIPELINE PREVIEW           */}
        {/* ================================================== */}
        <section className="bg-[#111827] border border-[#1E2638] rounded-xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#1E2638] pb-4 gap-2">
            <div>
              <span className="text-[10px] font-mono text-[#06B6D4] uppercase tracking-widest block">TALENT SUPPLY MODELING</span>
              <h2 className="text-xl font-bold text-white uppercase tracking-tight">CAPABILITY PIPELINE PREVIEW</h2>
            </div>
            <span className="text-[10px] font-mono uppercase bg-[#151D2D] text-[#F59E0B] border border-[#F59E0B]/30 px-2.5 py-0.5 rounded">
              CONCEPTUAL MODEL
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-center font-mono-val">
            {[
              { label: "LEARNER POOL", val: "100K" },
              { label: "PREREQUISITES", val: "72%" },
              { label: "TRAINING CAPACITY", val: "48K" },
              { label: "COMPLETION", val: "81%" },
              { label: "VERIFIED CAPABILITY", val: "67%" },
              { label: "JOB-READY SUPPLY", val: "26.1K", highlight: true },
            ].map((stage, i) => (
              <div key={i} className={`p-3.5 rounded-lg border ${stage.highlight ? 'bg-[#151D2D] border-[#10B981]' : 'bg-[#151D2D] border-[#1E2638]'}`}>
                <span className="text-[10px] text-[#64748B] block mb-1">{stage.label}</span>
                <span className={`text-lg font-black ${stage.highlight ? 'text-[#10B981]' : 'text-white'}`}>{stage.val}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#1E2638] text-xs font-mono-val">
            <div className="bg-[#151D2D] p-3 rounded border border-[#1E2638] flex justify-between items-center">
              <span className="text-[#94A3B8]">TIME-TO-CAPABILITY</span>
              <strong className="text-white">14 MO</strong>
            </div>
            <div className="bg-[#151D2D] p-3 rounded border border-[#1E2638] flex justify-between items-center">
              <span className="text-[#94A3B8]">STRUCTURAL LAG</span>
              <strong className="text-[#EF4444]">+6 MO LAG</strong>
            </div>
            <div className="bg-[#151D2D] p-3 rounded border border-[#1E2638] flex justify-between items-center">
              <span className="text-[#94A3B8]">PIPELINE BOTTLENECK</span>
              <strong className="text-[#F59E0B]">TRAINING CAPACITY</strong>
            </div>
          </div>
        </section>

        {/* ================================================== */}
        {/* SECTION 7 — COUNTERFACTUAL PREVIEW                */}
        {/* ================================================== */}
        <section className="bg-[#111827] border border-[#1E2638] rounded-xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#1E2638] pb-4 gap-2">
            <div>
              <span className="text-[10px] font-mono text-[#06B6D4] uppercase tracking-widest block">INTERVENTION SIMULATION</span>
              <h2 className="text-xl font-bold text-white uppercase tracking-tight">WHAT HAPPENS IF WE ACT?</h2>
            </div>
            <span className="text-[10px] font-mono uppercase bg-[#151D2D] text-[#8B5CF6] border border-[#8B5CF6]/30 px-2.5 py-0.5 rounded">
              CONCEPTUAL SIMULATION
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono-val">
            <div className="bg-[#151D2D] p-5 rounded-lg border border-[#1E2638] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#94A3B8] uppercase">BASELINE TRAJECTORY</span>
                <span className="text-xs text-[#EF4444] font-bold">UNCHECKED SHORTAGE</span>
              </div>
              <div className="text-2xl font-black text-white">14K <span className="text-xs text-[#94A3B8] font-normal">Projected Shortage</span></div>
              <p className="text-xs text-[#64748B]">Current training capacity and enrollment rates remain unchanged over 24 months.</p>
            </div>

            <div className="bg-[#151D2D] p-5 rounded-lg border border-[#10B981]/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#10B981] uppercase">INTERVENTION TRAJECTORY</span>
                <span className="text-xs text-[#10B981] font-bold">+20K TRAINING SEATS</span>
              </div>
              <div className="text-2xl font-black text-[#10B981]">7K <span className="text-xs text-[#94A3B8] font-normal">Projected Shortage (50% Reduction)</span></div>
              <div className="flex justify-between text-xs text-[#94A3B8]">
                <span>Time-to-Impact:</span>
                <strong className="text-white">8 MO</strong>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================== */}
        {/* SECTION 8 — INTELLIGENCE LAYERS                   */}
        {/* ================================================== */}
        <section className="space-y-6">
          <div className="border-b border-[#1E2638] pb-4">
            <span className="text-[10px] font-mono text-[#06B6D4] uppercase tracking-widest block">INTELLIGENCE PLATFORM</span>
            <h2 className="text-xl font-bold text-white uppercase tracking-tight">SYSTEM CAPABILITY LAYERS</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                title: "UNDERSTAND",
                color: "text-[#06B6D4]",
                items: ["Skill Radar", "Skill Graph", "Industry signals"]
              },
              {
                title: "DIAGNOSE",
                color: "text-[#F59E0B]",
                items: ["Skill Gap Intelligence", "Industry Readiness", "Career Adjacency", "Transferability"]
              },
              {
                title: "ACT",
                color: "text-[#10B981]",
                items: ["Learning Paths", "Skill Missions", "Intervention", "Challenges"]
              },
              {
                title: "SIMULATE",
                color: "text-[#8B5CF6]",
                items: ["Workforce Simulator", "Future scenarios", "Scenario analysis"]
              }
            ].map((layer, idx) => (
              <div key={idx} className="bg-[#111827] border border-[#1E2638] rounded-xl p-5 space-y-4">
                <h3 className={`text-xs font-mono font-bold uppercase tracking-wider ${layer.color}`}>{layer.title}</h3>
                <ul className="space-y-2 text-xs text-[#94A3B8]">
                  {layer.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#1E2638]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ================================================== */}
        {/* SECTION 9 — INTELLIGENCE YOU CAN INSPECT          */}
        {/* ================================================== */}
        <section className="bg-[#111827] border border-[#1E2638] rounded-xl p-6 sm:p-8 space-y-6">
          <div className="border-b border-[#1E2638] pb-4">
            <span className="text-[10px] font-mono text-[#06B6D4] uppercase tracking-widest block">TRUST & METHODOLOGY</span>
            <h2 className="text-xl font-bold text-white uppercase tracking-tight">INTELLIGENCE YOU CAN INSPECT</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="bg-[#151D2D] p-4 rounded-lg border border-[#1E2638] space-y-2">
              <span className="font-bold text-white block uppercase text-[11px]">DETERMINISTIC ENGINE</span>
              <p className="text-[#94A3B8] leading-relaxed">Formula-based scoring and explicit rule-based graph traversal.</p>
            </div>
            <div className="bg-[#151D2D] p-4 rounded-lg border border-[#1E2638] space-y-2">
              <span className="font-bold text-white block uppercase text-[11px]">SYNTHETIC DATA MODEL</span>
              <p className="text-[#94A3B8] leading-relaxed">Benchmark prototype data used to demonstrate system intelligence flows.</p>
            </div>
            <div className="bg-[#151D2D] p-4 rounded-lg border border-[#1E2638] space-y-2">
              <span className="font-bold text-white block uppercase text-[11px]">SIMULATED SCENARIOS</span>
              <p className="text-[#94A3B8] leading-relaxed">Scenario outputs generated by deterministic and simulated models.</p>
            </div>
            <div className="bg-[#151D2D] p-4 rounded-lg border border-[#1E2638] space-y-2">
              <span className="font-bold text-white block uppercase text-[11px]">SELF-REPORTED EVIDENCE</span>
              <p className="text-[#94A3B8] leading-relaxed">Capabilities backed by user task proofs and mission submissions.</p>
            </div>
          </div>
        </section>

        {/* ================================================== */}
        {/* SECTION 10 — FINAL CTA                            */}
        {/* ================================================== */}
        <section className="bg-[#111827] border border-[#1E2638] rounded-xl p-8 sm:p-12 text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-white uppercase tracking-tight">SEE WHERE CAPABILITY IS HEADING.</h2>
          <p className="text-sm text-[#94A3B8] max-w-xl mx-auto">Explore the workforce, understand the gap and simulate what happens next.</p>
          
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            {currentUser ? (
              <>
                <Link
                  href={getRoleDestinationPath(currentUser.role)}
                  className="text-xs font-bold font-mono bg-[#06B6D4] hover:bg-[#06B6D4]/90 text-black px-6 py-3 rounded-md transition-all cursor-pointer uppercase tracking-wider flex items-center gap-2"
                >
                  [ OPEN {currentUser.role?.toUpperCase() || "STUDENT"} WORKSPACE ] <ArrowRight size={14} />
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-xs font-mono text-rose-400 hover:text-rose-300 bg-rose-950/40 border border-rose-800/60 px-5 py-3 rounded-md transition-all cursor-pointer font-bold uppercase"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => handleLensNavigation("student", router)}
                  className="text-xs font-bold bg-[#151D2D] hover:bg-[#192235] text-white border border-[#1E2638] px-6 py-3 rounded-md transition-all cursor-pointer uppercase"
                >
                  ENTER STUDENT
                </button>
                <button 
                  onClick={() => handleLensNavigation("industry", router)}
                  className="text-xs font-bold bg-[#151D2D] hover:bg-[#192235] text-white border border-[#1E2638] px-6 py-3 rounded-md transition-all cursor-pointer uppercase"
                >
                  ENTER INDUSTRY
                </button>
                <button 
                  onClick={() => handleLensNavigation("workforce", router)}
                  className="text-xs font-bold bg-[#06B6D4] hover:bg-[#06B6D4]/90 text-black px-6 py-3 rounded-md transition-all cursor-pointer uppercase"
                >
                  EXPLORE WORKFORCE
                </button>
              </>
            )}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
