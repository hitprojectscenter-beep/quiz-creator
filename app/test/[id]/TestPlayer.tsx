"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Clock, Send, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { formatDuration } from "@/lib/utils";

export default function TestPlayer({ test }: { test: any }) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [timeLeft, setTimeLeft] = useState(
    test.time_limit_minutes ? test.time_limit_minutes * 60 : null
  );

  const question = test.questions[currentIndex];
  const totalQuestions = test.questions.length;
  const answered = Object.keys(answers).length;

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      const e = Math.floor((Date.now() - startTime) / 1000);
      setElapsed(e);
      if (test.time_limit_minutes) {
        const remaining = test.time_limit_minutes * 60 - e;
        setTimeLeft(Math.max(0, remaining));
        if (remaining <= 0) handleSubmit();
      }
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSelect(option: string) {
    setAnswers((prev) => ({ ...prev, [question.id]: option }));
  }

  async function handleSubmit() {
    if (submitting) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/submit-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testId: test.id,
          answers,
          durationSeconds: elapsed,
        }),
      });

      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.error);
      }

      const data = await res.json();
      sessionStorage.setItem(`result-${data.attemptId}`, JSON.stringify(data));
      router.push(`/results/${data.attemptId}`);
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="sticky top-0 z-50 glass border-b border-slate-200/50">
        <div className="max-w-4xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between mb-2">
            <Link href="/dashboard" className="btn-ghost text-sm">
              <ChevronRight className="w-4 h-4" />
              צא
            </Link>
            <div className="text-center">
              <div className="font-bold text-sm">{test.title}</div>
              <div className="text-xs text-slate-500">
                שאלה {currentIndex + 1} מתוך {totalQuestions} · נענו: {answered}
              </div>
            </div>
            <div className="flex items-center gap-2 font-mono">
              <Clock className="w-4 h-4" />
              <span className={timeLeft !== null && timeLeft < 60 ? "text-red-500 font-bold" : ""}>
                {timeLeft !== null ? formatDuration(timeLeft) : formatDuration(elapsed)}
              </span>
            </div>
          </div>
          {/* Progress bar */}
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-pink-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Question */}
        <div className="card mb-6 animate-slide-up" key={question.id}>
          {question.topic && (
            <span className="badge-chip bg-primary-100 text-primary-700 mb-3">
              {question.topic}
            </span>
          )}
          <h2 className="text-xl md:text-2xl font-bold mb-6 leading-relaxed">
            {question.question_text}
          </h2>

          <div className="space-y-3">
            {question.options.map((opt: any) => {
              const isSelected = answers[question.id] === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => handleSelect(opt.key)}
                  className={`w-full text-right p-4 rounded-xl border-2 transition-all hover:scale-[1.01] ${
                    isSelected
                      ? "border-primary-500 bg-primary-50 shadow-lg"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${
                        isSelected
                          ? "bg-primary-500 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {opt.key}
                    </div>
                    <div className="flex-1">{opt.text}</div>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-primary-500" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="card bg-red-50 border-red-200 text-red-700 mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
            className="btn-secondary"
          >
            <ChevronRight className="w-4 h-4" />
            הקודמת
          </button>

          {/* Question dots */}
          <div className="flex flex-wrap gap-1 justify-center max-w-md">
            {test.questions.map((q: any, i: number) => (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(i)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                  i === currentIndex
                    ? "bg-primary-500 text-white scale-110"
                    : answers[q.id]
                    ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {currentIndex < totalQuestions - 1 ? (
            <button
              onClick={() => setCurrentIndex((i) => i + 1)}
              className="btn-primary"
            >
              הבאה
              <ChevronLeft className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting || answered < totalQuestions}
              className="btn-primary bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
              title={answered < totalQuestions ? `נותרו ${totalQuestions - answered} שאלות` : "הגש מבחן"}
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  הגש מבחן
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>

        {answered < totalQuestions && currentIndex === totalQuestions - 1 && (
          <div className="text-center text-sm text-amber-600 mt-4">
            עוד {totalQuestions - answered} שאלות לא נענו
          </div>
        )}
      </main>
    </div>
  );
}
