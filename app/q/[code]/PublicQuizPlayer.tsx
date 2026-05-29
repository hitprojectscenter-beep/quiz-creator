"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Send,
  CheckCircle2,
  XCircle,
  Brain,
  Sparkles,
  RefreshCw,
  Trophy,
  AlertCircle,
} from "lucide-react";
import { formatDuration } from "@/lib/utils";

export default function PublicQuizPlayer({ test }: { test: any }) {
  const [phase, setPhase] = useState<"intro" | "playing" | "results">("intro");
  const [participantName, setParticipantName] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsed, setElapsed] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [results, setResults] = useState<any>(null);

  const totalQuestions = test.questions.length;
  const question = test.questions[currentIndex];
  const answered = Object.keys(answers).length;

  // Timer
  useEffect(() => {
    if (phase !== "playing") return;
    const interval = setInterval(() => {
      const e = Math.floor((Date.now() - startTime) / 1000);
      setElapsed(e);
      if (test.time_limit_minutes) {
        const remaining = test.time_limit_minutes * 60 - e;
        setTimeLeft(Math.max(0, remaining));
        if (remaining <= 0) finishTest();
      }
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, startTime]);

  function startTest() {
    setStartTime(Date.now());
    if (test.time_limit_minutes) setTimeLeft(test.time_limit_minutes * 60);
    setPhase("playing");
  }

  function handleSelect(option: string) {
    setAnswers((prev) => ({ ...prev, [question.id]: option }));
  }

  function finishTest() {
    let score = 0;
    const detailedResults = test.questions.map((q: any) => {
      const userAnswer = answers[q.id];
      const correct = userAnswer === q.correct_option;
      if (correct) score++;
      return {
        question: q.question_text,
        userAnswer,
        correctAnswer: q.correct_option,
        correct,
        explanation: q.explanation,
        options: q.options,
        topic: q.topic,
      };
    });

    const percentage = (score / totalQuestions) * 100;
    setResults({
      score,
      total: totalQuestions,
      percentage,
      duration: elapsed,
      details: detailedResults,
    });
    setPhase("results");
  }

  // === INTRO PHASE ===
  if (phase === "intro") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="card max-w-2xl w-full animate-slide-up">
          {/* Logo + Title - top-left */}
          <div className="flex items-start gap-4 mb-6">
            {test.logo_data ? (
              <div className="flex-shrink-0 w-20 h-20 rounded-xl bg-white border-2 border-slate-200 p-2 flex items-center justify-center">
                <img src={test.logo_data} alt="logo" className="max-w-full max-h-full object-contain" />
              </div>
            ) : (
              <div className="flex-shrink-0 w-20 h-20 rounded-xl bg-gradient-to-br from-primary-500 to-pink-500 flex items-center justify-center">
                <Brain className="w-10 h-10 text-white" />
              </div>
            )}
            <div className="flex-1">
              <div className="text-xs text-primary-600 font-medium mb-1">QuizMaster · מבחן משותף</div>
              <h1 className="text-2xl md:text-3xl font-bold leading-tight">{test.title}</h1>
              {test.description && <p className="text-slate-600 mt-2 text-sm">{test.description}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold gradient-text">{totalQuestions}</div>
              <div className="text-xs text-slate-500">שאלות</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <div className="text-lg font-bold">
                {test.difficulty === "easy" ? "😊 קל" : test.difficulty === "hard" ? "🔥 קשה" : "🤔 בינוני"}
              </div>
              <div className="text-xs text-slate-500">רמה</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold">
                {test.time_limit_minutes ? `${test.time_limit_minutes}'` : "∞"}
              </div>
              <div className="text-xs text-slate-500">דקות</div>
            </div>
          </div>

          <div className="mb-4">
            <label className="text-sm font-medium block mb-2">שמך (אופציונלי)</label>
            <input
              type="text"
              value={participantName}
              onChange={(e) => setParticipantName(e.target.value)}
              placeholder="לדוגמה: דן כהן"
              maxLength={50}
              className="input"
            />
            <p className="text-xs text-slate-500 mt-1">השם יוצג בלוח התוצאות שלך בלבד</p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800 mb-6 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <strong>שים לב:</strong> זהו מבחן משותף. לאחר סיומו תקבל ציון מיידי, אך התוצאות לא יישמרו.
              להוספת XP ותגים, <Link href="/register" className="underline font-medium">הירשם בחינם</Link>.
            </div>
          </div>

          <button
            onClick={startTest}
            className="btn-primary w-full text-lg py-3"
          >
            <Sparkles className="w-5 h-5" />
            התחל מבחן
          </button>
        </div>
      </div>
    );
  }

  // === RESULTS PHASE ===
  if (phase === "results" && results) {
    const grade = getGrade(results.percentage);
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-3xl mx-auto">
          {/* Hero */}
          <div className={`card text-center bg-gradient-to-br ${grade.color} text-white mb-6 animate-slide-up`}>
            {/* Logo top-left */}
            {test.logo_data && (
              <div className="flex justify-start mb-2">
                <div className="w-14 h-14 rounded-lg bg-white/90 p-1.5 flex items-center justify-center">
                  <img src={test.logo_data} alt="logo" className="max-w-full max-h-full object-contain" />
                </div>
              </div>
            )}
            <div className="text-6xl mb-2">
              {results.percentage === 100 ? "🏆" : results.percentage >= 80 ? "🎉" : results.percentage >= 60 ? "👍" : "💪"}
            </div>
            <h1 className="text-3xl font-bold mb-1">{grade.label}</h1>
            <p className="text-xl opacity-90 mb-6">{grade.message}</p>
            <div className="text-7xl font-bold mb-2">{Math.round(results.percentage)}%</div>
            <p className="text-xl">
              {participantName ? `${participantName} · ` : ""}
              <strong>{results.score}</strong> מתוך <strong>{results.total}</strong> נכון
            </p>
            <p className="text-sm opacity-75 mt-2">משך זמן: {formatDuration(results.duration)}</p>
          </div>

          {/* CTA to register */}
          <div className="card mb-6 bg-gradient-to-r from-primary-50 to-pink-50 border-primary-200">
            <div className="flex items-center gap-3">
              <Trophy className="w-10 h-10 text-amber-500" />
              <div className="flex-1">
                <h3 className="font-bold">רוצה לשמור את הציון שלך?</h3>
                <p className="text-sm text-slate-600">הירשם חינם והתחל לצבור XP, רמות וtagim</p>
              </div>
              <Link href="/register" className="btn-primary">הרשמה</Link>
            </div>
          </div>

          {/* Detailed review */}
          <div className="card mb-6">
            <h2 className="text-xl font-bold mb-4">סקירת תשובות</h2>
            <div className="space-y-4">
              {results.details.map((r: any, i: number) => (
                <div
                  key={i}
                  className={`p-4 rounded-xl border-2 ${
                    r.correct ? "border-emerald-200 bg-emerald-50/50" : "border-red-200 bg-red-50/50"
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        r.correct ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                      }`}
                    >
                      {r.correct ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-slate-500 mb-1">
                        שאלה {i + 1} · {r.topic}
                      </div>
                      <div className="font-medium">{r.question}</div>
                    </div>
                  </div>
                  <div className="space-y-2 mr-11">
                    {r.options.map((opt: any) => {
                      const isUserAnswer = r.userAnswer === opt.key;
                      const isCorrect = opt.key === r.correctAnswer;
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
                  {r.explanation && (
                    <div className="mt-3 mr-11 p-3 bg-blue-50 rounded-lg text-sm text-blue-900">
                      <strong>💡 הסבר:</strong> {r.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="grid md:grid-cols-2 gap-3">
            <button
              onClick={() => {
                setAnswers({});
                setCurrentIndex(0);
                setResults(null);
                setElapsed(0);
                setPhase("intro");
              }}
              className="btn-secondary"
            >
              <RefreshCw className="w-4 h-4" />
              נסה שוב
            </button>
            <Link href="/register" className="btn-primary">
              <Sparkles className="w-4 h-4" />
              הירשם כדי לצבור XP
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // === PLAYING PHASE ===
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  return (
    <div className="min-h-screen">
      {/* Top bar with logo on top-left */}
      <header className="sticky top-0 z-50 glass border-b border-slate-200/50">
        <div className="max-w-4xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between mb-2">
            {/* Logo - top-left */}
            <div className="flex items-center gap-2">
              {test.logo_data ? (
                <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 p-1 flex items-center justify-center">
                  <img src={test.logo_data} alt="logo" className="max-w-full max-h-full object-contain" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-pink-500 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
              )}
              <div className="text-xs">
                <div className="font-bold text-sm truncate max-w-[200px]">{test.title}</div>
                <div className="text-slate-500">
                  שאלה {currentIndex + 1}/{totalQuestions} · נענו: {answered}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 font-mono">
              <Clock className="w-4 h-4" />
              <span className={timeLeft !== null && timeLeft < 60 ? "text-red-500 font-bold" : ""}>
                {timeLeft !== null ? formatDuration(timeLeft) : formatDuration(elapsed)}
              </span>
            </div>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-pink-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
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
                        isSelected ? "bg-primary-500 text-white" : "bg-slate-100 text-slate-600"
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

        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
            className="btn-secondary"
          >
            <ChevronRight className="w-4 h-4" />
            הקודמת
          </button>

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
              onClick={finishTest}
              disabled={answered < totalQuestions}
              className="btn-primary bg-gradient-to-r from-emerald-500 to-teal-500"
              title={answered < totalQuestions ? `נותרו ${totalQuestions - answered} שאלות` : "הגש מבחן"}
            >
              הגש מבחן
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

function getGrade(percentage: number) {
  if (percentage === 100) return { label: "מושלם! 🎉", color: "from-amber-400 to-orange-500", message: "ביצוע יוצא מן הכלל!" };
  if (percentage >= 90) return { label: "מצוין", color: "from-emerald-500 to-teal-500", message: "כל הכבוד!" };
  if (percentage >= 80) return { label: "טוב מאוד", color: "from-blue-500 to-cyan-500", message: "עבודה יפה!" };
  if (percentage >= 70) return { label: "טוב", color: "from-primary-500 to-violet-500", message: "המשך להתאמן!" };
  if (percentage >= 60) return { label: "מספיק", color: "from-yellow-500 to-amber-500", message: "יש מקום לשיפור" };
  return { label: "טעון שיפור", color: "from-red-500 to-pink-500", message: "אל תוותר - נסה שוב!" };
}
