const canvas = document.getElementById('paint-canvas');
const ctx = canvas.getContext('2d');
let painting = false;
let color = document.getElementById('color-picker').value;
let size = document.getElementById('brush-size').value;

canvas.addEventListener('mousedown', () => painting = true);
canvas.addEventListener('mouseup', () => painting = false);
canvas.addEventListener('mouseleave', () => painting = false);
canvas.addEventListener('mousemove', draw);

document.getElementById('color-picker').addEventListener('input', e => color = e.target.value);
document.getElementById('brush-size').addEventListener('input', e => size = e.target.value);
document.getElementById('clear-btn').onclick = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};

function draw(e) {
  if (!painting) return;
  ctx.lineWidth = size;
  ctx.lineCap = 'round';
  ctx.strokeStyle = color;
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
}
canvas.addEventListener('mousedown', e => {
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
});