# Urea PACS WiFi Hotspot Setup

Transform your Raspberry Pi into a WiFi hotspot running the complete Urea PACS system for mobile access by PACS staff.

## 🏪 What This Does

- **WiFi Hotspot**: Creates "Urea-PACS-System" network
- **Custom Domain**: Access via `http://urea.pacs:3000` 
- **Full PACS App**: Dashboard, Farmers, Orders, Reports
- **Thermal Printing**: Posiflex PP8800 receipt printing
- **Mobile Optimized**: Responsive UI for staff phones
- **Offline Mode**: No internet required

## 🚀 Quick Setup

### 1. Install the Hotspot System
```bash
# Make installation script executable
chmod +x scripts/install-pacs-system.sh

# Run the installer
./scripts/install-pacs-system.sh
```

### 2. Build the Application
```bash
# Build React frontend
npm run build

# Build server (if using TypeScript)
cd server && npm run build
```

### 3. Start the Hotspot System
```bash
# Start hotspot + PACS server
./scripts/setup-pacs-hotspot.sh
```

## 📱 Staff Access Instructions

### Connect to WiFi:
- **Network**: `Urea-PACS-System`
- **Password**: `urea2025`

### Access PACS System:
- **Primary URL**: `http://urea.pacs:3000`
- **Backup IP**: `http://192.168.4.1:3000`

### Full PACS Features:
- ✅ Farmer registration and search
- ✅ Order creation and management  
- ✅ Dashboard with real-time stats
- ✅ Order history and reports
- ✅ Thermal receipt printing
- ✅ Mobile responsive design

## 🎯 System Architecture

```
📱 Staff Mobile Devices
    ↓ WiFi Connection
🏠 Raspberry Pi Hotspot (192.168.4.1)
    ├── 📡 WiFi Access Point (hostapd)
    ├── 🌐 DNS Server (dnsmasq) 
    │   └── urea.pacs → 192.168.4.1
    ├── 🖥️  PACS Web Server (Port 3000)
    │   ├── React Frontend (Dashboard, Forms)
    │   ├── Node.js API Server  
    │   └── SQLite Database
    └── 🖨️  Thermal Printer (USB)
```

## 📋 Configuration Files

### Hotspot Configuration
- `config/hostapd.conf` - WiFi access point settings
- `config/dnsmasq.conf` - DHCP and DNS configuration  

### Network Details
- **SSID**: Urea-PACS-System
- **Password**: urea2025  
- **IP Range**: 192.168.4.2 - 192.168.4.20
- **Gateway**: 192.168.4.1
- **DNS**: 192.168.4.1 (resolves urea.pacs)

## 🔧 Management Commands

### Manual Control
```bash
# Start hotspot system
./scripts/setup-pacs-hotspot.sh

# Development mode (no hotspot)
./scripts/start-pacs-dev.sh

# Check service status
sudo systemctl status urea-pacs
sudo systemctl status hostapd
sudo systemctl status dnsmasq
```

### Auto-Start Configuration
```bash
# Enable auto-start on boot
sudo systemctl enable urea-pacs

# Disable auto-start
sudo systemctl disable urea-pacs

# Start/stop service
sudo systemctl start urea-pacs
sudo systemctl stop urea-pacs
```

### Log Monitoring
```bash
# PACS service logs
sudo journalctl -u urea-pacs -f

# Hotspot logs  
sudo journalctl -u hostapd -f
sudo journalctl -u dnsmasq -f
```

## 🖨️ Thermal Printer Setup

### Printer Configuration
- **Model**: Posiflex PP8800
- **Connection**: USB to Raspberry Pi
- **CUPS Name**: `Posiflex-PP8800`
- **Paper**: 3-inch (80mm) thermal paper

### Printer Commands
```bash
# Check printer status
lpstat -p Posiflex-PP8800

# Test print
echo "Test Print" | lp -d Posiflex-PP8800

# View print jobs
lpq -P Posiflex-PP8800
```

## 🔐 Security Notes

- **Network Isolation**: Hotspot provides isolated network
- **No Internet**: Offline operation, no external connectivity
- **Local Access**: Only devices connected to hotspot can access
- **Change Password**: Edit `config/hostapd.conf` to change WiFi password

## 🛠️ Troubleshooting

### Hotspot Not Appearing
```bash
# Check WiFi interface
iwconfig

# Restart hostapd
sudo systemctl restart hostapd
sudo journalctl -u hostapd --no-pager -n 10
```

### Website Not Loading
```bash
# Check PACS service
sudo systemctl status urea-pacs
sudo journalctl -u urea-pacs --no-pager -n 10

# Check DNS resolution
nslookup urea.pacs 192.168.4.1
```

### Printer Issues
```bash
# Check USB connection
lsusb | grep -i posiflex

# Check CUPS
sudo systemctl status cups
lpstat -p
```

### Network Problems
```bash
# Check IP configuration  
ip addr show wlan0

# Check DHCP server
sudo systemctl status dnsmasq
sudo journalctl -u dnsmasq --no-pager -n 10
```

## 🔄 Development Workflow

### Local Development
```bash
# Development server (no hotspot)
./scripts/start-pacs-dev.sh
# Access at http://localhost:3001
```

### Testing Changes
```bash
# 1. Stop hotspot service
sudo systemctl stop urea-pacs

# 2. Make your changes
# Edit React components, server code, etc.

# 3. Rebuild
npm run build
cd server && npm run build

# 4. Test with dev server
./scripts/start-pacs-dev.sh

# 5. Start hotspot system  
./scripts/setup-pacs-hotspot.sh
```

### Production Deployment
```bash
# Build everything
npm run build
cd server && npm run build

# Enable auto-start service
sudo systemctl enable urea-pacs
sudo systemctl start urea-pacs
```

## 📊 System Requirements

- **Hardware**: Raspberry Pi 3B+ or 4
- **OS**: Raspbian/Ubuntu with systemd
- **Storage**: 8GB+ SD card
- **Network**: Built-in WiFi adapter
- **Printer**: Posiflex PP8800 (USB)
- **Power**: 5V 3A power supply

## 🎯 Use Cases

- **Agricultural Cooperatives**: PACS urea distribution
- **Remote Locations**: No internet connectivity required  
- **Mobile Staff**: Access from phones/tablets
- **Instant Receipts**: Thermal printer integration
- **Complete Records**: Full database and reporting

---

**🏪 Ready to serve PACS staff!** Connect to the WiFi hotspot and access the full Urea PACS system from any mobile device.