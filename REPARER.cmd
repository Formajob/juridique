@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
title ACX Flow - REPARATION CHIRURGICALE DU LOGIN
cd /d "%~dp0"

echo.
echo ============================================================
echo   ACX Flow - reparation du login (copie fichier par fichier)
echo ============================================================
echo   Dossier : %CD%
echo.

if not exist package.json (
  echo   STOP : pas de package.json ici. Ce n'est pas le dossier du projet.
  echo   Fais : cd ^<dossier du projet^>
  echo.
  pause
  exit /b
)

rem ---------- 1. trouver le zip ----------
set "ZIP="
if exist "juridique-refonte-glass.zip" set "ZIP=%CD%\juridique-refonte-glass.zip"
if not defined ZIP if exist "%USERPROFILE%\Downloads\juridique-refonte-glass.zip" set "ZIP=%USERPROFILE%\Downloads\juridique-refonte-glass.zip"
if not defined ZIP if exist "%USERPROFILE%\Desktop\juridique-refonte-glass.zip" set "ZIP=%USERPROFILE%\Desktop\juridique-refonte-glass.zip"
if not defined ZIP (
  echo   Place le fichier juridique-refonte-glass.zip dans ce dossier
  echo   ou dans Telechargements, puis relance.
  echo.
  pause
  exit /b
)
echo   zip : !ZIP!

rem ---------- 2. extraire dans un dossier temporaire ----------
set "TMPD=%TEMP%\acxflow_repair"
if exist "!TMPD!" rmdir /s /q "!TMPD!"
mkdir "!TMPD!"
echo.
echo   extraction...
powershell -NoProfile -Command "$ProgressPreference='SilentlyContinue'; Expand-Archive -LiteralPath '!ZIP!' -DestinationPath '!TMPD!' -Force"
if not exist "!TMPD!\src\app\login\page.tsx" (
  echo   [KO] le zip ne contient pas src\app\login\page.tsx
  pause
  exit /b
)

rem ---------- 3. copier les fichiers un par un, en forcant ----------
echo.
echo   copie forcee des fichiers :
if not exist "src\app\login" mkdir "src\app\login"
copy /Y "!TMPD!\src\app\login\page.tsx" "src\app\login\page.tsx" >nul
echo      [x] src\app\login\page.tsx
copy /Y "!TMPD!\src\app\page.tsx" "src\app\page.tsx" >nul
echo      [x] src\app\page.tsx

rem l'ancienne page de connexion et sa dependance
if exist "src\components\portail\AccessPage.tsx" (
  del /Q "src\components\portail\AccessPage.tsx"
  echo      [x] src\components\portail\AccessPage.tsx supprime
)

rem ---------- 4. le piege du src imbrique ----------
echo.
if exist "src\src" (
  echo   [!!] src\src existe : tu avais colle src DANS src.
  echo        Je le supprime pour eviter toute confusion.
  rmdir /s /q "src\src"
  echo        [x] src\src supprime
)

rem ---------- 5. verification ----------
echo.
echo ============================================================
echo   VERIFICATION
echo ============================================================
powershell -NoProfile -Command "$ProgressPreference='SilentlyContinue'; $f='src\app\login\page.tsx'; $h=(Get-FileHash $f -Algorithm SHA256).Hash.Substring(0,16).ToLower(); Write-Host ('   login/page.tsx : ' + (Get-Item $f).Length + ' octets, sha ' + $h); if (Select-String -Path $f -Pattern 'SIGNATURE-LOGIN: lg-autonome-v6' -Quiet) { Write-Host '   signature v6 : PRESENTE' -ForegroundColor Green } else { Write-Host '   signature v6 : ABSENTE' -ForegroundColor Red }; if (Select-String -Path 'src\app\page.tsx' -Pattern \"redirect\('/login'\)\" -Quiet) { Write-Host '   page.tsx redirige vers /login : OUI' -ForegroundColor Green } else { Write-Host '   page.tsx redirige vers /login : NON' -ForegroundColor Red }"

rem ---------- 6. cache + serveur ----------
echo.
echo ============================================================
echo   CACHE ET SERVEUR
echo ============================================================
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do (
  echo   arret du processus %%p sur le port 3000
  taskkill /F /PID %%p >nul 2>&1
)
ping -n 3 127.0.0.1 >nul
if exist .next rmdir /s /q .next
echo   .next supprime

echo.
echo   demarrage de npm run dev dans une nouvelle fenetre...
start "ACX Flow - npm run dev" cmd /k "npm run dev"
ping -n 22 127.0.0.1 >nul

echo.
echo ============================================================
echo   TEST SERVEUR
echo ============================================================
powershell -NoProfile -Command "$ProgressPreference='SilentlyContinue'; try { $r = Invoke-WebRequest -UseBasicParsing 'http://localhost:3000/login' -TimeoutSec 25; if ($r.Content -match 'acx-login') { Write-Host '   [OK]  le serveur envoie la page v6' -ForegroundColor Green } else { Write-Host '   [KO]  le serveur envoie autre chose' -ForegroundColor Red } } catch { Write-Host '   serveur pas encore pret : attends la fin de Compiling puis recharge la page' -ForegroundColor Yellow }"

echo.
start "" "http://localhost:3000/login?v=7"
echo   La page doit montrer la ligne grise :  Login autonome . v6
echo.
pause
