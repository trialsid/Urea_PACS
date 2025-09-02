#!/bin/bash

echo "🚀 Starting Urea PACS Development Mode..."
echo "💻 This runs the server in dev mode (no hotspot)"
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

# Build the frontend
echo "🏗️  Building React frontend..."
cd "$PROJECT_ROOT"
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed"
    exit 1
fi

# Start the server in development mode
echo ""
echo "🎯 Starting server in development mode..."
echo "🌐 Access at: http://localhost:3001"
echo "📊 Full dashboard, farmers, and orders functionality"
echo "🖨️  Thermal printing ready (if printer connected)"
echo ""
echo "🛑 Press Ctrl+C to stop the server"
echo ""

cd "$PROJECT_ROOT/server"
npm run dev