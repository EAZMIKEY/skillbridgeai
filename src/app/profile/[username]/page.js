"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import StudentApplicationShell from "@/app/student/StudentApplicationShell";

function ProfileRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tab = searchParams?.get("tab");
    if (tab && tab !== "overview") {
      router.replace(`/student/${tab}`);
    } else {
      router.replace("/student");
    }
  }, [router, searchParams]);

  return <StudentApplicationShell />;
}

export default function ProfileUsernamePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0f] text-slate-100 flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-slate-700 border-t-emerald-400 rounded-full animate-spin mx-auto" />
        </div>
      </div>
    }>
      <ProfileRedirectContent />
    </Suspense>
  );
}
