# Evernight Oath Build Script - Rebuilds js/bundle.js from modules
$files = @(
    'weapons.js',
    'audio.js',
    'particles.js',
    'lighting.js',
    'companions.js',
    'enemies.js',
    'boss.js',
    'dungeon.js',
    'player.js',
    'account.js',
    'citadel.js',
    'gacha.js',
    'arsenal.js',
    'storage.js',
    'network.js',
    'chat.js',
    'minimap.js',
    'diagnostics.js',
    'main.js'
)

$bundleLines = New-Object System.Collections.Generic.List[string]
$bundleLines.Add("/**")
$bundleLines.Add(" * EVERNIGHT OATH: DAWN CHRONICLES (永夜之誓：破曉紀錄)")
$bundleLines.Add(" * Standalone Offline Bundle (Zero-CORS, Direct file:/// Execution Support)")
$bundleLines.Add(" */")
$bundleLines.Add("(function () {")
$bundleLines.Add("  'use strict';")

$baseDir = ".\js"

foreach ($file in $files) {
    $fullPath = Join-Path $baseDir $file
    if (Test-Path $fullPath) {
        $bundleLines.Add("`n// ==================== BEGIN MODULE: $file ====================")
        $lines = Get-Content -LiteralPath $fullPath -Encoding UTF8
        foreach ($line in $lines) {
            if ($line -match "^\s*import\s+") {
                continue
            }
            $cleanLine = $line -replace "^\s*export\s+default\s+", ""
            $cleanLine = $cleanLine -replace "^\s*export\s+(const|class|function|let|var)\s+", "`$1 "
            $cleanLine = $cleanLine -replace "^\s*export\s*\{[^}]*\};?", ""
            
            $bundleLines.Add($cleanLine)
        }
        $bundleLines.Add("// ==================== END MODULE: $file ====================`n")
    } else {
        Write-Error "File not found: $fullPath"
    }
}

$bundleLines.Add("})();")

$outPath = ".\js\bundle.js"
[System.IO.File]::WriteAllLines((Resolve-Path "." | ForEach-Object { Join-Path $_.Path "js\bundle.js" }), $bundleLines, [System.Text.Encoding]::UTF8)
Write-Host "Bundle updated successfully: js\bundle.js ($((Get-Item '.\js\bundle.js').Length) bytes)"
