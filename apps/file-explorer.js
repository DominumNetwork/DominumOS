const fileView = document.getElementById('fileView');
const addressBar = document.getElementById('addressBar');
let iconView = true;

const dummyData = {
  Desktop: [
    { name: 'My File.txt', type: 'file' },
    { name: 'Folder A', type: 'folder' }
  ],
  Documents: [
    { name: 'Resume.pdf', type: 'file' },
    { name: 'Projects', type: 'folder' }
  ],
  Downloads: [
    { name: 'Software.zip', type: 'file' },
    { name: 'Game.exe', type: 'file' }
  ],
  Pictures: [
    { name: 'Image1.png', type: 'file' },
    { name: 'Vacation', type: 'folder' }
  ]
};

function loadFolder(name) {
  const items = dummyData[name] || [];
  addressBar.value = '/' + name;
  fileView.innerHTML = '';
  for (let item of items) {
    const div = document.createElement('div');
    div.className = 'file';
    div.innerHTML = `
      <img src="${item.type === 'folder' ? 'https://img.icons8.com/fluency/48/folder-invoices.png' : 'https://img.icons8.com/fluency/48/document.png'}" />
      <div>${item.name}</div>
    `;
    fileView.appendChild(div);
  }
}

function toggleView() {
  iconView = !iconView;
  fileView.style.gridTemplateColumns = iconView ? 'repeat(auto-fill, minmax(120px, 1fr))' : '1fr';
}

// Load default folder
loadFolder('Desktop');
