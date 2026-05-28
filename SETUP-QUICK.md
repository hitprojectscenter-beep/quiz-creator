# 🚀 הקמה מהירה - 5 דקות

## שלב 1: התקנה
```bash
cd quiz-generator
npm install
```

## שלב 2: Supabase (חינם)
1. פתח: https://supabase.com/dashboard
2. New Project → תן שם → המתן 1 דקה
3. עבור ל **SQL Editor** (סמל בצד שמאל)
4. העתק את כל התוכן של `supabase/schema.sql` והדבק → **Run**
5. עבור ל **Settings → API**
6. העתק:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`

## שלב 3: Claude API
1. פתח: https://console.anthropic.com/settings/keys
2. **Create Key**
3. העתק את המפתח (`sk-ant-...`) → `ANTHROPIC_API_KEY`

## שלב 4: קובץ .env.local
צור קובץ `.env.local` בתיקיית הפרויקט:
```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## שלב 5: הפעלה
```bash
npm run dev
```

פתח: http://localhost:3000 🎉

## ✅ בדיקה
1. הירשם עם אימייל וסיסמה
2. לחץ "מבחן חדש"
3. העלה PDF או קובץ Word
4. בחר 10 שאלות → "צור מבחן"
5. פתור את המבחן!

## 🆘 בעיות?
- **שגיאת auth**: וודא ש-`schema.sql` הורץ במלואו ב-Supabase
- **שגיאת Claude**: בדוק שיש קרדיט בחשבון Anthropic
- **שגיאת PDF**: וודא שהקובץ אינו מוצפן או סרוק (OCR לא נתמך)
