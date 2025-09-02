#!/bin/bash

echo "🏗️  Installing Urea PACS Hotspot System..."
echo "📦 This will configure your Raspberry Pi as a WiFi hotspot"
echo ""

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo "❌ Don't run this script as root/sudo"
   echo "   The script will ask for sudo when needed"
   exit 1
fi

# Get the current directory (should be the project root)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

echo "📁 Project root: $PROJECT_ROOT"
echo ""

# Install required system packages
echo "📦 Installing system packages..."
sudo apt update
sudo apt install -y hostapd dnsmasq

# Stop services initially
echo "⏹️  Stopping services..."
sudo systemctl stop hostapd
sudo systemctl stop dnsmasq

# Backup existing configuration files
echo "💾 Backing up existing configurations..."
sudo cp /etc/hostapd/hostapd.conf /etc/hostapd/hostapd.conf.backup 2>/dev/null || echo "   No existing hostapd.conf to backup"
sudo cp /etc/dnsmasq.conf /etc/dnsmasq.conf.backup 2>/dev/null || echo "   No existing dnsmasq.conf to backup"

# Install our configuration files
echo "⚙️  Installing PACS configurations..."
sudo cp "$PROJECT_ROOT/config/hostapd.conf" /etc/hostapd/hostapd.conf
sudo cp "$PROJECT_ROOT/config/dnsmasq.conf" /etc/dnsmasq.conf

# Configure hostapd daemon location
echo "📝 Configuring hostapd daemon..."
sudo sed -i 's|#DAEMON_CONF=""|DAEMON_CONF="/etc/hostapd/hostapd.conf"|g' /etc/default/hostapd

# Add custom domains to hosts file
echo "🌐 Adding custom domain entries..."
sudo cp /etc/hosts /etc/hosts.backup
echo "192.168.4.1 urea.pacs pacs.local" | sudo tee -a /etc/hosts

# Enable IP forwarding (for internet sharing if needed later)
echo "🔀 Enabling IP forwarding..."
echo 'net.ipv4.ip_forward=1' | sudo tee -a /etc/sysctl.conf

# Create systemd service for PACS system
echo "🔧 Creating PACS systemd service..."
cat << EOF | sudo tee /etc/systemd/system/urea-pacs.service
[Unit]
Description=Urea PACS System with WiFi Hotspot
After=network.target
Wants=hostapd.service dnsmasq.service

[Service]
Type=forking
User=$USER
WorkingDirectory=$PROJECT_ROOT
ExecStart=$PROJECT_ROOT/scripts/setup-pacs-hotspot.sh
ExecStop=/bin/bash -c 'sudo systemctl stop hostapd; sudo systemctl stop dnsmasq; sudo ip addr flush dev wlan0; sudo systemctl start NetworkManager 2>/dev/null || sudo systemctl start wpa_supplicant 2>/dev/null'
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# Make scripts executable
echo "🔐 Making scripts executable..."
chmod +x "$PROJECT_ROOT/scripts/setup-pacs-hotspot.sh"
chmod +x "$PROJECT_ROOT/scripts/install-pacs-system.sh"

# Reload systemd and enable services
echo "🔄 Reloading systemd..."
sudo systemctl daemon-reload

echo ""
echo "✅ Urea PACS Hotspot System Installed!"
echo ""
echo "🎯 Next Steps:"
echo "   1. Build the PACS application: npm run build"
echo "   2. Test the hotspot: ./scripts/setup-pacs-hotspot.sh"
echo "   3. Or enable auto-start: sudo systemctl enable urea-pacs"
echo ""
echo "📡 WiFi Network: Urea-PACS-System"
echo "🔑 Password: urea2025"
echo "🌐 Access URL: http://urea.pacs:3000"
echo "🖨️  Thermal printing enabled via Posiflex PP8800"
echo ""
echo "⚠️  Important: Ensure the React app is built (npm run build) before starting the hotspot!"