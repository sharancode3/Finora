# Finora Server Startup Script
# Runs both backend and frontend independently as separate processes.
# These survive AI sandbox restarts because they are OS-level processes.

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  Finora - Autonomous AI Financial Controller" -ForegroundColor White
Write-Host "  Starting Backend :8000 and Frontend :5173" -ForegroundColor White  
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# --- Kill any stale processes on target ports ---
$ports = @(8000, 5173)
foreach ($port in $ports) {
    $pid_list = netstat -ano | Select-String ":$port\s" | ForEach-Object {
        ($_ -split '\s+')[-1]
    } | Select-Object -Unique
    foreach ($p in $pid_list) {
        if ($p -match '^\d+$' -and $p -ne '0') {
            try { Stop-Process -Id $p -Force -ErrorAction SilentlyContinue } catch {}
        }
    }
}
Start-Sleep -Seconds 1

# --- Start Backend (FastAPI + Uvicorn) ---
$backendArgs = @{
    FilePath         = "python"
    ArgumentList     = "-m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload"
    WorkingDirectory = "C:\SHARAN PROJECTS\Finora"
    WindowStyle      = "Normal"
    PassThru         = $true
}
$backend = Start-Process @backendArgs
Write-Host "  [OK] Backend started  → http://127.0.0.1:8000  (PID $($backend.Id))" -ForegroundColor Green

Start-Sleep -Seconds 3

# --- Start Frontend (Vite dev server) ---
$frontendArgs = @{
    FilePath         = "npm"
    ArgumentList     = "run dev -- --host 127.0.0.1 --port 5173"
    WorkingDirectory = "C:\SHARAN PROJECTS\Finora\frontend"
    WindowStyle      = "Normal"
    PassThru         = $true
}
$frontend = Start-Process @frontendArgs
Write-Host "  [OK] Frontend started → http://localhost:5173  (PID $($frontend.Id))" -ForegroundColor Green

Write-Host ""
Write-Host "  Both servers are running as independent OS processes." -ForegroundColor Yellow
Write-Host "  They will NOT be affected by AI assistant restarts." -ForegroundColor Yellow
Write-Host ""
Write-Host "  Backend  → http://127.0.0.1:8000"
Write-Host "  Frontend → http://localhost:5173"
Write-Host "  API Docs → http://127.0.0.1:8000/docs"
