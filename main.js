window.onerror = function(msg, url, line, col, error) {
  alert('JS Error: ' + msg + ' at ' + line + ':' + col);
};

document.addEventListener('DOMContentLoaded', function() {
// --- Draggable Windows ---
function makeDraggable(win) {
  let isDragging = false, offsetX, offsetY;
  const titleBar = win.querySelector('.title-bar');
  if (!titleBar) return;
  titleBar.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - win.offsetLeft;
    offsetY = e.clientY - win.offsetTop;
    document.body.style.userSelect = 'none';
  });
  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    win.style.left = (e.clientX - offsetX) + 'px';
    win.style.top = (e.clientY - offsetY) + 'px';
  });
  document.addEventListener('mouseup', () => {
    isDragging = false;
    document.body.style.userSelect = '';
  });
}
// --- Desktop and Window System ---
const desktop = document.getElementById('desktop');
const contextMenu = document.getElementById('context-menu');
const startMenu = document.getElementById('start-menu');
const startBtn = document.getElementById('start-btn');
const taskbarApps = document.getElementById('taskbar-apps');
const timeDisplay = document.getElementById('time-display');
let zIndexCounter = 20;
let openWindows = [];

// --- Context Menu ---
desktop.addEventListener('contextmenu', e => {
  e.preventDefault();
  contextMenu.style.left = `${e.pageX}px`;
  contextMenu.style.top = `${e.pageY}px`;
  contextMenu.style.display = 'block';
});
window.addEventListener('click', e => {
  if (!contextMenu.contains(e.target)) contextMenu.style.display = 'none';
  if (!startMenu.contains(e.target) && e.target !== startBtn) startMenu.style.display = 'none';
});

// --- Start Menu ---
startBtn.onclick = e => {
  e.stopPropagation();
  startMenu.style.display = startMenu.style.display === 'block' ? 'none' : 'block';
};

// --- Window Management ---
function launchApp(title) {
  let win = openWindows.find(w => w.dataset.appTitle === title);
  if (win) {
    focusWindow(win);
    return;
  }
  win = document.createElement('div');
  win.className = 'window';
  win.dataset.appTitle = title;
  win.style.zIndex = zIndexCounter++;
  let controlsHTML = '';
  const os = document.body.getAttribute('data-os') || 'win11';
  if (os === 'macos') {
    controlsHTML = `
      <button class="close" title="Close"></button>
      <button class="minimize" title="Minimize"></button>
      <button class="maximize" title="Maximize"></button>
    `;
  } else {
    controlsHTML = `
      <button class="minimize" title="Minimize">&#x2015;</button>
      <button class="maximize" title="Maximize">&#x25A1;</button>
      <button class="close" title="Close">&#x2715;</button>
    `;
  }
  let content = getAppContent(title);
  // Special case for Browser: use iframe to apps/browser.html
  if (title === 'Browser') {
    content = `<iframe src='apps/browser.html' style='width:100%;height:90%;border:none;border-radius:8px;background:#fff;'></iframe>`;
  }
  win.innerHTML = `
    <div class="title-bar">
      <span>${title}</span>
      <span class="window-controls">${controlsHTML}</span>
    </div>
    <div class="content">${content}</div>
  `;
  desktop.appendChild(win);
  makeDraggable(win);
  win.addEventListener('mousedown', () => focusWindow(win));
  focusWindow(win);
  openWindows.push(win);
  updateTaskbar();
  // Assign window control actions
  const controls = win.querySelectorAll('.window-controls button');
  let minBtn, maxBtn, closeBtn;
  if (os === 'macos') {
    closeBtn = controls[0];
    minBtn = controls[1];
    maxBtn = controls[2];
  } else {
    minBtn = controls[0];
    maxBtn = controls[1];
    closeBtn = controls[2];
  }
  minBtn.onclick = e => {
    e.stopPropagation();
    win.style.display = 'none';
    updateTaskbar();
  };
  maxBtn.onclick = e => {
    e.stopPropagation();
    if (win.classList.contains('maximized')) {
      win.classList.remove('maximized');
      win.style.top = win.dataset.prevTop;
      win.style.left = win.dataset.prevLeft;
      win.style.width = win.dataset.prevWidth;
      win.style.height = win.dataset.prevHeight;
    } else {
      win.dataset.prevTop = win.style.top;
      win.dataset.prevLeft = win.style.left;
      win.dataset.prevWidth = win.style.width;
      win.dataset.prevHeight = win.style.height;
      win.classList.add('maximized');
      win.style.top = '0';
      win.style.left = '0';
      win.style.width = '100vw';
      win.style.height = 'calc(100vh - 48px)';
    }
  };
  closeBtn.onclick = e => {
    e.stopPropagation();
    win.parentNode && win.parentNode.removeChild(win);
    openWindows = openWindows.filter(w => w !== win);
    updateTaskbar();
  };
}

