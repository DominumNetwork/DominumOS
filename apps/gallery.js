const upload = document.getElementById('gallery-upload');
const gallery = document.getElementById('gallery');
let images = JSON.parse(localStorage.getItem('gallery-images')||'[]');
function notifyGallery(msg) { if(window.parent&&window.parent.notify)window.parent.notify(msg); }
function renderGallery() {
  gallery.innerHTML = images.map(src=>`<img src='${src}' />`).join('');
}
upload.addEventListener('change', e => {
  Array.from(e.target.files).forEach(file => {
    const reader = new FileReader();
    reader.onload = ev => {
      images.push(ev.target.result);
      localStorage.setItem('gallery-images', JSON.stringify(images));
      renderGallery();
      notifyGallery('Image uploaded!');
    };
    reader.readAsDataURL(file);
  });
});
renderGallery();