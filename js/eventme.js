// EventMe walkthroughs: a touch point and a scrolling/zooming camera that move between
// Francesca's EventMe screens. Coordinates are screen points (393 × 852, iPhone).
(() => {
  const W = 393, VH = 852;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  const scripts = {
    buy: async (d) => {
      d.show('home'); d.view(); d.place(300, 790); await d.wait(900); d.touchOn();
      await d.move(138, 640, 900); await d.tap(); d.show('event-details'); d.hideTouch(); await d.wait(900);
      d.view(197, 520, 1.35); await d.wait(1900);
      d.view(); d.touchOn(); await d.move(197, 782, 900); await d.tap(); d.show('buy-ticket'); await d.wait(800);
      await d.move(336, 317, 800); await d.tap(); d.show('buy-ticket-vip'); await d.wait(600);
      d.view(197, 740, 1.45); await d.wait(1500);
      d.view(); await d.move(197, 782, 700); await d.tap(); d.show('checkout'); await d.wait(900);
      await d.move(197, 516, 800); await d.tap(); await d.wait(1200);
      d.hideTouch(); await d.wait(900);
    },
    pay: async (d) => {
      d.show('card-details'); d.view(); d.place(300, 700); await d.wait(900); d.touchOn();
      await d.move(197, 426, 900); await d.tap(); d.show('scan-card'); d.hideTouch(); await d.wait(700);
      d.view(197, 400, 1.3); await d.wait(1800);
      d.view(); d.show('card-filled'); await d.wait(900); d.touchOn();
      await d.move(197, 782, 900); await d.tap(); d.show('payment-successful'); await d.wait(1200);
      await d.move(197, 533, 800); await d.tap(); d.show('your-ticket'); d.hideTouch(); await d.wait(900);
      d.view(197, 560, 1.5); await d.wait(2000);
      d.view(); await d.wait(1400);
    }
  };
  const still = { buy: 'event-details', pay: 'your-ticket' };

  class Abort extends Error {}

  function setup(fig) {
    const name = fig.dataset.demo, script = scripts[name];
    if (!script) return;
    const view = fig.querySelector('.ph-view');
    const camera = fig.querySelector('.ph-camera');
    const touch = fig.querySelector('.ph-touch');
    const shots = [...fig.querySelectorAll('.ph-shot')];
    const toggle = fig.querySelector('.wt-toggle');
    const heightOf = (s) => (s.naturalHeight && s.naturalWidth ? (s.naturalHeight / s.naturalWidth) * W : VH);
    let current = shots[0], run = 0, visible = false, paused = false;

    const check = (id) => { if (id !== run) throw new Abort(); };
    const d = (id) => ({
      wait: (ms) => new Promise((ok) => setTimeout(ok, ms)).then(() => check(id)),
      show(state) { shots.forEach((s) => { const on = s.dataset.state === state; s.classList.toggle('is-on', on); if (on) current = s; }); },
      // Centre the camera on (x, y) at scale s, never showing past the edges of the current screen.
      view(x = W / 2, y = VH / 2, s = 1, ms = 1100) {
        s = 1; // Mobile apps never zoom; the camera only scrolls long screens.
        const px = view.clientWidth / W, H = heightOf(current);
        const tx = Math.min(0, Math.max(W - W * s, W / 2 - x * s));
        const ty = Math.min(0, Math.max(VH - H * s, VH / 2 - y * s));
        camera.style.transitionDuration = `${ms}ms`;
        camera.style.transform = `translate(${tx * px}px, ${ty * px}px) scale(${s})`;
      },
      place(x, y) { touch.style.transitionDuration = '0ms'; touch.style.left = `${(x / W) * 100}%`; touch.style.top = `${(y / W) * view.clientWidth}px`; },
      touchOn() { touch.style.transitionDuration = '300ms'; touch.classList.add('is-on'); },
      hideTouch() { touch.style.transitionDuration = '300ms'; touch.classList.remove('is-on'); },
      async move(x, y, ms) {
        touch.style.transitionDuration = `${ms}ms`;
        touch.style.left = `${(x / W) * 100}%`; touch.style.top = `${(y / W) * view.clientWidth}px`;
        await this.wait(ms);
      },
      async tap() {
        touch.classList.remove('is-pressed'); void touch.offsetWidth;
        touch.classList.add('is-pressed'); await this.wait(220);
        touch.classList.remove('is-pressed'); touch.style.transitionDuration = '150ms';
      }
    });

    async function loop() { const id = ++run; try { for (;;) await script(d(id)); } catch (e) { if (!(e instanceof Abort)) throw e; } }
    function sync() { if (visible && !paused && !reduce.matches) { if (!fig.dataset.running) { fig.dataset.running = '1'; loop(); } } else { delete fig.dataset.running; run++; } }

    if (reduce.matches) { d(0).show(still[name]); return; }
    toggle.addEventListener('click', () => {
      paused = !paused;
      fig.classList.toggle('is-paused', paused);
      toggle.setAttribute('aria-label', paused ? 'Play walkthrough' : 'Pause walkthrough');
      sync();
    });
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; sync(); }, { threshold: 0.35 }).observe(fig);
  }

  document.querySelectorAll('.walkthrough[data-phone]').forEach(setup);
})();
