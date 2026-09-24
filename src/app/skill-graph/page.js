"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Network, ArrowRight, ArrowDown, BookOpen, Layers, Briefcase, ExternalLink, Info } from "lucide-react";
import { getNode, getRoleSkills, getRelatedRoles, getSkillConnections } from "@/lib/skillGraphLogic";
import { ROLES_DATA } from "@/data/skillGraph";
import { SKILLS_DATA } from "@/data/skillModel";

function GraphExplorer() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const initialNodeId = searchParams.get("node") || "r_ai_engineer"; // Default starting point
  const [selectedNode, setSelectedNode] = useState(getNode(initialNodeId) || ROLES_DATA[0]);

  // Handle URL updates without full reload
  useEffect(() => {
    const nodeParam = searchParams.get("node");
    if (nodeParam) {
      const node = getNode(nodeParam);
      if (node) setSelectedNode(node);
    }
  }, [searchParams]);

  // Derived graph data based on selection
  const graphState = useMemo(() => {
    if (!selectedNode) return null;
    
    const isRole = !!selectedNode.type; // ROLES_DATA has 'type: "Role"'
    
    if (isRole) {
      return {
        type: "role",
        center: selectedNode,
        parents: [],
        children: getRoleSkills(selectedNode.id).map(r => ({ ...r, nodeType: "skill" }))
      };
    } else {
      const connections = getSkillConnections(selectedNode.id);
      return {
        type: "skill",
        center: selectedNode,
        parents: getRelatedRoles(selectedNode.id).map(r => ({ ...r, nodeType: "role" }))
          .concat(connections.filter(c => c.direction === "parent").map(c => ({ ...c, nodeType: "skill" }))),
        children: connections.filter(c => c.direction === "child").map(c => ({ ...c, nodeType: "skill" }))
      };
    }
  }, [selectedNode]);

  if (!graphState) return <div>Node not found</div>;

  const handleNodeClick = (node) => {
    router.replace(`/skill-graph?node=${node.id}`, { scroll: false });
  };

  const NodeCard = ({ data, active, explanation }) => {
    const { node, nodeType } = data;
    const isMain = active;
    
    return (
      <div 
        onClick={() => handleNodeClick(node)}
        className={`relative p-4 rounded-xl cursor-pointer transition-all duration-300 border ${
          isMain ? 'bg-violet-600/20 border-violet-500/50 shadow-[0_0_20px_rgba(139,92,246,0.3)] min-w-[200px]' 
          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/30'
        } flex flex-col items-center justify-center text-center`}
      >
        <div className="flex items-center gap-2 mb-1 text-white/50 text-[10px] uppercase font-bold tracking-widest">
          {nodeType === "role" || node.type ? <Briefcase size={12} /> : <Layers size={12} />}
          {nodeType === "role" || node.type ? "Job Role" : "Competency"}
        </div>
        <h3 className={`font-bold ${isMain ? 'text-lg text-white' : 'text-sm text-white/80'}`}>
          {node.name}
        </h3>
        
        {!active && explanation && (
          <div className="group absolute -top-2 -right-2 p-1.5 bg-white/10 rounded-full hover:bg-blue-500 transition-colors">
            <Info size={12} className="text-white/60 group-hover:text-white" />
            <div className="hidden group-hover:block absolute bottom-full pb-2 right-0 w-48 z-50">
              <div className="bg-[#1a1a24] text-xs text-white p-3 rounded-lg border border-white/10 shadow-xl">
                {explanation}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {/* Search Sidebar */}
      <div className="space-y-6">
        <div className="glass p-6 rounded-3xl border border-white/5">
          <h3 className="text-white font-bold mb-4">Start Point</h3>
          <p className="text-white/50 text-xs mb-4">Select a root node to explore its industry connections.</p>
          
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            <h4 className="text-[10px] uppercase text-white/30 font-bold tracking-widest sticky top-0 bg-[#0a0a0f]/80 backdrop-blur pb-2">Roles</h4>
            {ROLES_DATA.map(role => (
              <button 
                key={role.id}
                onClick={() => handleNodeClick(role)}
                className={`w-full text-left px-3 py-2 text-sm rounded-lg border transition-colors ${selectedNode.id === role.id ? 'bg-violet-500/20 border-violet-500/30 text-white' : 'border-transparent text-white/60 hover:bg-white/5'}`}
              >
                {role.name}
              </button>
            ))}
            
            <h4 className="text-[10px] uppercase text-white/30 font-bold tracking-widest mt-6 sticky top-0 bg-[#0a0a0f]/80 backdrop-blur pb-2">Top Skills</h4>
            {SKILLS_DATA.slice(0, 15).map(skill => (
              <button 
                key={skill.id}
                onClick={() => handleNodeClick(skill)}
                className={`w-full text-left px-3 py-2 text-sm rounded-lg border transition-colors ${selectedNode.id === skill.id ? 'bg-blue-500/20 border-blue-500/30 text-white' : 'border-transparent text-white/60 hover:bg-white/5'}`}
              >
                {skill.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Graph Area */}
      <div className="md:col-span-2 glass rounded-3xl pt-8 pb-12 px-4 border border-white/5 relative flex flex-col items-center justify-center min-h-[60vh]">
        
        {/* Link to Detail Page if it's a Skill */}
        {graphState.type === "skill" && (
          <a href={`/explore/${selectedNode.id}`} className="absolute top-6 right-6 flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 border border-white/10 rounded-lg text-xs font-semibold text-white/80 transition-colors">
            Skill Details <ExternalLink size={12} />
          </a>
        )}

        <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-12">
          
          {/* Parents Row */}
          {graphState.parents.length > 0 && (
            <div className="flex flex-wrap justify-center gap-6 w-full relative">
              {graphState.parents.map((rel, idx) => (
                <div key={rel.node.id || idx} className="relative flex flex-col items-center group">
                  <NodeCard data={rel} explanation={rel.explanation} />
                  {/* Connection Line */}
                  <div className="w-px h-8 bg-gradient-to-b from-white/10 to-blue-500/50 mt-4 absolute top-full left-1/2 -translate-x-1/2">
                    <ArrowDown size={14} className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-blue-400" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Center Hub */}
          <div className="relative z-10 my-4 shadow-[0_0_100px_rgba(139,92,246,0.15)] rounded-full">
             <NodeCard data={{ node: selectedNode, nodeType: graphState.type }} active={true} />
          </div>

          {/* Children Row */}
          {graphState.children.length > 0 && (
            <div className="flex flex-wrap justify-center gap-6 w-full relative">
              {graphState.children.map((rel, idx) => (
                <div key={rel.node.id || idx} className="relative flex flex-col items-center group">
                  {/* Connection Line */}
                  <div className="w-px h-8 bg-gradient-to-b from-violet-500/50 to-white/10 mb-4 absolute bottom-full left-1/2 -translate-x-1/2">
                    <ArrowDown size={14} className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-white/30" />
                  </div>
                  <NodeCard data={rel} explanation={rel.explanation} />
                </div>
              ))}
            </div>
          )}
          
          {graphState.children.length === 0 && graphState.parents.length === 0 && (
            <div className="text-white/40 text-sm italic mt-4">
              No direct related competencies mapped.
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}

export default function SkillGraphPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        <div className="mb-10 lg:flex lg:justify-between lg:items-end">
          <div>
            <p className="text-blue-400 text-sm font-semibold uppercase tracking-widest mb-3 flex items-center gap-2">
              <Network size={16} /> Skill Relationship Mapping
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
              Industry Skill <span className="text-blue-400">Graph</span>
            </h1>
            <p className="text-white/50 text-lg max-w-2xl">
              Understand exact relationships between market roles, core prerequisite competencies, and related adjacent skills.
            </p>
          </div>
        </div>
        
        <Suspense fallback={<div className="h-64 flex items-center justify-center text-white/50">Loading visualization...</div>}>
          <GraphExplorer />
        </Suspense>
        
      </div>
      <Footer />
    </div>
  );
}
