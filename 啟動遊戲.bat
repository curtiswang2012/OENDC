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
echo 正在啟動多人連線與區域網路伺服器 (連接埠: 8080)...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1"
pause
