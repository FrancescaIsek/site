// DigitalAjo: the full desktop page glides from section to section inside the browser window,
// pausing on each one, then returns to the top. Stops are in page pixels (the page is 1440 wide).
(() => {
  const fig = document.querySelector('.ajo-tour');
  if (!fig || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const view = fig.querySelector('.ajo-view'), img = fig.querySelector('.ajo-page-img'), toggle = fig.querySelector('.wt-toggle');
  const PAGE_W = 1440, PAGE_H = 5569, VIEW_H = 900;
  const stops = [0, 1250, 2500, 3420, PAGE_H - VIEW_H];
  let i = 0, timer = null, visible = false, paused = false;
  const go = (y) => { img.style.transform = `translateY(${-y * (view.clientWidth / PAGE_W)}px)`; };
  function step() {
    i += 1;
    if (i >= stops.length) {
      img.style.opacity = '0';
      timer = setTimeout(() => { img.style.transition = 'none'; i = 0; go(0); void img.offsetWidth; img.style.transition = ''; img.style.opacity = '1'; timer = setTimeout(step, 2600); }, 400);
      return;
    }
    go(stops[i]);
    timer = setTimeout(step, 3200);
  }
  function sync() { clearTimeout(timer); if (visible && !paused) timer = setTimeout(step, 1800); }
  toggle.addEventListener('click', () => { paused = !paused; fig.classList.toggle('is-paused', paused); toggle.setAttribute('aria-label', paused ? 'Play tour' : 'Pause tour'); sync(); });
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; sync(); }, { threshold: 0.35 }).observe(fig);
  window.addEventListener('resize', () => go(stops[i]));
})();
