import mammoth from "mammoth";
import { anthropic, MODEL } from "./anthropic";

export async function parsePDF(buffer: Buffer): Promise<string> {
  const pdfParse = (await import("pdf-parse")).default;
  const data = await pdfParse(buffer);
  return data.text;
}

export async function parseDocx(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

export async function parseText(buffer: Buffer): Promise<string> {
  return buffer.toString("utf-8");
}

/**
 * Use Claude Vision to extract text from image (OCR)
 * Supports: JPG, PNG, WebP, GIF
 */
export async function parseImage(buffer: Buffer, mimeType: string): Promise<string> {
  // Validate mime type
  const validMimes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!validMimes.includes(mimeType)) {
    throw new Error(`סוג תמונה לא נתמך: ${mimeType}`);
  }

  // Size limit: 5MB for base64-encoded images
  if (buffer.length > 5 * 1024 * 1024) {
    throw new Error("התמונה גדולה מדי - מקסימום 5MB");
  }

  const base64 = buffer.toString("base64");

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4000,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mimeType as any,
              data: base64,
            },
          },
          {
            type: "text",
            text: "חלץ את כל הטקסט שמופיע בתמונה הזו. כלול הכל - כותרות, פסקאות, טבלאות, רשימות. שמור על המבנה המקורי ככל האפשר. אם יש מספר עמודות, חבר אותם בסדר הגיוני. החזר רק את הטקסט המחולץ ללא הסברים נוספים.",
          },
        ],
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  if (text.trim().length < 20) {
    throw new Error("לא ניתן לחלץ טקסט משמעותי מהתמונה. וודא שהתמונה ברורה ומכילה טקסט קריא.");
  }
  return text;
}

function mimeFromExt(ext: string): string | null {
  const map: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
  };
  return map[ext.toLowerCase()] || null;
}

export async function parseFile(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split(".").pop()?.toLowerCase() || "";

  switch (ext) {
    case "pdf":
      return parsePDF(buffer);
    case "docx":
    case "doc":
      return parseDocx(buffer);
    case "txt":
    case "md":
      return parseText(buffer);
    case "jpg":
    case "jpeg":
    case "png":
    case "webp":
    case "gif": {
      const mime = mimeFromExt(ext);
      if (!mime) throw new Error(`סוג תמונה לא נתמך: ${ext}`);
      return parseImage(buffer, mime);
    }
    default:
      throw new Error(
        `סוג קובץ לא נתמך: .${ext}. נתמכים: PDF, DOCX, TXT, JPG, PNG, WebP`
      );
  }
}
