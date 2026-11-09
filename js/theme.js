(() => {
  const root = document.documentElement;
  let theme = 'light';
  try {
    const saved = localStorage.getItem('portfolio-theme');
    if (saved) {
      theme = saved;
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      theme = 'dark';
    }
  } catch (_) { }
  root.dataset.theme = theme;
  document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.theme-toggle');
    if (buttons.length > 0) {
      function update() {
        const dark = root.dataset.theme === 'dark';
        buttons.forEach(btn => {
          btn.setAttribute('aria-pressed', String(dark));
          btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
          btn.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
        });
      }
      buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
          try { localStorage.setItem('portfolio-theme', root.dataset.theme); } catch (_) {}
          update();
        });
      });
      update();
    }

    const header = document.querySelector('.portfolio-header');
    if (header) {
      function checkScroll() {
        const scrolled = window.scrollY > 10;
        header.classList.toggle('scrolled', scrolled);
        if (window.innerWidth > 767) {
          header.classList.toggle('scrolled-hide', window.scrollY > 40);
        } else {
          header.classList.remove('scrolled-hide');
        }
      }
      window.addEventListener('scroll', checkScroll, { passive: true });
      window.addEventListener('resize', checkScroll);
      checkScroll();
    }
  });
})();
