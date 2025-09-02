# Raspberry Pi Deployment Guide

Complete step-by-step guide for deploying the Urea PACS system to Raspberry Pi with WiFi hotspot and autostart configuration.

## 🚀 Raspberry Pi Deployment Steps

### 1. Clone and Setup on Raspberry Pi
```bash
# SSH into your Raspberry Pi
ssh pi@your-pi-ip

# Clone the repository
git clone <your-repo-url> Urea_PACS
cd Urea_PACS

# Install Node.js dependencies for frontend
npm install

# Install server dependencies
cd server
npm install
cd ..
```

### 2. Build Frontend and Backend
```bash
# Build React frontend (creates dist/ folder)
npm run build

# Build TypeScript backend (creates server/dist/ folder) 
cd server
npm run build
cd ..
```

**Build Output:**
- `dist/` - Production React build (served by Express)
- `server/dist/` - Compiled TypeScript server files

### 3. Install Hotspot System
```bash
# Install WiFi hotspot configuration
chmod +x scripts/*.sh
./scripts/install-pacs-system.sh
```

**This installer will:**
- Install hostapd and dnsmasq packages
- Configure WiFi hotspot settings
- Set up DNS with `urea.pacs` domain mapping
- Create systemd service for autostart
- Backup existing network configurations

### 4. Enable Autostart from Boot
```bash
# Enable the PACS service to start automatically
sudo systemctl enable urea-pacs

# Start the service now
sudo systemctl start urea-pacs

# Check if it's running
sudo systemctl status urea-pacs
```

## 🔧 Complete Boot-to-Ready Sequence

**What happens on Pi boot:**
1. **Pi boots up** - Hardware initialization
2. **urea-pacs service starts** - Systemd launches our service
3. **WiFi hotspot activates** - "Urea-PACS-System" becomes available
4. **DNS server starts** - `urea.pacs` domain resolution active
5. **PACS server launches** - Web server starts on port 3000
6. **System ready** - Staff can connect and access interface

## 📱 Staff Usage After Setup

### Connection Details:
- **WiFi Network**: `Urea-PACS-System`
- **Password**: `urea2025` 
- **Primary URL**: `http://urea.pacs:3000`
- **Backup URL**: `http://192.168.4.1:3000`

### Available Features:
✅ **Dashboard** - Real-time stats and overview  
✅ **Farmer Management** - Registration and search  
✅ **Order Creation** - Urea purchase processing  
✅ **Order History** - Complete transaction records  
✅ **Thermal Printing** - PACS2 format receipts  
✅ **Mobile Interface** - Responsive design for phones  
✅ **Offline Operation** - No internet required  

## 🛠️ System Management Commands

### Service Control
```bash
# Check service status
sudo systemctl status urea-pacs

# Start service
sudo systemctl start urea-pacs

# Stop service
sudo systemctl stop urea-pacs

# Restart service
sudo systemctl restart urea-pacs

# Enable autostart on boot
sudo systemctl enable urea-pacs

# Disable autostart
sudo systemctl disable urea-pacs
```

### Log Monitoring
```bash
# View PACS service logs (live)
sudo journalctl -u urea-pacs -f

# View hotspot logs
sudo journalctl -u hostapd -f
sudo journalctl -u dnsmasq -f

# View recent logs (last 20 lines)
sudo journalctl -u urea-pacs --no-pager -n 20
```

### Manual Operation
```bash
# Start hotspot manually (for testing)
./scripts/setup-pacs-hotspot.sh

# Development mode (no hotspot, localhost only)
./scripts/start-pacs-dev.sh

# Stop all hotspot services
sudo systemctl stop hostapd dnsmasq urea-pacs
```

## 🖨️ Thermal Printer Setup

### Hardware Connection
1. Connect Posiflex PP8800 to Pi via USB
2. Power on printer and Pi
3. Verify connection: `lsusb | grep -i posiflex`

### CUPS Configuration
```bash
# Check printer status
lpstat -p Posiflex-PP8800

# Test print
echo "Test Print from PACS" | lp -d Posiflex-PP8800

# View print jobs
lpq -P Posiflex-PP8800
```

## 🌐 Network Configuration Details

### WiFi Hotspot Settings
- **SSID**: Urea-PACS-System
- **Password**: urea2025
- **Channel**: 7 (2.4GHz)
- **Security**: WPA2-PSK
- **Country Code**: IN (India)