function focusWindow(win) {
  openWindows.forEach(w => w.classList.remove('active'));
  win.classList.add('active');
  win.style.zIndex = zIndexCounter++;
}

function updateTaskbar() {
  taskbarApps.innerHTML = '';
  openWindows.forEach(win => {
    const btn = document.createElement('button');
    btn.textContent = win.dataset.appTitle;
    btn.style = 'background:none;border:none;padding:6px 14px;margin:0 2px;border-radius:8px;cursor:pointer;font-weight:500;font-size:1em;transition:background 0.15s;position:relative;';
    if (win.style.display !== 'none') btn.style.background = '#e0e7ef';
    // Running indicator
    const indicator = document.createElement('span');
    indicator.style = 'position:absolute;bottom:4px;left:50%;transform:translateX(-50%);width:8px;height:8px;border-radius:50%;background:#2563eb;';
    btn.appendChild(indicator);
    btn.onclick = e => {
      e.stopPropagation();
      if (win.style.display === 'none') win.style.display = '';
      focusWindow(win);
    };
    taskbarApps.appendChild(btn);
  });
  // Make taskbar horizontally scrollable if overflow
  const os = document.body.getAttribute('data-os') || 'win11';
  if (os === 'win11' || os === 'chromeos') {
    taskbarApps.parentElement.style.overflowX = 'auto';
    taskbarApps.parentElement.style.flexWrap = 'nowrap';
  } else {
    taskbarApps.parentElement.style.overflowX = '';
    taskbarApps.parentElement.style.flexWrap = '';
  }
}

// --- Desktop Icons ---
const appIcons = {
  'Terminal': 'https://img.icons8.com/fluency/48/000000/console.png',
  'File Explorer': 'https://img.icons8.com/fluency/48/000000/folder-invoices.png',
  'Browser': 'https://img.icons8.com/fluency/48/000000/internet-browser.png',
  'Settings': 'https://img.icons8.com/fluency/48/000000/settings.png',
  'Notepad': 'https://img.icons8.com/fluency/48/000000/notepad.png',
  'Calculator': 'https://img.icons8.com/fluency/48/000000/calculator.png',
  'Paint': 'https://img.icons8.com/fluency/48/000000/paint-palette.png',
  'Music Player': 'https://img.icons8.com/fluency/48/000000/musical-notes.png',
  'Calendar': 'https://img.icons8.com/fluency/48/000000/calendar.png',
  'Gallery': 'https://img.icons8.com/fluency/48/000000/picture.png',
};
let iconY = 24;
Object.entries(appIcons).forEach(([app, url], i) => {
  createDesktopIcon(app, 24, iconY, url);
  iconY += 86;
});
function createDesktopIcon(title, x, y, iconUrl) {
  const icon = document.createElement('div');
  icon.className = 'desktop-icon';
  icon.style.left = `${x}px`;
  icon.style.top = `${y}px`;
  icon.innerHTML = `<img src="${iconUrl}" /><div>${title}</div>`;
  icon.addEventListener('dblclick', () => launchApp(title));
  desktop.appendChild(icon);
}

