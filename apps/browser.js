const tabs = [];
let activeTab = null;
let browserTheme = localStorage.getItem('browserTheme') || 'light';
let bookmarks = JSON.parse(localStorage.getItem('browserBookmarks') || '[]');
let proxyMode = 'direct';
let uvReady = false;

// Initialize UV when scripts are loaded
function initUV() {
  if (typeof window.uv !== 'undefined') {
    console.log('UV loaded successfully');
    uvReady = true;
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/src/uv/uv.sw.js', {
        scope: '/src/uv/'
      }).then(() => {
        console.log('UV Service Worker registered');
      }).catch(err => {
        console.error('UV Service Worker registration failed:', err);
      });
    }
  } else {
    console.error('UV not loaded');
    uvReady = false;
  }
}

// Check if UV is ready
setTimeout(initUV, 1000);

function setBrowserTheme(theme) {
  document.body.setAttribute('data-browser-theme', theme);
  browserTheme = theme;
  localStorage.setItem('browserTheme', theme);
}
setBrowserTheme(browserTheme);

function renderTabs() {
  const tabBar = document.querySelector('.browser-tabs');
  tabBar.innerHTML = '';
  tabs.forEach((tab, i) => {
    const tabEl = document.createElement('div');
    tabEl.className = 'tab' + (tab === activeTab ? ' active' : '');
    tabEl.textContent = tab.title;
    tabEl.onclick = () => switchTab(tab);
    const closeBtn = document.createElement('button');
    closeBtn.className = 'close-tab';
    closeBtn.textContent = '×';
    closeBtn.onclick = (e) => { e.stopPropagation(); closeTab(tab); };
    tabEl.appendChild(closeBtn);
    tabBar.appendChild(tabEl);
  });
  const addBtn = document.createElement('button');
  addBtn.id = 'add-tab';
  addBtn.textContent = '+';
  addBtn.onclick = addTab;
  tabBar.appendChild(addBtn);
}

function renderNavbar() {
  document.getElementById('browser-address').value = activeTab ? activeTab.url : '';
}

function renderBookmarks() {
  const bar = document.querySelector('.browser-bookmarks');
  bar.innerHTML = '';
  bookmarks.forEach(bm => {
    const bmEl = document.createElement('span');
    bmEl.className = 'bookmark';
    bmEl.textContent = bm.title;
    bmEl.onclick = () => openUrl(bm.url);
    bar.appendChild(bmEl);
  });
}

function renderContent() {
  const content = document.querySelector('.browser-content');
  content.innerHTML = '';
  if (!activeTab || !activeTab.url) {
    // New tab page
    const ntp = document.createElement('div');
    ntp.style = 'padding:32px;text-align:center;';
    ntp.innerHTML = `<h2>New Tab</h2><div style='margin:18px 0;'>
      <input id='ntp-search' type='text' placeholder='Search the web...' style='width:60%;padding:8px 16px;border-radius:8px;border:1px solid #ccc;font-size:1.1em;'>
      <button id='ntp-search-btn' style='padding:8px 18px;border-radius:8px;background:#2563eb;color:#fff;border:none;font-size:1.1em;margin-left:8px;'>Search</button>
    </div>`;
    // Shortcuts
    if (bookmarks.length) {
      const sc = document.createElement('div');
      sc.style = 'margin:18px 0;display:flex;justify-content:center;gap:18px;flex-wrap:wrap;';
      bookmarks.forEach(bm => {
        const btn = document.createElement('button');
        btn.className = 'bookmark';
        btn.textContent = bm.title;
        btn.onclick = () => openUrl(bm.url);
        sc.appendChild(btn);
      });
      ntp.appendChild(sc);
    }
    content.appendChild(ntp);
    setTimeout(() => {
      document.getElementById('ntp-search').onkeydown = e => { if (e.key === 'Enter') searchNtp(); };
      document.getElementById('ntp-search-btn').onclick = searchNtp;
    }, 0);
  } else {
    const iframe = document.createElement('iframe');
    if (proxyMode === 'ultraviolet' && uvReady) {
      // Use Ultraviolet proxy
      try {
        const encodedUrl = window.uv.encodeUrl(activeTab.url);
        console.log('Original URL:', activeTab.url);
        console.log('Encoded URL:', encodedUrl);
        iframe.src = encodedUrl;
      } catch (error) {
        console.error('UV encoding failed:', error);
        iframe.src = activeTab.url; // Fallback to direct
      }
    } else {
      // Direct mode or UV not ready
      if (proxyMode === 'ultraviolet' && !uvReady) {
        console.warn('UV not ready, using direct mode');
      }
      iframe.src = activeTab.url;
    }
    iframe.style = 'width:100%;height:100%;border:none;';
    content.appendChild(iframe);
  }
}

