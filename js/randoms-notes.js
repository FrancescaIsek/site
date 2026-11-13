// Randoms: a small pink tooltip with Francesca's note appears above an item on hover or keyboard focus.
// Desktop only: nothing shows on touch screens. It hides while an item is dragged.
(() => {
  const root = document.querySelector('.randoms');
  if (!root || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const tag = document.createElement('span');
  tag.className = 'random-note';
  tag.setAttribute('aria-hidden', 'true');
  root.appendChild(tag);
  let current = null, frame = 0;

  function place() {
    if (!current) { frame = 0; return; }
    const r = current.getBoundingClientRect(), base = root.getBoundingClientRect();
    tag.style.left = `${r.left - base.left + r.width / 2}px`;
    tag.style.top = `${r.top - base.top}px`;
    frame = requestAnimationFrame(place);
  }
  function show(el) {
    if (el.classList.contains('dragging')) return;
    current = el;
    tag.textContent = el.dataset.note;
    tag.classList.add('is-on');
    if (!frame) place();
  }
  function hide(el) {
    if (el && el !== current) return;
    current = null;
    tag.classList.remove('is-on');
  }

  root.querySelectorAll('.random-item[data-note]').forEach((el) => {
    let downAt = null, hovered = false;
    el.addEventListener('pointerenter', (e) => { if (e.pointerType === 'touch') return; hovered = true; show(el); });
    el.addEventListener('pointerleave', (e) => { if (e.pointerType === 'touch') return; hovered = false; hide(el); });
    el.addEventListener('pointerdown', (e) => { downAt = { x: e.clientX, y: e.clientY, type: e.pointerType }; });
    el.addEventListener('pointermove', () => { if (el.classList.contains('dragging')) hide(el); });
    el.addEventListener('pointerup', (e) => {
      if (downAt?.type !== 'touch' && hovered) setTimeout(() => show(el), 60);
      downAt = null;
    });
    el.addEventListener('focus', () => show(el));
    el.addEventListener('blur', () => hide(el));
  });
})();
