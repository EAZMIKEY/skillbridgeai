"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Code2, Eye, EyeOff, ArrowRight, Mail, Lock, Shield, User, 
  Building2, Globe, CheckCircle2, ArrowLeft, KeyRound
} from "lucide-react";
import { saveStoredUser, getRoleDestinationPath } from "@/lib/auth/userSession";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const roleParam = searchParams?.get("role") || "student";
  const [activeRole, setActiveRole] = useState(roleParam);

  useEffect(() => {
    if (roleParam && ["student", "workforce", "industry"].includes(roleParam)) {
      setActiveRole(roleParam);
    }
  }, [roleParam]);

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();
      
      if (!res.ok || !data.user) {
        setError(data.error || "Invalid email or password.");
        return;
      }

      const userObj = data.user;
      saveStoredUser(userObj);

      if (userObj.role === "industry") {
        localStorage.setItem(
          "innoverse_company",
          JSON.stringify({ name: userObj.name + " Corp", sector: "Technology" })
        );
      }

      router.push(getRoleDestinationPath(userObj.role));
    } catch (err) {
      setError("Unable to connect to authentication server.");
    } finally {
      setLoading(false);
    }
  };

  // Role Editorial Content Map
  const roleEditorial = {
    student: {
      badge: "STUDENT ACCESS",
      badgeStyle: "bg-emerald-950 text-emerald-400 border-emerald-800",
      headline: "Access Your Skill Twin & Milestone Roadmap",
      description: "Sign in to inspect your verified capability twin, target role readiness scores, and milestone mission progression.",
      features: [
        "Deterministic capability gap analysis",
        "Milestone learning roadmap tracking",
        "Target role readiness classification"
      ]
    },
    workforce: {
      badge: "WORKFORCE / INSTITUTION ACCESS",
      badgeStyle: "bg-cyan-950 text-cyan-400 border-cyan-800",
      headline: "Access Regional Supply & Pipeline Intelligence",
      description: "Sign in to inspect regional workforce supply, curriculum alignment scores, and intervention scenario models.",
      features: [
        "Regional workforce supply analytics",
        "Curriculum alignment matrix catalog",
        "Intervention scenario simulator"
      ]
    },
    industry: {
      badge: "INDUSTRY / PRODUCT ACCESS",
      badgeStyle: "bg-violet-950 text-violet-300 border-violet-800",
      headline: "Access Demand Trajectories & Opportunity Radars",
      description: "Sign in to inspect enterprise demand trajectories, capability gap tables, role blueprints, and product opportunity radars.",
      features: [
        "Large-scale demand trajectory canvas",
        "Capability-driven product opportunity radar",
        "Enterprise role blueprint architecture"
      ]
    }
  };

  const activeEditorial = roleEditorial[activeRole] || roleEditorial.student;

  return (
    <div className="min-h-screen bg-[#0A0E17] text-slate-100 font-sans flex">
      {/* LEFT PANEL — EDITORIAL INTELLIGENCE CONTEXT */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 bg-[#0B0F17] border-r border-[#1E2638]">
        <div className="space-y-8">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#161E2E] border border-[#1E2638] flex items-center justify-center text-cyan-400 font-bold">
              <Code2 size={16} />
            </div>
            <div className="leading-tight">
              <span className="font-bold text-base text-white block">SKILLBRIDGE AI</span>
              <span className="text-[9px] font-mono text-slate-400 tracking-widest block">WORKFORCE INTELLIGENCE SYSTEM</span>
            </div>
          </Link>

          {/* Dynamic Role Editorial */}
          <div className="space-y-4 pt-8">
            <span className={`text-[10px] font-mono font-bold uppercase px-3 py-1 rounded border inline-block ${activeEditorial.badgeStyle}`}>
              {activeEditorial.badge}
            </span>

            <h2 className="text-3xl font-extrabold text-white leading-tight">
              {activeEditorial.headline}
            </h2>

            <p className="text-slate-300 text-sm leading-relaxed max-w-md">
              {activeEditorial.description}
            </p>

            <div className="space-y-2.5 pt-4 border-t border-[#1E2638] font-mono text-xs">
              {activeEditorial.features.map((feat, i) => (
                <div key={i} className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 size={14} className="text-cyan-400 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-[10px] font-mono text-slate-500 border-t border-[#1E2638] pt-4 flex items-center justify-between">
          <span>ENCRYPTED SESSION • DETERMINISTIC SECURITY</span>
          <span>SYSTEM V2.4</span>
        </div>
      </div>

      {/* RIGHT PANEL — HIGH-PRECISION FORM */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-12">
        <div className="max-w-md w-full mx-auto space-y-8 my-auto">
          
          {/* Back link */}
          <Link href="/get-started" className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={14} /> Back to Role Selection
          </Link>

          {/* Form Header */}
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1">
              SECURE WORKSPACE ACCESS
            </span>
            <h1 className="text-2xl font-bold text-white">Sign in to SkillBridge</h1>
            <p className="text-xs text-slate-400 mt-1">
              Select your workspace perspective below to authenticate into the system.
            </p>
          </div>

          {/* Role Context Switcher Tabs */}
          <div className="bg-[#111827] p-1.5 rounded-xl border border-[#1E2638] grid grid-cols-3 gap-1 text-xs font-mono">
            <button
              type="button"
              onClick={() => setActiveRole("student")}
              className={`py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeRole === "student" ? "bg-emerald-950 text-emerald-400 border border-emerald-800" : "text-slate-400 hover:text-white"
              }`}
            >
              <User size={12} /> Student
            </button>

            <button
              type="button"
              onClick={() => setActiveRole("workforce")}
              className={`py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeRole === "workforce" ? "bg-cyan-950 text-cyan-400 border border-cyan-800" : "text-slate-400 hover:text-white"
              }`}
            >
              <Globe size={12} /> Workforce
            </button>

            <button
              type="button"
              onClick={() => setActiveRole("industry")}
              className={`py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeRole === "industry" ? "bg-violet-950 text-violet-300 border border-violet-800" : "text-slate-400 hover:text-white"
              }`}
            >
              <Building2 size={12} /> Industry
            </button>
          </div>

          {error && (
            <div className="p-3 bg-rose-950/40 border border-rose-800 rounded-lg text-xs font-mono text-rose-400">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 uppercase block">Work Email / User Handle</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="alex.chen@enterprise.com"
                  className="w-full bg-[#111827] border border-[#1E2638] rounded-xl px-3.5 py-3 pl-9 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] text-slate-400 uppercase block">Password</label>
                <Link href="/forgot-password" className="text-[10px] text-cyan-400 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••••••"
                  className="w-full bg-[#111827] border border-[#1E2638] rounded-xl px-3.5 py-3 pl-9 pr-9 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 uppercase tracking-wider font-mono mt-2"
            >
              {loading ? (
                <span>AUTHENTICATING...</span>
              ) : (
                <>
                  <span>SIGN IN TO {activeRole.toUpperCase()} WORKSPACE</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="pt-4 border-t border-[#1E2638] text-center text-xs font-mono text-slate-400">
            <span>New to SkillBridge? </span>
            <Link href={`/register?role=${activeRole}`} className="text-cyan-400 hover:underline font-bold">
              Create an account →
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0E17] flex items-center justify-center text-cyan-400 font-mono text-xs">Loading Auth...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}
