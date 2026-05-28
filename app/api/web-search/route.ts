import { NextRequest, NextResponse } from "next/server";
import { expandSourceWithSearch } from "@/lib/web-search";
import { anthropic, MODEL } from "@/lib/anthropic";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();
    if (!content) {
      return NextResponse.json({ error: "תוכן חסר" }, { status: 400 });
    }

    // First, identify the main topic
    const topicResponse = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 200,
      messages: [
        {
          role: "user",
          content: `מהו הנושא המרכזי של הטקסט הבא? החזר רק את שם הנושא בעברית, בקצרה.\n\n${content.slice(0, 3000)}`,
        },
      ],
    });

    const topic = topicResponse.content[0].type === "text" ? topicResponse.content[0].text.trim() : "כללי";

    // Expand the content
    const expanded = await expandSourceWithSearch(content, topic);

    return NextResponse.json({ topic, expanded });
  } catch (err: any) {
    console.error("Web search error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
