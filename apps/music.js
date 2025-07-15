const fileInput = document.getElementById('music-file');
const audio = document.getElementById('audio');
fileInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (file) {
    audio.src = URL.createObjectURL(file);
    audio.play();
  }
});