/* Shared pointer follower. Creates one small circle that eases toward the
   mouse and grows slightly over links and controls. Never runs on touch or
   when the visitor asks for reduced motion. The native cursor is untouched. */
(() => {
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const interactive = "a, button, [role='button'], input, select, textarea, label, summary, [tabindex]:not([tabindex='-1'])";

  let ring = null;
  let frame = 0;
  let seen = false;
  let x = 0;
  let y = 0;
  let targetX = 0;
  let targetY = 0;

  function place(px, py) {
    if (ring) ring.style.transform = "translate3d(" + px + "px," + py + "px,0)";
  }

  function tick() {
    frame = 0;
    x += (targetX - x) * 0.22;
    y += (targetY - y) * 0.22;
    place(x, y);
    if (Math.abs(targetX - x) > 0.1 || Math.abs(targetY - y) > 0.1) {
      frame = requestAnimationFrame(tick);
    } else {
      x = targetX;
      y = targetY;
      place(x, y);
    }
  }

  function onPointerMove(event) {
    if (event.pointerType === "touch") return;
    targetX = event.clientX;
    targetY = event.clientY;
    if (!seen) {
      seen = true;
      x = targetX;
      y = targetY;
      place(x, y);
      ring.classList.add("is-visible");
    }
    const target = event.target;
    const active = target && typeof target.closest === "function" && target.closest(interactive);
    ring.classList.toggle("is-active", Boolean(active));
    if (!frame) frame = requestAnimationFrame(tick);
  }

  function onPointerLeave(event) {
    if (event.relatedTarget) return;
    seen = false;
    if (ring) {
      ring.classList.remove("is-visible", "is-active");
    }
  }

  function start() {
    if (ring || !document.body) return;
    ring = document.createElement("div");
    ring.className = "cursor-ring";
    ring.setAttribute("aria-hidden", "true");
    ring.innerHTML = "<i></i>";
    document.body.appendChild(ring);
    document.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);
  }

  function stop() {
    if (!ring) return;
    document.removeEventListener("pointermove", onPointerMove);
    document.documentElement.removeEventListener("pointerleave", onPointerLeave);
    cancelAnimationFrame(frame);
    frame = 0;
    ring.remove();
    ring = null;
    seen = false;
  }

  function sync() {
    if (finePointer.matches && !reducedMotion.matches) start();
    else stop();
  }

  sync();
  finePointer.addEventListener("change", sync);
  reducedMotion.addEventListener("change", sync);
})();
