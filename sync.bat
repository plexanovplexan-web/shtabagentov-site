@echo off
chcp 65001 >nul
rem ============================================================
rem  sync.bat - knopka "papka -> GitHub" cherez obshchiy SYNC-HUB
rem
rem  Nastroyki etogo proekta - sync.config.json ryadom s etim faylom.
rem  Dvizhok - v papke sync-hub: po umolchaniyu ..\sync-hub (sosednyaya
rem  papka), inache ukazhi put v peremennoy okruzheniya SYNC_HUB.
rem
rem  Klyuchi: sync.bat -Branch   otpravit vetkoy sync/* + ssylka na PR
rem           sync.bat -DryRun   tolko proverki
rem           sync.bat -Help     vse klyuchi
rem  Kody vozvrata: 0 uspeh/nechego otpravlyat, 1 otkaz, 2 nuzhen chelovek
rem ============================================================
setlocal
set "HUB=%~dp0..\sync-hub"
if defined SYNC_HUB set "HUB=%SYNC_HUB%"
if not exist "%HUB%\push.ps1" (
  echo SYNC-HUB ne nayden: %HUB%
  echo Polozhi sync-hub ryadom s papkoy proekta ili zaday peremennuyu SYNC_HUB.
  pause
  exit /b 1
)
powershell -NoProfile -ExecutionPolicy Bypass -File "%HUB%\push.ps1" -Repo "%~dp0." %*
set "RC=%ERRORLEVEL%"
echo.
pause
exit /b %RC%
