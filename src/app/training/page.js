"use client";

import React, { useState, useMemo, use } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { 
  BookOpen, 
  Search, 
  Target, 
  Sparkles, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  ChevronRight, 
  Filter, 
  RefreshCw,
  Award,
  Zap,
  BarChart2
} from "lucide-react";
import { getTrainingPrograms } from "@/lib/curriculumAlignment";
import { STUDENT_PROFILE } from "@/data/studentProfile";

const DOMAINS = ["ALL", "AI / GenAI", "Backend Engineering", "Cloud Engineering", "Cybersecurity", "Data Engineering", "Full Stack", "NLP", "Software Engineering"];
const LEVELS = ["ALL", "Foundation", "Intermediate", "Advanced"];
const TRAJECTORIES = ["ALL", "IMPROVING", "STABLE", "FUTURE RISK"];

export default function TrainingMarketplacePage({ searchParams: searchParamsPromise }) {
  const searchParams = searchParamsPromise ? use(searchParamsPromise) : {};
  const initialSkill = searchParams?.skill || "";

  const [search, setSearch] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("ALL");
  const [selectedLevel, setSelectedLevel] = useState("ALL");
  const [selectedTrajectory, setSelectedTrajectory] = useState("ALL");
  const [sortBy, setSortBy] = useState("bestIndustry");

  const programs = useMemo(() => {
    return getTrainingPrograms(
      {
        search,
        domain: selectedDomain,
        level: selectedLevel,
        trajectory: selectedTrajectory,
        skill: initialSkill,
        sortBy
      },
      STUDENT_PROFILE.capabilities
    );
  }, [search, selectedDomain, selectedLevel, selectedTrajectory, initialSkill, sortBy]);

  const resetFilters = () => {
    setSearch("");
    setSelectedDomain("ALL");
    setSelectedLevel("ALL");
    setSelectedTrajectory("ALL");
    setSortBy("bestIndustry");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-violet-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-[30%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />

      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-16 relative z-10">
        
        {/* Header */}
        <div className="mb-10 lg:flex lg:justify-between lg:items-end gap-6 border-b border-white/10 pb-8">
          <div>
            <p className="text-violet-400 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
              <BookOpen size={16} /> Training & Curriculum Intelligence
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mb-3">
              Curriculum <span className="text-violet-400">Alignment</span>
            </h1>
            <p className="text-white/70 text-base sm:text-lg max-w-3xl leading-relaxed">
              Measure how well training programs prepare learners for today’s jobs and tomorrow’s capabilities.
            </p>
          </div>

          <div className="mt-4 lg:mt-0 shrink-0">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl text-xs text-white/80">
              <Sparkles size={14} className="text-violet-400" />
              <span>Analyzing Student: <strong className="text-white">{STUDENT_PROFILE.name}</strong></span>
            </div>
          </div>
        </div>

        {/* Active Skill Filter Alert */}
        {initialSkill && (
          <div className="mb-6 p-4 rounded-2xl bg-violet-950/20 border border-violet-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-violet-300">
              <Target size={16} />
              <span>Filtering programs covering skill: <strong className="text-white">{initialSkill}</strong></span>
            </div>
            <Link href="/training" className="text-xs text-white/50 hover:text-white underline">Clear Filter</Link>
          </div>
        )}

        {/* Search & Discovery Bar */}
        <div className="glass p-5 rounded-2xl border border-white/10 mb-8 space-y-4 shadow-lg">
          <div className="flex flex-col md:flex-row gap-3 items-center">
            
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
              <input
                type="text"
                placeholder="Search programs, providers, skills, or domains..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#12131c] border border-white/15 rounded-xl pl-11 pr-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500/60 transition-all placeholder:text-white/40"
              />
            </div>

            {/* Sort Select */}
            <div className="w-full md:w-56 shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-[#12131c] border border-white/15 rounded-xl px-4 py-3 text-white text-xs font-semibold focus:outline-none focus:border-violet-500/60 cursor-pointer"
              >
                <option value="bestIndustry">Sort: Highest Current Alignment</option>
                <option value="bestFuture">Sort: Highest Future Alignment</option>
                <option value="highestCoverage">Sort: Highest Skill Coverage</option>
                <option value="highestPractical">Sort: Highest Practical Exposure</option>
              </select>
            </div>
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-white/5 text-xs">
            <div className="flex items-center gap-1.5 text-white/50 font-bold uppercase tracking-wider mr-2">
              <Filter size={14} /> Filters:
            </div>

            {/* Domain Filter */}
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-white/80 hover:text-white focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#12131c]">Domain: All</option>
              {DOMAINS.filter(d => d !== "ALL").map(d => (
                <option key={d} value={d} className="bg-[#12131c]">{d}</option>
              ))}
            </select>

            {/* Level Filter */}
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-white/80 hover:text-white focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#12131c]">Level: All</option>
              {LEVELS.filter(l => l !== "ALL").map(l => (
                <option key={l} value={l} className="bg-[#12131c]">{l}</option>
              ))}
            </select>

            {/* Trajectory Filter */}
            <select
              value={selectedTrajectory}
              onChange={(e) => setSelectedTrajectory(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-white/80 hover:text-white focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#12131c]">Trajectory: All</option>
              {TRAJECTORIES.filter(t => t !== "ALL").map(t => (
                <option key={t} value={t} className="bg-[#12131c]">{t}</option>
              ))}
            </select>

            <button onClick={resetFilters} className="ml-auto text-white/40 hover:text-white flex items-center gap-1 text-xs">
              <RefreshCw size={12} /> Reset
            </button>
          </div>
        </div>

        {/* Results Counter */}
        <div className="mb-6 flex items-center justify-between text-xs text-white/60">
          <span>Showing <strong>{programs.length}</strong> Training Programs</span>
          <span>Sorted by: <strong className="text-violet-400">{sortBy}</strong></span>
        </div>

        {/* Program Cards Grid */}
        {programs.length === 0 ? (
          <div className="glass rounded-3xl p-12 text-center border border-white/10">
            <AlertTriangle className="mx-auto text-white/40 mb-3" size={40} />
            <h3 className="text-lg font-bold text-white mb-1">No Training Programs Found</h3>
            <p className="text-white/60 text-xs mb-4">Try adjusting your search terms or resetting filters.</p>
            <button onClick={resetFilters} className="bg-white/10 hover:bg-white/20 text-white text-xs px-4 py-2 rounded-xl font-bold">Reset Filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {programs.map((prog) => {
              const { alignment, projectedImpact } = prog;
              return (
                <div 
                  key={prog.id}
                  className="glass rounded-3xl p-6 border border-white/10 hover:border-violet-500/40 transition-all flex flex-col justify-between group bg-gradient-to-br from-black/40 via-black/20 to-violet-950/10 shadow-lg"
                >
                  <div>
                    {/* Header Provider & Trajectory */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <span className="text-[11px] font-bold text-violet-400 uppercase tracking-widest block">{prog.provider}</span>
                        <span className="text-[10px] text-white/40">{prog.domain} • {prog.level}</span>
                      </div>

                      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                        alignment.trajectory === 'IMPROVING' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                        alignment.trajectory === 'STABLE' ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' :
                        'bg-red-500/20 text-red-300 border-red-500/40'
                      }`}>
                        {alignment.trajectory}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-violet-300 transition-colors leading-snug">
                      {prog.name}
                    </h3>

                    {/* Alignment Matrix Badge Bar */}
                    <div className="grid grid-cols-2 gap-2 my-3 p-3 rounded-2xl bg-white/5 border border-white/5 text-xs">
                      <div>
                        <span className="text-[10px] text-white/40 uppercase block font-bold">Current Alignment</span>
                        <strong className="text-white font-mono text-sm">{alignment.currentAlignment}%</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-white/40 uppercase block font-bold">Future Alignment</span>
                        <strong className="text-violet-300 font-mono text-sm">{alignment.futureAlignment}%</strong>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-white/70 line-clamp-2 mb-4 leading-relaxed">
                      {prog.description}
                    </p>

                    {/* Meta Badges */}
                    <div className="flex flex-wrap gap-2 text-[11px] text-white/60 mb-4">
                      <span className="bg-white/5 px-2.5 py-1 rounded-lg border border-white/5 flex items-center gap-1">
                        <Clock size={12} className="text-blue-400" /> {prog.duration}
                      </span>
                      <span className="bg-white/5 px-2.5 py-1 rounded-lg border border-white/5 flex items-center gap-1">
                        <Layers size={12} className="text-emerald-400" /> {prog.deliveryMode}
                      </span>
                    </div>

                    {/* Covered Skills Pills */}
                    <div className="mb-4">
                      <div className="text-[10px] text-white/40 uppercase font-bold tracking-wider mb-1.5">Key Covered Skills</div>
                      <div className="flex flex-wrap gap-1.5">
                        {prog.coveredSkills.map((s) => (
                          <span key={s.skillId} className="text-[10px] bg-black/40 text-white/80 border border-white/10 px-2 py-0.5 rounded-md font-mono">
                            {s.skillId.replace("s_", "").toUpperCase()} ({s.coverageLevel}%)
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <div className="text-[11px] text-emerald-400 font-semibold">
                      {projectedImpact.projectedReadinessImpact}
                    </div>

                    <Link 
                      href={`/training/${prog.id}`}
                      className="text-xs bg-violet-600/30 hover:bg-violet-600/50 text-violet-200 border border-violet-500/40 px-4 py-2 rounded-xl font-bold flex items-center gap-1 transition-all"
                    >
                      Analyze Curriculum <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
