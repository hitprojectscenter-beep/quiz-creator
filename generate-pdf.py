#!/usr/bin/env python
"""Convert MANUAL.md to a beautifully formatted PDF in Hebrew RTL."""

import os
import sys
import subprocess
from pathlib import Path
import markdown

# Paths
BASE_DIR = Path(__file__).parent
MD_FILE = BASE_DIR / "MANUAL.md"
HTML_FILE = BASE_DIR / "MANUAL.html"
PDF_FILE = BASE_DIR / "MANUAL.pdf"

# Read Markdown content
with open(MD_FILE, encoding="utf-8") as f:
    md_text = f.read()

# Convert Markdown to HTML
md = markdown.Markdown(extensions=["extra", "toc", "tables", "fenced_code", "nl2br"])
html_body = md.convert(md_text)

# Beautiful HTML template with RTL + Hebrew + colors
HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
<meta charset="UTF-8">
<title>QuizMaster - מדריך משתמש מלא</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
  @page {
    size: A4;
    margin: 10mm 12mm 12mm 12mm;
    @bottom-center {
      content: "QuizMaster · עמוד " counter(page) " מתוך " counter(pages);
      font-family: 'Heebo', sans-serif;
      font-size: 8pt;
      color: #94a3b8;
    }
  }
  * { box-sizing: border-box; }
  body {
    font-family: 'Heebo', system-ui, sans-serif;
    direction: rtl;
    text-align: right;
    color: #1e293b;
    line-height: 1.45;
    font-size: 9pt;
    margin: 0;
    padding: 0;
  }
  h1 {
    color: #6366f1;
    font-size: 20pt;
    font-weight: 800;
    margin: 0 0 4px 0;
    padding-bottom: 6px;
    border-bottom: 2px solid #6366f1;
    page-break-after: avoid;
  }
  h2 {
    color: #4f46e5;
    font-size: 14pt;
    font-weight: 700;
    margin: 12px 0 6px 0;
    padding-right: 8px;
    border-right: 4px solid #6366f1;
    page-break-after: avoid;
  }
  h3 {
    color: #6366f1;
    font-size: 11pt;
    font-weight: 700;
    margin: 8px 0 4px 0;
    page-break-after: avoid;
  }
  h4 {
    color: #475569;
    font-size: 10pt;
    font-weight: 600;
    margin: 6px 0 3px 0;
    page-break-after: avoid;
  }
  p { margin: 3px 0; }
  ul, ol {
    margin: 4px 0;
    padding-right: 20px;
    padding-left: 0;
  }
  li { margin: 1px 0; }
  strong { color: #4338ca; font-weight: 700; }
  em { color: #db2777; font-style: italic; }
  a {
    color: #6366f1;
    text-decoration: none;
    border-bottom: 1px dotted #6366f1;
  }
  code {
    background: #f1f5f9;
    color: #be185d;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Consolas', 'Monaco', monospace;
    font-size: 9.5pt;
    direction: ltr;
    display: inline-block;
  }
  pre {
    background: linear-gradient(135deg, #1e293b 0%, #312e81 100%);
    color: #e2e8f0;
    padding: 14px 18px;
    border-radius: 10px;
    overflow-x: auto;
    direction: ltr;
    text-align: left;
    font-family: 'Consolas', 'Monaco', monospace;
    font-size: 9pt;
    line-height: 1.5;
    page-break-inside: avoid;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
  }
  pre code {
    background: transparent;
    color: inherit;
    padding: 0;
    font-size: inherit;
  }
  blockquote {
    margin: 14px 0;
    padding: 12px 16px;
    background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%);
    border-right: 4px solid #f59e0b;
    border-radius: 8px;
    color: #78350f;
    page-break-inside: avoid;
  }
  blockquote p { margin: 4px 0; }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 6px 0;
    direction: rtl;
    background: white;
    border-radius: 6px;
    overflow: hidden;
    page-break-inside: avoid;
  }
  th {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    color: white;
    padding: 5px 8px;
    text-align: right;
    font-weight: 700;
    font-size: 9pt;
  }
  td {
    padding: 4px 8px;
    border-bottom: 1px solid #e2e8f0;
    font-size: 8.5pt;
  }
  tr:nth-child(even) td { background: #f8fafc; }
  tr:last-child td { border-bottom: none; }
  hr {
    border: none;
    height: 1px;
    background: linear-gradient(90deg, transparent, #6366f1, transparent);
    margin: 10px 0;
  }
  blockquote {
    margin: 6px 0;
    padding: 6px 10px;
    background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%);
    border-right: 3px solid #f59e0b;
    border-radius: 6px;
    color: #78350f;
    page-break-inside: avoid;
    font-size: 8.5pt;
  }
  blockquote p { margin: 2px 0; }
  /* Header banner instead of full cover page */
  .banner {
    background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
    color: white;
    padding: 12px 16px;
    border-radius: 10px;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .banner-icon { font-size: 28pt; line-height: 1; }
  .banner-title { font-size: 18pt; font-weight: 800; color: white; }
  .banner-sub { font-size: 9pt; opacity: 0.9; margin-top: 2px; }
  /* TOC styling */
  ol li, ul li { color: #334155; }
  /* Emoji spacing */
  h1, h2, h3, h4, h5 { font-feature-settings: "ss01"; }
  /* Print optimizations */
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style>
</head>
<body>

<div class="banner">
  <div class="banner-icon">🧠</div>
  <div>
    <div class="banner-title">QuizMaster · מדריך משתמש</div>
    <div class="banner-sub">מערכת ליצירת מבחנים אמריקאיים מקבצים, מופעלת על ידי Claude AI · גרסה 2.0 · 2026</div>
  </div>
</div>

%(content)s

</body>
</html>
"""

html_full = HTML_TEMPLATE.replace("%(content)s", html_body)

with open(HTML_FILE, "w", encoding="utf-8") as f:
    f.write(html_full)

print(f"HTML created: {HTML_FILE}")

# Convert to PDF using Chrome headless
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

if not os.path.exists(CHROME):
    print("Chrome not found, trying Edge...")
    CHROME = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

# Use file:// URL for the HTML
html_url = "file:///" + str(HTML_FILE).replace("\\", "/")

cmd = [
    CHROME,
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--no-pdf-header-footer",
    "--virtual-time-budget=10000",
    f"--print-to-pdf={PDF_FILE}",
    html_url,
]

print(f"Running: {CHROME} --headless=new ... (output: {PDF_FILE})")
result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
if result.returncode != 0:
    print("STDERR:", result.stderr[-500:])
    sys.exit(1)

if PDF_FILE.exists():
    size_kb = PDF_FILE.stat().st_size / 1024
    print(f"✅ PDF created: {PDF_FILE} ({size_kb:.1f} KB)")
else:
    print(f"❌ PDF not created")
    sys.exit(1)
