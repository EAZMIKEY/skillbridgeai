"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser } from "@/lib/auth/userSession";

export default function ProfileRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const user = getStoredUser();
    if (!user) {
      router.replace("/get-started?role=student");
      return;
    }
    const role = user.role || "student";
    if (role !== "student") {
      router.replace(`/get-started?role=student&conflict=true&currentRole=${role}`);
      return;
    }
    router.replace("/student");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-100 flex items-center justify-center font-sans">
      <div className="text-center space-y-4">
        <div className="w-10 h-10 border-2 border-slate-700 border-t-emerald-400 rounded-full animate-spin mx-auto" />
        <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">
          Redirecting to Student Workspace...
        </p>
      </div>
    </div>
  );
}
