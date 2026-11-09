// Preview videos below the first screen only download and play once they
// scroll into view, and pause again when they leave it.
(() => {
  const videos = [...document.querySelectorAll("video[data-autoplay]")];
  if (!videos.length) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const io = new IntersectionObserver(entries => {
    for (const { target, isIntersecting } of entries) {
      if (isIntersecting && !reduce.matches) target.play().catch(() => {});
      else target.pause();
    }
  }, { rootMargin: "200px 0px" });
  videos.forEach(video => io.observe(video));
})();
