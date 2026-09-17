@echo off
echo Starting Our Little Universe...
echo.
echo [1/2] Starting backend server...
start "OLU Backend" cmd /k "cd server && npm run dev"
timeout /t 3 /noisy
echo [2/2] Starting frontend...
start "OLU Frontend" cmd /k "cd client && npm run dev"
echo.
echo Both servers starting! Open http://localhost:5173 in your browser.
echo PIN: 1122
pause
