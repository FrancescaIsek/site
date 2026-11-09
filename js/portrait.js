const portrait = document.querySelector(".portrait");
const button = portrait.querySelector("button");
const studio = portrait.querySelector(".studio");
const outdoors = portrait.querySelector(".outdoors");

function showPhoto(personal) {
  portrait.classList.toggle("turned", personal);
  portrait.querySelector(".caption").textContent = personal ? "Out in the sunshine" : "In the studio";
  studio.setAttribute("aria-hidden", String(personal));
  outdoors.setAttribute("aria-hidden", String(!personal));
  button.setAttribute("aria-label", personal ? "Turn photo to studio portrait" : "Turn photo to outdoor portrait");
  button.setAttribute("title", personal ? "Show studio portrait" : "Show outdoor portrait");
}

showPhoto(false);
button.hidden = false;
button.addEventListener("click", () => showPhoto(!portrait.classList.contains("turned")));

// "Click to change" follows the pointer over the print, like the View pill on work cards.
const print = portrait.querySelector(".print");
const turnPill = portrait.querySelector(".turn-pill");
if (print && turnPill) {
  print.addEventListener("pointermove", event => {
    if (event.pointerType === "touch") return;
    const bounds = portrait.getBoundingClientRect();
    const x = Math.max(0, Math.min(event.clientX - bounds.left + 12, bounds.width - 112));
    const y = Math.max(0, Math.min(event.clientY - bounds.top + 12, bounds.height - 32));
    turnPill.style.setProperty("--turn-x", x + "px");
    turnPill.style.setProperty("--turn-y", y + "px");
  });
}

const replay = document.querySelector(".replay");
const reveal = document.querySelector(".action-reveal");
replay.hidden = false;
replay.addEventListener("click", () => {
  reveal.classList.add("reset");
  void reveal.offsetWidth;
  reveal.classList.remove("reset");
});

const work = document.querySelector(".work");
const motionToggle = work.querySelector(".motion-toggle");
const motionPreference = matchMedia("(prefers-reduced-motion: reduce)");
const mobileLayout = matchMedia("(max-width: 767px)");
const workCards = [...work.querySelectorAll(".project")];
const cardRatios = new Map(workCards.map(card => [card, 0]));
const apexCard = work.querySelector(".project.apex");
const apexVideo = apexCard ? apexCard.querySelector("video") : null;

function syncApexVideo() {
  if (!apexVideo) return;
  const isReduced = motionPreference.matches;
  const isPaused = work.classList.contains("paused");
  const isInView = apexCard && apexCard.classList.contains("in-view");
  if (!isReduced && !isPaused && isInView) {
    apexVideo.play().catch(() => {});
  } else {
    apexVideo.pause();
    if (isReduced) {
      apexVideo.removeAttribute("autoplay");
      try { apexVideo.currentTime = 0; } catch (_) {}
    }
  }
}

function updateWorkPlayback() {
  for (const card of workCards) card.classList.toggle("in-view", (cardRatios.get(card) || 0) > 0);
  syncApexVideo();
}

function setPreviewPlayback(playing) {
  work.classList.add("playing");
  work.classList.toggle("paused", !playing);
  motionToggle.textContent = playing ? "Pause previews" : "Play previews";
  updateWorkPlayback();
}
setPreviewPlayback(!motionPreference.matches);
motionPreference.addEventListener("change", () => {
  if (motionPreference.matches && apexVideo) {
    apexVideo.removeAttribute("autoplay");
    apexVideo.pause();
    try { apexVideo.currentTime = 0; } catch (_) {}
  }
  setPreviewPlayback(!motionPreference.matches);
});
motionToggle.hidden = false;
motionToggle.addEventListener("click", () => setPreviewPlayback(work.classList.contains("paused")));
const previewObserver = new IntersectionObserver(entries => {
  for (const entry of entries) {
    cardRatios.set(entry.target, entry.isIntersecting ? entry.intersectionRatio : 0);
  }
  updateWorkPlayback();
}, { threshold: [0, 0.2, 0.35, 0.5, 0.75, 1] });
workCards.forEach(project => previewObserver.observe(project));
mobileLayout.addEventListener("change", updateWorkPlayback);

