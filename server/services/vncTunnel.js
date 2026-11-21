// ==============================================================================
// Multi-User Linux Cloud Desktop - noVNC / RFB WebSocket-to-TCP Proxy Bridge
// Bridges browser noVNC WebSocket client directly to internal X11 x11vnc server
// Enables 100% single-port VNC desktop streaming through Render Web Services
// ==============================================================================

const net = require('net');
const ws = require('ws');

class VncTunnel {
  constructor() {
    this.defaultVncPort = 5901;
    this.defaultVncHost = '127.0.0.1';
  }

  handleWebSocket(clientWs, request) {
    const url = new URL(request.url, `http://${request.headers.host}`);
    const targetPort = parseInt(url.searchParams.get('port'), 10) || this.defaultVncPort;
    const targetHost = url.searchParams.get('host') || this.defaultVncHost;

    console.log(`[VNCTunnel] Client connected to VNC bridge -> forwarding to TCP ${targetHost}:${targetPort}`);

    // Create TCP socket to the internal X11 VNC server
    const tcpSocket = net.createConnection({ host: targetHost, port: targetPort }, () => {
      console.log(`[VNCTunnel] TCP connection established with VNC server at ${targetHost}:${targetPort}`);
    });

    // Disable Nagle's algorithm for low-latency interactive cursor/screen updates
    tcpSocket.setNoDelay(true);

    // Forward binary RFB packets from VNC server (TCP) to Browser (WebSocket)
    tcpSocket.on('data', (chunk) => {
      if (clientWs.readyState === ws.OPEN) {
        clientWs.send(chunk, { binary: true });
      }
    });

    // Forward input packets (mouse, keyboard, clipboard) from Browser (WebSocket) to VNC server (TCP)
    clientWs.on('message', (message) => {
      if (!tcpSocket.destroyed) {
        tcpSocket.write(message);
      }
    });

    // Handle TCP disconnect
    tcpSocket.on('close', () => {
      console.log('[VNCTunnel] TCP socket closed by VNC server.');
      if (clientWs.readyState === ws.OPEN) {
        clientWs.close();
      }
    });

    // Handle WebSocket disconnect
    clientWs.on('close', () => {
      console.log('[VNCTunnel] Browser client disconnected from VNC bridge.');
      if (!tcpSocket.destroyed) {
        tcpSocket.end();
      }
    });

    // Error handling
    tcpSocket.on('error', (err) => {
      console.warn(`[VNCTunnel] TCP connection error (${targetHost}:${targetPort}): ${err.message}`);
      if (clientWs.readyState === ws.OPEN) {
        clientWs.close();
      }
    });

    clientWs.on('error', (err) => {
      console.warn('[VNCTunnel] WebSocket error:', err.message);
      if (!tcpSocket.destroyed) {
        tcpSocket.destroy();
      }
    });
  }
}

module.exports = new VncTunnel();
