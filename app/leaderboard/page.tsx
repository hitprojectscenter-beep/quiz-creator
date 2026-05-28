import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import Navbar from "@/components/Navbar";
import { Trophy, Medal, Crown, Flame } from "lucide-react";
import { calculateLevel } from "@/lib/utils";

export default async function LeaderboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: leaders } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url, xp, streak_days, total_tests_taken, total_tests_created")
    .order("xp", { ascending: false })
    .limit(50);

  const myRank = leaders ? leaders.findIndex((l) => l.id === user.id) + 1 : 0;

  return (
    <div className="min-h-screen">
      <Navbar profile={profile} />

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white mb-4 shadow-xl">
            <Trophy className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-bold gradient-text">לוח המובילים</h1>
          <p className="text-slate-600 mt-2">ראה איפה אתה עומד מול שאר הלומדים</p>
          {myRank > 0 && (
            <div className="inline-block mt-4 px-6 py-2 rounded-full bg-primary-100 text-primary-700 font-medium">
              המקום שלך: #{myRank}
            </div>
          )}
        </div>

        {/* Top 3 podium */}
        {leaders && leaders.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-8 items-end">
            <PodiumCard rank={2} user={leaders[1]} />
            <PodiumCard rank={1} user={leaders[0]} tall />
            <PodiumCard rank={3} user={leaders[2]} />
          </div>
        )}

        {/* Full list */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">דירוג מלא</h2>
          <div className="space-y-2">
            {leaders?.map((l, i) => {
              const rank = i + 1;
              const isMe = l.id === user.id;
              return (
                <div
                  key={l.id}
                  className={`flex items-center gap-4 p-3 rounded-xl ${
                    isMe
                      ? "bg-gradient-to-r from-primary-50 to-pink-50 border-2 border-primary-300"
                      : rank <= 3
                      ? "bg-amber-50"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <div className="w-10 text-center font-bold text-lg">
                    {rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-pink-500 text-white flex items-center justify-center font-bold">
                    {l.full_name?.charAt(0) || "U"}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">
                      {l.full_name || l.username}
                      {isMe && <span className="text-xs text-primary-600 mr-2">(אני)</span>}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-3">
                      <span>רמה {calculateLevel(l.xp || 0)}</span>
                      {(l.streak_days || 0) > 0 && (
                        <span className="flex items-center gap-1">
                          <Flame className="w-3 h-3 text-orange-500" />
                          {l.streak_days}
                        </span>
                      )}
                      <span>{l.total_tests_taken || 0} מבחנים</span>
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="text-lg font-bold gradient-text">{(l.xp || 0).toLocaleString()}</div>
                    <div className="text-xs text-slate-500">XP</div>
                  </div>
                </div>
              );
            })}
            {(!leaders || leaders.length === 0) && (
              <p className="text-center text-slate-500 py-8">עוד אין משתמשים</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function PodiumCard({ rank, user, tall }: any) {
  const icons = { 1: <Crown className="w-6 h-6" />, 2: <Medal className="w-6 h-6" />, 3: <Medal className="w-6 h-6" /> };
  const colors = {
    1: "from-amber-400 to-yellow-500",
    2: "from-slate-300 to-slate-400",
    3: "from-orange-400 to-amber-600",
  };
  return (
    <div className={`text-center ${tall ? "" : "mt-8"}`}>
      <div
        className={`mx-auto w-16 h-16 rounded-full bg-gradient-to-br ${(colors as any)[rank]} text-white flex items-center justify-center font-bold text-2xl mb-2 shadow-xl`}
      >
        {user.full_name?.charAt(0) || "?"}
      </div>
      <div className="font-bold truncate">{user.full_name}</div>
      <div className="text-sm text-slate-500">{(user.xp || 0).toLocaleString()} XP</div>
      <div className={`mt-2 rounded-t-xl bg-gradient-to-br ${(colors as any)[rank]} text-white p-3 ${tall ? "py-6" : "py-3"}`}>
        <div className="flex items-center justify-center">{(icons as any)[rank]}</div>
        <div className="text-2xl font-bold mt-1">#{rank}</div>
      </div>
    </div>
  );
}
