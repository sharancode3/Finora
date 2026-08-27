@echo off
title Finora - Startup
echo.
echo  ============================================================
echo    Finora - Autonomous AI Financial Controller
echo    Starting Backend (port 8000) and Frontend (port 5173)
echo  ============================================================
echo.

:: Kill any existing processes on these ports (clean slate)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000 2^>nul') do (
    taskkill /PID %%a /F 2^>nul
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173 2^>nul') do (
    taskkill /PID %%a /F 2^>nul
)

timeout /t 1 /nobreak ^>nul

:: Start FastAPI Backend in its own persistent window
start "Finora Backend :8000" cmd /k "title Finora Backend :8000 && cd /d C:\SHARAN PROJECTS\Finora && python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload"

:: Wait 3 seconds for backend to be ready
timeout /t 3 /nobreak ^>nul

:: Start Vite Frontend in its own persistent window
start "Finora Frontend :5173" cmd /k "title Finora Frontend :5173 && cd /d C:\SHARAN PROJECTS\Finora\frontend && npm run dev -- --host 127.0.0.1 --port 5173"

echo.
echo  Backend  -^> http://127.0.0.1:8000
echo  Frontend -^> http://localhost:5173
echo  API Docs -^> http://127.0.0.1:8000/docs
echo.
echo  Both servers are running in their own windows.
echo  You can close this window - servers will keep running.
echo.
