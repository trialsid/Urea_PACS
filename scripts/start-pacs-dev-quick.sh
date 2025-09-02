#!/bin/bash

echo "🚀 Starting Urea PACS Quick Development Mode..."
echo "💨 Uses existing build, only starts server"
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

# Check if build exists, if not, build once
if [ ! -d "$PROJECT_ROOT/dist" ]; then
    echo "📦 No existing build found, building once..."
    cd "$PROJECT_ROOT"
    npm run build
    
    if [ $? -ne 0 ]; then
        echo "❌ Frontend build failed"
        exit 1
    fi
else
    echo "📦 Using existing build in dist/"
fi

# Start the server
echo ""
echo "🎯 Starting server in development mode..."
echo "🌐 Access at: http://localhost:3001"
echo "📊 Full dashboard, farmers, and orders functionality"
echo "🖨️  Thermal printing ready (if printer connected)"
echo ""
echo "💡 To rebuild frontend: npm run build"
echo "🛑 Press Ctrl+C to stop the server"
echo ""

cd "$PROJECT_ROOT/server"
npm run dev