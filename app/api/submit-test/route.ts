import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { calculateXP } from "@/lib/utils";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "לא מאומת" }, { status: 401 });
    }

    const { testId, answers, durationSeconds } = await request.json();

    // Fetch test + questions
    const { data: test } = await supabase
      .from("tests")
      .select("*, questions(*)")
      .eq("id", testId)
      .single();

    if (!test) {
      return NextResponse.json({ error: "המבחן לא נמצא" }, { status: 404 });
    }

    // Calculate score
    let score = 0;
    const results: any[] = [];
    for (const q of test.questions) {
      const userAnswer = answers[q.id];
      const correct = userAnswer === q.correct_option;
      if (correct) score++;
      results.push({
        questionId: q.id,
        question: q.question_text,
        userAnswer,
        correctAnswer: q.correct_option,
        correct,
        explanation: q.explanation,
        options: q.options,
      });
    }

    const total = test.questions.length;
    const percentage = (score / total) * 100;
    const xpEarned = calculateXP(score, total, test.difficulty);

    // Insert attempt
    const { data: attempt, error: attemptError } = await supabase
      .from("attempts")
      .insert({
        test_id: testId,
        user_id: user.id,
        answers,
        score,
        total_questions: total,
        percentage,
        duration_seconds: durationSeconds,
        xp_earned: xpEarned,
      })
      .select()
      .single();

    if (attemptError) throw attemptError;

    // Update profile
    const today = new Date().toISOString().split("T")[0];
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    let newStreak = 1;
    if (profile?.last_active_date) {
      const lastDate = new Date(profile.last_active_date);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 0) newStreak = profile.streak_days || 1;
      else if (diffDays === 1) newStreak = (profile.streak_days || 0) + 1;
      else newStreak = 1;
    }

    await supabase
      .from("profiles")
      .update({
        xp: (profile?.xp || 0) + xpEarned,
        total_tests_taken: (profile?.total_tests_taken || 0) + 1,
        total_correct_answers: (profile?.total_correct_answers || 0) + score,
        streak_days: newStreak,
        last_active_date: today,
      })
      .eq("id", user.id);

    // Update test stats
    const { data: stats } = await supabase
      .from("attempts")
      .select("percentage")
      .eq("test_id", testId);
    const avg = stats && stats.length > 0
      ? stats.reduce((s, a: any) => s + a.percentage, 0) / stats.length
      : percentage;

    await supabase
      .from("tests")
      .update({
        total_attempts: stats?.length || 1,
        average_score: avg,
      })
      .eq("id", testId);

    // Check badges
    const newBadges: any[] = [];
    if (percentage === 100) {
      const { data: badges } = await supabase
        .from("badges")
        .select("*")
        .eq("requirement_type", "perfect_score");
      if (badges) {
        const { count: perfectCount } = await supabase
          .from("attempts")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("percentage", 100);
        for (const badge of badges) {
          if ((perfectCount || 0) >= badge.requirement_value) {
            const { error } = await supabase
              .from("user_badges")
              .insert({ user_id: user.id, badge_id: badge.id });
            if (!error) newBadges.push(badge);
          }
        }
      }
    }

    return NextResponse.json({
      attemptId: attempt.id,
      score,
      total,
      percentage,
      xpEarned,
      results,
      newBadges,
      streakDays: newStreak,
    });
  } catch (err: any) {
    console.error("Submit error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
