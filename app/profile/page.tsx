import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import Navbar from "@/components/Navbar";
import XPBar from "@/components/XPBar";
import { Trophy, Flame, BookOpen, Target, Award, TrendingUp } from "lucide-react";

export default async function ProfilePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: allBadges } = await supabase.from("badges").select("*").order("requirement_value");
  const { data: earnedBadges } = await supabase
    .from("user_badges")
    .select("badge_id")
    .eq("user_id", user.id);
  const earnedSet = new Set((earnedBadges || []).map((b) => b.badge_id));

  const { data: attempts } = await supabase
    .from("attempts")
    .select("*, tests(title)")
    .eq("user_id", user.id)
    .order("completed_at", { ascending: false })
    .limit(20);

  const avgScore =
    attempts && attempts.length > 0
      ? attempts.reduce((s, a: any) => s + Number(a.percentage), 0) / attempts.length
      : 0;

  return (
    <div className="min-h-screen">
      <Navbar profile={profile} />

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="card mb-6 bg-gradient-to-br from-primary-600 to-pink-500 text-white">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-white text-primary-600 flex items-center justify-center font-bold text-4xl shadow-xl">
              {profile?.full_name?.charAt(0) || "U"}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{profile?.full_name || "משתמש"}</h1>
              <p className="opacity-90">@{profile?.username}</p>
              <p className="opacity-75 text-sm mt-1">
                חבר מאז {new Date(profile?.created_at).toLocaleDateString("he-IL")}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <XPBar xp={profile?.xp || 0} />
          <StatCard icon={<Flame />} value={profile?.streak_days || 0} label="ימים רצופים" color="from-orange-500 to-red-500" />
          <StatCard icon={<BookOpen />} value={profile?.total_tests_taken || 0} label="מבחנים שעברתי" color="from-emerald-500 to-teal-500" />
          <StatCard icon={<Target />} value={`${Math.round(avgScore)}%`} label="ציון ממוצע" color="from-violet-500 to-purple-500" />
        </div>

        {/* Badges grid */}
        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            התגים שלי ({earnedSet.size}/{allBadges?.length || 0})
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {allBadges?.map((b: any) => {
              const earned = earnedSet.has(b.id);
              return (
                <div
                  key={b.id}
                  className={`text-center p-3 rounded-xl transition-all ${
                    earned
                      ? "bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300"
                      : "bg-slate-50 opacity-40"
                  }`}
                  title={b.description}
                >
                  <div className="text-4xl mb-1">{b.icon}</div>
                  <div className="text-xs font-bold">{b.name}</div>
                  <div className="text-xs text-slate-500 mt-1">{b.description}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent attempts */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            היסטוריית מבחנים
          </h2>
          {!attempts || attempts.length === 0 ? (
            <p className="text-slate-500 text-center py-8">עוד לא ביצעת מבחנים</p>
          ) : (
            <div className="space-y-2">
              {attempts.map((a: any) => (
                <div key={a.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50">
                  <div>
                    <div className="font-medium">{a.tests?.title || "מבחן"}</div>
                    <div className="text-xs text-slate-500">
                      {new Date(a.completed_at).toLocaleDateString("he-IL")} · +{a.xp_earned} XP
                    </div>
                  </div>
                  <div className={`text-2xl font-bold ${a.percentage >= 80 ? "text-emerald-600" : a.percentage >= 60 ? "text-amber-600" : "text-red-600"}`}>
                    {Math.round(a.percentage)}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, value, label, color }: any) {
  return (
    <div className="card">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} text-white flex items-center justify-center mb-2`}>
        {icon}
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-slate-500">{label}</div>
    </div>
  );
}
