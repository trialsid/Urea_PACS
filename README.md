# 🌾 Urea PACS Distribution System

A desktop application for managing Urea fertilizer distribution through Primary Agricultural Credit Societies (PACS).

## ⚡ Quick Start

1. **Double-click `start.bat`** to launch the application
2. The browser will automatically open to the application
3. Begin processing farmer orders immediately

## 🎯 Features

- **Aadhaar-based farmer identification** with double-entry validation
- **Order management** (2 bags Urea @ ₹268 each)
- **Payment collection** workflow with cash calculator
- **3-inch thermal receipt printing**
- **Order history** tracking per farmer
- **Offline operation** with local SQLite database

## 📋 System Requirements

- Windows 10 or later
- Node.js 18+ installed
- 3-inch thermal printer (optional)

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete setup and deployment instructions.

## 🏗️ Technology Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express
- **Database**: SQLite (local file-based)
- **Styling**: Custom minimal CSS with Inter font
- **Architecture**: Single integrated server serving both API and frontend

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

---

**🚀 Ready to use!** Just run `start.bat` and start processing orders.