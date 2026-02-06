// Shared micro-interactions (safe, lightweight)

(() => {
  const prefersReducedMotion = window.matchMedia?.(
    "(prefers-reduced-motion: reduce)"
  )?.matches;

  // Mark page as loaded (enables fade-in + logo pop).
  // `defer` ensures DOM is parsed before this runs.
  document.body.classList.add("is-loaded");

  // Fix bfcache restores (Back/Forward).
  window.addEventListener("pageshow", () => {
    document.body.classList.remove("is-leaving");
    document.body.classList.add("is-loaded");
  });

  // Page-to-page fade transition for internal links (skip if reduced motion).
  if (!prefersReducedMotion) {
    document.addEventListener("click", (e) => {
      // Only left-click without modifiers.
      if (e.defaultPrevented) return;
      if (e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const a = e.target?.closest?.("a");
      if (!a) return;
      if (a.target && a.target !== "_self") return;
      if (a.hasAttribute("download")) return;

      const href = a.getAttribute("href");
      if (!href) return;
      if (href.startsWith("#")) return; // in-page anchors
      if (href.startsWith("mailto:") || href.startsWith("tel:")) return;
      if (href.startsWith("javascript:")) return;

      let url;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }

      // Only same-origin navigations.
      if (url.origin !== window.location.origin) return;

      // If it’s the same page (hash change), let browser handle it.
      const samePath =
        url.pathname === window.location.pathname &&
        url.search === window.location.search;
      if (samePath && url.hash) return;

      e.preventDefault();

      document.body.classList.remove("is-loaded");
      document.body.classList.add("is-leaving");

      // Navigate after slide-out; keep a timeout fallback.
      const navigate = () => {
        window.location.href = url.href;
      };

      const timeoutId = window.setTimeout(navigate, 280);
      const onEnd = (ev) => {
        if (ev.target !== document.body) return;
        window.clearTimeout(timeoutId);
        document.body.removeEventListener("transitionend", onEnd);
        navigate();
      };

      document.body.addEventListener("transitionend", onEnd);
    });
  }

  // Scroll reveal (skip if reduced motion)
  if (prefersReducedMotion) return;

  const candidates = document.querySelectorAll(
    ".card, .content-item, .mockup, .persona, .sw"
  );

  candidates.forEach((el) => {
    // Avoid re-adding, and allow opt-out.
    if (el.classList.contains("reveal")) return;
    if (el.getAttribute("data-reveal") === "false") return;
    el.classList.add("reveal");
  });

  const observer = new IntersectionObserver(
    (entries, obs) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      }
    },
    { root: null, threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );

  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
})();

