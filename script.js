/* =========================================================
   Marlon Decke-Cornill — Portfolio
   Language toggle · scroll reveals · lightbox · clock
   ========================================================= */

(function () {
  "use strict";

  /* ---------- Language toggle ---------- */
  const STORAGE_KEY = "mdc-lang";
  const DEFAULT_LANG = "de";
  const buttons = document.querySelectorAll(".lang__btn");
  const htmlEl = document.documentElement;
  const clockEl = document.getElementById("clock");

  function applyLanguage(lang) {
    const elements = document.querySelectorAll("[data-de], [data-en]");
    elements.forEach((el) => {
      const value = el.getAttribute("data-" + lang);
      if (value === null) return;
      if (el.tagName === "META") {
        el.setAttribute("content", value);
        return;
      }
      el.innerHTML = value;
    });

    htmlEl.setAttribute("lang", lang);
    document.title =
      lang === "en"
        ? "Marlon Decke-Cornill — Social media, corporate communications & AI"
        : "Marlon Decke-Cornill — Social Media, Unternehmenskommunikation & KI";

    buttons.forEach((btn) => {
      const isActive = btn.dataset.lang === lang;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    renderClock(lang);
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (_) {}
  }

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => applyLanguage(btn.dataset.lang));
  });

  let initial = DEFAULT_LANG;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "de" || stored === "en") initial = stored;
  } catch (_) {}
  applyLanguage(initial);

  /* ---------- Live clock (Stuttgart) ---------- */
  function renderClock(lang) {
    if (!clockEl) return;
    const now = new Date();
    const opts = {
      timeZone: "Europe/Berlin",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };
    const time = new Intl.DateTimeFormat(
      lang === "en" ? "en-GB" : "de-DE",
      opts
    ).format(now);
    clockEl.textContent = `Stuttgart · ${time}`;
  }
  setInterval(() => {
    const active = document.querySelector(".lang__btn.is-active");
    renderClock(active ? active.dataset.lang : DEFAULT_LANG);
  }, 30000);

  /* ---------- Lightbox (images + videos) ---------- */
  const lightbox = document.getElementById("lightbox");
  if (lightbox) {
    const lbImg = lightbox.querySelector(".lightbox__img");
    const lbVideo = lightbox.querySelector(".lightbox__video");
    const lbCap = lightbox.querySelector(".lightbox__cap");
    const lbClose = lightbox.querySelector(".lightbox__close");
    let lastFocused = null;

    function getCaption(fig) {
      if (!fig) return "";
      const dc = fig.getAttribute("data-lightbox-cap");
      if (dc) return dc;
      const figcap = fig.querySelector("figcaption");
      return figcap ? figcap.textContent.trim() : "";
    }

    function showLightbox() {
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.classList.add("lb-open");
      setTimeout(() => lbClose.focus(), 30);
    }

    function openLightboxImage(src, alt, caption) {
      lastFocused = document.activeElement;
      lbVideo.pause();
      lbVideo.removeAttribute("src");
      lbVideo.load();
      lbVideo.hidden = true;
      lbImg.hidden = false;
      lbImg.src = src;
      lbImg.alt = alt || "";
      lbCap.textContent = caption || alt || "";
      showLightbox();
    }

    function openLightboxVideo(src, caption) {
      lastFocused = document.activeElement;
      lbImg.hidden = true;
      lbImg.src = "";
      lbVideo.hidden = false;
      lbVideo.src = src;
      lbCap.textContent = caption || "";
      // Try to play right away; if blocked, user can press play
      const p = lbVideo.play();
      if (p && p.catch) p.catch(() => {});
      showLightbox();
    }

    function closeLightbox() {
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.classList.remove("lb-open");
      lbVideo.pause();
      lbVideo.removeAttribute("src");
      lbVideo.load();
      lbImg.src = "";
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }

    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox || e.target === lbImg) closeLightbox();
    });
    lbClose.addEventListener("click", closeLightbox);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && lightbox.classList.contains("is-open")) closeLightbox();
    });

    // Images: click anywhere to open
    const imgTargets = document.querySelectorAll(
      ".media-paper img, .brand-row img, .pinboard__photo:not(.pinboard__photo--placeholder) img, [data-lightbox] img"
    );
    imgTargets.forEach((img) => {
      img.style.cursor = "zoom-in";
      img.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        openLightboxImage(img.currentSrc || img.src, img.alt, getCaption(img.closest("figure")));
      });
    });

    // Videos: inject an expand button into each frame
    document.querySelectorAll(".media-card__frame video").forEach((video) => {
      const frame = video.closest(".media-card__frame");
      if (!frame || frame.querySelector(".media-expand")) return;
      const btn = document.createElement("button");
      btn.className = "media-expand";
      btn.type = "button";
      btn.setAttribute("aria-label", "Vollbild öffnen");
      btn.innerHTML = "⤢";
      frame.appendChild(btn);
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        openLightboxVideo(video.currentSrc || video.src, getCaption(video.closest("figure")));
      });
    });
  }

  /* ---------- Scroll reveals ---------- */
  const revealTargets = document.querySelectorAll(
    ".section__heading, .section__num, .case, .timeline__item, .skill, .langs__list li, .contact__heading, .contact__email, .manifest__body p, .manifest__body .display, .hero__title, .hero__lede, .media-card, .media-paper, .subcase, .metrics, .brand-row, .gif-block__main, .gif-block__loop, .pinboard-wrap, .compare"
  );
  revealTargets.forEach((el) => el.classList.add("reveal"));

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    revealTargets.forEach((el) => io.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add("is-visible"));
  }

})();
