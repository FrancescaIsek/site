// About · Talks. Desktop: hovering a row shows its photos as prints that follow the pointer.
// Phones: tapping a row opens it and fans out its photo stack.
(() => {
  const section = document.querySelector('.talks');
  if (!section) return;
  const list = section.querySelector('.talks-list');
  const rows = [...section.querySelectorAll('.talk')];
  const float = section.querySelector('.talk-float');
  const desktop = matchMedia('(min-width: 761px) and (hover: hover) and (pointer: fine)');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');

  // Front print sits at the pointer; the back print peeks out to its right.
  function prints(row) {
    const [back, front] = row.querySelectorAll('.talk-photos img');
    const fw = front.classList.contains('is-wide');
    const f = fw ? { w: 260, h: 195, x: 30, y: -50, r: -4 } : { w: 200, h: 266, x: 36, y: -70, r: -5 };
    const b = fw ? { w: 140, h: 187, x: 262, y: -70, r: 6 } : { w: 170, h: 226, x: 200, y: -50, r: 6 };
    float.replaceChildren(...[[back, b], [front, f]].map(([img, p]) => {
      const el = document.createElement('div');
      el.className = 'talk-print';
      el.style.cssText = `--w:${p.w}px;--h:${p.h}px;--x:${p.x}px;--y:${p.y}px;--r:${p.r}deg`;
      const copy = new Image(); copy.src = img.currentSrc || img.src; copy.alt = '';
      el.append(copy);
      return el;
    }));
  }

  // Pointer follow with a little lag.
  let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
  function tick() {
    x += (tx - x) * .18; y += (ty - y) * .18;
    float.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    raf = Math.abs(tx - x) + Math.abs(ty - y) > .3 ? requestAnimationFrame(tick) : 0;
  }
  function aim(e, snap) {
    const box = section.getBoundingClientRect();
    const maxX = document.documentElement.clientWidth - box.left - 440; // keep both prints on screen
    tx = Math.min(e.clientX - box.left, maxX); ty = e.clientY - box.top;
    if (snap || reduce.matches) { x = tx; y = ty; float.style.transform = `translate3d(${x}px, ${y}px, 0)`; return; }
    if (!raf) raf = requestAnimationFrame(tick);
  }

  let current = null;
  function activate(row, e) {
    if (current === row) return;
    current?.classList.remove('is-active');
    current = row;
    row.classList.add('is-active');
    list.classList.add('has-active');
    prints(row);
    if (e) aim(e, !float.classList.contains('is-on'));
    float.classList.remove('is-on'); void float.offsetWidth; float.classList.add('is-on');
  }
  function clear() {
    current?.classList.remove('is-active');
    current = null;
    list.classList.remove('has-active');
    float.classList.remove('is-on');
  }

  rows.forEach((row) => {
    row.addEventListener('pointerenter', (e) => { if (desktop.matches && e.pointerType === 'mouse') activate(row, e); });
    row.addEventListener('pointermove', (e) => { if (desktop.matches && current === row) aim(e); });
    // Keyboard on desktop: show the prints beside the row.
    row.addEventListener('focusin', () => {
      if (!desktop.matches) return;
      const box = row.getBoundingClientRect();
      activate(row, { clientX: box.left + Math.min(box.width - 460, 790), clientY: box.top + 52 });
    });
    row.addEventListener('focusout', () => { if (desktop.matches && current === row) clear(); });

    // Phones: tap the row (or its photos) to open and close it.
    const button = row.querySelector('.talk-photos');
    row.addEventListener('click', () => {
      if (desktop.matches) return;
      const open = row.classList.toggle('is-open');
      button.setAttribute('aria-expanded', String(open));
    });
  });
  list.addEventListener('pointerleave', () => { if (desktop.matches) clear(); });
  desktop.addEventListener?.('change', clear);
})();
