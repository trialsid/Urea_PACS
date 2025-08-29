@echo off
title Urea PACS Distribution System
cls

echo ========================================
echo    UREA PACS DISTRIBUTION SYSTEM
echo ========================================
echo.
echo Starting the server...
echo.
echo 📄 Database: SQLite (local storage)
echo 🚀 Frontend: React + TypeScript  
echo ⚙️  Backend: Node.js + Express
echo 🌐 Browser: Auto-opening at http://localhost:3001
echo.
echo ℹ️  Press Ctrl+C to stop the server
echo ========================================
echo.

REM Clean up any existing server processes on port 3001
echo Checking for existing processes...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3001" ^| find "LISTENING"') do (
    echo Stopping process on port 3001...
    taskkill /F /PID %%a >nul 2>&1
)
timeout /t 1 /nobreak >nul

REM Change to server directory
cd server

REM Start the integrated server in background and open browser
echo Starting integrated server...
start /B node dist\server.js

REM Wait a moment for server to start
timeout /t 3 /nobreak >nul

REM Open browser to the application
echo Opening browser...
start http://localhost:3001

REM Keep the command window open and wait for server
echo Server is running in background...
echo Press any key to stop the server and exit.
pause >nul

REM Kill only the server process when done
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3001" ^| find "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)

REM If server stops, pause to show any error messages
echo.
echo Server stopped.
pause