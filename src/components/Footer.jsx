import Link from "next/link";
import { Code2, Github, Twitter, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-[#1E2638] mt-20 py-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="text-sm font-bold text-white">SKILLBRIDGE AI</div>
            <div className="text-[11px] text-[#94A3B8]">WORKFORCE INTELLIGENCE SYSTEM</div>
          </div>

          <div className="flex gap-6 text-sm text-[#94A3B8]">
            <Link href="/profile" className="hover:text-white">Student</Link>
            <Link href="/company-dashboard" className="hover:text-white">Industry</Link>
            <Link href="/regional-intelligence" className="hover:text-white">Workforce</Link>
            <Link href="/explore" className="hover:text-white">Explore</Link>
            <Link href="/skill-graph" className="hover:text-white">Skill Graph</Link>
            <Link href="/regional-intelligence" className="hover:text-white">Regional Intelligence</Link>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#1E2638] text-sm text-white/30 flex items-center justify-between">
          <div>© 2026 SkillBridge AI. All rights reserved.</div>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white/60">Privacy</Link>
            <Link href="/terms" className="hover:text-white/60">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
