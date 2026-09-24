"use client";

import { useState, useMemo } from "react";
import { 
  Rocket, 
  TrendingUp, 
  Circle, 
  AlertTriangle, 
  ArrowDown, 
  Search, 
  Filter, 
  Network, 
  Activity, 
  RotateCcw,
  ChevronRight,
  Layers,
  Briefcase,
  SlidersHorizontal
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { SKILLS_DATA } from "@/data/skillModel";
import { enrichSkillData } from "@/lib/skillLogic";

const STATUS_UI = {
  "Emerging": { icon: Rocket, color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/30", badge: "bg-violet-500/20 text-violet-300 border-violet-500/40" },
  "Growing": { icon: TrendingUp, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30", badge: "bg-blue-500/20 text-blue-300 border-blue-500/40" },
  "Stable": { icon: Circle, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" },
  "Transforming": { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30", badge: "bg-amber-500/20 text-amber-300 border-amber-500/40" },
  "Declining": { icon: ArrowDown, color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/30", badge: "bg-rose-500/20 text-rose-300 border-rose-500/40" }
};

export default function ExplorePage() {
  const [filterState, setFilterState] = useState({
    search: "",
    sector: "All",
    status: "All",
    demandLevel: "All",
    sortBy: "futureDemand" // 'futureDemand' | 'growth' | 'currentDemand' | 'name'
  });

  // Safe dataset initialization & enrichment
  const skills = useMemo(() => {
    try {
      return enrichSkillData(SKILLS_DATA || []);
    } catch {
      return [];
    }
  }, []);

  const sectors = useMemo(() => {
    const set = new Set((skills || []).map(s => s.sector).filter(Boolean));
    return ["All", ...Array.from(set)];
  }, [skills]);

  // Analytical summary stats computed deterministically
  const stats = useMemo(() => {
    const total = skills.length;
    const domainCount = new Set(skills.map(s => s.sector)).size;
    const highDemandCount = skills.filter(s => (s.futureDemand || 0) >= 80).length;
    const allRoles = new Set();
    skills.forEach(s => (s.roles || []).forEach(r => allRoles.add(r)));
    const connectedRolesCount = allRoles.size;

    return {
      total,
      domains: domainCount,
      highDemand: highDemandCount,
      connectedRoles: connectedRolesCount
    };
  }, [skills]);

  // Filtering & Sorting Logic
  const filteredSkills = useMemo(() => {
    let result = [...skills];

    // Search query
    if (filterState.search.trim()) {
      const q = filterState.search.toLowerCase().trim();
      result = result.filter(s => 
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.sector && s.sector.toLowerCase().includes(q)) ||
        (s.explanation && s.explanation.toLowerCase().includes(q)) ||
        (s.roles && s.roles.some(r => r.toLowerCase().includes(q)))
      );
    }

    // Sector / Domain filter
    if (filterState.sector !== "All") {
      result = result.filter(s => s.sector === filterState.sector);
    }

    // Status filter
    if (filterState.status !== "All") {
      result = result.filter(s => s.status === filterState.status);
    }

    // Demand Level filter
    if (filterState.demandLevel !== "All") {
      if (filterState.demandLevel === "High") {
        result = result.filter(s => (s.futureDemand || 0) >= 80);
      } else if (filterState.demandLevel === "Medium") {
        result = result.filter(s => (s.futureDemand || 0) >= 50 && (s.futureDemand || 0) < 80);
      } else if (filterState.demandLevel === "Low") {
        result = result.filter(s => (s.futureDemand || 0) < 50);
      }
    }

    // Sorting
    result.sort((a, b) => {
      if (filterState.sortBy === "growth") {
        return (b.growth || 0) - (a.growth || 0);
      }
      if (filterState.sortBy === "currentDemand") {
        return (b.currentDemand || 0) - (a.currentDemand || 0);
      }
      if (filterState.sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      // default: futureDemand
      return (b.futureDemand || 0) - (a.futureDemand || 0);
    });

    return result;
  }, [skills, filterState]);

  const hasActiveFilters = 
    filterState.search !== "" || 
    filterState.sector !== "All" || 
    filterState.status !== "All" || 
    filterState.demandLevel !== "All" || 
    filterState.sortBy !== "futureDemand";

  const handleResetFilters = () => {
    setFilterState({
      search: "",
      sector: "All",
      status: "All",
      demandLevel: "All",
      sortBy: "futureDemand"
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-28 pb-20">
        
        {/* PAGE HEADER */}
        <div className="mb-10 text-left border-b border-slate-800/80 pb-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-md text-xs font-mono font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/20 uppercase tracking-wider">
              WORKFORCE INTELLIGENCE DISCOVERY
            </span>
            <span className="px-3 py-1 rounded-md text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800">
              DETERMINISTIC INTELLIGENCE MODEL
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
            EXPLORE THE SKILL ECOSYSTEM
          </h1>

          <p className="text-slate-400 text-base md:text-lg max-w-3xl leading-relaxed">
            Discover technical competencies, industry demand signals, skill relationships, and career pathway connections across the SkillBridge capability graph.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <Link 
              href="/skill-graph" 
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-lg border border-slate-700 transition-colors"
            >
              <Network size={16} className="text-violet-400" />
              Interactive Skill Graph
            </Link>
            <Link 
              href="/company-dashboard" 
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-lg border border-slate-700 transition-colors"
            >
              <Activity size={16} className="text-blue-400" />
              Workforce Simulator
            </Link>
          </div>
        </div>

        {/* ANALYTICAL SUMMARY DASHBOARD */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Skills</span>
              <Layers size={16} className="text-slate-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-white">{stats.total}</div>
            <div className="text-xs text-slate-500 mt-1">Cataloged competencies</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Domains</span>
              <Network size={16} className="text-slate-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-violet-400">{stats.domains}</div>
            <div className="text-xs text-slate-500 mt-1">Industry sectors</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">High Demand</span>
              <TrendingUp size={16} className="text-slate-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400">{stats.highDemand}</div>
            <div className="text-xs text-slate-500 mt-1">Future demand ≥ 80</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Connected Roles</span>
              <Briefcase size={16} className="text-slate-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-blue-400">{stats.connectedRoles}</div>
            <div className="text-xs text-slate-500 mt-1">Target career paths</div>
          </div>
        </div>

        {/* SEARCH AND CONTROLS TOOLBAR */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="Search skills, domains, or target roles..." 
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500/70 transition-colors"
                value={filterState.search}
                onChange={e => setFilterState({...filterState, search: e.target.value})}
              />
              {filterState.search && (
                <button 
                  onClick={() => setFilterState({...filterState, search: ""})}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs font-mono"
                >
                  CLEAR
                </button>
              )}
            </div>

            {/* Sector / Domain Filter */}
            <div className="w-full md:w-48">
              <select 
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-violet-500/70"
                value={filterState.sector}
                onChange={e => setFilterState({...filterState, sector: e.target.value})}
              >
                <option value="All">All Domains</option>
                {sectors.filter(s => s !== "All").map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="w-full md:w-44">
              <select 
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-violet-500/70"
                value={filterState.status}
                onChange={e => setFilterState({...filterState, status: e.target.value})}
              >
                <option value="All">All Statuses</option>
                <option value="Emerging">Emerging</option>
                <option value="Growing">Growing</option>
                <option value="Stable">Stable</option>
                <option value="Transforming">Transforming</option>
                <option value="Declining">Declining</option>
              </select>
            </div>

            {/* Demand Filter */}
            <div className="w-full md:w-44">
              <select 
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-violet-500/70"
                value={filterState.demandLevel}
                onChange={e => setFilterState({...filterState, demandLevel: e.target.value})}
              >
                <option value="All">All Demand Levels</option>
                <option value="High">High (≥ 80)</option>
                <option value="Medium">Medium (50 - 79)</option>
                <option value="Low">Low (&lt; 50)</option>
              </select>
            </div>

            {/* Sort Filter */}
            <div className="w-full md:w-48">
              <select 
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-violet-500/70"
                value={filterState.sortBy}
                onChange={e => setFilterState({...filterState, sortBy: e.target.value})}
              >
                <option value="futureDemand">Sort: Future Demand</option>
                <option value="growth">Sort: Growth Rate</option>
                <option value="currentDemand">Sort: Current Demand</option>
                <option value="name">Sort: Name (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Active Filter Bar & Results Count */}
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 border-t border-slate-800/60 pt-3">
            <div>
              Showing <span className="font-mono font-semibold text-slate-200">{filteredSkills.length}</span> of <span className="font-mono">{skills.length}</span> skills
            </div>
            
            {hasActiveFilters && (
              <button 
                onClick={handleResetFilters}
                className="flex items-center gap-1.5 text-violet-400 hover:text-violet-300 transition-colors font-medium"
              >
                <RotateCcw size={14} />
                Reset Filters &amp; Search
              </button>
            )}
          </div>
        </div>

        {/* RESULTS GRID */}
        {filteredSkills.length === 0 ? (
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl py-16 px-6 text-center">
            <div className="max-w-md mx-auto">
              <SlidersHorizontal className="mx-auto text-slate-600 mb-4" size={36} />
              <h3 className="text-lg font-bold text-slate-200 mb-2">No skills match your criteria</h3>
              <p className="text-slate-400 text-sm mb-6">
                Try adjusting your search query, selecting a different domain, or resetting your filter constraints.
              </p>
              <button 
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors"
              >
                <RotateCcw size={14} />
                Reset Search Filters
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSkills.map((skill) => {
              const UI = STATUS_UI[skill.status] || STATUS_UI["Stable"];
              const StatusIcon = UI.icon;
              
              return (
                <div 
                  key={skill.id}
                  className="bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Header line: Domain & Status Badge */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-mono text-slate-400 truncate max-w-[180px]">
                        {skill.sector}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${UI.badge}`}>
                        <StatusIcon size={12} />
                        {skill.status}
                      </span>
                    </div>

                    {/* Skill Name */}
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-violet-300 transition-colors">
                      {skill.name}
                    </h3>

                    {/* Explanation / Description snippet */}
                    <p className="text-slate-400 text-xs leading-relaxed line-clamp-2 mb-4">
                      {skill.explanation}
                    </p>

                    {/* Roles Tags */}
                    {skill.roles && skill.roles.length > 0 && (
                      <div className="mb-5">
                        <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-1.5">
                          Relevant Roles
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {skill.roles.slice(0, 3).map((role, rIdx) => (
                            <span 
                              key={rIdx} 
                              className="bg-slate-950 border border-slate-800 text-slate-300 text-[11px] px-2 py-0.5 rounded"
                            >
                              {role}
                            </span>
                          ))}
                          {skill.roles.length > 3 && (
                            <span className="text-slate-500 text-[11px] px-1 py-0.5 font-mono">
                              +{skill.roles.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Metrics Footer & CTA Link */}
                  <div className="border-t border-slate-800/80 pt-4 mt-auto">
                    <div className="grid grid-cols-3 gap-2 text-center mb-4">
                      <div className="bg-slate-950/80 p-2 rounded border border-slate-800/50">
                        <div className="text-[10px] uppercase text-slate-500">Current</div>
                        <div className="text-sm font-bold font-mono text-slate-200">{skill.currentDemand}</div>
                      </div>

                      <div className="bg-slate-950/80 p-2 rounded border border-slate-800/50">
                        <div className="text-[10px] uppercase text-slate-500">Future</div>
                        <div className={`text-sm font-bold font-mono ${UI.color}`}>{skill.futureDemand}</div>
                      </div>

                      <div className="bg-slate-950/80 p-2 rounded border border-slate-800/50">
                        <div className="text-[10px] uppercase text-slate-500">Growth</div>
                        <div className={`text-sm font-bold font-mono ${skill.growth > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          {skill.growth > 0 ? `+${skill.growth.toFixed(1)}%` : `${skill.growth.toFixed(1)}%`}
                        </div>
                      </div>
                    </div>

                    <Link 
                      href={`/explore/${skill.id}`}
                      className="w-full flex items-center justify-between text-xs font-semibold bg-violet-600/10 hover:bg-violet-600/20 text-violet-300 border border-violet-500/30 px-3.5 py-2 rounded-lg transition-colors group-hover:border-violet-500/50"
                    >
                      <span>VIEW SKILL INTELLIGENCE</span>
                      <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
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
