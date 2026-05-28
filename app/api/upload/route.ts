import { NextRequest, NextResponse } from "next/server";
import { parseFile } from "@/lib/parsers";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "לא נשלחו קבצים" }, { status: 400 });
    }

    const contents: string[] = [];
    for (const file of files) {
      try {
        const text = await parseFile(file);
        contents.push(`=== ${file.name} ===\n${text}`);
      } catch (err: any) {
        console.error(`Failed to parse ${file.name}:`, err);
        return NextResponse.json(
          { error: `שגיאה בקובץ ${file.name}: ${err.message}` },
          { status: 400 }
        );
      }
    }

    const content = contents.join("\n\n");
    if (content.trim().length < 100) {
      return NextResponse.json(
        { error: "התוכן קצר מדי. יש להעלות חומר משמעותי יותר." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      content,
      wordCount: content.split(/\s+/).length,
      filesProcessed: files.length,
    });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
