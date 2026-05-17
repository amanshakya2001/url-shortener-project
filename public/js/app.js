/* =========================================================
   Theme: light / dark, persisted in localStorage
   ========================================================= */
(function initTheme() {
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
})();

window.toggleTheme = function () {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
};

/* =========================================================
   Toast notifications
   Usage: toast.success('Message'), toast.error('Oops'), toast.warning('...')
   ========================================================= */
window.toast = (function () {
  function ensureContainer() {
    let c = document.querySelector('.toast-container');
    if (!c) {
      c = document.createElement('div');
      c.className = 'toast-container';
      c.setAttribute('aria-live', 'polite');
      c.setAttribute('aria-atomic', 'true');
      document.body.appendChild(c);
    }
    return c;
  }

  const ICONS = {
    success: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>',
    danger: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
    warning: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
    info: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
  };

  function show(message, type = 'info', timeout = 4000) {
    const container = ensureContainer();
    const toastEl = document.createElement('div');
    toastEl.className = `toast ${type}`;
    toastEl.setAttribute('role', type === 'danger' ? 'alert' : 'status');
    toastEl.innerHTML = `
      <span class="toast-icon">${ICONS[type] || ICONS.info}</span>
      <span class="toast-body"></span>
      <button class="toast-close" aria-label="Dismiss">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>`;
    toastEl.querySelector('.toast-body').textContent = message;
    container.appendChild(toastEl);

    let timer;
    const remove = () => {
      clearTimeout(timer);
      toastEl.classList.add('is-leaving');
      toastEl.addEventListener('animationend', () => toastEl.remove(), { once: true });
    };
    toastEl.querySelector('.toast-close').addEventListener('click', remove);
    if (timeout > 0) timer = setTimeout(remove, timeout);
    return remove;
  }

  return {
    success: (msg, t) => show(msg, 'success', t),
    error:   (msg, t) => show(msg, 'danger', t),
    warning: (msg, t) => show(msg, 'warning', t),
    info:    (msg, t) => show(msg, 'info', t)
  };
})();

/* =========================================================
   Small helpers
   ========================================================= */
window.$ = (sel, root = document) => root.querySelector(sel);
window.$$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
