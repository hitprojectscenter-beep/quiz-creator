import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const MODEL = "claude-sonnet-4-6";

export type GeneratedQuestion = {
  question: string;
  options: { key: string; text: string }[];
  correct: string;
  explanation: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
};

export async function generateQuestions(
  content: string,
  numQuestions: number,
  difficulty: "easy" | "medium" | "hard" = "medium",
  additionalContext: string = ""
): Promise<GeneratedQuestion[]> {
  const systemPrompt = `אתה מומחה ביצירת שאלות מבחן אמריקאיות איכותיות בעברית.

חשוב מאוד:
- כל שאלה חייבת להיות בעברית
- 4 אפשרויות תשובה (A, B, C, D)
- רק תשובה אחת נכונה
- האפשרויות השגויות צריכות להיות סבירות אך לא נכונות (distractors איכותיים)
- ספק הסבר מפורט מדוע התשובה הנכונה היא הנכונה
- וודא שהשאלות מבוססות אך ורק על התוכן שסופק
- רמת קושי: ${difficulty === "easy" ? "קלה - שאלות הבנה בסיסיות" : difficulty === "hard" ? "קשה - דורש ניתוח, יישום וקישור בין מושגים" : "בינונית - דורש הבנה והיסקים"}

החזר אך ורק JSON תקין במבנה הבא, ללא טקסט נוסף:
{
  "questions": [
    {
      "question": "טקסט השאלה",
      "options": [
        {"key": "A", "text": "אפשרות 1"},
        {"key": "B", "text": "אפשרות 2"},
        {"key": "C", "text": "אפשרות 3"},
        {"key": "D", "text": "אפשרות 4"}
      ],
      "correct": "B",
      "explanation": "הסבר מדוע התשובה נכונה ומדוע האחרות שגויות",
      "topic": "נושא קצר של השאלה",
      "difficulty": "${difficulty}"
    }
  ]
}`;

  const userPrompt = `צור ${numQuestions} שאלות אמריקאיות איכותיות בעברית על בסיס התוכן הבא:

=== תוכן ===
${content.slice(0, 50000)}
=== סוף תוכן ===

${additionalContext ? `\n=== מקורות נוספים ===\n${additionalContext.slice(0, 20000)}\n=== סוף ===\n` : ""}

צור בדיוק ${numQuestions} שאלות. החזר רק JSON תקין.`;

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 8000,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";

  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("לא נמצא JSON בתשובת ה-AI");
  }

  const parsed = JSON.parse(jsonMatch[0]);
  return parsed.questions;
}

export async function generateTestTitle(content: string): Promise<{ title: string; description: string }> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 500,
    messages: [
      {
        role: "user",
        content: `על בסיס התוכן הבא, צור כותרת קצרה (עד 60 תווים) ותיאור קצר (עד 150 תווים) למבחן בעברית.
החזר רק JSON: {"title": "...", "description": "..."}

תוכן:
${content.slice(0, 5000)}`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return { title: "מבחן חדש", description: "" };
  return JSON.parse(match[0]);
}
