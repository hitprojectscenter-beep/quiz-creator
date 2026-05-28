"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { Brain, LogOut, Plus, Trophy, User, BarChart3 } from "lucide-react";

export default function Navbar({ profile }: { profile: any }) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 glass border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-pink-500 flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold gradient-text">QuizMaster</span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link href="/dashboard" className="btn-ghost hidden sm:flex">
            <BarChart3 className="w-4 h-4" />
            דשבורד
          </Link>
          <Link href="/leaderboard" className="btn-ghost hidden sm:flex">
            <Trophy className="w-4 h-4" />
            מובילים
          </Link>
          <Link href="/profile" className="btn-ghost">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">{profile?.full_name || "פרופיל"}</span>
          </Link>
          <Link href="/create" className="btn-primary">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">מבחן חדש</span>
          </Link>
          <button onClick={handleLogout} className="btn-ghost text-red-600" title="התנתק">
            <LogOut className="w-4 h-4" />
          </button>
        </nav>
      </div>
    </header>
  );
}
