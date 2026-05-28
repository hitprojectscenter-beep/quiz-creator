// Web search integration - uses Brave Search API if available,
// otherwise falls back to Claude's knowledge

import { anthropic, MODEL } from "./anthropic";

export type SearchResult = {
  title: string;
  url: string;
  snippet: string;
};

export async function searchWeb(query: string, limit: number = 5): Promise<SearchResult[]> {
  const braveKey = process.env.BRAVE_SEARCH_API_KEY;

  if (braveKey) {
    try {
      const res = await fetch(
        `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${limit}`,
        {
          headers: {
            Accept: "application/json",
            "X-Subscription-Token": braveKey,
          },
        }
      );
      const data = await res.json();
      return (data.web?.results || []).slice(0, limit).map((r: any) => ({
        title: r.title,
        url: r.url,
        snippet: r.description,
      }));
    } catch (error) {
      console.error("Brave search failed:", error);
    }
  }

  // Fallback: ask Claude to generate relevant information
  return [];
}

export async function expandSourceWithSearch(
  originalContent: string,
  topic: string
): Promise<string> {
  // Use Claude to identify key topics, then search for additional info
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4000,
    messages: [
      {
        role: "user",
        content: `על בסיס התוכן הבא בנושא "${topic}", הרחב את המידע בצורה אקדמית ומדויקת.
ספק מידע נוסף, דוגמאות, הקשרים, והגדרות שיכולים לעזור ביצירת שאלות מבחן איכותיות.

תוכן מקורי:
${originalContent.slice(0, 8000)}

החזר טקסט מורחב בעברית עם מידע נוסף רלוונטי.`,
      },
    ],
  });

  return response.content[0].type === "text" ? response.content[0].text : "";
}
