const fileInput = document.getElementById('music-file');
const audio = document.getElementById('audio');
let playlist = [], currentTrack = 0;
function notifyMusic(msg) {
  if (window.parent && window.parent.notify) window.parent.notify(msg);
}
fileInput.setAttribute('multiple', 'multiple');
fileInput.addEventListener('change', e => {
  playlist = Array.from(e.target.files);
  currentTrack = 0;
  if (playlist.length) {
    playTrack(0);
    renderPlaylist();
  }
});
function playTrack(idx) {
  if (!playlist[idx]) return;
  audio.src = URL.createObjectURL(playlist[idx]);
  audio.play();
  notifyMusic('Now playing: ' + playlist[idx].name);
}
audio.addEventListener('ended', () => {
  if (currentTrack < playlist.length - 1) playTrack(++currentTrack);
});
function renderPlaylist() {
  let list = document.getElementById('playlist');
  if (!list) {
    list = document.createElement('div');
    list.id = 'playlist';
    audio.parentNode.appendChild(list);
  }
  list.innerHTML = playlist.map((f,i) => `<div style='padding:4px 0;${i===currentTrack?'font-weight:bold;':''}'>${f.name}</div>`).join('');
}
// Add next/prev buttons
const btnBar = document.createElement('div');
btnBar.style = 'margin-top:8px;display:flex;gap:8px;';
btnBar.innerHTML = `<button id='prev-btn'>Prev</button><button id='next-btn'>Next</button>`;
audio.parentNode.insertBefore(btnBar, audio.nextSibling);
document.getElementById('prev-btn').onclick = () => { if (currentTrack > 0) playTrack(--currentTrack); };
document.getElementById('next-btn').onclick = () => { if (currentTrack < playlist.length-1) playTrack(++currentTrack); };