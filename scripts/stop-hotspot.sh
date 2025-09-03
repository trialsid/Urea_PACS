#!/bin/bash

echo "🔄 Stopping PACS Hotspot and restoring internet..."

# Stop hotspot services
sudo systemctl stop hostapd 2>/dev/null
sudo systemctl stop dnsmasq 2>/dev/null

# Flush WiFi interface
sudo ip addr flush dev wlan0

# Restart normal network services
sudo systemctl start NetworkManager 2>/dev/null || sudo systemctl start wpa_supplicant 2>/dev/null

echo "✅ Hotspot stopped, internet restored"
echo "📶 You should be able to connect to WiFi normally now"