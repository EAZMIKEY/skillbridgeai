"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Code2, Target, CheckCircle2, ChevronRight, LayoutList } from "lucide-react";
import Link from "next/link";

const MISSIONS = [
  {
    id: "M-401",
    title: "Build an Intelligent Customer-Support API",
    description: "Build a production-ready Node.js API that uses AI to classify customer support tickets. Deploy it to a cloud provider using Docker.",
    company: "Meta",
    skills: ["Cloud Deployment", "Docker", "Node.js", "AI APIs"],
    status: "Recommended",
    gapResolved: "Cloud Deployment",
    level: "Intermediate",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "M-203",
    title: "SQL Data Transformation Engine",
    description: "Write complex SQL queries to clean, transform, and aggregate dirty e-commerce data into analytical views.",
    company: "Stripe",
    skills: ["SQL", "Data Modeling", "Analytics"],
    status: "Open",
    gapResolved: "SQL Advanced",
    level: "Beginner",
    color: "from-emerald-500 to-teal-500",
  },
  {
    id: "M-512",
    title: "RAG Document Q&A System",
    description: "Implement a Retrieval-Augmented Generation system using Vector Databases to answer questions from local PDF files.",
    company: "OpenAI",
    skills: ["GenAI", "Python", "Vector DB"],
    status: "Recommended",
    gapResolved: "GenAI (LLMs/RAG)",
    level: "Advanced",
    color: "from-violet-500 to-purple-500",
  },
];

export default function MissionsPage() {
  const [activeTab, setActiveTab] = useState("All");

  const filteredMissions = activeTab === "All" ? MISSIONS : MISSIONS.filter(m => m.status === activeTab);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 pt-32 pb-20">
        <div className="mb-10 text-center">
          <p className="text-violet-400 text-sm font-semibold uppercase tracking-widest mb-3">
            Practical Skill Development
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Skill <span className="gradient-text">Missions</span>
          </h1>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            Learning should not stop at watching courses. Solve realistic problems, submit evidence, and close your capability gaps.
          </p>
        </div>

        <div className="flex justify-center flex-wrap gap-3 mb-10">
          {["All", "Recommended", "Open", "Completed"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === tab 
                  ? "bg-violet-600/20 text-violet-400 border border-violet-500/50" 
                  : "bg-white/5 text-white/60 border border-white/5 hover:border-white/20 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredMissions.map((mission) => (
            <div key={mission.id} className="glass rounded-2xl p-6 hover:border-white/10 transition-all border border-white/5 group">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold text-white/40">{mission.id}</span>
                    {mission.status === "Recommended" && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-400 uppercase tracking-wider">
                        Targets Your Skill Gap
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{mission.title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed mb-4 max-w-3xl">
                    {mission.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {mission.skills.map((s) => (
                      <span key={s} className="px-2 py-1 rounded bg-white/5 text-white/70 text-xs border border-white/5">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="md:w-64 pt-2 md:border-l md:border-white/5 md:pl-6 flex flex-col justify-between shrink-0">
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-white/40 font-semibold mb-2">Verification Outcome</h4>
                    <div className="flex items-start gap-2 mb-4">
                      <Target size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                      <p className="text-sm text-emerald-400 font-medium">Closes <span className="font-bold underline">{mission.gapResolved}</span> gap</p>
                    </div>
                  </div>
                  
                  <button className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-medium text-sm hover:bg-white/10 transition-colors flex justify-center items-center gap-2 group-hover:border-violet-500/30 group-hover:text-violet-300">
                    Start Mission <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {filteredMissions.length === 0 && (
            <div className="text-center py-20">
               <LayoutList size={40} className="text-white/20 mx-auto mb-4" />
               <p className="text-white/50">No missions found in this category.</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
