"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { Copy, Check, Play, ChevronRight, Share2, Mail, MessageCircle, Download } from "lucide-react";

export default function ShareView({ test }: { test: any }) {
  const [copied, setCopied] = useState(false);
  const [qrUrl, setQrUrl] = useState("");

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/test/${test.id}` : "";

  useEffect(() => {
    if (shareUrl) {
      QRCode.toDataURL(shareUrl, {
        width: 280,
        margin: 2,
        color: { dark: "#4f46e5", light: "#ffffff" },
      }).then(setQrUrl);
    }
  }, [shareUrl]);

  function copyLink() {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function shareWhatsApp() {
    const text = `הצטרף למבחן: ${test.title}\n${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  function shareEmail() {
    const subject = `מבחן: ${test.title}`;
    const body = `הוזמנת לפתור את המבחן הבא:\n\n${test.title}\n\nלחץ על הקישור:\n${shareUrl}`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  }

  function downloadQR() {
    const a = document.createElement("a");
    a.href = qrUrl;
    a.download = `quiz-${test.share_code}.png`;
    a.click();
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 glass border-b border-slate-200/50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="btn-ghost">
            <ChevronRight className="w-4 h-4" />
            חזרה
          </Link>
          <h1 className="text-xl font-bold gradient-text">שתף מבחן</h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Test info */}
        <div className="card mb-6 bg-gradient-to-br from-primary-600 to-pink-500 text-white animate-slide-up">
          <div className="flex items-center gap-2 mb-2">
            <Share2 className="w-5 h-5" />
            <span className="text-sm opacity-90">המבחן מוכן לשיתוף</span>
          </div>
          <h2 className="text-3xl font-bold mb-2">{test.title}</h2>
          {test.description && <p className="opacity-90 mb-4">{test.description}</p>}
          <div className="flex flex-wrap gap-2">
            <span className="badge-chip bg-white/20">{test.total_questions} שאלות</span>
            <span className="badge-chip bg-white/20">
              {test.difficulty === "easy" ? "קל" : test.difficulty === "hard" ? "קשה" : "בינוני"}
            </span>
            {test.time_limit_minutes && (
              <span className="badge-chip bg-white/20">{test.time_limit_minutes} דקות</span>
            )}
            <span className="badge-chip bg-white/20">קוד: {test.share_code}</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* QR Code */}
          <div className="card text-center">
            <h3 className="font-bold text-lg mb-4">סרוק את הקוד</h3>
            {qrUrl ? (
              <img src={qrUrl} alt="QR Code" className="mx-auto rounded-xl" />
            ) : (
              <div className="w-[280px] h-[280px] mx-auto bg-slate-100 rounded-xl animate-pulse" />
            )}
            <button onClick={downloadQR} className="btn-secondary mt-4 w-full">
              <Download className="w-4 h-4" />
              הורד QR
            </button>
          </div>

          {/* Share options */}
          <div className="space-y-4">
            <div className="card">
              <h3 className="font-bold text-lg mb-3">קישור שיתוף</h3>
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl mb-3">
                <code className="flex-1 text-sm truncate text-slate-700">{shareUrl}</code>
                <button
                  onClick={copyLink}
                  className={`btn ${copied ? "bg-emerald-500 text-white" : "btn-primary"} text-sm`}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "הועתק!" : "העתק"}
                </button>
              </div>
            </div>

            <div className="card">
              <h3 className="font-bold text-lg mb-3">שיתוף מהיר</h3>
              <div className="space-y-2">
                <button onClick={shareWhatsApp} className="btn w-full bg-emerald-500 text-white hover:bg-emerald-600">
                  <MessageCircle className="w-5 h-5" />
                  שלח ב-WhatsApp
                </button>
                <button onClick={shareEmail} className="btn w-full bg-blue-500 text-white hover:bg-blue-600">
                  <Mail className="w-5 h-5" />
                  שלח באימייל
                </button>
              </div>
            </div>

            <Link href={`/test/${test.id}`} className="btn-primary w-full text-lg py-3">
              <Play className="w-5 h-5" />
              התחל את המבחן עכשיו
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