function getAppContent(title) {
  switch (title) {
    case 'Terminal':
      return `<div style='font-family:monospace;font-size:1em;background:#181818;color:#0f0;padding:8px;border-radius:6px;height:100%;'>webOS@user:~$ <span id='term-cursor'>█</span></div>`;
    case 'File Explorer':
      return `<div><b>Files:</b><ul><li>Documents</li><li>Pictures</li><li>Music</li><li>Videos</li></ul></div>`;
    case 'Browser':
      return `<iframe src='https://bing.com' style='width:100%;height:90%;border:none;border-radius:8px;'></iframe>`;
    case 'Calendar':
      return `<iframe src='apps/calendar.html' style='width:100%;height:90%;border:none;border-radius:8px;background:#fff;'></iframe>`;
    case 'Gallery':
      return `<iframe src='apps/gallery.html' style='width:100%;height:90%;border:none;border-radius:8px;background:#fff;'></iframe>`;
    case 'Settings':
      return `
      <div class="settings-app" style="display:flex;min-height:260px;">
        <div class="settings-sidebar" style="width:160px;padding:18px 0 18px 0;background:var(--window-bg);border-right:1.5px solid var(--window-border);display:flex;flex-direction:column;gap:8px;">
          <div data-section="appearance" class="active" style="padding:10px 18px;cursor:pointer;border-radius:8px;">Appearance</div>
          <div data-section="system" style="padding:10px 18px;cursor:pointer;border-radius:8px;">System</div>
          <div data-section="users" style="padding:10px 18px;cursor:pointer;border-radius:8px;">Users</div>
          <div data-section="personalization" style="padding:10px 18px;cursor:pointer;border-radius:8px;">Personalization</div>
          <div data-section="widgets" style="padding:10px 18px;cursor:pointer;border-radius:8px;">Widgets</div>
          <div data-section="about" style="padding:10px 18px;cursor:pointer;border-radius:8px;">About</div>
        </div>
        <div class="settings-content" style="flex:1;padding:24px;">
          <section data-section="appearance" class="active">
            <label style="display:block;margin-bottom:12px;">OS Design:<br>
              <select id="os-select" style="margin-top:4px;width:140px;">
                <option value="win11">Windows 11</option>
                <option value="macos">macOS</option>
                <option value="chromeos">ChromeOS</option>
                <option value="linux">Linux</option>
              </select>
            </label>
            <label style="display:block;margin-bottom:12px;">Theme:<br>
              <select id="theme-select" style="margin-top:4px;width:140px;">
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </label>
            <label style="display:block;margin-bottom:12px;">Accent Color:<br>
              <input type="color" id="accent-color" value="#2563eb" style="margin-top:4px;width:40px;height:28px;border:none;background:none;" />
            </label>
          </section>
          <section data-section="system" style="display:none;">System settings coming soon.</section>
          <section data-section="users" style="display:none;">User management coming soon.</section>
          <section data-section="personalization" style="display:none;">Wallpaper and personalization coming soon.</section>
          <section data-section="widgets" style="display:none;">Widget toggles coming soon.</section>
          <section data-section="about" style="display:none;">WebOS v1.0<br>By DominumNetwork</section>
        </div>
      </div>
      `;
    case 'Notepad':
      return `<iframe src='apps/notepad.html' style='width:100%;height:90%;border:none;border-radius:8px;background:#fff;'></iframe>`;
    case 'Calculator':
      return `<iframe src='apps/calculator.html' style='width:100%;height:90%;border:none;border-radius:8px;background:#fff;'></iframe>`;
    case 'Paint':
      return `<iframe src='apps/paint.html' style='width:100%;height:90%;border:none;border-radius:8px;background:#fff;'></iframe>`;
    case 'Music Player':
      return `<iframe src='apps/music.html' style='width:100%;height:90%;border:none;border-radius:8px;background:#fff;'></iframe>`;
    default:
      return `This is the ${title} app.`;
  }
}

// --- Time ---
function updateTime() {
  const now = new Date();
  timeDisplay.textContent = now.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
}
setInterval(updateTime, 1000);
updateTime();

// --- Battery SVG ---
function renderBattery(level = 0.7, charging = false) {
  const color = level > 0.5 ? '#4ade80' : level > 0.2 ? '#facc15' : '#ef4444';
  document.getElementById('battery-svg').innerHTML = `
    <svg viewBox="0 0 36 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="4" width="30" height="12" rx="4" fill="#e5e7eb" stroke="#222" stroke-width="1.5"/>
      <rect x="33" y="8" width="2" height="4" rx="1" fill="#222"/>
      <rect class="battery-fill" x="3" y="6" width="${26*level}" height="8" rx="3" fill="${color}"/>
      ${charging ? '<polygon points="16,7 20,7 18,13 22,13 14,19 16,13 12,13" fill="#2563eb"/>' : ''}
    </svg>
  `;
}
let batteryLevel = 0.7, batteryDir = -0.01;
setInterval(() => {
  batteryLevel += batteryDir * (Math.random()*0.03+0.01);
  if (batteryLevel < 0.15 || batteryLevel > 0.95) batteryDir *= -1;
  renderBattery(batteryLevel, batteryLevel > 0.95);
}, 1200);
renderBattery();

