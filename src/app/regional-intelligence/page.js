"use client";

import React, { useState, useMemo, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { 
  Globe, 
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
  BarChart2,
  MapPin,
  GitCompare,
  X,
  Info,
  Building2,
  LogOut
} from "lucide-react";
import { getRegions, compareRegions, getSkillRegionalLandscape } from "@/lib/regionalSkillIntelligence";
import { SKILLS_DATA } from "@/data/skillModel";
import { getStoredUser, clearStoredUser } from "@/lib/auth/userSession";

const COUNTRIES = ["ALL", "India", "USA", "UK", "Japan", "Germany"];
const RISK_LEVELS = ["ALL", "CRITICAL", "HIGH", "MODERATE", "LOW"];

export default function RegionalIntelligencePage({ searchParams: searchParamsPromise }) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("Overview");

  useEffect(() => {
    queueMicrotask(() => {
      setIsMounted(true);
      const user = getStoredUser();
      if (!user) {
        router.replace("/get-started?role=workforce");
        return;
      }
      const userRole = user.role || "workforce";
      if (userRole !== "workforce") {
        router.replace(`/get-started?role=workforce&conflict=true&currentRole=${userRole}`);
        return;
      }
      setCurrentUser(user);
    });
  }, [router]);

  const handleSignOut = () => {
    clearStoredUser();
    router.push("/get-started");
  };

  const searchParams = searchParamsPromise ? use(searchParamsPromise) : {};
  const initialSkill = searchParams?.skill || "";

  const [search, setSearch] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("ALL");
  const [selectedRiskLevel, setSelectedRiskLevel] = useState("ALL");
  const [selectedSkill, setSelectedSkill] = useState(initialSkill);
  const [sortBy, setSortBy] = useState("bestAlignment");
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [compareRegionIds, setCompareRegionIds] = useState(["reg_bengaluru", "reg_silicon_valley"]);

  const regions = useMemo(() => {
    return getRegions({
      search,
      country: selectedCountry,
      riskLevel: selectedRiskLevel,
      skill: selectedSkill,
      sortBy
    });
  }, [search, selectedCountry, selectedRiskLevel, selectedSkill, sortBy]);

  const skillLandscape = useMemo(() => {
    if (!selectedSkill) return null;
    return getSkillRegionalLandscape(selectedSkill);
  }, [selectedSkill]);

  const comparisonData = useMemo(() => {
    return compareRegions(compareRegionIds);
  }, [compareRegionIds]);

  const resetFilters = () => {
    setSearch("");
    setSelectedCountry("ALL");
    setSelectedRiskLevel("ALL");
    setSelectedSkill("");
    setSortBy("bestAlignment");
  };

  const workforceNavTabs = [
    "Overview",
    "Talent Supply",
    "Capability Distribution",
    "Regional Intelligence",
    "Skill Gaps",
    "Role Demand",
    "Training / Intervention",
    "Scenario Planning",
    "Profile"
  ];

  if (!isMounted || !currentUser || currentUser.role !== "workforce") {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-slate-100 flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-slate-700 border-t-purple-400 rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">
            Loading Workforce Portal...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white relative overflow-hidden font-sans">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-[30%] right-[-10%] w-[500px] h-[500px] bg-violet-500/10 blur-[130px] rounded-full pointer-events-none" />

      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-16 relative z-10 space-y-6">
        
        {/* ROLE APPLICATION SHELL HEADER & NAVIGATION */}
        <div className="bg-[#111827] border border-[#1E2638] rounded-2xl p-4 sm:p-6 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1E2638] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 font-bold">
                <Globe size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded">
                    WORKFORCE APPLICATION SHELL
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
                {displayName} (<strong className="text-cyan-400">Workforce</strong>)
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

          {/* Workforce Nav Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono no-scrollbar">
            {workforceNavTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-2 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab
                    ? "bg-cyan-500 text-slate-950 shadow-md"
                    : "bg-[#161E2E] text-slate-400 hover:text-white border border-[#1E2638]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        
        {/* Synthetic Data Mode Disclaimer Banner */}
        <div className="mb-6 px-4 py-2.5 rounded-2xl bg-blue-950/20 border border-blue-500/30 flex items-center justify-between text-xs text-blue-300">
          <div className="flex items-center gap-2">
            <Info size={16} className="shrink-0" />
            <span><strong>Data Mode: Prototype / Synthetic Regional Model</strong> — Regional workforce indicators represent synthetic intelligence modeling.</span>
          </div>
          <span className="font-mono text-[10px] bg-blue-500/20 px-2 py-0.5 rounded text-blue-200">SYNTHETIC V1.0</span>
        </div>

        {/* Header */}
        <div className="mb-10 lg:flex lg:justify-between lg:items-end gap-6 border-b border-white/10 pb-8">
          <div>
            <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
              <Globe size={16} /> Geographic Workforce Intelligence
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mb-3">
              Regional <span className="text-blue-400">Skill Intelligence</span>
            </h1>
            <p className="text-white/70 text-base sm:text-lg max-w-3xl leading-relaxed">
              Understand where workforce capabilities are growing, where shortages are emerging, and where intervention can create the greatest impact.
            </p>
          </div>

          <div className="mt-4 lg:mt-0 flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsCompareOpen(true)}
              className="text-xs bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-500/40 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all"
            >
              <GitCompare size={16} /> Compare Regions ({compareRegionIds.length})
            </button>
          </div>
        </div>

        {/* Search & Discovery Bar */}
        <div className="glass p-5 rounded-2xl border border-white/10 mb-8 space-y-4 shadow-lg">
          <div className="flex flex-col md:flex-row gap-3 items-center">
            
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
              <input
                type="text"
                placeholder="Search region name, country, state, or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#12131c] border border-white/15 rounded-xl pl-11 pr-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/60 transition-all placeholder:text-white/40"
              />
            </div>

            {/* Sort Select */}
            <div className="w-full md:w-56 shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-[#12131c] border border-white/15 rounded-xl px-4 py-3 text-white text-xs font-semibold focus:outline-none focus:border-blue-500/60 cursor-pointer"
              >
                <option value="bestAlignment">Sort: Highest Alignment</option>
                <option value="highestRisk">Sort: Highest Future Risk</option>
                <option value="largestWorkforce">Sort: Largest Workforce</option>
                <option value="highestShortages">Sort: Highest Shortages</option>
              </select>
            </div>
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-white/5 text-xs">
            <div className="flex items-center gap-1.5 text-white/50 font-bold uppercase tracking-wider mr-2">
              <Filter size={14} /> Filters:
            </div>

            {/* Country Filter */}
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-white/80 hover:text-white focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#12131c]">Country: All</option>
              {COUNTRIES.filter(c => c !== "ALL").map(c => (
                <option key={c} value={c} className="bg-[#12131c]">{c}</option>
              ))}
            </select>

            {/* Risk Level Filter */}
            <select
              value={selectedRiskLevel}
              onChange={(e) => setSelectedRiskLevel(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-white/80 hover:text-white focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#12131c]">Future Risk: All</option>
              {RISK_LEVELS.filter(r => r !== "ALL").map(r => (
                <option key={r} value={r} className="bg-[#12131c]">{r}</option>
              ))}
            </select>

            {/* Skill-Centric Filter */}
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-white/80 hover:text-white focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-[#12131c]">Skill Filter: None</option>
              {SKILLS_DATA.map(s => (
                <option key={s.id} value={s.id} className="bg-[#12131c]">{s.name}</option>
              ))}
            </select>

            <button onClick={resetFilters} className="ml-auto text-white/40 hover:text-white flex items-center gap-1 text-xs">
              <RefreshCw size={12} /> Reset
            </button>
          </div>
        </div>

        {/* Skill-Centric Regional Landscape Breakdown (If Skill Filter Active) */}
        {skillLandscape && (
          <div className="glass rounded-3xl p-6 border border-blue-500/30 mb-8 bg-blue-950/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
                <Target size={16} /> Regional Landscape for: {skillLandscape.skillName}
              </h3>
              <button onClick={() => setSelectedSkill("")} className="text-xs text-white/40 hover:text-white">Clear Skill View</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mb-4">
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <span className="text-white/40 block text-[10px]">Highest Capability Region</span>
                <strong className="text-emerald-400">{skillLandscape.strongestRegion?.regionName} ({skillLandscape.strongestRegion?.availableCapability}%)</strong>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <span className="text-white/40 block text-[10px]">Biggest Regional Shortage</span>
                <strong className="text-amber-400">{skillLandscape.biggestShortageRegion?.regionName} (Gap: {skillLandscape.biggestShortageRegion?.rawGap} pts)</strong>
              </div>
            </div>
          </div>
        )}

        {/* Results Counter */}
        <div className="mb-6 flex items-center justify-between text-xs text-white/60">
          <span>Showing <strong>{regions.length}</strong> Regional Skill Profiles</span>
          <span>Sorted by: <strong className="text-blue-400">{sortBy}</strong></span>
        </div>

        {/* Region Cards Grid */}
        {regions.length === 0 ? (
          <div className="glass rounded-3xl p-12 text-center border border-white/10">
            <AlertTriangle className="mx-auto text-white/40 mb-3" size={40} />
            <h3 className="text-lg font-bold text-white mb-1">No Regions Found</h3>
            <p className="text-white/60 text-xs mb-4">Try adjusting your search terms or resetting filters.</p>
            <button onClick={resetFilters} className="bg-white/10 hover:bg-white/20 text-white text-xs px-4 py-2 rounded-xl font-bold">Reset Filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {regions.map((reg) => {
              const { alignment, futureRisks, topShortage } = reg;
              const isSelectedForCompare = compareRegionIds.includes(reg.id);
              return (
                <div 
                  key={reg.id}
                  className="glass rounded-3xl p-6 border border-white/10 hover:border-blue-500/40 transition-all flex flex-col justify-between group bg-gradient-to-br from-black/40 via-black/20 to-blue-950/10 shadow-lg"
                >
                  <div>
                    {/* Header Country & Risk Badge */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <span className="text-[11px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1">
                          <MapPin size={12} /> {reg.country} • {reg.stateOrProvince}
                        </span>
                        <span className="text-[10px] text-white/40">Est. Workforce: {reg.workforceSize}</span>
                      </div>

                      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                        futureRisks.riskLevel === 'CRITICAL' ? 'bg-red-500/20 text-red-300 border-red-500/40' :
                        futureRisks.riskLevel === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                        'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      }`}>
                        Risk: {futureRisks.riskLevel}
                      </span>
                    </div>

                    {/* Region Name */}
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-300 transition-colors leading-snug">
                      {reg.name}
                    </h3>

                    {/* Alignment Matrix Badge Bar */}
                    <div className="grid grid-cols-2 gap-2 my-3 p-3 rounded-2xl bg-white/5 border border-white/5 text-xs">
                      <div>
                        <span className="text-[10px] text-white/40 uppercase block font-bold">Regional Alignment</span>
                        <strong className="text-white font-mono text-sm">{alignment.alignmentScore}/100</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-white/40 uppercase block font-bold">Workforce Capability</span>
                        <strong className="text-blue-300 font-mono text-sm">{alignment.workforceCapability}%</strong>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-white/70 line-clamp-2 mb-4 leading-relaxed">
                      {reg.description}
                    </p>

                    {/* Top Shortage Callout */}
                    {topShortage && (
                      <div className="mb-4 p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs">
                        <span className="text-[10px] text-amber-400 uppercase font-bold block">Primary Skill Shortage</span>
                        <span className="font-bold text-white">{topShortage.skillName}</span> (Gap: {topShortage.rawGap} pts)
                      </div>
                    )}
                  </div>

                  {/* Footer Actions */}
                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <button
                      onClick={() => {
                        if (isSelectedForCompare) {
                          setCompareRegionIds(compareRegionIds.filter(id => id !== reg.id));
                        } else if (compareRegionIds.length < 3) {
                          setCompareRegionIds([...compareRegionIds, reg.id]);
                        }
                      }}
                      className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-all ${
                        isSelectedForCompare ? 'bg-blue-600 text-white border-blue-400' : 'bg-white/5 text-white/60 hover:text-white border-white/10'
                      }`}
                    >
                      {isSelectedForCompare ? 'Selected' : '+ Compare'}
                    </button>

                    <Link 
                      href={`/regional-intelligence/${reg.id}`}
                      className="text-xs bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-500/40 px-4 py-2 rounded-xl font-bold flex items-center gap-1 transition-all"
                    >
                      Regional Profile <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* Cross-Region Comparator Modal Drawer */}
      {isCompareOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass max-w-4xl w-full rounded-3xl p-6 border border-blue-500/30 bg-[#0d0e17] text-white shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <GitCompare className="text-blue-400" size={20} /> Cross-Region Intelligence Comparison
              </h3>
              <button onClick={() => setIsCompareOpen(false)} className="p-1 text-white/40 hover:text-white"><X size={20} /></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {comparisonData.map(c => (
                <div key={c.regionId} className="bg-white/5 p-4 rounded-2xl border border-white/10 text-xs">
                  <span className="text-[10px] text-blue-400 font-bold uppercase">{c.country}</span>
                  <h4 className="text-base font-bold text-white mb-2">{c.name}</h4>
                  
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between p-2 rounded bg-black/40">
                      <span className="text-white/60">Alignment Score:</span>
                      <strong className="text-white">{c.alignmentScore}/100</strong>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-black/40">
                      <span className="text-white/60">Workforce Capability:</span>
                      <strong className="text-blue-300">{c.workforceCapability}%</strong>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-black/40">
                      <span className="text-white/60">Future Risk:</span>
                      <strong className="text-amber-400">{c.riskLevel}</strong>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-black/40">
                      <span className="text-white/60">Primary Shortage:</span>
                      <strong className="text-red-300">{c.topShortage}</strong>
                    </div>
                  </div>

                  <Link href={`/regional-intelligence/${c.regionId}`} className="text-xs text-blue-400 font-bold hover:underline">
                    View Full Profile →
                  </Link>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-white/10">
              <button onClick={() => setIsCompareOpen(false)} className="text-xs bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-2 rounded-xl">Close</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
