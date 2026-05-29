"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Upload, FileText, X, Loader2, Sparkles, Globe, Brain, ChevronLeft, Image as ImageIcon, Tag } from "lucide-react";

type FileItem = {
  file: File;
  name: string;
  size: number;
};

export default function CreateTestPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [testTitle, setTestTitle] = useState("");
  const [logoData, setLogoData] = useState<string | null>(null);
  const [logoName, setLogoName] = useState<string>("");
  const [numQuestions, setNumQuestions] = useState(10);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [timeLimit, setTimeLimit] = useState(0);
  const [useWebSearch, setUseWebSearch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files || []);
    const newFiles = selected.map((f) => ({ file: f, name: f.name, size: f.size }));
    setFiles((prev) => [...prev, ...newFiles]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleLogoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024) {
      setError("גודל הלוגו לא יכול לעלות על 500KB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("חובה להעלות קובץ תמונה (PNG, JPG, SVG)");
      return;
    }

    setError("");
    const reader = new FileReader();
    reader.onload = (ev) => {
      setLogoData(ev.target?.result as string);
      setLogoName(file.name);
    };
    reader.readAsDataURL(file);
  }

  function removeLogo() {
    setLogoData(null);
    setLogoName("");
    if (logoInputRef.current) logoInputRef.current.value = "";
  }

  async function handleGenerate() {
    if (files.length === 0) {
      setError("יש להעלות לפחות קובץ אחד");
      return;
    }
    setLoading(true);
    setError("");

    try {
      // Step 1: Upload and parse files
      const hasImages = files.some((f) =>
        /\.(jpe?g|png|webp|gif)$/i.test(f.name)
      );
      setProgress(
        hasImages
          ? "מחלץ טקסט מהתמונות עם AI (זה יכול לקחת דקה)..."
          : "מנתח את הקבצים..."
      );
      const formData = new FormData();
      files.forEach((f) => formData.append("files", f.file));
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      if (!uploadRes.ok) {
        const errData = await uploadRes.json().catch(() => ({ error: "שגיאה בעיבוד הקבצים" }));
        throw new Error(errData.error || "שגיאה בעיבוד הקבצים");
      }
      const { content } = await uploadRes.json();

      // Step 2: Optionally expand with web search
      let additionalContext = "";
      if (useWebSearch) {
        setProgress("מחפש שאלות דומות באינטרנט...");
        const searchRes = await fetch("/api/web-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: content.slice(0, 5000) }),
        });
        if (searchRes.ok) {
          const data = await searchRes.json();
          additionalContext = data.expanded || "";
        }
      }

      // Step 3: Generate questions
      setProgress(`יוצר ${numQuestions} שאלות חכמות...`);
      const generateRes = await fetch("/api/generate-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          additionalContext,
          numQuestions,
          difficulty,
          timeLimit,
          customTitle: testTitle.trim() || null,
          logoData,
        }),
      });

      if (!generateRes.ok) {
        const err = await generateRes.json();
        throw new Error(err.error || "שגיאה ביצירת המבחן");
      }

      const { testId } = await generateRes.json();
      setProgress("הצלחה! מעביר אותך לעמוד השיתוף...");
      router.push(`/share/${testId}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 glass border-b border-slate-200/50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="btn-ghost">
            <ChevronLeft className="w-4 h-4" />
            חזרה
          </Link>
          <h1 className="text-xl font-bold gradient-text">צור מבחן חדש</h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {loading ? (
          <div className="card text-center py-16">
            <Loader2 className="w-16 h-16 mx-auto text-primary-500 animate-spin mb-6" />
            <h2 className="text-2xl font-bold mb-2">יוצר את המבחן שלך</h2>
            <p className="text-slate-600">{progress}</p>
            <div className="mt-8 max-w-md mx-auto text-sm text-slate-500 text-right space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" /> ניתוח הקבצים
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" /> יצירת שאלות עם Claude AI
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-slate-300" /> שמירה במסד הנתונים
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Step 1: Title + Logo */}
            <div className="card mb-6 animate-slide-up">
              <h2 className="text-xl font-bold mb-1">1. פרטי המבחן</h2>
              <p className="text-slate-600 text-sm mb-4">תן שם למבחן והעלה לוגו (אופציונלי)</p>

              <div className="grid md:grid-cols-3 gap-4">
                {/* Logo upload - top-left */}
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium mb-2">
                    <ImageIcon className="w-4 h-4 inline ml-1" />
                    לוגו המבחן
                  </label>
                  {logoData ? (
                    <div className="relative aspect-square rounded-xl border-2 border-primary-300 bg-white p-3 flex items-center justify-center group">
                      <img src={logoData} alt="logo" className="max-w-full max-h-full object-contain" />
                      <button
                        onClick={removeLogo}
                        className="absolute top-1 left-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => logoInputRef.current?.click()}
                      className="aspect-square border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-primary-50/50 transition-all"
                    >
                      <ImageIcon className="w-8 h-8 text-slate-400 mb-1" />
                      <div className="text-xs text-slate-500 text-center px-2">לחץ להעלאת לוגו</div>
                      <div className="text-xs text-slate-400 mt-1">עד 500KB</div>
                    </div>
                  )}
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoSelect}
                    className="hidden"
                  />
                </div>

                {/* Title input */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    <Tag className="w-4 h-4 inline ml-1" />
                    שם המבחן
                  </label>
                  <input
                    type="text"
                    value={testTitle}
                    onChange={(e) => setTestTitle(e.target.value)}
                    placeholder="לדוגמה: מבחן בהיסטוריה - שיעור 3"
                    maxLength={100}
                    className="input"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    {testTitle ? `${testTitle.length}/100` : "אם תשאיר ריק, AI יציע שם אוטומטית"}
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2: Upload Files */}
            <div className="card mb-6 animate-slide-up">
              <h2 className="text-xl font-bold mb-1">2. העלה חומרי לימוד</h2>
              <p className="text-slate-600 text-sm mb-4">
                📄 PDF · 📝 Word · 📃 טקסט · 📷 <strong>תמונות (OCR אוטומטי)</strong> · ניתן להעלות מספר קבצים
              </p>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center cursor-pointer hover:border-primary-500 hover:bg-primary-50/50 transition-all"
              >
                <Upload className="w-12 h-12 mx-auto text-slate-400 mb-3" />
                <div className="font-medium">לחץ כדי להעלות קבצים</div>
                <div className="text-sm text-slate-500 mt-1">או גרור לכאן</div>
                <div className="text-xs text-slate-400 mt-2">
                  📄 PDF, DOCX, TXT &nbsp;·&nbsp; 📷 JPG, PNG (עד 5MB)
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.docx,.doc,.txt,.md,.jpg,.jpeg,.png,.webp,.gif,image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                      <FileText className="w-5 h-5 text-primary-500" />
                      <div className="flex-1 truncate">
                        <div className="font-medium text-sm">{f.name}</div>
                        <div className="text-xs text-slate-500">{(f.size / 1024).toFixed(1)} KB</div>
                      </div>
                      <button onClick={() => removeFile(i)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Step 3: Settings */}
            <div className="card mb-6 animate-slide-up">
              <h2 className="text-xl font-bold mb-4">3. הגדרות המבחן</h2>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="font-medium">מספר שאלות</label>
                    <span className="text-2xl font-bold gradient-text">{numQuestions}</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="5"
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(Number(e.target.value))}
                    className="w-full accent-primary-500"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>5</span>
                    <span>50</span>
                  </div>
                </div>

                <div>
                  <label className="font-medium block mb-2">רמת קושי</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "easy", label: "קל", emoji: "😊" },
                      { value: "medium", label: "בינוני", emoji: "🤔" },
                      { value: "hard", label: "קשה", emoji: "🔥" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setDifficulty(opt.value as any)}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          difficulty === opt.value
                            ? "border-primary-500 bg-primary-50"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="text-2xl">{opt.emoji}</div>
                        <div className="text-sm font-medium mt-1">{opt.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="font-medium">הגבלת זמן (דקות)</label>
                    <span className="font-bold">{timeLimit === 0 ? "ללא הגבלה" : `${timeLimit} דק'`}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    step="5"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(Number(e.target.value))}
                    className="w-full accent-primary-500"
                  />
                </div>

                <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-slate-200 cursor-pointer hover:border-primary-300 transition-all">
                  <input
                    type="checkbox"
                    checked={useWebSearch}
                    onChange={(e) => setUseWebSearch(e.target.checked)}
                    className="w-5 h-5 accent-primary-500"
                  />
                  <Globe className="w-5 h-5 text-primary-500" />
                  <div className="flex-1">
                    <div className="font-medium">חיפוש שאלות דומות באינטרנט</div>
                    <div className="text-xs text-slate-500">הרחבת התוכן עם מידע נוסף ויצירת שאלות מגוונות יותר</div>
                  </div>
                  <span className="badge-chip bg-amber-100 text-amber-700">🌐</span>
                </label>
              </div>
            </div>

            {error && (
              <div className="card bg-red-50 border-red-200 text-red-700 mb-6">
                {error}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={files.length === 0}
              className="btn-primary w-full text-xl py-4 animate-pulse-glow"
            >
              <Sparkles className="w-6 h-6" />
              צור מבחן חכם עכשיו
              <Brain className="w-6 h-6" />
            </button>

            <p className="text-center text-sm text-slate-500 mt-4">
              💡 ייצור המבחן עשוי לקחת 20-60 שניות בהתאם להיקף החומר
            </p>
          </>
        )}
      </main>
    </div>
  );
}
