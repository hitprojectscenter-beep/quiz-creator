import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QuizMaster - מחולל מבחנים חכם",
  description: "מערכת חכמה ליצירת מבחנים אמריקאיים מקבצים, עם משחוק ושיתוף",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <body className="antialiased">{children}</body>
    </html>
  );
}
