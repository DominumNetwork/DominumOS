const area = document.getElementById('notepad-area');
function notifyNotepad(msg) {
  if (window.parent && window.parent.notify) window.parent.notify(msg);
}
function saveNote() {
  localStorage.setItem('notepad-content', area.value);
  notifyNotepad('Note saved!');
}
function loadNote() {
  area.value = localStorage.getItem('notepad-content') || '';
  notifyNotepad('Note loaded!');
}
area.value = localStorage.getItem('notepad-content') || '';
area.addEventListener('input', saveNote);
// Add Save/Load buttons
const btnBar = document.createElement('div');
btnBar.style = 'margin-bottom:8px;display:flex;gap:8px;';
btnBar.innerHTML = `<button id='save-btn'>Save</button><button id='load-btn'>Load</button>`;
area.parentNode.insertBefore(btnBar, area);
document.getElementById('save-btn').onclick = saveNote;
document.getElementById('load-btn').onclick = loadNote;