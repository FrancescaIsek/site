// Apex walkthroughs: a scripted cursor and camera that move between Francesca's real screen states.
// Coordinates are in screen pixels (each screen is 1434 × 1068).
(() => {
  const W = 1434, H = 1068;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  const scripts = {
    room: async (d) => {
      d.show('list'); d.zoom(); d.place(1000, 820);
      await d.wait(500); d.cursorOn();
      await d.move(520, 376, 900); await d.wait(250);
      await d.move(520, 636, 1400); await d.wait(200);
      await d.move(980, 690, 900); await d.wait(300);
      d.zoom(330, 180, 2.2); await d.move(292, 40, 1150); await d.wait(250);
      await d.click(); d.show('collapsed'); await d.wait(450);
      d.zoom(); await d.move(40, 172, 900); await d.wait(700);
      await d.move(1100, 560, 1300); await d.wait(300);
      await d.move(1330, 700, 900); await d.wait(1400);
      d.zoom(150, 150, 2.2); await d.move(86, 40, 1150); await d.wait(250);
      await d.click(); d.show('list'); await d.wait(450);
      d.zoom(); await d.move(1000, 820, 1100); await d.wait(1200);
    },
    group: async (d) => {
      d.show('list'); d.menu(false); d.zoom(); d.place(700, 780);
      await d.wait(500); d.cursorOn();
      await d.move(520, 480, 800); await d.wait(300);
      d.zoom(1150, 340, 2.1); await d.move(1327, 246, 1150); await d.wait(200);
      await d.click(); d.menu(true); await d.wait(500);
      await d.move(1189, 320, 700); await d.wait(350);
      await d.click(); d.menu(false); d.show('panel'); await d.wait(1400);
      await d.move(1327, 246, 600); await d.wait(200);
      await d.click(); d.show('status-collapsed'); d.zoom(); await d.wait(800);
      await d.move(361, 328, 900); await d.wait(200);
      await d.click(); d.show('status'); await d.wait(600);
      await d.move(600, 520, 800); await d.move(600, 900, 1200); await d.wait(700);
      d.zoom(1150, 340, 2.1); await d.move(1327, 246, 1150); await d.wait(200);
      await d.click(); d.menu(true); await d.wait(500);
      await d.move(1213, 461, 800); await d.wait(350);
      await d.click(); d.menu(false); d.show('category'); d.zoom(); await d.wait(700);
      await d.move(640, 420, 900); await d.move(640, 780, 1100); await d.wait(1600);
    },
    subtasks: async (d) => {
      d.show('list'); d.zoom(); d.place(900, 820);
      await d.wait(500); d.cursorOn();
      await d.move(355, 376, 1000); await d.wait(250);
      d.zoom(560, 480, 1.7); await d.wait(600);
      await d.click(); d.show('subtasks'); await d.wait(900);
      await d.move(520, 428, 600); await d.wait(300);
      await d.move(520, 480, 500); await d.wait(400);
      await d.move(400, 555, 700); await d.wait(700);
      d.zoom(600, 820, 1.7); await d.move(560, 948, 1150); await d.wait(1500);
      d.zoom(); await d.move(357, 376, 1000); await d.wait(200);
      await d.click(); d.show('list'); await d.wait(800);
      await d.move(900, 820, 900); await d.wait(900);
    },
    start: async (d) => {
      d.show('empty'); d.zoom(); d.place(1100, 960);
      await d.wait(600); d.cursorOn();
      d.zoom(860, 760, 1.6); await d.move(854, 853, 1150); await d.wait(300);
      await d.click(); d.show('first'); d.zoom(560, 390, 2); await d.wait(500);
      await d.move(357, 377, 900); await d.wait(1300);
      d.zoom(820, 390, 1.8); await d.move(740, 378, 1000); await d.wait(400);
      await d.move(925, 378, 600); await d.wait(400);
      await d.move(1060, 378, 600); await d.wait(900);
      d.zoom(); await d.move(1100, 900, 1000); await d.wait(1000);
      d.show('empty'); await d.wait(900);
    }
  };
  // What a reduced-motion visitor sees: the most telling state, still.
  const still = { room: 'collapsed', group: 'status', subtasks: 'subtasks', start: 'first' };

  class Abort extends Error {}

  function setup(fig) {
    const name = fig.dataset.demo, script = scripts[name];
    if (!script) return;
    const camera = fig.querySelector('.wt-camera');
    const cursor = fig.querySelector('.wt-cursor');
    const shots = [...fig.querySelectorAll('.wt-shot:not(.wt-menu)')];
    const menu = fig.querySelector('.wt-menu');
    const toggle = fig.querySelector('.wt-toggle');
    let run = 0, visible = false, paused = false;

    const check = (id) => { if (id !== run) throw new Abort(); };
    const d = (id) => ({
      wait: (ms) => new Promise((ok) => setTimeout(ok, ms)).then(() => check(id)),
      show(state) { shots.forEach((s) => s.classList.toggle('is-on', s.dataset.state === state)); },
      menu(on) { if (menu) menu.classList.toggle('is-on', on); },
      zoom(x = W / 2, y = H / 2, s = 1) {
        const tx = Math.min(0, Math.max(100 - 100 * s, 50 - (x / W) * 100 * s));
        const ty = Math.min(0, Math.max(100 - 100 * s, 50 - (y / H) * 100 * s));
        camera.style.transform = `translate(${tx}%, ${ty}%) scale(${s})`;
      },
      place(x, y) { cursor.style.transitionDuration = '0ms'; cursor.style.left = `${(x / W) * 100}%`; cursor.style.top = `${(y / H) * 100}%`; },
      cursorOn() { cursor.style.transitionDuration = '300ms'; cursor.classList.add('is-on'); },
      async move(x, y, ms) {
        cursor.style.transitionDuration = `${ms}ms`;
        cursor.style.left = `${(x / W) * 100}%`; cursor.style.top = `${(y / H) * 100}%`;
        await this.wait(ms);
      },
      async click() {
        cursor.classList.remove('is-pressed'); void cursor.offsetWidth;
        cursor.classList.add('is-pressed'); await this.wait(140);
        cursor.classList.remove('is-pressed'); cursor.style.transitionDuration = '120ms';
      }
    });

    async function loop() {
      const id = ++run;
      try { for (;;) await script(d(id)); } catch (e) { if (!(e instanceof Abort)) throw e; }
    }
    function stop() { run++; }
    function sync() { if (visible && !paused && !reduce.matches) { if (!fig.dataset.running) { fig.dataset.running = '1'; loop(); } } else { delete fig.dataset.running; stop(); } }

    if (reduce.matches) { d(0).show(still[name]); return; }
    toggle.addEventListener('click', () => {
      paused = !paused;
      fig.classList.toggle('is-paused', paused);
      toggle.setAttribute('aria-label', paused ? 'Play walkthrough' : 'Pause walkthrough');
      sync();
    });
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, { threshold: 0.35 }).observe(fig);
  }

  document.querySelectorAll('.walkthrough').forEach(setup);
})();
