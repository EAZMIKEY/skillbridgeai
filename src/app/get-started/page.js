"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  Code2, User, Building2, Globe, ArrowRight, Shield, Target, 
  TrendingUp, Compass, ChevronRight, Award, Layers, AlertTriangle, LogOut, RefreshCw
} from "lucide-react";
import { getStoredUser, saveStoredUser, clearStoredUser, getRoleDestinationPath } from "@/lib/auth/userSession";

function GetStartedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const roleParam = searchParams?.get("role");
  const isConflict = searchParams?.get("conflict") === "true";
  const currentRoleParam = searchParams?.get("currentRole");

  const [selectedRole, setSelectedRole] = useState(() => {
    return roleParam && ["student", "workforce", "industry"].includes(roleParam) ? roleParam : "student";
  });
  const [currentUser] = useState(() => getStoredUser());

  const roles = [
    {
      id: "student",
      title: "STUDENT",
      headline: "Build Capability & Opportunities",
      description: "Understand your capabilities, identify skill gaps, track milestone learning roadmaps, and build toward verified target role readiness.",
      badge: "SKILL TWIN & READINESS",
      icon: Target,
      accentColor: "emerald",
      borderStyle: "border-emerald-500/40 hover:border-emerald-400",
      bgStyle: "bg-[#0E1422] hover:bg-[#111827]",
      badgeStyle: "bg-emerald-950 text-emerald-400 border-emerald-800",
      btnStyle: "bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold",
      destination: "/profile",
      previewMetrics: [
        { label: "VERIFIED TWIN SCORE", val: "74 / 100" },
        { label: "TARGET ROLE", val: "DevOps Engineer" },
        { label: "NEXT MILESTONE", val: "Cloud Architecture" }
      ]
    },
    {
      id: "industry",
      title: "INDUSTRY",
      headline: "Demand Trajectories & Opportunity Radars",
      description: "Understand capability demand shifts, product opportunities, role readiness, and enterprise talent pipeline bottlenecks.",
      badge: "DEMAND & OPPORTUNITY",
      icon: Building2,
      accentColor: "violet",
      borderStyle: "border-violet-500/40 hover:border-violet-400",
      bgStyle: "bg-[#0E1422] hover:bg-[#111827]",
      badgeStyle: "bg-violet-950 text-violet-300 border-violet-800",
      btnStyle: "bg-violet-500 hover:bg-violet-400 text-slate-950 font-bold",
      destination: "/company-dashboard",
      previewMetrics: [
        { label: "DEMAND SHIFT", val: "▲ +18% Growth" },
        { label: "CRITICAL GAPS", val: "12 Capabilities" },
        { label: "OPPORTUNITY SIGNAL", val: "High Demand / Low Supply" }
      ]
    },
    {
      id: "workforce",
      title: "WORKFORCE",
      headline: "Regional Supply & Intervention Intelligence",
      description: "Understand regional workforce supply, capability readiness, curriculum alignment, and regional intervention scenario opportunities.",
      badge: "REGIONAL SUPPLY & PIPELINE",
      icon: Globe,
      accentColor: "cyan",
      borderStyle: "border-cyan-500/40 hover:border-cyan-400",
      bgStyle: "bg-[#0E1422] hover:bg-[#111827]",
      badgeStyle: "bg-cyan-950 text-cyan-400 border-cyan-800",
      btnStyle: "bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold",
      destination: "/regional-intelligence",
      previewMetrics: [
        { label: "REGIONAL SUPPLY", val: "14,250 Talent" },
        { label: "ALIGNED CURRICULA", val: "84% Match" },
        { label: "INTERVENTION LIFT", val: "+8.4 Readiness Pts" }
      ]
    }
  ];

  const handleSelectRole = (roleId) => {
    setSelectedRole(roleId);
  };

  const handleContinueLogin = (roleId) => {
    router.push(`/login?role=${roleId}`);
  };

  const handleContinueSignup = (roleId) => {
    router.push(`/register?role=${roleId}`);
  };

  const handleSwitchUserRole = (newRole) => {
    if (currentUser) {
      const updated = { ...currentUser, role: newRole };
      saveStoredUser(updated);
      router.push(getRoleDestinationPath(newRole));
    }
  };

  const handleSignOut = () => {
    clearStoredUser();
    setCurrentUser(null);
    router.push("/get-started");
  };

  return (
    <div className="min-h-screen bg-[#0A0E17] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-12 flex-1">
        
        {/* ROLE CONFLICT BARNER IF USER IS SIGNED IN WITH DIFFERENT ROLE */}
        {isConflict && currentUser && (
          <div className="bg-[#191624] border border-amber-500/40 rounded-2xl p-6 space-y-4 max-w-3xl mx-auto shadow-2xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-amber-400 shrink-0 mt-0.5" size={20} />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  ROLE TRANSITION NOTICE
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  You are currently signed in as <strong className="text-amber-400 capitalize">{currentUser.name || currentUser.username} ({currentUser.role})</strong>. You selected the <strong className="text-cyan-400 capitalize">{selectedRole}</strong> experience.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2 font-mono text-xs">
              <button
                onClick={() => router.push(getRoleDestinationPath(currentUser.role))}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 font-bold transition-all"
              >
                Continue as {currentUser.role.toUpperCase()} →
              </button>
              <button
                onClick={() => handleSwitchUserRole(selectedRole)}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg font-bold transition-all flex items-center gap-1.5"
              >
                <RefreshCw size={12} />
                Switch Profile to {selectedRole.toUpperCase()}
              </button>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 rounded-lg border border-rose-800/60 font-bold transition-all flex items-center gap-1.5 ml-auto"
              >
                <LogOut size={12} />
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-[#111827] px-3 py-1 rounded-full border border-[#1E2638] text-xs font-mono text-cyan-400">
            <Code2 size={14} />
            <span>SKILLBRIDGE AI — WORKFORCE INTELLIGENCE SYSTEM</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            How will you use <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">SkillBridge</span>?
          </h1>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Choose the role experience you want to access. Each role provides dedicated analytical models, dashboards, and workspace tools.
          </p>
        </div>

        {/* 3 Role Choice Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((r) => {
            const IconComp = r.icon;
            const isSelected = selectedRole === r.id;

            return (
              <div
                key={r.id}
                onClick={() => handleSelectRole(r.id)}
                className={`border rounded-2xl p-6 transition-all cursor-pointer flex flex-col justify-between space-y-6 shadow-2xl relative ${
                  isSelected 
                    ? `${r.borderStyle} ${r.bgStyle} ring-2 ring-cyan-500/30` 
                    : 'border-[#1E2638] bg-[#0B0F17] hover:border-slate-700'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded border ${r.badgeStyle}`}>
                      {r.badge}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-[#161E2E] border border-[#1E2638] flex items-center justify-center text-white">
                      <IconComp size={20} />
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">{r.title} ROLE</span>
                    <h2 className="text-xl font-bold text-white mt-1">{r.headline}</h2>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{r.description}</p>

                  {/* Preview Metrics Box */}
                  <div className="bg-[#0B0F17] p-3 rounded-xl border border-[#1E2638] space-y-1.5 font-mono text-[11px]">
                    {r.previewMetrics.map((m, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-slate-400">{m.label}:</span>
                        <span className="text-white font-bold">{m.val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTAs */}
                <div className="space-y-2 pt-4 border-t border-[#1E2638]">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleContinueSignup(r.id); }}
                    className={`w-full py-3 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 font-mono cursor-pointer ${r.btnStyle}`}
                  >
                    <span>CREATE {r.id.toUpperCase()} ACCOUNT</span>
                    <ArrowRight size={14} />
                  </button>

                  <button
                    onClick={(e) => { e.stopPropagation(); handleContinueLogin(r.id); }}
                    className="w-full py-2.5 rounded-xl text-xs font-mono text-slate-400 hover:text-white bg-[#161E2E] hover:bg-slate-800 border border-[#1E2638] transition-colors text-center cursor-pointer"
                  >
                    Sign In as {r.id.charAt(0).toUpperCase() + r.id.slice(1)} →
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Global Sign In Footer Link */}
        <div className="text-center text-xs font-mono text-slate-400 pt-4 border-t border-[#1E2638]">
          <span>Already have an account? </span>
          <Link href={`/login?role=${selectedRole}`} className="text-cyan-400 hover:text-cyan-300 font-bold underline">
            Sign in to existing account →
          </Link>
        </div>

      </main>

      <Footer />
    </div>
  );
}

export default function GetStartedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0E17] flex items-center justify-center text-cyan-400 font-mono text-xs">Loading Get Started...</div>}>
      <GetStartedContent />
    </Suspense>
  );
}