if (motionPreference.matches && apexVideo) {
  apexVideo.removeAttribute("autoplay");
  apexVideo.pause();
  try { apexVideo.currentTime = 0; } catch (_) {}
}
updateWorkPlayback();

workCards.forEach(card => {
  card.addEventListener("pointermove", event => {
    const bounds = card.getBoundingClientRect();
    card.style.setProperty("--view-x", Math.min(event.clientX - bounds.left + 10, bounds.width - 54) + "px");
    card.style.setProperty("--view-y", Math.min(event.clientY - bounds.top + 10, bounds.height - 32) + "px");
  });
});

const screens = document.querySelector(".screens");
const galleryToggle = screens.querySelector("button");
const galleryTracks = [...screens.querySelectorAll(".screens-track")];
// The rows run the full device width, so repeat each set until half the track
// is wider than the device. That keeps the -50% loop gap-free on wide screens.
let galleryCounts = [];
function fillGallery() {
  const deviceWidth = document.documentElement.clientWidth;
  const counts = galleryTracks.map(track => {
    const unit = track.querySelector(".screens-set");
    const unitWidth = unit.offsetWidth || unit.getBoundingClientRect().width;
    if (!unitWidth) return 2;
    const needed = Math.max(2, Math.ceil((deviceWidth * 2) / unitWidth));
    return needed + (needed % 2);
  });
  if (counts.every((count, index) => count === galleryCounts[index])) return;
  galleryCounts = counts;
  galleryTracks.forEach((track, index) => {
    const base = track.querySelector(".screens-set");
    [...track.querySelectorAll(".screens-set")].slice(1).forEach(set => set.remove());
    for (let copy = 1; copy < counts[index]; copy += 1) {
      const clone = base.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      track.append(clone);
    }
  });
}
// One steady speed on every screen size: 75 pixels a second for both rows.
const GALLERY_SPEED = 75;
function setGallerySpeed() {
  galleryTracks.forEach(track => {
    const loop = track.scrollWidth / 2;
    if (loop) track.style.animationDuration = (loop / GALLERY_SPEED).toFixed(2) + "s";
  });
}
fillGallery();
setGallerySpeed();
addEventListener("resize", () => { fillGallery(); setGallerySpeed(); });
addEventListener("load", setGallerySpeed);
function setGalleryPaused(paused) {
  screens.classList.toggle("paused", paused);
  galleryToggle.textContent = paused ? "Play gallery" : "Pause gallery";
}
setGalleryPaused(motionPreference.matches);
motionPreference.addEventListener("change", () => setGalleryPaused(motionPreference.matches));
galleryToggle.addEventListener("click", () => setGalleryPaused(!screens.classList.contains("paused")));
galleryToggle.hidden = false;
screens.classList.add("ready");
// Phones: holding a finger on a row pauses it; letting go carries on.
galleryTracks.forEach(track => {
  track.addEventListener("touchstart", () => track.classList.add("held"), { passive: true });
  ["touchend", "touchcancel"].forEach(type => track.addEventListener(type, () => track.classList.remove("held")));
});

const testimonials = document.querySelector(".testimonials");
if (testimonials) {
  const panel = testimonials.querySelector("#testimonial-panel");
  const people = [...testimonials.querySelectorAll(".testimonial-person")];
  let active = null;

  function closeQuote() {
    active = null;
    panel.hidden = true;
    people.forEach(person => person.setAttribute("aria-expanded", "false"));
  }
  function showQuote(person) {
    if (active === person) return;
    active = person;
    panel.replaceChildren(document.getElementById(`testimonial-content-${person.dataset.quote}`).content.cloneNode(true));
    panel.hidden = false;
    people.forEach(button => button.setAttribute("aria-expanded", String(button === person)));
  }
  people.forEach(person => {
    person.addEventListener("pointerenter", event => {
      if (event.pointerType !== "touch") showQuote(person);
    });
    person.addEventListener("focus", () => showQuote(person));
    person.addEventListener("click", () => showQuote(person));
  });
  // Keep the quote open while moving from a portrait into its text or profile link.
  testimonials.addEventListener("pointerleave", () => {
    if (window.innerWidth > 767) closeQuote();
  });
  testimonials.addEventListener("focusout", event => {
    if (window.innerWidth > 767 && !testimonials.contains(event.relatedTarget)) closeQuote();
  });
  testimonials.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      const previous = active;
      previous?.focus();
      if (window.innerWidth > 767) closeQuote();
    }
  });
  document.addEventListener("pointerdown", event => {
    if (window.innerWidth > 767 && !testimonials.contains(event.target)) closeQuote();
  });

  // Phones open the first quote under the avatar row.
  function initMobileTestimonials() {
    if (window.innerWidth <= 767 && people.length > 0 && !active) {
      showQuote(people[0]);
    }
  }
  initMobileTestimonials();
  window.addEventListener("resize", initMobileTestimonials);
}

