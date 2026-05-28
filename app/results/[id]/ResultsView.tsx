"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, XCircle, Sparkles, Trophy, RefreshCw, Share2, ChevronLeft, BookOpen, Zap } from "lucide-react";
import { formatDuration } from "@/lib/utils";

export default function ResultsView({ attempt }: { attempt: any }) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [resultData, setResultData] = useState<any>(null);
  const percentage = Number(attempt.percentage);
  const test = attempt.tests;
  const questions = test.questions.sort((a: any, b: any) => a.question_order - b.question_order);

  useEffect(() => {
    if (percentage >= 80) setShowConfetti(true);
    const stored = sessionStorage.getItem(`result-${attempt.id}`);
    if (stored) setResultData(JSON.parse(stored));
  }, [attempt.id, percentage]);

  const getGrade = () => {
    if (percentage === 100) return { label: "מושלם! 🎉", color: "from-amber-400 to-orange-500", message: "ביצוע יוצא מן הכלל!" };
    if (percentage >= 90) return { label: "מצוין", color: "from-emerald-500 to-teal-500", message: "כל הכבוד!" };
    if (percentage >= 80) return { label: "טוב מאוד", color: "from-blue-500 to-cyan-500", message: "עבודה יפה!" };
    if (percentage >= 70) return { label: "טוב", color: "from-primary-500 to-violet-500", message: "המשך להתאמן!" };
    if (percentage >= 60) return { label: "מספיק", color: "from-yellow-500 to-amber-500", message: "יש מקום לשיפור" };
    return { label: "טעון שיפור", color: "from-red-500 to-pink-500", message: "אל תוותר - נסה שוב!" };
  };

  const grade = getGrade();

  return (
    <div className="min-h-screen relative">
      {/* Confetti */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="confetti-piece"
              style={
                {
                  "--x": `${(Math.random() - 0.5) * 1000}px`,
                  "--y": `${(Math.random() - 0.5) * 1000}px`,
                  "--color": ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"][i % 5],
                  animationDelay: `${Math.random() * 0.5}s`,
                } as any
              }
            />
          ))}
        </div>
      )}

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Hero result */}
        <div className={`card text-center bg-gradient-to-br ${grade.color} text-white mb-6 animate-slide-up`}>
          <div className="text-6xl mb-2">{percentage === 100 ? "🏆" : percentage >= 80 ? "🎉" : percentage >= 60 ? "👍" : "💪"}</div>
          <h1 className="text-3xl font-bold mb-1">{grade.label}</h1>
          <p className="text-xl opacity-90 mb-6">{grade.message}</p>
          <div className="text-7xl font-bold mb-2">{Math.round(percentage)}%</div>
          <p className="text-xl">
            ענית נכון על <strong>{attempt.score}</strong> מתוך <strong>{attempt.total_questions}</strong> שאלות
          </p>
        </div>

        {/* XP & Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="card text-center">
            <Zap className="w-8 h-8 mx-auto text-amber-500 mb-2" />
            <div className="text-3xl font-bold gradient-text">+{attempt.xp_earned}</div>
            <div className="text-sm text-slate-500">XP שצברת</div>
          </div>
          <div className="card text-center">
            <Trophy className="w-8 h-8 mx-auto text-violet-500 mb-2" />
            <div className="text-3xl font-bold">{attempt.score}/{attempt.total_questions}</div>
            <div className="text-sm text-slate-500">תשובות נכונות</div>
          </div>
          <div className="card text-center">
            <BookOpen className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
            <div className="text-3xl font-bold">{formatDuration(attempt.duration_seconds || 0)}</div>
            <div className="text-sm text-slate-500">משך זמן</div>
          </div>
        </div>

        {/* New badges */}
        {resultData?.newBadges && resultData.newBadges.length > 0 && (
          <div className="card mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 animate-pulse-glow">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              זכית בתגים חדשים!
            </h3>
            <div className="flex flex-wrap gap-3">
              {resultData.newBadges.map((b: any) => (
                <div key={b.id} className="bg-white rounded-xl p-3 flex items-center gap-2 shadow-sm">
                  <div className="text-3xl">{b.icon}</div>
                  <div>
                    <div className="font-bold">{b.name}</div>
                    <div className="text-xs text-slate-500">+{b.xp_reward} XP</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detailed review */}
        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            סקירת תשובות
          </h2>
          <div className="space-y-4">
            {questions.map((q: any, i: number) => {
              const userAnswer = attempt.answers[q.id];
              const correct = userAnswer === q.correct_option;
              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-xl border-2 ${
                    correct ? "border-emerald-200 bg-emerald-50/50" : "border-red-200 bg-red-50/50"
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        correct ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                      }`}
                    >
                      {correct ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-slate-500 mb-1">שאלה {i + 1} · {q.topic}</div>
                      <div className="font-medium">{q.question_text}</div>
                    </div>
                  </div>

                  <div className="space-y-2 mr-11">
                    {q.options.map((opt: any) => {
                      const isUserAnswer = userAnswer === opt.key;
                      const isCorrect = opt.key === q.correct_option;
                      return (
                        <div
                          key={opt.key}
                          className={`p-2 rounded-lg text-sm flex items-center gap-2 ${
                            isCorrect
                              ? "bg-emerald-100 text-emerald-800 font-medium"
                              : isUserAnswer
                              ? "bg-red-100 text-red-800"
                              : "bg-white text-slate-600"
                          }`}
                        >
                          <span className="font-bold w-6">{opt.key}.</span>
                          <span className="flex-1">{opt.text}</span>
                          {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                          {isUserAnswer && !isCorrect && <XCircle className="w-4 h-4 text-red-600" />}
                        </div>
                      );
                    })}
                  </div>

                  {q.explanation && (
                    <div className="mt-3 mr-11 p-3 bg-blue-50 rounded-lg text-sm text-blue-900">
                      <strong>💡 הסבר:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="grid md:grid-cols-3 gap-3">
          <Link href="/dashboard" className="btn-secondary">
            <ChevronLeft className="w-4 h-4" />
            לדשבורד
          </Link>
          <Link href={`/test/${test.id}`} className="btn-secondary">
            <RefreshCw className="w-4 h-4" />
            נסה שוב
          </Link>
          <Link href={`/share/${test.id}`} className="btn-primary">
            <Share2 className="w-4 h-4" />
            שתף את המבחן
          </Link>
        </div>
      </main>
    </div>
  );
}
