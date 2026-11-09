(() => {
const motionPreference = matchMedia("(prefers-reduced-motion: reduce)");
const copyEmail = document.querySelector(".copy-email");
if (copyEmail) {
  let copyTimeout;
  copyEmail.addEventListener("click", async () => {
    const status = document.querySelector(".copy-status");
    clearTimeout(copyTimeout);
    try {
      await navigator.clipboard.writeText("francescaisek@gmail.com");
      status.textContent = "Copied";
    } catch {
      status.textContent = "Couldn’t copy. Select the email to copy it.";
    }
    copyTimeout = setTimeout(() => { status.textContent = ""; }, 3000);
  });
}

// Keep each link's hit area stationary while its visible ball rolls away.
// This sustains hover without chasing the ball or triggering neighboring links.
const rollingSlots = [...document.querySelectorAll(".footer-orb-slot")];
let stopCurrentBall = () => {};
rollingSlots.forEach(slot => {
  const control = slot.querySelector(".footer-orb");
  const ball = slot.querySelector(".footer-ball");
  let frame = 0;
  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
    slot.classList.remove("rolling");
    ball.style.transform = "";
  }
  function start() {
    if (motionPreference.matches || frame) return;
    stopCurrentBall();
    stopCurrentBall = stop;
    const lane = document.querySelector(".footer-socials").getBoundingClientRect();
    const origin = slot.getBoundingClientRect();
    const travel = Math.max(0, origin.left - lane.left);
    const radius = origin.width / 2;
    const startTime = performance.now();
    slot.classList.add("rolling");
    function roll(now) {
      const phase = (now - startTime) / 5600 * Math.PI * 2;
      const x = -travel * (1 - Math.cos(phase)) / 2;
      const y = -12 * Math.abs(Math.sin(phase * 3));
      ball.style.transform = `translate(${x}px, ${y}px) rotate(${x / radius}rad)`;
      frame = requestAnimationFrame(roll);
    }
    frame = requestAnimationFrame(roll);
  }
  slot.addEventListener("pointerenter", event => { if (event.pointerType !== "touch") start(); });
  slot.addEventListener("pointerleave", stop);
  control.addEventListener("focus", () => { if (control.matches(":focus-visible")) start(); });
  control.addEventListener("blur", stop);
  motionPreference.addEventListener("change", stop);
});
window.addEventListener("blur", () => stopCurrentBall());

})();
