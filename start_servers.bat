@echo off
echo Starting Finora Backend and Frontend...

:: Start the FastAPI Backend in a new window
start cmd /k "title Finora Backend && set PYTHONPATH=C:\SHARAN PROJECTS\Finora && cd /d C:\SHARAN PROJECTS\Finora\backend && python main.py"

:: Start the Vite Frontend in a new window
start cmd /k "title Finora Frontend && cd /d C:\SHARAN PROJECTS\Finora\frontend && npm run dev"

echo Servers are booting up in separate windows!
echo You can now safely ignore any AI sandbox restarts.
pause
