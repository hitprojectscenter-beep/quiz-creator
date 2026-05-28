# 🧠 QuizMaster - מחולל מבחנים חכם

יישום מלא ליצירת מבחנים אמריקאיים מקבצים, מופעל על ידי Claude AI. כולל מערכת משחוק מלאה, שיתוף מבחנים, וחיפוש מידע באינטרנט.

## ✨ תכונות

- 📚 **העלאת קבצים** - PDF, Word, טקסט
- 🤖 **יצירת שאלות חכמה** - באמצעות Claude AI
- 🎮 **מערכת משחוק מלאה** - XP, רמות, badges, רצפי ימים
- 🏆 **לוח מובילים** - תחרות בין משתמשים
- 🔗 **שיתוף קל** - קישור + QR קוד + WhatsApp/Email
- 🌐 **הרחבת מקורות מהאינטרנט** - חיפוש מידע נוסף
- 📊 **ניתוח ביצועים** - היסטוריה, ציון ממוצע
- 🎨 **תמיכה מלאה ב-RTL ועברית**
- 🌙 **עיצוב מודרני עם אנימציות**

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **UI**: Tailwind CSS + Lucide Icons + Heebo Font
- **Database & Auth**: Supabase (PostgreSQL)
- **AI**: Anthropic Claude API (claude-sonnet-4-6)
- **File Parsing**: pdf-parse, mammoth
- **Sharing**: qrcode

## 🚀 הקמה מהירה

### 1. התקנת תלויות

```bash
cd quiz-generator
npm install
```

### 2. הקמת Supabase

1. צור חשבון ב-[supabase.com](https://supabase.com) (חינם)
2. צור פרויקט חדש
3. עבור ל-SQL Editor והרץ את התוכן של `supabase/schema.sql`
4. עבור ל-Settings → API והעתק:
   - `Project URL`
   - `anon public key`
   - `service_role key`

### 3. קבלת מפתח Claude API

1. צור חשבון ב-[console.anthropic.com](https://console.anthropic.com)
2. צור API Key חדש
3. העתק את המפתח (מתחיל ב-`sk-ant-`)

### 4. הגדרת משתני סביבה

צור קובץ `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. הרצה

```bash
npm run dev
```

פתח [http://localhost:3000](http://localhost:3000) ✨

## 📁 מבנה הפרויקט

```
quiz-generator/
├── app/
│   ├── api/                    # API Routes
│   │   ├── upload/             # ניתוח קבצים
│   │   ├── generate-test/      # יצירת מבחן עם Claude
│   │   ├── submit-test/        # הגשת תשובות וחישוב ציון
│   │   └── web-search/         # הרחבת מקורות
│   ├── login/                  # התחברות
│   ├── register/               # הרשמה
│   ├── dashboard/              # דשבורד ראשי
│   ├── create/                 # יצירת מבחן חדש
│   ├── test/[id]/              # ביצוע מבחן
│   ├── results/[id]/           # תוצאות מבחן
│   ├── share/[id]/             # שיתוף מבחן
│   ├── leaderboard/            # לוח מובילים
│   └── profile/                # פרופיל משתמש
├── components/
│   ├── Navbar.tsx
│   └── XPBar.tsx
├── lib/
│   ├── supabase-client.ts      # Supabase client side
│   ├── supabase-server.ts      # Supabase server side
│   ├── anthropic.ts            # Claude AI integration
│   ├── parsers.ts              # PDF/Word/TXT parsers
│   ├── web-search.ts           # חיפוש אינטרנט
│   └── utils.ts                # XP, levels, helpers
├── supabase/
│   └── schema.sql              # סכמת מסד נתונים
└── middleware.ts               # הגנת routes
```

## 🎮 מערכת המשחוק

### XP ורמות
- 10 XP לכל תשובה נכונה
- בונוס לרמות קושי גבוהות (×1.5 לבינוני, ×2 לקשה)
- +50 XP על ציון מושלם
- +25 XP על 90%+
- 30 XP בסיס + 2 XP לכל שאלה על יצירת מבחן

### תגים (Badges)
- 🎯 צעדים ראשונים - מבחן ראשון שנוצר
- 📚 יוצר מנוסה - 5 מבחנים
- 🎓 מורה מקצועי - 20 מבחנים
- ⭐ לומד מתחיל - מבחן ראשון שעברת
- 🔥 סטודנט חרוץ - 10 מבחנים
- 👑 מאסטר - 50 מבחנים
- 💯 מושלם! - ציון 100%
- 🌟 שאיפה למצוינות - 5 ציונים של 100%
- ⚡ רצף של 7 ימים
- 🏆 רצף של 30 ימים
- 💎 1000 XP
- 🚀 5000 XP

## 🌐 הרחבת מקורות מהאינטרנט (אופציונלי)

כברירת מחדל, Claude מרחיב את התוכן בעצמו. כדי להפעיל חיפוש אמיתי באינטרנט:

1. צור חשבון ב-[Brave Search API](https://brave.com/search/api/)
2. הוסף ל-`.env.local`:
   ```
   BRAVE_SEARCH_API_KEY=your-key
   ```

## 🚢 העלאה ל-Production

### Vercel (מומלץ)

```bash
npm install -g vercel
vercel
```

הוסף את משתני הסביבה בדשבורד של Vercel.

### בנייה מקומית

```bash
npm run build
npm start
```

## 💡 רעיונות להרחבה עתידית

- [ ] מצב Battle - 2 משתמשים מתחרים בזמן אמת
- [ ] OCR לתמונות (Tesseract.js)
- [ ] ייצוא ל-PDF להדפסה
- [ ] שאלות פתוחות + הערכת AI
- [ ] חזרה מרווחת (Spaced Repetition)
- [ ] הקראה קולית (TTS)
- [ ] PWA - התקנה כאפליקציה
- [ ] תמיכה בעוד שפות
- [ ] כיתות וקבוצות לימוד
- [ ] תגובות ודיון בשאלות

## 📄 רישיון

MIT
