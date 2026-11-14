// Phone menu: the three-line button opens the menu and turns into an X to close it.
(() => {
  const button = document.querySelector(".mobile-menu-btn");
  const overlay = document.getElementById("mobile-nav-overlay");
  if (!button || !overlay) return;
  let closeTimer = 0;
  function open() {
    clearTimeout(closeTimer);
    overlay.hidden = false;
    void overlay.offsetHeight;
    overlay.classList.add("is-open");
    
    button.setAttribute("aria-expanded", "true");
    button.setAttribute("aria-label", "Close menu");
    document.body.style.overflow = "hidden";
  }
  function close() {
    overlay.classList.remove("is-open");
    
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-label", "Open menu");
    document.body.style.overflow = "";
    closeTimer = setTimeout(() => { if (!overlay.classList.contains("is-open")) overlay.hidden = true; }, 220);
  }
  button.addEventListener("click", () => overlay.classList.contains("is-open") ? close() : open());
  overlay.querySelector(".mobile-menu-close")?.addEventListener("click", close);
  overlay.querySelectorAll("a").forEach(link => link.addEventListener("click", close));
  addEventListener("keydown", event => {
    if (event.key === "Escape" && overlay.classList.contains("is-open")) { close(); button.focus(); }
  });
})();
