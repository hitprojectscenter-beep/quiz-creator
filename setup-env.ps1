# ============================================
# QuizMaster - Interactive Env Setup
# ============================================
# Run this script to update .env.local safely
# Usage: powershell -ExecutionPolicy Bypass -File setup-env.ps1
# ============================================

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  QuizMaster - הגדרת משתני סביבה        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "הסקריפט יבקש 3 מפתחות מ-Supabase ויעדכן את .env.local" -ForegroundColor Yellow
Write-Host "הערכים שלך לא יישמרו בשום מקום אחר חוץ מהקובץ" -ForegroundColor Yellow
Write-Host ""
Write-Host "פתח את: https://supabase.com/dashboard → הפרויקט שלך → Settings → API" -ForegroundColor Green
Write-Host ""

# Get Supabase URL
do {
    $url = Read-Host "1/3  הדבק את ה-Project URL (מתחיל ב-https://)"
    if (-not $url.StartsWith("https://")) {
        Write-Host "  ⚠️  ה-URL חייב להתחיל ב-https://" -ForegroundColor Red
    }
} until ($url.StartsWith("https://") -and $url -notmatch "placeholder")

# Get anon key
do {
    $anonKey = Read-Host "2/3  הדבק את anon public key (מתחיל ב-eyJ)"
    if (-not $anonKey.StartsWith("eyJ")) {
        Write-Host "  ⚠️  המפתח חייב להתחיל ב-eyJ (זה JWT)" -ForegroundColor Red
    }
} until ($anonKey.StartsWith("eyJ"))

# Get service_role key
do {
    $serviceKey = Read-Host "3/3  הדבק את service_role key (לחץ Reveal קודם, מתחיל ב-eyJ)"
    if (-not $serviceKey.StartsWith("eyJ")) {
        Write-Host "  ⚠️  המפתח חייב להתחיל ב-eyJ (זה JWT)" -ForegroundColor Red
    }
    if ($serviceKey -eq $anonKey) {
        Write-Host "  ⚠️  זה אותו מפתח כמו anon public - לחץ 'Reveal' ליד service_role" -ForegroundColor Red
        $serviceKey = ""
    }
} until ($serviceKey.StartsWith("eyJ"))

# Keep existing Anthropic key
$envPath = Join-Path $PSScriptRoot ".env.local"
$existingContent = if (Test-Path $envPath) { Get-Content $envPath -Raw -Encoding UTF8 } else { "" }
$anthropicMatch = [regex]::Match($existingContent, "ANTHROPIC_API_KEY=(.+)")
$anthropicKey = if ($anthropicMatch.Success) { $anthropicMatch.Groups[1].Value.Trim() } else { "sk-ant-PLACEHOLDER" }

if ($anthropicKey -eq "sk-ant-PLACEHOLDER" -or $anthropicKey.StartsWith("sk-ant-placeholder")) {
    $newAnthropic = Read-Host "4/4  הדבק את ANTHROPIC_API_KEY (או Enter כדי לשמור הקיים)"
    if ($newAnthropic -ne "") { $anthropicKey = $newAnthropic }
}

# Build new content
$newContent = @"
# QuizMaster - Environment Variables
# DO NOT COMMIT THIS FILE TO GIT
NEXT_PUBLIC_SUPABASE_URL=$url
NEXT_PUBLIC_SUPABASE_ANON_KEY=$anonKey
SUPABASE_SERVICE_ROLE_KEY=$serviceKey
ANTHROPIC_API_KEY=$anthropicKey
NEXT_PUBLIC_APP_URL=http://localhost:3200
"@

# Write to file
Set-Content -Path $envPath -Value $newContent -Encoding UTF8

Write-Host ""
Write-Host "✅ .env.local עודכן בהצלחה!" -ForegroundColor Green
Write-Host ""
Write-Host "סיכום:" -ForegroundColor Cyan
Write-Host "  Supabase URL:        $url" -ForegroundColor White
Write-Host "  anon key:            $($anonKey.Substring(0, [Math]::Min(20, $anonKey.Length)))..." -ForegroundColor White
Write-Host "  service_role:        $($serviceKey.Substring(0, [Math]::Min(20, $serviceKey.Length)))..." -ForegroundColor White
Write-Host "  Anthropic:           $($anthropicKey.Substring(0, [Math]::Min(20, $anthropicKey.Length)))..." -ForegroundColor White
Write-Host ""
Write-Host "🚀 השלב הבא:" -ForegroundColor Yellow
Write-Host "  1. עצור את שרת ה-dev הקיים (Ctrl+C בטרמינל שלו)" -ForegroundColor White
Write-Host "  2. הרץ: npm run dev" -ForegroundColor White
Write-Host "  3. פתח: http://localhost:3200" -ForegroundColor White
Write-Host "  4. הירשם ויצור את המבחן הראשון!" -ForegroundColor White
Write-Host ""
