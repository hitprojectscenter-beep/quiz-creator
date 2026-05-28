import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { generateQuestions, generateTestTitle } from "@/lib/anthropic";
import { generateShareCode } from "@/lib/utils";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "לא מאומת" }, { status: 401 });
    }

    const { content, additionalContext, numQuestions, difficulty, timeLimit } = await request.json();

    if (!content || numQuestions < 1) {
      return NextResponse.json({ error: "פרמטרים חסרים" }, { status: 400 });
    }

    // Generate title and questions in parallel
    const [titleData, questions] = await Promise.all([
      generateTestTitle(content),
      generateQuestions(content, numQuestions, difficulty, additionalContext),
    ]);

    // Create test record
    const { data: test, error: testError } = await supabase
      .from("tests")
      .insert({
        creator_id: user.id,
        title: titleData.title,
        description: titleData.description,
        difficulty,
        time_limit_minutes: timeLimit > 0 ? timeLimit : null,
        is_public: true,
        share_code: generateShareCode(),
        total_questions: questions.length,
        source_summary: content.slice(0, 500),
      })
      .select()
      .single();

    if (testError) throw testError;

    // Insert questions
    const questionsToInsert = questions.map((q, i) => ({
      test_id: test.id,
      question_text: q.question,
      options: q.options,
      correct_option: q.correct,
      explanation: q.explanation,
      difficulty: q.difficulty || difficulty,
      topic: q.topic,
      question_order: i + 1,
    }));

    const { error: qError } = await supabase.from("questions").insert(questionsToInsert);
    if (qError) throw qError;

    // Update creator stats + grant XP
    const xpReward = 30 + (numQuestions * 2);
    const { data: profile } = await supabase
      .from("profiles")
      .select("xp, total_tests_created")
      .eq("id", user.id)
      .single();

    await supabase
      .from("profiles")
      .update({
        xp: (profile?.xp || 0) + xpReward,
        total_tests_created: (profile?.total_tests_created || 0) + 1,
      })
      .eq("id", user.id);

    // Check for badges
    await checkAndGrantBadges(supabase, user.id);

    return NextResponse.json({ testId: test.id, shareCode: test.share_code });
  } catch (err: any) {
    console.error("Generate test error:", err);
    return NextResponse.json({ error: err.message || "שגיאה ביצירת המבחן" }, { status: 500 });
  }
}

async function checkAndGrantBadges(supabase: any, userId: string) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (!profile) return;

  const { data: badges } = await supabase.from("badges").select("*");
  if (!badges) return;

  const { data: earned } = await supabase
    .from("user_badges")
    .select("badge_id")
    .eq("user_id", userId);
  const earnedIds = new Set((earned || []).map((b: any) => b.badge_id));

  for (const badge of badges) {
    if (earnedIds.has(badge.id)) continue;

    let qualifies = false;
    switch (badge.requirement_type) {
      case "tests_created":
        qualifies = profile.total_tests_created >= badge.requirement_value;
        break;
      case "tests_taken":
        qualifies = profile.total_tests_taken >= badge.requirement_value;
        break;
      case "xp":
        qualifies = profile.xp >= badge.requirement_value;
        break;
      case "streak":
        qualifies = profile.streak_days >= badge.requirement_value;
        break;
    }

    if (qualifies) {
      await supabase.from("user_badges").insert({ user_id: userId, badge_id: badge.id });
      await supabase
        .from("profiles")
        .update({ xp: profile.xp + badge.xp_reward })
        .eq("id", userId);
    }
  }
}