function addTab(url = '', title = 'New Tab') {
  const tab = { url, title };
  tabs.push(tab);
  switchTab(tab);
  renderTabs();
  renderNavbar();
  renderContent();
}

function closeTab(tab) {
  const idx = tabs.indexOf(tab);
  if (idx !== -1) {
    tabs.splice(idx, 1);
    if (activeTab === tab) {
      activeTab = tabs[idx] || tabs[idx-1] || null;
    }
    renderTabs();
    renderNavbar();
    renderContent();
  }
}

function switchTab(tab) {
  activeTab = tab;
  renderTabs();
  renderNavbar();
  renderContent();
}

function openUrl(url) {
  if (!/^https?:\/\//.test(url) && !url.startsWith('about:')) {
    // treat as search
    url = 'https://www.bing.com/search?q=' + encodeURIComponent(url);
  }
  activeTab.url = url;
  activeTab.title = url;
  renderTabs();
  renderNavbar();
  renderContent();
}

function searchNtp() {
  const val = document.getElementById('ntp-search').value;
  if (val) openUrl(val);
}

document.getElementById('add-tab').onclick = () => addTab();
document.getElementById('go-btn').onclick = () => openUrl(document.getElementById('browser-address').value);
document.getElementById('browser-address').onkeydown = e => { if (e.key === 'Enter') openUrl(e.target.value); };
document.getElementById('back-btn').onclick = () => {
  const iframe = document.querySelector('.browser-content iframe');
  if (iframe && iframe.contentWindow && iframe.contentWindow.history) iframe.contentWindow.history.back();
};
document.getElementById('forward-btn').onclick = () => {
  const iframe = document.querySelector('.browser-content iframe');
  if (iframe && iframe.contentWindow && iframe.contentWindow.history) iframe.contentWindow.history.forward();
};
document.getElementById('reload-btn').onclick = () => {
  const iframe = document.querySelector('.browser-content iframe');
  if (iframe) iframe.contentWindow.location.reload();
};
document.getElementById('proxy-mode').onchange = function() {
  proxyMode = this.value;
  if (activeTab && activeTab.url) {
    renderContent();
  }
};

// Bookmarks bar: right-click to add current tab as bookmark
const bookmarksBar = document.querySelector('.browser-bookmarks');
bookmarksBar.oncontextmenu = e => {
  e.preventDefault();
  if (activeTab && activeTab.url) {
    const title = prompt('Bookmark title:', activeTab.title || activeTab.url);
    if (title) {
      bookmarks.push({ title, url: activeTab.url });
      localStorage.setItem('browserBookmarks', JSON.stringify(bookmarks));
      renderBookmarks();
      renderContent();
    }
  }
};

// Browser theme switcher (right-click tab bar)
document.querySelector('.browser-tabs').oncontextmenu = e => {
  e.preventDefault();
  const theme = browserTheme === 'light' ? 'dark' : 'light';
  setBrowserTheme(theme);
};

// Initial render
addTab();
renderBookmarks();