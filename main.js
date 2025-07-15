// ... All JavaScript from the <script> tag in index.html goes here ...
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
  // If app is already open and not multi-instance, focus it
  let win = openWindows.find(w => w.dataset.appTitle === title);
  if (win && !['Notepad'].includes(title)) {
    focusWindow(win);
    return;
  }
  win = document.createElement('div');
  win.className = 'window';
  win.dataset.appTitle = title;
  win.style.zIndex = zIndexCounter++;
  win.innerHTML = `
    <div class="title-bar">
      <span>${title}</span>
      <span class="window-controls">
        <button class="minimize" title="Minimize">&#x2015;</button>
        <button class="maximize" title="Maximize">&#x25A1;</button>
        <button class="close" title="Close">&#x2715;</button>
      </span>
    </div>
    <div class="content">${getAppContent(title)}</div>
  `;
  desktop.appendChild(win);
  makeDraggable(win);
  win.addEventListener('mousedown', () => focusWindow(win));
  focusWindow(win);
  openWindows.push(win);
  updateTaskbar();
  // Window controls
  const [minBtn, maxBtn, closeBtn] = win.querySelectorAll('.window-controls button');
  // macOS traffic lights: swap order and hide icons
  if (document.body.getAttribute('data-theme') === 'macos') {
    win.querySelector('.window-controls').innerHTML = `
      <button class="close" title="Close"></button>
      <button class="minimize" title="Minimize"></button>
      <button class="maximize" title="Maximize"></button>
    `;
  }
  // Re-query after possible macOS swap
  const controls = win.querySelectorAll('.window-controls button');
  const minBtn2 = controls[1] || minBtn;
  const maxBtn2 = controls[2] || maxBtn;
  const closeBtn2 = controls[0] || closeBtn;
  minBtn2.onclick = e => {
    e.stopPropagation();
    win.style.display = 'none';
    updateTaskbar();
  };
  maxBtn2.onclick = e => {
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
  closeBtn2.onclick = e => {
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
    btn.style = 'background:none;border:none;padding:6px 14px;margin:0 2px;border-radius:8px;cursor:pointer;font-weight:500;font-size:1em;transition:background 0.15s;';
    if (win.style.display !== 'none') btn.style.background = '#e0e7ef';
    btn.onclick = e => {
      e.stopPropagation();
      if (win.style.display === 'none') win.style.display = '';
      focusWindow(win);
    };
    taskbarApps.appendChild(btn);
  });
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
let iconY = 32;
Object.entries(appIcons).forEach(([app, url], i) => {
  createDesktopIcon(app, 32, iconY, url);
  iconY += 84;
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
      return `<div><b>Settings</b><br><br><label>Theme/OS: <select id='theme-select'><option value='win11'>Windows 11</option><option value='macos'>macOS</option><option value='chromeos'>ChromeOS</option><option value='linux'>Linux</option><option value='dark'>Dark</option><option value='light'>Light</option></select></label><br><br><label>User: <select id='user-select'><option value='user1'>User 1</option><option value='user2'>User 2</option></select></label></div>`;
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

// --- Add widgets, notifications, theme switching, and other logic here as in your original script ---
// (Paste the rest of your original script here)