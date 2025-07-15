const area = document.getElementById('notepad-area');
area.value = localStorage.getItem('notepad-content') || '';
area.addEventListener('input', () => {
  localStorage.setItem('notepad-content', area.value);
});