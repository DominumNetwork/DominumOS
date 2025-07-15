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
// ... (continue with the rest of the script from index.html) ...