// Nearby tools scatter away from the pointer, then spring back to their slots.
// Measure the resting slots rather than transformed bounds to avoid feedback jitter.
const stack = document.querySelector(".stack-icons");
if (stack) {
  const tools = [...stack.children].map(element => ({ element, x: 0, y: 0, r: 0, vx: 0, vy: 0, vr: 0, tx: 0, ty: 0, tr: 0 }));
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
  let frame = 0;
  let lastTime = 0;

  function animate(time) {
    const step = Math.min((time - (lastTime || time - 16.67)) / 16.67, 2);
    lastTime = time;
    let moving = false;
    for (const tool of tools) {
      for (const [position, velocity, target] of [["x", "vx", "tx"], ["y", "vy", "ty"], ["r", "vr", "tr"]]) {
        tool[velocity] = (tool[velocity] + (tool[target] - tool[position]) * 0.14 * step) * Math.pow(0.77, step);
        tool[position] += tool[velocity] * step;
        if (Math.abs(tool[target] - tool[position]) + Math.abs(tool[velocity]) > 0.03) moving = true;
        else { tool[position] = tool[target]; tool[velocity] = 0; }
      }
      tool.element.style.transform = `translate(${tool.x}px, ${tool.y}px) rotate(${tool.r}deg)`;
    }
    frame = moving ? requestAnimationFrame(animate) : 0;
    if (!moving) lastTime = 0;
  }

  function start() { if (!frame) frame = requestAnimationFrame(animate); }
  function returnHome() {
    tools.forEach(tool => { tool.tx = tool.ty = tool.tr = 0; });
    start();
  }
  stack.parentElement.addEventListener("pointermove", event => {
    if (!finePointer.matches || motionPreference.matches || event.pointerType === "touch") return;
    tools.forEach((tool, index) => {
      const rect = tool.element.getBoundingClientRect();
      // Rotation preserves the center; subtract only our translation.
      const dx = rect.left + rect.width / 2 - tool.x - event.clientX;
      const dy = rect.top + rect.height / 2 - tool.y - event.clientY;
      const distance = Math.hypot(dx, dy);
      const force = Math.pow(Math.max(0, 1 - distance / 125), 1.5);
      tool.tx = dx / Math.max(distance, 20) * force * 42;
      tool.ty = (Math.abs(dy) < 8 ? (index % 2 ? 1 : -1) : dy / Math.max(distance, 20)) * force * 36;
      tool.tr = (dx / Math.max(distance, 20) || (index % 2 ? 1 : -1)) * force * 22;
    });
    start();
  });
  stack.parentElement.addEventListener("pointerleave", returnHome);
  window.addEventListener("blur", returnHome);
  window.addEventListener("scroll", returnHome, { passive: true });
  function resetMotion() {
    cancelAnimationFrame(frame);
    frame = lastTime = 0;
    tools.forEach(tool => {
      for (const key of ["x", "y", "r", "vx", "vy", "vr", "tx", "ty", "tr"]) tool[key] = 0;
      tool.element.style.removeProperty("transform");
    });
  }
  motionPreference.addEventListener("change", resetMotion);
  finePointer.addEventListener("change", resetMotion);
}
