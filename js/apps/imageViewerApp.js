// ==============================================================================
// Multi-OS Cybersecurity Platform - Image Viewer & Wallpaper Setter
// ==============================================================================

class ImageViewerApp {
  open(imgName = 'Security_Topology.svg') {
    const iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`;

    const container = document.createElement('div');
    container.className = 'tool-container';
    container.innerHTML = `
      <div class="tool-toolbar" style="background:#131a26; justify-content:space-between;">
        <span style="font-weight:700; color:var(--parrot-cyan); font-size:12px;">Image Viewer: ${imgName}</span>
        <div style="display:flex; gap:6px;">
          <button class="tool-btn" id="img-zoom-in">Zoom In</button>
          <button class="tool-btn" id="img-zoom-out">Zoom Out</button>
          <button class="tool-btn primary" id="img-set-wallpaper">Set as Desktop Wallpaper</button>
        </div>
      </div>

      <div style="flex:1; background:#070a0f; display:flex; align-items:center; justify-content:center; overflow:hidden; padding:20px;">
        <div id="img-preview-box" style="width:500px; height:320px; border-radius:8px; border:2px solid var(--parrot-cyan); background:radial-gradient(circle at 50% 50%, #00363d 0%, #070e17 100%); display:flex; flex-direction:column; align-items:center; justify-content:center; box-shadow:0 0 24px rgba(0,229,255,0.2);">
          <svg style="width:80px;height:80px;color:var(--parrot-cyan);margin-bottom:12px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
          <div style="font-weight:700; color:#ffffff; font-size:16px;">${imgName}</div>
          <div style="font-size:12px; color:#8b949e; margin-top:4px;">1920 x 1080 • SVG Vector / Cyber Mesh</div>
        </div>
      </div>
    `;

    window.windowManager.createWindow({
      id: 'image-viewer',
      title: `Photos - ${imgName}`,
      icon: iconSvg,
      width: 680,
      height: 460,
      content: container
    });

    container.querySelector('#img-set-wallpaper').onclick = () => {
      document.getElementById('desktop').style.backgroundImage = 'radial-gradient(circle at 50% 50%, #00363d 0%, #070e17 100%)';
      window.notifications.show('Appearance', 'Wallpaper applied to desktop', 'info');
    };
  }
}

window.imageViewerApp = new ImageViewerApp();
window.openImageViewerApp = (name) => window.imageViewerApp.open(name);
