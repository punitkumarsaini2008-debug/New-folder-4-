#!/usr/bin/env bash
set -e

echo "============================================================"
echo "  ParrotCloud OS - Render Container Initializing"
echo "  Target Port: ${PORT:-10000}"
echo "  Architecture: Linux $(uname -m)"
echo "============================================================"

# Ensure DISPLAY is set for X11 applications
export DISPLAY=:1
export RESOLUTION="${VNC_RESOLUTION:-1280x720x16}"

# Clean up any stale X11 locks from previous runs
rm -f /tmp/.X1-lock /tmp/.X11-unix/X1

# 1. Start Xvfb (Virtual Framebuffer) on Display :1
echo "[Desktop] Starting Xvfb virtual framebuffer on display :1 (${RESOLUTION})..."
Xvfb :1 -screen 0 "${RESOLUTION}" -ac +extension GLX +render -noreset &
XVFB_PID=$!

# Wait briefly for Xvfb to be ready
sleep 1

# 2. Start Openbox lightweight window manager
echo "[Desktop] Launching Openbox window manager..."
openbox &
OPENBOX_PID=$!

# 3. Start x11vnc server listening on localhost port 5901
echo "[Desktop] Starting x11vnc on 127.0.0.1:5901 (RFB 003.008)..."
x11vnc -display :1 -nopw -listen 127.0.0.1 -rfbport 5901 -forever -shared -bg &
VNC_PID=$!

# Cleanup handler for graceful shutdown
cleanup() {
    echo -e "\n[Shutdown] Stopping desktop services and Node.js..."
    kill -TERM "$NODE_PID" 2>/dev/null || true
    kill -TERM "$VNC_PID" 2>/dev/null || true
    kill -TERM "$OPENBOX_PID" 2>/dev/null || true
    kill -TERM "$XVFB_PID" 2>/dev/null || true
    exit 0
}

trap cleanup SIGTERM SIGINT

# 4. Start Node.js Master Application Server
echo "[Server] Launching Node.js master server on port ${PORT:-10000}..."
node server/server.js &
NODE_PID=$!

# Wait for Node process
wait "$NODE_PID"
