// Roverto product page — light, dependency-free interactions.
(() => {
  "use strict";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Media manifest: drop files in /media and set src here. ---- */
  const MEDIA = {
    roverDriveVideo: { type: "video", src: null }, // "media/rover-drive.mp4"
    mappingVideo: { type: "video", src: null }, //    "media/mapping.mp4" or image
    dashboardVideo: { type: "video", src: null },
    mapImage: { type: "image", src: null },
  };

  function hydrateMedia() {
    document.querySelectorAll("[data-media]").forEach((box) => {
      const m = MEDIA[box.getAttribute("data-media")];
      if (!m || !m.src) return; // keep placeholder
      box.querySelector(".ph")?.remove();
      let el;
      if (m.type === "video") {
        el = document.createElement("video");
        Object.assign(el, { src: m.src, muted: true, loop: true, autoplay: true, playsInline: true });
        el.setAttribute("playsinline", "");
      } else {
        el = document.createElement("img");
        el.src = m.src;
        el.alt = box.getAttribute("data-media");
      }
      box.appendChild(el);
    });
  }

  /* ---- Sticky header state ---- */
  const header = document.querySelector(".site-header");
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- Reveal on scroll ---- */
  const reveals = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    reveals.forEach((r) => r.classList.add("in"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add("in");
          if (e.target.classList.contains("pipeline")) startFlow(e.target);
          if (e.target.classList.contains("metrics")) countUp(e.target);
          io.unobserve(e.target);
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" },
    );
    reveals.forEach((r) => io.observe(r));
  }

  /* ---- Pipeline flow pulse (staggered) ---- */
  function startFlow(pipeline) {
    if (reduce) return;
    pipeline.querySelectorAll(".flow").forEach((f, i) => {
      f.classList.add("live");
      f.style.animationDelay = `${i * 0.28}s`;
    });
  }

  /* ---- Count-up metrics ---- */
  function countUp(scope) {
    scope.querySelectorAll("[data-count]").forEach((el) => {
      const target = parseFloat(el.getAttribute("data-count"));
      const dec = parseInt(el.getAttribute("data-dec") || "0", 10);
      const suffix = el.getAttribute("data-suffix") || "";
      if (reduce) {
        el.textContent = target.toFixed(dec) + suffix;
        return;
      }
      const dur = 1100;
      const t0 = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (target * eased).toFixed(dec) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  hydrateMedia();

  /* ---- Presentation deck: click / keys advance section by section ---- */
  const slides = [
    ...document.querySelectorAll("section"),
    document.querySelector(".site-footer"),
  ].filter(Boolean);
  let cur = 0;

  const dots = document.createElement("nav");
  dots.className = "deck-dots";
  dots.setAttribute("aria-label", "Slide navigation");
  slides.forEach((_, i) => {
    const b = document.createElement("button");
    b.setAttribute("aria-label", "Go to slide " + (i + 1));
    b.addEventListener("click", (e) => {
      e.stopPropagation();
      go(i);
    });
    dots.appendChild(b);
  });
  document.body.appendChild(dots);

  const hint = document.createElement("div");
  hint.className = "deck-hint";
  hint.textContent = "click or → to advance · F fullscreen";
  document.body.appendChild(hint);
  let hintTimer = setTimeout(() => (hint.style.opacity = "0"), 4500);

  function paint() {
    [...dots.children].forEach((d, i) => d.classList.toggle("on", i === cur));
  }
  function go(i) {
    cur = Math.max(0, Math.min(slides.length - 1, i));
    slides[cur].scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    paint();
    hint.style.opacity = "0";
    clearTimeout(hintTimer);
  }
  paint();

  // keep `cur` synced when scrolling manually
  if ("IntersectionObserver" in window) {
    const sync = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const i = slides.indexOf(e.target);
            if (i >= 0) {
              cur = i;
              paint();
            }
          }
        });
      },
      { threshold: 0.5 },
    );
    slides.forEach((s) => sync.observe(s));
  }

  // keyboard
  window.addEventListener("keydown", (e) => {
    const k = e.key;
    if (k === "ArrowRight" || k === "ArrowDown" || k === "PageDown" || k === " ") {
      e.preventDefault();
      go(cur + 1);
    } else if (k === "ArrowLeft" || k === "ArrowUp" || k === "PageUp") {
      e.preventDefault();
      go(cur - 1);
    } else if (k === "Home") {
      e.preventDefault();
      go(0);
    } else if (k === "End") {
      e.preventDefault();
      go(slides.length - 1);
    } else if (k === "f" || k === "F") {
      toggleFullscreen(document.documentElement);
    }
  });

  // click anywhere (except interactive elements / media) advances
  document.addEventListener("click", (e) => {
    if (e.target.closest("a, button, video, .media, .showcase-media, input")) return;
    go(cur + 1);
  });

  // click a showcase image → fullscreen it
  document.querySelectorAll(".showcase-media").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFullscreen(el);
    });
  });

  function toggleFullscreen(el) {
    if (!document.fullscreenElement) el.requestFullscreen?.().catch(() => {});
    else document.exitFullscreen?.().catch(() => {});
  }
})();
