import mammoth from "mammoth";

export async function parsePDF(buffer: Buffer): Promise<string> {
  // Dynamic import to avoid build-time issues
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

export async function parseFile(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split(".").pop()?.toLowerCase();

  switch (ext) {
    case "pdf":
      return parsePDF(buffer);
    case "docx":
    case "doc":
      return parseDocx(buffer);
    case "txt":
    case "md":
      return parseText(buffer);
    default:
      throw new Error(`סוג קובץ לא נתמך: ${ext}`);
  }
}
