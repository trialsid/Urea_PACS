# 🌾 Urea PACS Distribution System

A desktop application for managing Urea fertilizer distribution through Primary Agricultural Credit Societies (PACS).

## ⚡ Quick Start

1. **Run `./scripts/setup-pacs-hotspot.sh`** to launch the hotspot system
2. **Connect to WiFi**: `Urea-PACS-System` (password: `urea2025`)
3. **Access application**: `http://urea.pacs:3000` or `http://192.168.4.1:3000`
4. Begin processing farmer orders immediately

## 🎯 Features

- **Aadhaar-based farmer identification** with double-entry validation
- **Order management** (2 bags Urea @ ₹268 each)
- **Payment collection** workflow with cash calculator
- **3-inch thermal receipt printing**
- **Order history** tracking per farmer
- **Offline operation** with local SQLite database

## 📋 System Requirements

- Raspberry Pi 3/4 with Raspberry Pi OS
- Node.js 18+ installed
- WiFi capability for hotspot mode
- Posiflex PP8800 thermal printer (USB connection)

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete setup and deployment instructions.

### Installation
```bash
# Install system dependencies
./scripts/install-pacs-system.sh

# Enable auto-start on boot
sudo systemctl enable urea-pacs
```

## 🔧 Operation Commands

### Service Control
```bash
# Start/Stop/Restart the system
sudo systemctl start urea-pacs
sudo systemctl stop urea-pacs  
sudo systemctl restart urea-pacs

# Check system status
sudo systemctl status urea-pacs

# View live logs
sudo journalctl -u urea-pacs -f
```

### Manual Operation (Development/Testing)
```bash
# Stop service and run manually
sudo systemctl stop urea-pacs
./scripts/setup-pacs-hotspot.sh

# Emergency network restore
./scripts/stop-hotspot.sh
```

### Development
```bash
# Build everything
npm run build && cd server && npm run build

# Development mode (separate terminals)
npm run dev          # Frontend
cd server && npm run dev  # Backend
```

## 🏗️ Technology Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express
- **Database**: SQLite (local file-based)
- **Styling**: Custom minimal CSS with Inter font
- **Architecture**: Single integrated server serving both API and frontend
- **Deployment**: WiFi hotspot mode for offline rural operation

## 📊 Workflow

1. **Aadhaar Entry** → Double-entry validation
2. **Farmer Details** → New registration or existing lookup  
3. **Order Review** → Confirm quantity and pricing
4. **Payment Collection** → Cash handling with change calculation
5. **Receipt Generation** → 3-inch thermal receipt printing

## 💾 Data Storage

- All data stored locally in SQLite database
- No internet connection required
- Automatic database initialization
- Easy backup by copying database file

## 🖨️ Printer Setup

**Posiflex PP8800 Thermal Printer**
- Connect via USB to Raspberry Pi
- Check connection: `lsusb | grep -i posiflex`
- Device path: `/dev/usb/lp0`
- Automatic ESC/POS receipt printing

## 📡 Network Access

- **WiFi Hotspot**: `Urea-PACS-System`
- **Password**: `urea2025`  
- **URLs**: `http://urea.pacs:3000` or `http://192.168.4.1:3000`
- **Coverage**: Local area network for PACS staff devices

---

**🚀 Ready to use!** Just run `./scripts/setup-pacs-hotspot.sh` and start processing orders via WiFi hotspot.