### IP Configuration
- **Pi Gateway**: 192.168.4.1
- **DHCP Range**: 192.168.4.2 - 192.168.4.20
- **Subnet**: 255.255.255.0 (/24)
- **DNS Server**: 192.168.4.1 (Pi itself)

### Domain Resolution
- `urea.pacs` → 192.168.4.1
- `pacs.local` → 192.168.4.1

## 🔄 Development and Updates

### Making Changes
```bash
# 1. Stop the service
sudo systemctl stop urea-pacs

# 2. Pull latest changes
git pull origin main

# 3. Reinstall dependencies (if package.json changed)
npm install
cd server && npm install && cd ..

# 4. Rebuild application
npm run build
cd server && npm run build && cd ..

# 5. Restart service
sudo systemctl start urea-pacs
```

### Testing Before Production
```bash
# Test in development mode first
./scripts/start-pacs-dev.sh
# Access at http://localhost:3001

# Then test hotspot mode
./scripts/setup-pacs-hotspot.sh
# Connect to WiFi and test http://urea.pacs:3000
```

## 🐛 Troubleshooting

### Hotspot Not Appearing
```bash
# Check WiFi interface
iwconfig

# Check hostapd service
sudo systemctl status hostapd
sudo journalctl -u hostapd --no-pager -n 10

# Restart hotspot services
sudo systemctl restart hostapd dnsmasq
```

### Website Not Loading
```bash
# Check PACS service
sudo systemctl status urea-pacs
sudo journalctl -u urea-pacs --no-pager -n 10

# Check if port 3000 is listening
sudo netstat -tlnp | grep :3000

# Test DNS resolution from connected device
nslookup urea.pacs 192.168.4.1
```

### Database Issues
```bash
# Check if database file exists
ls -la server/data/

# Check database permissions
sudo chown -R $USER:$USER server/data/

# View server logs for database errors
sudo journalctl -u urea-pacs | grep -i database
```

### Printer Problems
```bash
# Check USB connection
lsusb | grep -i posiflex

# Check CUPS service
sudo systemctl status cups

# Reset printer queue
sudo cancel -a Posiflex-PP8800
```

## 🔐 Security Considerations

### Network Security
- **Isolated Network**: Hotspot provides air-gapped environment
- **No Internet**: System operates completely offline
- **Local Access Only**: Only connected devices can access PACS
- **Password Protected**: WiFi requires password to connect

### System Security
- **User Permissions**: Service runs as non-root user
- **File Permissions**: Database and logs properly protected
- **Service Isolation**: PACS service contained via systemd

### Customization Options
```bash
# Change WiFi password (edit and reinstall)
nano config/hostapd.conf
./scripts/install-pacs-system.sh

# Change network name/domain
nano config/dnsmasq.conf
./scripts/install-pacs-system.sh
```

## 📊 System Requirements

### Hardware Minimum
- **Raspberry Pi**: 3B+ or 4 (recommended: Pi 4 with 4GB RAM)
- **Storage**: 16GB+ microSD card (Class 10)
- **Power**: 5V 3A official power supply
- **Printer**: Posiflex PP8800 thermal printer
- **Network**: Built-in WiFi adapter

### Software Dependencies
- **OS**: Raspberry Pi OS (Debian-based) with systemd
- **Node.js**: v16+ (installed via NodeSource or package manager)
- **System Packages**: hostapd, dnsmasq, cups
- **Services**: systemd for service management

## 🎯 Production Checklist

### Before Going Live
- [ ] Hardware connected and tested
- [ ] Application built (`npm run build`)
- [ ] Hotspot system installed (`./scripts/install-pacs-system.sh`)
- [ ] Thermal printer configured and tested
- [ ] Autostart enabled (`sudo systemctl enable urea-pacs`)
- [ ] System rebooted and verified working
- [ ] Staff trained on WiFi connection and URL access
- [ ] Backup/recovery procedure documented

### Regular Maintenance
- [ ] Monitor service logs weekly
- [ ] Check thermal paper supply
- [ ] Verify database backups
- [ ] Update system packages monthly
- [ ] Test thermal printer functionality

---

**🏪 System Ready!** Your Raspberry Pi is now configured as a complete PACS hotspot system. Staff can connect to the WiFi and access the full Urea PACS application with thermal printing capabilities.