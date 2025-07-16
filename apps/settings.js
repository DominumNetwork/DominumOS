// === INIT: Apply saved preferences ===
window.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme');
  const savedOS = localStorage.getItem('os');
  const savedAccent = localStorage.getItem('accent');

  if (savedTheme) {
    document.body.setAttribute('data-theme', savedTheme);
    document.getElementById('theme-select').value = savedTheme;
  }

  if (savedOS) {
    document.body.setAttribute('data-os', savedOS);
    document.getElementById('os-select').value = savedOS;
  }

  if (savedAccent) {
    document.documentElement.style.setProperty('--accent', savedAccent);
    document.getElementById('accent-color').value = savedAccent;
  }

  // Set initial visible section
  document.querySelector('[data-section=\"appearance\"]').classList.add('active');
  document.querySelector('section[data-section=\"appearance\"]').classList.add('active');
});

// === Settings: Handle changes ===
document.addEventListener('change', function(e) {
  const target = e.target;

  if (target.id === 'theme-select') {
    document.body.setAttribute('data-theme', target.value);
    localStorage.setItem('theme', target.value);
  }

  if (target.id === 'os-select') {
    document.body.setAttribute('data-os', target.value);
    localStorage.setItem('os', target.value);
  }

  if (target.id === 'accent-color') {
    document.documentElement.style.setProperty('--accent', target.value);
    localStorage.setItem('accent', target.value);
  }
});

// === Sidebar Navigation ===
document.querySelectorAll('.settings-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.settings-content section').forEach(sec => sec.classList.remove('active'));

    tab.classList.add('active');
    const section = tab.dataset.section;
    const target = document.querySelector(`.settings-content section[data-section=\"${section}\"]`);
    if (target) target.classList.add('active');
  });
});

// === Search Filter for Sidebar ===
document.getElementById('settings-search').addEventListener('input', e => {
  const query = e.target.value.toLowerCase();
  document.querySelectorAll('.settings-tab').forEach(tab => {
    tab.style.display = tab.textContent.toLowerCase().includes(query) ? 'block' : 'none';
  });
});
