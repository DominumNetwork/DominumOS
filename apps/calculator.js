const display = document.getElementById('calc-display');
const buttons = [
  7,8,9,'/',
  4,5,6,'*',
  1,2,3,'-',
  0,'.','=','+'
];
const btnsDiv = document.getElementById('calc-buttons');
let current = '';
buttons.forEach(b => {
  const btn = document.createElement('button');
  btn.textContent = b;
  btn.onclick = () => {
    if (b === '=') {
      try { current = eval(current).toString(); } catch { current = 'Error'; }
      display.value = current;
    } else {
      current += b;
      display.value = current;
    }
  };
  btnsDiv.appendChild(btn);
});
display.value = '';