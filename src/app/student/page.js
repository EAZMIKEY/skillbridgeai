"use client";

import { Suspense } from "react";
import StudentApplicationShell from "./StudentApplicationShell";

export default function StudentOverviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0f] text-slate-100 flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-slate-700 border-t-emerald-400 rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">
            Loading Student Portal...
          </p>
        </div>
      </div>
    }>
      <StudentApplicationShell />
    </Suspense>
  );
}
