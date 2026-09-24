"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, Code2, Building2, User } from "lucide-react";
import { handleLensNavigation, clearStoredUser, getStoredUser } from "@/lib/auth/userSession";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const router = useRouter();

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const stored = getStoredUser();
        if (stored) {
          const username = stored.username || (stored.email ? stored.email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "") : "user");
          setUser({ ...stored, username });
        }
        const companyStored = localStorage.getItem("innoverse_company");
        if (companyStored) {
          setCompany(JSON.parse(companyStored));
        }
      } catch {
        // Ignore storage errors
      }
    });
  }, []);

  const handleLogout = () => {
    clearStoredUser();
    setUser(null);
    setCompany(null);
    router.push("/get-started");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-white/5 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-[#111827] border border-[#1E2638] flex items-center justify-center">
              <Code2 size={14} className="text-[#06B6D4]" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-bold text-white">SKILLBRIDGE AI</div>
              <div className="text-[10px] text-[#94A3B8] tracking-widest">WORKFORCE INTELLIGENCE</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6 text-xs font-mono">
            <button 
              onClick={() => handleLensNavigation("student", router)}
              className="text-white/60 hover:text-white font-medium transition-colors cursor-pointer uppercase"
            >
              STUDENT
            </button>
            <button 
              onClick={() => handleLensNavigation("industry", router)}
              className="text-white/60 hover:text-white font-medium transition-colors cursor-pointer uppercase"
            >
              INDUSTRY
            </button>
            <button 
              onClick={() => handleLensNavigation("workforce", router)}
              className="text-white/60 hover:text-white font-medium transition-colors cursor-pointer uppercase"
            >
              WORKFORCE
            </button>
            <Link href="/product" className="text-white/60 hover:text-white font-medium transition-colors uppercase">
              PRODUCT
            </Link>
            <Link href="/explore" className="text-white/60 hover:text-white font-medium transition-colors uppercase">
              EXPLORE
            </Link>
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            {/* Right-side CTAs: Single Get Started Entry */}
            {!user && !company && (
              <Link href="/get-started" className="px-4 py-2 bg-[#06B6D4] hover:bg-[#06B6D4]/90 text-black font-mono font-bold rounded-lg text-xs transition-all shadow-md uppercase tracking-wider">
                GET STARTED
              </Link>
            )}
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-slate-300">
                  {user.name || user.username} (<strong className="text-cyan-400 capitalize">{user.role || 'student'}</strong>)
                </span>
                <button 
                  onClick={handleLogout} 
                  className="px-3.5 py-1.5 rounded-lg glass border border-white/10 text-white/70 hover:text-white text-xs font-mono transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : null}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden p-2 text-white/60 hover:text-white" onClick={() => setOpen(!open)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-white/5 bg-[#0a0a0f]/95 backdrop-blur-md">
          <div className="px-4 py-4 flex flex-col gap-3">
            <button 
              onClick={() => { handleLensNavigation("student", router); setOpen(false); }}
              className="text-left text-white/70 hover:text-white font-medium py-1 text-sm font-mono uppercase"
            >
              STUDENT
            </button>
            <button 
              onClick={() => { handleLensNavigation("industry", router); setOpen(false); }}
              className="text-left text-white/70 hover:text-white font-medium py-1 text-sm font-mono uppercase"
            >
              INDUSTRY
            </button>
            <button 
              onClick={() => { handleLensNavigation("workforce", router); setOpen(false); }}
              className="text-left text-white/70 hover:text-white font-medium py-1 text-sm font-mono uppercase"
            >
              WORKFORCE
            </button>
            <Link href="/product" className="text-white/70 hover:text-white font-medium py-1 text-sm font-mono uppercase" onClick={() => setOpen(false)}>
              PRODUCT
            </Link>
            <Link href="/explore" className="text-white/70 hover:text-white font-medium py-1 text-sm font-mono uppercase" onClick={() => setOpen(false)}>
              EXPLORE
            </Link>
            <hr className="border-white/5" />
            {user || company ? (
              <button onClick={() => { handleLogout(); setOpen(false); }} className="text-left text-rose-400 font-medium py-1 text-sm font-mono">
                Sign Out
              </button>
            ) : (
              <Link href="/get-started" className="w-full text-center px-4 py-2 bg-[#06B6D4] text-black font-mono font-bold rounded-lg text-sm uppercase tracking-wider" onClick={() => setOpen(false)}>
                GET STARTED
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
