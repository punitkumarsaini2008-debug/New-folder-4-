// ==============================================================================
// Multi-User Linux Cloud Desktop - Apache Guacamole WebSocket Tunnel
// Connects client browser canvas to guacd daemon via secure internal TCP
// ==============================================================================

const net = require('net');
const config = require('../config');
const db = require('../db');

class GuacamoleTunnelService {
  constructor() {
    this.connections = new Map();
  }

  handleWebSocket(ws, req) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const sessionId = url.searchParams.get('session');
    const width = parseInt(url.searchParams.get('width'), 10) || 1920;
    const height = parseInt(url.searchParams.get('height'), 10) || 1080;
    const dpi = parseInt(url.searchParams.get('dpi'), 10) || 96;

    console.log(`[GuacamoleTunnel] Connection request for session: ${sessionId} (${width}x${height}@${dpi}dpi)`);

    // Verify session in database
    db.query(
      'SELECT id, user_id, container_ip, vnc_internal_port, status FROM user_sessions WHERE id = $1',
      [sessionId]
    ).then(res => {
      if (res.rowCount === 0) {
        ws.send(this.encodeGuacamoleInstruction('error', ['Session not found or expired', '404']));
        ws.close();
        return;
      }

      const session = res.rows[0];
      const targetHost = session.container_ip || '127.0.0.1';
      const targetPort = session.vnc_internal_port || 5901;

      // Connect to guacd daemon
      const guacdSocket = new net.Socket();

      guacdSocket.connect(config.guacd.port, config.guacd.host, () => {
        console.log(`[GuacamoleTunnel] Connected to guacd at ${config.guacd.host}:${config.guacd.port}`);

        // Handshake: select protocol (vnc)
        const selectInstruction = this.encodeGuacamoleInstruction('select', ['vnc']);
        guacdSocket.write(selectInstruction);
      });

      let handshakeStage = 0;

      guacdSocket.on('data', data => {
        const text = data.toString('utf8');

        if (handshakeStage === 0 && text.startsWith('4.args')) {
          // guacd responded with required arguments list
          handshakeStage = 1;
          const sizeInstruction = this.encodeGuacamoleInstruction('size', [width.toString(), height.toString(), dpi.toString()]);
          const audioInstruction = this.encodeGuacamoleInstruction('audio', ['audio/ogg']);
          const videoInstruction = this.encodeGuacamoleInstruction('video', []);
          const imageInstruction = this.encodeGuacamoleInstruction('image', ['image/png', 'image/jpeg', 'image/webp']);

          // Connect instruction specifying internal VNC host & port
          const connectInstruction = this.encodeGuacamoleInstruction('connect', [
            targetHost,
            targetPort.toString(),
            '', // password (empty for internal loopback socket)
            width.toString(),
            height.toString(),
            dpi.toString()
          ]);

          guacdSocket.write(sizeInstruction + audioInstruction + videoInstruction + imageInstruction + connectInstruction);
        } else if (handshakeStage === 1 && text.startsWith('5.ready')) {
          handshakeStage = 2;
          if (ws.readyState === ws.OPEN) {
            ws.send(text);
          }
        } else {
          // Forward stream data to client WebSocket
          if (ws.readyState === ws.OPEN) {
            ws.send(text);
          }
        }
      });

      // Forward client input events (mouse, key, size, clipboard) to guacd
      ws.on('message', message => {
        if (!guacdSocket.destroyed) {
          guacdSocket.write(message);
        }
      });

      ws.on('close', () => {
        console.log(`[GuacamoleTunnel] Client closed session: ${sessionId}`);
        if (!guacdSocket.destroyed) {
          guacdSocket.destroy();
        }
      });

      guacdSocket.on('error', err => {
        console.warn(`[GuacamoleTunnel] guacd TCP socket warning:`, err.message);
        if (ws.readyState === ws.OPEN) {
          // Send educational fallback notice if guacd container is not running locally
          ws.send(this.encodeGuacamoleInstruction('error', [
            `guacd host unreachable (${err.message}). Using local WebGL rendering fallback.`,
            '503'
          ]));
        }
      });

      guacdSocket.on('close', () => {
        if (ws.readyState === ws.OPEN) {
          ws.close();
        }
      });
    }).catch(err => {
      console.error('[GuacamoleTunnel Error]:', err.message);
      if (ws.readyState === ws.OPEN) ws.close();
    });
  }

  // Encodes parameters into Guacamole protocol instruction format: len.param,len.param;
  encodeGuacamoleInstruction(opcode, params) {
    const elements = [opcode, ...params];
    const encoded = elements.map(el => `${Buffer.byteLength(el, 'utf8')}.${el}`).join(',');
    return `${encoded};`;
  }
}

module.exports = new GuacamoleTunnelService();
