"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-client";
import { Brain, Mail, Lock, User, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, username: fullName },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    setTimeout(() => router.push("/dashboard"), 1500);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-pink-500 flex items-center justify-center">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text">QuizMaster</h1>
        </Link>

        <div className="card">
          <h2 className="text-2xl font-bold mb-2">הצטרף עכשיו 🚀</h2>
          <p className="text-slate-600 mb-6">צור חשבון חינם והתחל ליצור מבחנים</p>

          {success ? (
            <div className="bg-emerald-50 text-emerald-700 px-4 py-6 rounded-xl text-center">
              <div className="text-3xl mb-2">🎉</div>
              <div className="font-bold">נרשמת בהצלחה!</div>
              <div className="text-sm mt-1">מעביר אותך לדשבורד...</div>
            </div>
          ) : (
            <>
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">שם מלא</label>
                  <div className="relative">
                    <User className="absolute right-3 top-3 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="input pr-10"
                      placeholder="ישראל ישראלי"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">אימייל</label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-3 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="input pr-10"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">סיסמה</label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-3 w-5 h-5 text-slate-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="input pr-10"
                      placeholder="לפחות 6 תווים"
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
                )}

                <button type="submit" disabled={loading} className="btn-primary w-full text-lg">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "צור חשבון"}
                </button>
              </form>

              <p className="text-center text-sm text-slate-600 mt-6">
                כבר יש לך חשבון?{" "}
                <Link href="/login" className="text-primary-600 font-medium hover:underline">
                  התחבר כאן
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
