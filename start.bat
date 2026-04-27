@echo off
setlocal enabledelayedexpansion
title English Coach
cd /d "%~dp0"

cls
echo.
echo  ==========================================
echo    English Coach  ^|  Equity Analyst Ed.
echo  ==========================================
echo.

rem Trova primo IP locale (esclude loopback 127.x e APIPA 169.x)
set "IP=???"
for /f "tokens=2 delims=:" %%A in ('ipconfig 2^>nul ^| findstr "IPv4"') do (
    set "_x=%%A"
    set "_x=!_x: =!"
    echo !_x! | findstr /v /b "127\. 169\." >nul 2>&1
    if not errorlevel 1 (
        set "IP=!_x!"
        goto :got_ip
    )
)
:got_ip

echo  PC:       http://localhost:3000
echo  Telefono: http://%IP%:3000
echo.
echo  * Connetti il telefono alla stessa Wi-Fi
echo  * Se Windows chiede di consentire il firewall: clicca Si'
echo  * Ctrl+C per fermare il server
echo  ==========================================
echo.

rem ---- Prova Python ----
where /q python 2>nul
if not errorlevel 1 (
    python -c "import sys" >nul 2>&1
    if not errorlevel 1 (
        echo  Avvio con Python...
        start "" "http://localhost:3000"
        python -m http.server 3000
        goto :fine
    )
)

where /q python3 2>nul
if not errorlevel 1 (
    python3 -c "import sys" >nul 2>&1
    if not errorlevel 1 (
        echo  Avvio con Python3...
        start "" "http://localhost:3000"
        python3 -m http.server 3000
        goto :fine
    )
)

rem ---- Prova Node.js ----
where /q node 2>nul
if not errorlevel 1 (
    echo  Avvio con Node.js...
    start "" "http://localhost:3000"
    npx --yes serve -l 3000 .
    goto :fine
)

rem ---- Niente trovato ----
echo.
echo  =============================================
echo  ERRORE: Python o Node.js non trovati.
echo  =============================================
echo.
echo  Installa Python (gratuito, consigliato):
echo    https://www.python.org/downloads/
echo.
echo  IMPORTANTE: durante l'installazione spunta
echo  "Add Python to PATH" !
echo.
pause

:fine
endlocal
