#!/bin/bash

echo "🏪 Starting Urea PACS WiFi Hotspot System..."
echo "📱 Setting up hotspot for PACS staff access"
echo ""

# Stop all network services that might interfere
echo "🔄 Stopping all WiFi client services..."
sudo systemctl stop wpa_supplicant 2>/dev/null
sudo systemctl stop NetworkManager 2>/dev/null
sudo systemctl stop dhcpcd 2>/dev/null

# Kill any remaining wpa processes
sudo pkill wpa_supplicant 2>/dev/null
sudo pkill dhcpcd 2>/dev/null

# Completely flush and reset WiFi interface
echo "🔧 Completely resetting WiFi interface..."
sudo ip link set wlan0 down
sleep 2

# Remove all IP addresses and routes
sudo ip addr flush dev wlan0
sudo ip route flush dev wlan0

# Bring interface back up
sudo ip link set wlan0 up
sleep 2

# Set ONLY the hotspot IP (no other IPs)
echo "🌐 Setting hotspot IP 192.168.4.1..."
sudo ip addr add 192.168.4.1/24 dev wlan0

# Start hostapd (Access Point)
echo "📡 Starting WiFi Access Point..."
sudo systemctl start hostapd

# Start DHCP server
echo "🔧 Starting DHCP server..."
sudo systemctl start dnsmasq

# Wait for services to fully start
sleep 3

# Verify services are running
if sudo systemctl is-active --quiet hostapd && sudo systemctl is-active --quiet dnsmasq; then
    echo ""
    echo "✅ Urea PACS System Ready!"
    echo ""
    echo "📡 WiFi Hotspot: 'Urea-PACS-System'"
    echo "🔑 Password: urea2025"
    echo "🌐 Staff Access: http://urea.pacs:3000"
    echo "🌐 Or use IP: http://192.168.4.1:3000"
    echo "🖨️  Printer: Posiflex PP8800 Connected"
    echo "📊 Full PACS Dashboard, Farmers, Orders"
    echo ""
    echo "👥 Staff Instructions:"
    echo "   1. Connect to WiFi: Urea-PACS-System"
    echo "   2. Use password: urea2025"
    echo "   3. Open browser: http://urea.pacs:3000"
    echo "   4. Access full PACS system"
    echo "   5. Print thermal receipts"
    echo ""
    echo "🛑 Press Ctrl+C to shutdown PACS system"
    echo ""
    
    # Get the script directory and project root
    SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
    PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
    
    # Change to the server directory  
    cd "$PROJECT_ROOT/server" || { echo "❌ Server directory not found"; exit 1; }
    
    # Set up complete cleanup on exit
    trap 'echo ""; echo "🔄 Shutting down PACS system..."; sudo systemctl stop hostapd; sudo systemctl stop dnsmasq; sudo ip addr flush dev wlan0; sudo systemctl start NetworkManager 2>/dev/null || sudo systemctl start wpa_supplicant 2>/dev/null; echo "✅ PACS system stopped"; echo "📶 Network services restarted"; exit 0' INT
    
    # Build PACS server first
    echo "🏗️  Building server..."
    npm run build
    if [ $? -ne 0 ]; then
        echo "❌ Server build failed"
        exit 1
    fi
    
    # Print READY message BEFORE starting server (app not accessible yet)
    echo "🖨️  Printing READY message..."
    printf "\x1B\x21\x30READY\x1B\x21\x00\n\nWiFi: Urea-PACS-System\n\nAddress:\nhttp://192.168.4.1:3000\nhttp://urea.pacs:3000\n\n\x1D\x56\x00" | sudo tee /dev/usb/lp0 > /dev/null 2>/dev/null || echo "📋 Printer not available"
    
    # NOW start the server - app becomes accessible only after READY prints
    echo "🚀 Starting Urea PACS Server (app now accessible)..."
    npm run start &
    SERVER_PID=$!
    
    # Wait for server process  
    wait $SERVER_PID
    
else
    echo "❌ Failed to start PACS hotspot system"
    echo "📋 Checking hostapd status:"
    sudo journalctl -u hostapd --no-pager -n 3
    echo ""
    echo "📋 Checking dnsmasq status:"  
    sudo journalctl -u dnsmasq --no-pager -n 3
    echo ""
    echo "🔄 Restarting network services..."
    sudo systemctl start NetworkManager 2>/dev/null || sudo systemctl start wpa_supplicant 2>/dev/null
fi