#!/bin/bash

echo "⚡ Starting Urea PACS Fast Development Mode..."
echo "🔥 Frontend + Backend in parallel (no build step)"
echo ""

# Get the current directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

echo "📁 Project root: $PROJECT_ROOT"
echo ""

# Check if we're in the correct directory
if [ ! -f "$PROJECT_ROOT/package.json" ]; then
    echo "❌ Error: package.json not found in project root"
    echo "   Please run this script from the Urea_PACS directory"
    exit 1
fi

# Function to kill background processes
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $FRONTEND_PID $BACKEND_PID 2>/dev/null
    exit
}

# Set up trap to clean up on exit
trap cleanup SIGINT SIGTERM

echo "🎯 Starting frontend dev server (Vite)..."
cd "$PROJECT_ROOT"
npm run dev &
FRONTEND_PID=$!

echo "🎯 Starting backend dev server (Express)..."
cd "$PROJECT_ROOT/server"
npm run dev &
BACKEND_PID=$!

echo ""
echo "✅ Both servers starting..."
echo "🌐 Frontend: http://localhost:5173 (dev with hot reload)"
echo "🌐 Backend:  http://localhost:3001 (full API + static files)"
echo "💡 Use frontend URL for development with hot reload"
echo "💡 Use backend URL for production-like testing"
echo ""
echo "🛑 Press Ctrl+C to stop both servers"
echo ""

# Wait for both processes
wait $FRONTEND_PID $BACKEND_PID