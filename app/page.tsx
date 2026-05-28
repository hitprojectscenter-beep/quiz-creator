import Link from "next/link";
import { Sparkles, Upload, Trophy, Share2, Zap, Brain, Globe } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-pink-500 flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold gradient-text">QuizMaster</h1>
          </div>
          <nav className="flex items-center gap-3">
            <Link href="/login" className="btn-ghost">התחברות</Link>
            <Link href="/register" className="btn-primary">הרשמה חינם</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 text-primary-700 text-sm font-medium mb-6 animate-fade-in">
          <Sparkles className="w-4 h-4" />
          מופעל על ידי Claude AI
        </div>
        <h2 className="text-5xl md:text-7xl font-bold mb-6 animate-slide-up">
          הפוך כל חומר ל-<span className="gradient-text">מבחן חכם</span>
        </h2>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 animate-slide-up">
          העלה קבצים, קבל מבחן אמריקאי איכותי תוך שניות, וצבור נקודות ניסיון תוך כדי הלמידה.
          שתף עם חברים והתחרו על המקום הראשון!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
          <Link href="/register" className="btn-primary text-lg px-8 py-3">
            <Zap className="w-5 h-5" />
            התחל בחינם
          </Link>
          <Link href="/login" className="btn-secondary text-lg px-8 py-3">
            יש לי חשבון
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h3 className="text-3xl font-bold text-center mb-12">איך זה עובד?</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Upload className="w-8 h-8" />}
            title="1. העלה חומרים"
            description="העלה קבצי PDF, Word או טקסט. ניתן להעלות מספר קבצים יחד."
            color="from-blue-500 to-cyan-500"
          />
          <FeatureCard
            icon={<Brain className="w-8 h-8" />}
            title="2. AI יוצר מבחן"
            description="Claude AI מנתח את החומר ויוצר שאלות איכותיות עם הסברים."
            color="from-primary-500 to-purple-500"
          />
          <FeatureCard
            icon={<Trophy className="w-8 h-8" />}
            title="3. למד וצבור XP"
            description="פתור מבחנים, צבור נקודות, עלה רמות וזכה בתגים."
            color="from-amber-500 to-pink-500"
          />
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-6">
          <FeatureCard
            icon={<Share2 className="w-8 h-8" />}
            title="שיתוף קל"
            description="שלח קישור או QR קוד לחברים והתחרו על המקום הראשון."
            color="from-emerald-500 to-teal-500"
          />
          <FeatureCard
            icon={<Globe className="w-8 h-8" />}
            title="הרחבת מקורות"
            description="הרחב את התוכן עם מידע נוסף מהאינטרנט לעוד שאלות."
            color="from-rose-500 to-orange-500"
          />
          <FeatureCard
            icon={<Sparkles className="w-8 h-8" />}
            title="משחוק מלא"
            description="לוח מובילים, badges, רצפים יומיים, ורמות התקדמות."
            color="from-fuchsia-500 to-pink-500"
          />
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="card bg-gradient-to-br from-primary-600 to-pink-500 text-white p-12">
          <h3 className="text-4xl font-bold mb-4">מוכן להתחיל?</h3>
          <p className="text-xl mb-8 opacity-90">הצטרף עכשיו ויצור את המבחן הראשון שלך תוך דקות</p>
          <Link href="/register" className="inline-block bg-white text-primary-600 font-bold px-8 py-3 rounded-xl hover:scale-105 transition-transform">
            הירשם בחינם →
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-8 text-center text-slate-500 text-sm">
        © 2026 QuizMaster · נוצר עם ❤️ באמצעות Claude AI
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <div className="card hover:shadow-xl transition-all hover:-translate-y-1">
      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white mb-4`}>
        {icon}
      </div>
      <h4 className="text-xl font-bold mb-2">{title}</h4>
      <p className="text-slate-600">{description}</p>
    </div>
  );
}
