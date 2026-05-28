import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import Navbar from "@/components/Navbar";
import XPBar from "@/components/XPBar";
import { Plus, Trophy, Flame, Award, BookOpen, Share2, Play } from "lucide-react";

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: myTests } = await supabase
    .from("tests")
    .select("*")
    .eq("creator_id", user.id)
    .order("created_at", { ascending: false })
    .limit(6);

  const { data: recentAttempts } = await supabase
    .from("attempts")
    .select("*, tests(title)")
    .eq("user_id", user.id)
    .order("completed_at", { ascending: false })
    .limit(5);

  const { data: badges } = await supabase
    .from("user_badges")
    .select("*, badges(*)")
    .eq("user_id", user.id)
    .order("earned_at", { ascending: false })
    .limit(8);

  return (
    <div className="min-h-screen">
      <Navbar profile={profile} />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold">שלום, {profile?.full_name || "לומד"} 👋</h1>
          <p className="text-slate-600 mt-1">מה תרצה ללמוד היום?</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <XPBar xp={profile?.xp || 0} />

          <StatCard
            icon={<Flame className="w-8 h-8" />}
            label="רצף יומי"
            value={`${profile?.streak_days || 0} ימים`}
            color="from-orange-500 to-red-500"
          />

          <StatCard
            icon={<BookOpen className="w-8 h-8" />}
            label="מבחנים שנוצרו"
            value={profile?.total_tests_created || 0}
            color="from-emerald-500 to-teal-500"
          />

          <StatCard
            icon={<Trophy className="w-8 h-8" />}
            label="מבחנים שעברתי"
            value={profile?.total_tests_taken || 0}
            color="from-violet-500 to-purple-500"
          />
        </div>

        {/* Action: Create New */}
        <Link
          href="/create"
          className="block mb-8 bg-gradient-to-r from-primary-600 to-pink-500 text-white rounded-2xl p-8 hover:scale-[1.01] transition-transform shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">צור מבחן חדש</h2>
              <p className="opacity-90">העלה חומר וקבל מבחן תוך שניות</p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <Plus className="w-10 h-10" />
            </div>
          </div>
        </Link>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* My Tests */}
          <div className="lg:col-span-2 card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">המבחנים שלי</h3>
              {myTests && myTests.length > 0 && (
                <Link href="/create" className="text-sm text-primary-600 hover:underline">
                  + חדש
                </Link>
              )}
            </div>

            {!myTests || myTests.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>עדיין לא יצרת מבחנים</p>
                <Link href="/create" className="btn-primary mt-4 inline-flex">
                  צור את המבחן הראשון
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {myTests.map((test: any) => (
                  <div key={test.id} className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100">
                    <div className="flex-1">
                      <div className="font-medium">{test.title}</div>
                      <div className="text-sm text-slate-500">
                        {test.total_questions} שאלות · {test.total_attempts} ניסיונות
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/test/${test.id}`} className="btn-ghost text-sm" title="פתור">
                        <Play className="w-4 h-4" />
                      </Link>
                      <Link href={`/share/${test.id}`} className="btn-ghost text-sm" title="שתף">
                        <Share2 className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity & Badges */}
          <div className="space-y-6">
            {/* Badges */}
            <div className="card">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                התגים שלי
              </h3>
              {!badges || badges.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">
                  עוד אין לך תגים. השלם מבחנים כדי לזכות בתגים!
                </p>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {badges.map((b: any) => (
                    <div
                      key={b.id}
                      className="text-center p-2 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200"
                      title={b.badges.description}
                    >
                      <div className="text-2xl">{b.badges.icon}</div>
                      <div className="text-xs font-medium mt-1 line-clamp-2">{b.badges.name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent attempts */}
            <div className="card">
              <h3 className="text-xl font-bold mb-4">פעילות אחרונה</h3>
              {!recentAttempts || recentAttempts.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">
                  עוד לא ביצעת מבחנים
                </p>
              ) : (
                <div className="space-y-2">
                  {recentAttempts.map((a: any) => (
                    <div key={a.id} className="flex items-center justify-between text-sm">
                      <div className="flex-1 truncate">{a.tests?.title}</div>
                      <div className={`font-bold ${a.percentage >= 80 ? "text-emerald-600" : a.percentage >= 60 ? "text-amber-600" : "text-red-600"}`}>
                        {Math.round(a.percentage)}%
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, color }: any) {
  return (
    <div className="card">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white mb-3`}>
        {icon}
      </div>
      <div className="text-sm text-slate-500">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}
