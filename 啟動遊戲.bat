@echo off
chcp 65001 >nul
title 永夜之誓：破曉紀錄 - 遊戲啟動器

echo ========================================================
echo       ⚔️ 永夜之誓：破曉紀錄 (Evernight Oath) ⚔️
echo ========================================================
echo.
echo [1] 直接開啟遊戲 (預設瀏覽器)
echo [2] 啟動本機極速 Web 伺服器並開啟 (推薦多人連線/測試)
echo.

set /p choice="請選擇啟動方式 [預設 1]: "
if "%choice%"=="2" goto server_mode

:direct_mode
echo.
echo 正在為您啟動遊戲...
start "" "%~dp0index.html"
exit

:server_mode
echo.
echo 正在啟動本機伺服器 (連接埠: 8080)...
start http://localhost:8080/index.html
powershell -NoProfile -Command "Write-Host '本機遊戲伺服器運行中: http://localhost:8080/' -ForegroundColor Green; Write-Host '關閉此視窗即可停止伺服器。' -ForegroundColor Yellow; $listener = New-Object System.Net.HttpListener; $listener.Prefixes.Add('http://localhost:8080/'); $listener.Start(); while ($listener.IsListening) { $context = $listener.GetContext(); $req = $context.Request; $res = $context.Response; $rawPath = $req.Url.LocalPath.TrimStart('/'); if ($rawPath -eq '') { $rawPath = 'index.html' }; $localPath = Join-Path (Get-Location) $rawPath; if (Test-Path $localPath -PathType Leaf) { $bytes = [System.IO.File]::ReadAllBytes($localPath); $ext = [System.IO.Path]::GetExtension($localPath).ToLower(); switch ($ext) { '.html' { $res.ContentType = 'text/html; charset=utf-8' } '.js' { $res.ContentType = 'application/javascript; charset=utf-8' } '.css' { $res.ContentType = 'text/css; charset=utf-8' } '.json' { $res.ContentType = 'application/json' } '.png' { $res.ContentType = 'image/png' } default { $res.ContentType = 'application/octet-stream' } }; $res.ContentLength64 = $bytes.Length; $res.OutputStream.Write($bytes, 0, $bytes.Length); } else { $res.StatusCode = 404 }; $res.Close(); }"
pause
