// BranchOut walkthroughs: a touch point and a scrolling/zooming camera that move between
// Francesca's real phone screens. Coordinates are screen units (each screen is 430 wide; the phone shows 932 tall).
(() => {
  const W = 430, VH = 932;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  const scripts = {
    home: async (d) => {
      d.show('home-before'); d.view(); d.hideTouch(); await d.wait(1400);
      d.view(215, 466 + 260); await d.wait(1700);
      d.view(); await d.wait(1300);
      d.show('home'); await d.wait(1200);
      d.place(320, 760); d.touchOn(); await d.move(170, 330, 900); await d.wait(200);
      d.view(170, 330, 1.45); await d.wait(1600);
      d.view(); d.hideTouch(); await d.wait(1600);
    },
    room: async (d) => {
      d.show('home'); d.view(); d.place(330, 760); await d.wait(600); d.touchOn();
      await d.move(131, 389, 900); await d.tap(); d.show('join-room'); await d.wait(900);
      await d.move(215, 741, 800); await d.tap(); await d.wait(500);
      await d.move(215, 833, 600); await d.tap(); d.show('match-room'); await d.wait(900);
      await d.move(215, 377, 800); await d.tap(); await d.wait(600);
      d.view(215, 600, 1.5); await d.move(300, 600, 1000); await d.wait(1800);
      d.view(); d.hideTouch(); await d.wait(1400);
    },
    event: async (d) => {
      d.show('event'); d.view(); d.hideTouch(); await d.wait(1200);
      d.view(215, 466 + 23); await d.wait(900);
      d.show('attendees'); d.view(); await d.wait(1100);
      d.place(330, 820); d.touchOn(); await d.move(154, 524, 900); await d.tap();
      d.show('attendee-jane'); d.view(190, 690, 1.5, 700); await d.wait(700);
      await d.move(190, 700, 900); await d.wait(1800);
      d.hideTouch(); d.show('attendees'); d.view(190, 690, 1.5, 0); await d.wait(400);
      d.view(); d.hideTouch(); await d.wait(1400);
    },
    status: async (d) => {
      d.show('profile'); d.view(); d.place(330, 820); await d.wait(800); d.touchOn();
      await d.move(210, 553, 900); await d.tap(); d.show('status-pick'); d.view(); await d.wait(900);
      await d.move(215, 327, 800); await d.tap(); d.show('available-now'); await d.wait(900);
      await d.move(215, 249, 700); await d.tap(); await d.wait(600);
      d.view(215, 700); await d.move(215, 989, 1000); await d.tap();
      d.show('review'); d.view(); await d.wait(1100);
      d.view(215, 1251 - 466); await d.move(215, 1011, 1100); await d.tap(); await d.wait(1600);
      d.view(); d.hideTouch(); await d.wait(1200);
    },
    match: async (d) => {
      d.show('match'); d.view(); d.place(330, 820); await d.wait(900); d.touchOn();
      d.view(215, 330, 1.3); await d.move(215, 300, 900); await d.wait(900);
      d.view(); await d.move(215, 538, 800); await d.tap(); d.show('confirm'); await d.wait(900);
      await d.move(215, 597, 700); await d.tap(); d.show('sent'); await d.wait(700);
      d.view(215, 560, 1.4); await d.wait(1800);
      d.view(); d.hideTouch(); await d.wait(1400);
    },
    feed: async (d) => {
      d.show('feed'); d.view(); d.hideTouch(); await d.wait(1200);
      d.view(215, 640, 1, 1800); await d.wait(2200);
      d.view(215, 1050, 1, 1800); await d.wait(2200);
      d.view(215, 1758 - 466, 1, 1800); await d.wait(2400);
      d.view(215, 466, 1, 1600); await d.wait(1800);
    },
    group: async (d) => {
      d.show('group'); d.view(); d.place(330, 860); await d.wait(800); d.touchOn();
      await d.move(392, 498, 900); await d.tap(); d.show('group-selected'); await d.wait(700);
      await d.move(215, 921, 900); await d.tap(); d.show('chat'); d.hideTouch(); await d.wait(900);
      d.view(215, 200, 1.6); await d.wait(2200);
      d.view(); await d.wait(1600);
    }
  };
  const still = { home: 'home', room: 'match-room', event: 'attendees', status: 'review', match: 'sent', feed: 'feed', group: 'chat' };

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