// --- WiFi SVG ---
function renderWifi(strength = 3) {
  document.getElementById('wifi-svg').innerHTML = `
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="25" r="2.5" fill="#2563eb"/>
      <path class="wifi-wave" d="M8 19c4-4 12-4 16 0" stroke="#2563eb" stroke-width="2.5" fill="none"/>
      <path class="wifi-wave" d="M4 15c6-6 18-6 24 0" stroke="#2563eb" stroke-width="2" fill="none"/>
      <path class="wifi-wave" d="M12 23c2-2 6-2 8 0" stroke="#2563eb" stroke-width="2.5" fill="none"/>
    </svg>
  `;
}
setInterval(() => renderWifi(Math.floor(Math.random()*4)), 2000);
renderWifi();

// --- Add widgets, notifications, theme switching, and other logic here as in your original script ---
// (Paste the rest of your original script here)

// --- Theme/OS Switching ---
document.addEventListener('change', function(e) {
  if (e.target && e.target.id === 'theme-select') {
    document.body.setAttribute('data-theme', e.target.value);
  }
});

// --- Ensure only one instance of each app ---
// (Already handled in launchApp, but remove Notepad exception)
// In launchApp, replace:
//   if (win && !['Notepad'].includes(title)) {
// with:
//   if (win) {
//     focusWindow(win);
//     return;
//   }
// (This is done below)

// --- Fix window control order for macOS and ensure X always closes ---
// (Already handled by re-querying controls, but make sure closeBtn2 is always the close button)

window.launchApp = launchApp;
window.makeDraggable = makeDraggable;
});

// --- Add app shortcuts to the taskbar ---
document.addEventListener('DOMContentLoaded', function() {
  const taskbarLeft = document.querySelector('#taskbar .left');
  if (taskbarLeft) {
    const apps = [
      { title: 'Browser', icon: 'https://img.icons8.com/fluency/48/000000/internet-browser.png' },
      { title: 'File Explorer', icon: 'https://img.icons8.com/fluency/48/000000/folder-invoices.png' },
      { title: 'Settings', icon: 'https://img.icons8.com/fluency/48/000000/settings.png' }
    ];
    apps.forEach(app => {
      const btn = document.createElement('button');
      btn.title = app.title;
      btn.style = 'background:none;border:none;padding:2px 6px;margin:0 2px;border-radius:8px;cursor:pointer;';
      btn.innerHTML = `<img src="${app.icon}" style="width:28px;height:28px;vertical-align:middle;"/>`;
      btn.onclick = () => launchApp(app.title);
      taskbarLeft.appendChild(btn);
    });
  }
});

// --- Settings Sidebar Navigation ---
document.addEventListener('click', function(e) {
  if (e.target.closest('.settings-sidebar div')) {
    const section = e.target.getAttribute('data-section');
    document.querySelectorAll('.settings-sidebar div').forEach(d => d.classList.remove('active'));
    e.target.classList.add('active');
    document.querySelectorAll('.settings-content section').forEach(s => {
      s.classList.toggle('active', s.getAttribute('data-section') === section);
    });
  }
});

// --- Theme/OS and Accent Switching ---
document.addEventListener('change', function(e) {
  if (e.target && e.target.id === 'os-select') {
    document.body.setAttribute('data-os', e.target.value);
    localStorage.setItem('os', e.target.value);
  }
  if (e.target && e.target.id === 'theme-select') {
    document.body.setAttribute('data-theme', e.target.value);
    localStorage.setItem('theme', e.target.value);
  }
  if (e.target && e.target.id === 'accent-color') {
    document.documentElement.style.setProperty('--accent', e.target.value);
    localStorage.setItem('accent', e.target.value);
  }
});
// On load, restore theme, os, accent
(function(){
  const os = localStorage.getItem('os') || 'win11';
  const theme = localStorage.getItem('theme') || 'light';
  const accent = localStorage.getItem('accent') || '#2563eb';
  document.body.setAttribute('data-os', os);
  document.body.setAttribute('data-theme', theme);
  document.documentElement.style.setProperty('--accent', accent);
})();

