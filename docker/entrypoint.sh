#!/usr/bin/env bash

echo "============================================================"
echo "  ParrotCloud OS - Master Container Initializing"
echo "  Target Port: ${PORT:-10000}"
echo "  Architecture: Linux $(uname -m)"
echo "============================================================"

# Ensure DISPLAY is set for X11 applications
export DISPLAY=:1
export RESOLUTION="${VNC_RESOLUTION:-1280x720x16}"

# Ensure /tmp/.X11-unix exists with appropriate permissions
mkdir -p /tmp/.X11-unix 2>/dev/null || true
chmod 1777 /tmp/.X11-unix 2>/dev/null || true
rm -f /tmp/.X1-lock /tmp/.X11-unix/X1 2>/dev/null || true

# 1. Start Xvfb (Virtual Framebuffer) on Display :1 in background
echo "[Desktop] Starting Xvfb virtual framebuffer on display :1 (${RESOLUTION})..."
Xvfb :1 -screen 0 "${RESOLUTION}" -ac &
XVFB_PID=$!

sleep 1

# 2. Start Openbox lightweight window manager in background
echo "[Desktop] Launching Openbox window manager..."
openbox &
OPENBOX_PID=$!

# 3. Start x11vnc server listening on localhost port 5901 in background
echo "[Desktop] Starting x11vnc on 127.0.0.1:5901 (RFB)..."
x11vnc -display :1 -nopw -listen 127.0.0.1 -rfbport 5901 -forever -shared -bg &
VNC_PID=$!

# 4. Start Node.js Master Application Server as foreground process
echo "[Server] Launching Node.js master server on port ${PORT:-10000}..."
exec node server/server.js