// --- Make desktop icons draggable and persist positions ---
let draggedIcon = null, iconOffsetX = 0, iconOffsetY = 0;
desktop.addEventListener('mousedown', function(e) {
  const icon = e.target.closest('.desktop-icon');
  if (icon) {
    draggedIcon = icon;
    iconOffsetX = e.clientX - icon.offsetLeft;
    iconOffsetY = e.clientY - icon.offsetTop;
    desktop.appendChild(icon);
    document.body.style.userSelect = 'none';
  }
});
desktop.addEventListener('mousemove', function(e) {
  if (draggedIcon) {
    draggedIcon.style.left = (e.clientX - iconOffsetX) + 'px';
    draggedIcon.style.top = (e.clientY - iconOffsetY) + 'px';
  }
});
desktop.addEventListener('mouseup', function(e) {
  if (draggedIcon) {
    saveIconPositions();
    draggedIcon = null;
    document.body.style.userSelect = '';
  }
});
function saveIconPositions() {
  const icons = Array.from(document.querySelectorAll('.desktop-icon')).map(icon => ({
    title: icon.querySelector('div').textContent,
    left: icon.style.left,
    top: icon.style.top
  }));
  localStorage.setItem('desktopIcons', JSON.stringify(icons));
}
function restoreIconPositions() {
  const icons = JSON.parse(localStorage.getItem('desktopIcons')||'[]');
  icons.forEach(data => {
    const icon = Array.from(document.querySelectorAll('.desktop-icon')).find(i => i.querySelector('div').textContent === data.title);
    if (icon) {
      icon.style.left = data.left;
      icon.style.top = data.top;
    }
  });
}
document.addEventListener('DOMContentLoaded', restoreIconPositions);

// --- Notification System ---
window.notify = function(msg, type = 'info') {
  const area = document.getElementById('notification-area');
  if (!area) return;
  const note = document.createElement('div');
  note.textContent = msg;
  note.style = `background:${type==='error'?'#e81123':'#2563eb'};color:#fff;padding:12px 20px;border-radius:8px;margin-bottom:8px;box-shadow:0 2px 8px #0003;font-size:1em;opacity:0.95;`;
  area.appendChild(note);
  setTimeout(()=>note.remove(), 3500);
};

// --- Taskbar Running App Indicator ---
function updateTaskbar() {
  taskbarApps.innerHTML = '';
  openWindows.forEach(win => {
    const btn = document.createElement('button');
    btn.textContent = win.dataset.appTitle;
    btn.style = 'background:none;border:none;padding:6px 14px;margin:0 2px;border-radius:8px;cursor:pointer;font-weight:500;font-size:1em;transition:background 0.15s;position:relative;';
    if (win.style.display !== 'none') btn.style.background = '#e0e7ef';
    // Running indicator
    const indicator = document.createElement('span');
    indicator.style = 'position:absolute;bottom:4px;left:50%;transform:translateX(-50%);width:8px;height:8px;border-radius:50%;background:#2563eb;';
    btn.appendChild(indicator);
    btn.onclick = e => {
      e.stopPropagation();
      if (win.style.display === 'none') win.style.display = '';
      focusWindow(win);
    };
    taskbarApps.appendChild(btn);
  });
  // Make taskbar horizontally scrollable if overflow
  const os = document.body.getAttribute('data-os') || 'win11';
  if (os === 'win11' || os === 'chromeos') {
    taskbarApps.parentElement.style.overflowX = 'auto';
    taskbarApps.parentElement.style.flexWrap = 'nowrap';
  } else {
    taskbarApps.parentElement.style.overflowX = '';
    taskbarApps.parentElement.style.flexWrap = '';
  }
}

// --- macOS menubar widgets ---
function updateMacOSMenubar() {
  if (document.body.getAttribute('data-os') !== 'macos') return;
  document.getElementById('macos-time').textContent = timeDisplay.textContent;
  document.getElementById('macos-wifi').innerHTML = document.getElementById('wifi-svg').innerHTML;
  document.getElementById('macos-battery').innerHTML = document.getElementById('battery-svg').innerHTML;
}
setInterval(updateMacOSMenubar, 1000);

function renderMacOSDock() {
  const dock = document.getElementById('macos-dock');
  if (document.body.getAttribute('data-os') !== 'macos') {
    dock.style.display = 'none';
    return;
  }
  dock.style.display = 'flex';
  dock.innerHTML = '';
  Object.entries(appIcons).forEach(([app, url]) => {
    const icon = document.createElement('div');
    icon.className = 'dock-icon';
    icon.title = app;
    icon.innerHTML = `<img src="${url}" alt="${app}" />`;
    icon.onclick = () => launchApp(app);
    dock.appendChild(icon);
  });
}
document.addEventListener('DOMContentLoaded', renderMacOSDock);
// Also update dock when OS changes
const observer = new MutationObserver(renderMacOSDock);
observer.observe(document.body, { attributes: true, attributeFilter: ['data-os'] });
