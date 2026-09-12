// GSAP/ScrollTrigger cargan de un CDN — si eso falla (bloqueador de
// anuncios, red inestable, caída del CDN), nada de lo de abajo debe
// romperse: solo el movimiento es opcional aquí, no el menú móvil, el
// estado del horario, el mapa, etc.
const gsapReady = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";
if (gsapReady) {
  gsap.registerPlugin(ScrollTrigger);
}

/* ---------- Word splitting (accesible) ---------- */
function splitWords(el) {
  const text = el.textContent.trim();
  el.setAttribute("aria-label", text);
  const words = text.split(/\s+/);
  el.innerHTML = "";
  const wrap = document.createElement("span");
  wrap.className = "split-wrap";
  wrap.setAttribute("aria-hidden", "true");
  words.forEach((word, i) => {
    const outer = document.createElement("span");
    outer.className = "split-word";
    const inner = document.createElement("span");
    inner.textContent = word;
    outer.appendChild(inner);
    wrap.appendChild(outer);
    if (i < words.length - 1) wrap.appendChild(document.createTextNode(" "));
  });
  el.appendChild(wrap);
  return Array.from(wrap.querySelectorAll(".split-word > span"));
}

const splitTargets = document.querySelectorAll("[data-split-word]");
const splitMap = new Map();
splitTargets.forEach((el) => splitMap.set(el, splitWords(el)));

/* ---------- Valoración de Google (única fuente de la cifra — edítala
   aquí cuando cambie). Verificada en la ficha de Google del negocio
   (12-09-2026): 4,6 sobre 5, 240 reseñas. ---------- */
const GOOGLE_RATING = { value: "4,6", count: "240", outOf5: 4.6 };

function initGoogleRating() {
  const { value, count, outOf5 } = GOOGLE_RATING;
  const heroRating = document.querySelector(".hero-rating");
  const ctaCount = document.querySelector(".resenas-cta-count");
  const ring = document.querySelector(".resenas-ring");
  const ringValue = document.querySelector(".resenas-ring-value strong");
  const countText = document.querySelector(".resenas-count");
  if (heroRating) heroRating.setAttribute("aria-label", `${value} sobre 5 en Google, ${count} reseñas — ver ficha de Google (se abre en una pestaña nueva)`);
  if (ctaCount) ctaCount.textContent = `Ver reseñas en Google (${value}★)`;
  if (ring) ring.style.setProperty("--pct", (outOf5 / 5) * 100 + "%");
  if (ringValue) ringValue.textContent = value;
  if (countText) countText.textContent = `${count} reseñas en Google. Lo que más se repite:`;
}
initGoogleRating();

/* ---------- Hero: escena de iconos gelatinosos orbitando (langostino,
   pulpo, tortilla, croqueta) a sangre completa sobre el degradado vino de
   fondo. Solo se activa con motion permitido y si el canvas 2D existe; si
   no, el degradado CSS del propio .hero se queda como fondo completo (ver
   js/scene-gooey-icons.js). ---------- */
let heroScene = null;
function initHeroScene() {
  const card = document.querySelector("[data-hero-scene]");
  const canvas = card && card.querySelector(".hero-scene-canvas");
  if (!card || !canvas || typeof window.createGooeyIconScene !== "function") return;
  heroScene = window.createGooeyIconScene(canvas);
  if (heroScene) card.classList.add("is-animated");
}

/* ---------- Cookie notice ---------- */
function initCookieBanner() {
  const banner = document.querySelector(".cookie-banner");
  const ackBtn = document.querySelector(".cookie-ack");
  if (!banner || !ackBtn) return;
  const KEY = "o-logradouro-cookie-ack";
  let acknowledged = false;
  try {
    acknowledged = localStorage.getItem(KEY) === "1";
  } catch (e) {}
  if (!acknowledged) {
    banner.hidden = false;
    document.body.classList.add("has-cookie-banner");
  }
  ackBtn.addEventListener("click", () => {
    banner.hidden = true;
    document.body.classList.remove("has-cookie-banner");
    try {
      localStorage.setItem(KEY, "1");
    } catch (e) {}
  });
}
initCookieBanner();

/* ---------- Botón flotante de WhatsApp ---------- */
function initWhatsappFab() {
  const fab = document.querySelector(".whatsapp-fab");
  const hero = document.querySelector(".hero");
  if (!fab || !hero) return;
  if (!gsapReady) {
    const observer = new IntersectionObserver(([entry]) => {
      fab.classList.toggle("is-visible", !entry.isIntersecting);
    });
    observer.observe(hero);
    return;
  }
  ScrollTrigger.create({
    trigger: hero,
    start: "bottom top",
    onEnter: () => fab.classList.add("is-visible"),
    onLeaveBack: () => fab.classList.remove("is-visible"),
  });
}
initWhatsappFab();

/* ---------- Mapa: solo carga el iframe (y sus cookies) de Google al clic ---------- */
function initMapConsent() {
  document.querySelectorAll(".map-consent").forEach((btn) => {
    btn.addEventListener(
      "click",
      () => {
        const iframe = document.createElement("iframe");
        iframe.title = btn.dataset.mapTitle || "Mapa";
        iframe.src = btn.dataset.mapSrc;
        iframe.loading = "lazy";
        iframe.referrerPolicy = "no-referrer-when-downgrade";
        btn.replaceWith(iframe);
      },
      { once: true }
    );
  });
}
initMapConsent();

/* ---------- Horario en directo ----------
   Datos verificados en la ficha de Google Maps del negocio (12-09-2026):
   miércoles a domingo, 10:00–1:00 (una sola franja que cruza medianoche);
   lunes y martes cerrado. A diferencia de A Taberna do Rio (barra/cocina
   en franjas distintas), aquí hay una sola franja de apertura — por eso
   isOpenAt() sigue necesitando el arrastre al día anterior para las horas
   de después de medianoche (00:00–01:00). */
const HOURS = {
  0: [["10:00", "01:00"]], // Domingo
  1: [], // Lunes: cerrado
  2: [], // Martes: cerrado
  3: [["10:00", "01:00"]], // Miércoles
  4: [["10:00", "01:00"]], // Jueves
  5: [["10:00", "01:00"]], // Viernes
  6: [["10:00", "01:00"]], // Sábado
};

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function isOpenAt(hoursMap, date) {
  const day = date.getDay();
  const minutes = date.getHours() * 60 + date.getMinutes();
  const today = hoursMap[day] || [];
  const yesterday = hoursMap[(day + 6) % 7] || [];

  const openNow = today.some(([open, close]) => {
    const o = toMinutes(open);
    const c = toMinutes(close);
    return c > o ? minutes >= o && minutes < c : minutes >= o;
  });
  if (openNow) return true;

  return yesterday.some(([open, close]) => {
    const o = toMinutes(open);
    const c = toMinutes(close);
    return c <= o && minutes < c;
  });
}

/* ---------- Reloj de la taberna: línea de tiempo 8h–26h (hasta la 1h del
   día siguiente) con la franja de hoy y una marca en vivo de "ahora". Eje
   fijo en minutos para que la franja y la marca de "ahora" se posicionen
   en % sin depender del layout. Después de medianoche (00:00–01:00) el
   "ahora" se sitúa usando el eje del día anterior, ya que esa hora sigue
   perteneciendo al servicio de la noche anterior. ---------- */
const CLOCK_AXIS_START = 8 * 60;
const CLOCK_AXIS_END = 26 * 60; // 02:00 del día siguiente
const CLOCK_AXIS_RANGE = CLOCK_AXIS_END - CLOCK_AXIS_START;

function clockPct(minutes) {
  return Math.min(100, Math.max(0, ((minutes - CLOCK_AXIS_START) / CLOCK_AXIS_RANGE) * 100));
}

function renderClockTrack(track, hoursMap, day) {
  if (!track) return;
  track.innerHTML = "";
  (hoursMap[day] || []).forEach(([open, close]) => {
    const span = document.createElement("span");
    span.className = "clock-window";
    const o = toMinutes(open);
    let c = toMinutes(close);
    if (c <= o) c += 24 * 60; // cruza medianoche: dibuja hasta la 1h "extendida"
    const left = clockPct(o);
    const right = clockPct(c);
    span.style.left = left + "%";
    span.style.width = Math.max(0, right - left) + "%";
    track.appendChild(span);
  });
}

function initOpeningHours() {
  const status = document.getElementById("hours-status-text");
  const dot = document.querySelector("[data-status-dot]");
  const list = document.getElementById("hours-list");
  const track = document.querySelector("[data-clock-track]");
  const nowMark = document.querySelector("[data-clock-now]");
  if (!status || !list) return;

  let lastDay = null;

  function update() {
    const now = new Date();
    const day = now.getDay();
    list.querySelectorAll("li").forEach((li) => {
      li.classList.toggle("is-today", Number(li.dataset.day) === day);
    });
    const open = isOpenAt(HOURS, now);
    status.textContent = open ? "Abierto ahora" : "Cerrado ahora";
    if (dot) dot.classList.toggle("is-closed", !open);

    if (day !== lastDay) {
      renderClockTrack(track, HOURS, day);
      lastDay = day;
    }
    if (nowMark) {
      let minutes = now.getHours() * 60 + now.getMinutes();
      if (minutes < CLOCK_AXIS_START) minutes += 24 * 60; // 00:00–01:00 -> extremo derecho del eje
      nowMark.style.left = clockPct(minutes) + "%";
    }
  }
  update();
  setInterval(update, 60000);
}
initOpeningHours();

/* ---------- Menú móvil ---------- */
const navToggle = document.querySelector(".nav-toggle");
const mobileNav = document.getElementById("mobile-nav");

function closeMobileNav() {
  mobileNav.hidden = true;
  navToggle.setAttribute("aria-expanded", "false");
}
function openMobileNav() {
  mobileNav.hidden = false;
  navToggle.setAttribute("aria-expanded", "true");
}
navToggle.addEventListener("click", () => {
  const isOpen = navToggle.getAttribute("aria-expanded") === "true";
  isOpen ? closeMobileNav() : openMobileNav();
});
mobileNav.addEventListener("click", (e) => {
  if (e.target.tagName === "A") closeMobileNav();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && navToggle.getAttribute("aria-expanded") === "true") {
    closeMobileNav();
    navToggle.focus();
  }
});

/* ---------- Reduced motion y cableado del scroll suave ---------- */
const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

let lenis = null;

const revealTimelines = [];
function completeRevealsBefore(targetEl) {
  const targetTop = targetEl.getBoundingClientRect().top + window.scrollY;
  revealTimelines.forEach(({ group, tl }) => {
    const groupTop = group.getBoundingClientRect().top + window.scrollY;
    if (groupTop <= targetTop + 40) tl.progress(1);
  });
}

function smoothScrollToSelector(selector) {
  const target = document.querySelector(selector);
  if (!target) return;
  completeRevealsBefore(target);
  const headerOffset = 68;
  if (lenis) {
    lenis.scrollTo(target, { offset: -headerOffset });
  } else {
    const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top, behavior: reduceQuery.matches ? "auto" : "smooth" });
  }
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  const id = link.getAttribute("href");
  if (id.length <= 1) return;
  if (!document.querySelector(id)) return;
  link.addEventListener("click", (e) => {
    e.preventDefault();
    closeMobileNav();
    smoothScrollToSelector(id);
  });
});

document.querySelectorAll("[data-scroll-target]").forEach((btn) => {
  btn.addEventListener("click", () => smoothScrollToSelector(btn.dataset.scrollTarget));
});

/* ---------- Rail nav ---------- */
function setRailActive(id) {
  document.querySelectorAll(".rail-links a").forEach((a) => {
    a.classList.toggle("is-active", a.getAttribute("href") === "#" + id);
  });
  document.querySelectorAll('.mobile-nav a[href^="#"], .footer-nav a[href^="#"]').forEach((a) => {
    a.classList.toggle("is-active", a.getAttribute("href") === "#" + id);
  });
}

const RAIL_SECTIONS = ["momentos", "mesa", "historia", "terraza", "resenas", "encuentranos"];

function initScrollSpy() {
  if (!gsapReady) return;
  RAIL_SECTIONS.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    ScrollTrigger.create({
      trigger: el,
      start: "top center",
      end: "bottom center",
      onEnter: () => setRailActive(id),
      onEnterBack: () => setRailActive(id),
    });
  });
}

/* ---------- Cromo de scroll ---------- */
function initScrollChrome() {
  if (!gsapReady) return;
  const bar = document.querySelector(".scroll-progress-bar");
  const header = document.querySelector(".site-header");
  const railFill = document.querySelector(".rail-track-fill");
  if (bar || railFill) {
    ScrollTrigger.create({
      trigger: document.documentElement,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        if (bar) bar.style.transform = `scaleX(${self.progress})`;
        if (railFill) railFill.style.height = self.progress * 100 + "%";
      },
    });
  }
  if (header) {
    ScrollTrigger.create({
      trigger: document.body,
      start: "top -80",
      onEnter: () => header.classList.add("is-scrolled"),
      onLeaveBack: () => header.classList.remove("is-scrolled"),
    });
  }
}

/* ---------- Foco tipo linterna sobre "Encuéntranos" ---------- */
function initSpotlight() {
  document.querySelectorAll(".spotlight").forEach((section) => {
    section.addEventListener("pointermove", (e) => {
      const rect = section.getBoundingClientRect();
      const mx = (((e.clientX - rect.left) / rect.width) * 100).toFixed(1) + "%";
      const my = (((e.clientY - rect.top) / rect.height) * 100).toFixed(1) + "%";
      section.style.setProperty("--mx", mx);
      section.style.setProperty("--my", my);
    });
  });
}

/* ---------- Motion setup ---------- */
if (!gsapReady) {
  document.body.classList.add("motion-reduced");
}

const mm = gsapReady ? gsap.matchMedia() : null;

if (mm) mm.add(
  {
    isMotion: "(prefers-reduced-motion: no-preference)",
    isFinePointer: "(pointer: fine)",
  },
  (context) => {
    const { isMotion, isFinePointer } = context.conditions;

    if (isMotion) {
      lenis = new Lenis({ lerp: 0.11, smoothWheel: true, wheelMultiplier: 1 });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);

      runHeroIntro();
      runSectionReveals();
      runGhostParallax();
      runMarquee();
      initScrollSpy();
      initScrollChrome();
      initHeroScene();

      if (isFinePointer) {
        initMagneticButtons();
        initTiltCards();
        initHeroTilt();
        initSpotlight();
        initCustomCursor();
      }

      window.addEventListener("pagehide", () => {
        lenis && lenis.destroy();
        ScrollTrigger.getAll().forEach((t) => t.kill());
        if (heroScene) heroScene.destroy();
      });
    } else {
      document.body.classList.add("motion-reduced");
      initScrollSpy();
      initScrollChrome();
    }

    return () => {
      if (lenis) {
        lenis.destroy();
        lenis = null;
      }
    };
  }
);

/* ---------- Intro del hero ---------- */
function runHeroIntro() {
  const tl = gsap.timeline({ delay: 0.15 });
  tl.from(".site-header", { y: -24, opacity: 0, duration: 0.7, ease: "power3.out" });
  tl.from(".hero-eyebrow", { y: 12, opacity: 0, duration: 0.5, ease: "power2.out" }, "-=0.35");
  tl.from(".hero-title", { y: 20, opacity: 0, duration: 0.7, ease: "power3.out" }, "-=0.25");
  tl.from(".hero-claim", { y: 16, opacity: 0, duration: 0.6, ease: "power2.out" }, "-=0.45");
  tl.from(".hero-actions", { y: 14, opacity: 0, duration: 0.6, ease: "power2.out" }, "-=0.35");
  tl.from(".hero-note", { y: 10, opacity: 0, duration: 0.5, ease: "power2.out" }, "-=0.3");
  tl.from(".hero-media", { y: 26, opacity: 0, duration: 0.9, ease: "power3.out" }, "-=0.75");
  tl.from(".scroll-cue", { opacity: 0, duration: 0.5 }, "-=0.2");
}

/* ---------- Revelados sección por sección ---------- */
function runSectionReveals() {
  document.querySelectorAll("[data-reveal-group]").forEach((group) => {
    const heading = group.querySelector("h2");
    const headingSplitTargets = heading
      ? Array.from(heading.matches("[data-split-word]") ? [heading] : heading.querySelectorAll("[data-split-word]"))
      : [];
    const headingWords = headingSplitTargets.length
      ? headingSplitTargets.flatMap((el) => splitMap.get(el) || [])
      : null;
    const blocks = group.querySelectorAll("p, .resenas-panel");
    const cards = group.querySelectorAll(
      ".momento, .terraza-tile, .diptico-panel, .clock-card, .info-list li, .map-card, .mesa-foco"
    );
    const rows = group.querySelectorAll(".mesa-index li, .hours-list li");

    if (headingWords) gsap.set(headingWords, { yPercent: 110, opacity: 0 });
    gsap.set(blocks, { y: 16, opacity: 0 });
    gsap.set(cards, { y: 30, opacity: 0, scale: 0.95 });
    gsap.set(rows, { opacity: 0 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: group,
        start: "top 78%",
        toggleActions: "play none none none",
      },
    });
    if (headingWords) {
      tl.to(headingWords, { yPercent: 0, opacity: 1, duration: 0.8, stagger: 0.05, ease: "power4.out" });
    }
    tl.to(blocks, { y: 0, opacity: 1, duration: 0.6, stagger: 0.05, ease: "power2.out" }, headingWords ? "-=0.35" : 0);
    tl.to(
      cards,
      { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: Math.min(0.07, 0.4 / Math.max(cards.length, 1)), ease: "power3.out" },
      headingWords || blocks.length ? "-=0.35" : 0
    );
    if (rows.length) {
      const rowStagger = Math.min(0.02, 0.4 / rows.length);
      tl.to(rows, { opacity: 1, duration: 0.25, stagger: rowStagger, ease: "power1.out" }, "-=0.3");
    }
    revealTimelines.push({ group, tl });
  });
}

/* ---------- Marca de agua fantasma con paralaje ---------- */
function runGhostParallax() {
  document.querySelectorAll(".ghost-word").forEach((el) => {
    gsap.to(el, {
      yPercent: -16,
      ease: "none",
      scrollTrigger: {
        trigger: el.closest("section"),
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
  });
}

/* ---------- Divisor marquesina ---------- */
function runMarquee() {
  const track = document.querySelector(".marquee-track");
  if (!track) return;

  function start() {
    const seqWidth = track.scrollWidth / 2;
    const pxPerSecond = 55;

    const tween = gsap.to(track, {
      xPercent: -50,
      duration: seqWidth / pxPerSecond,
      ease: "none",
      repeat: -1,
    });

    ScrollTrigger.create({
      trigger: track,
      start: "top bottom",
      end: "bottom top",
      onEnter: () => tween.play(),
      onEnterBack: () => tween.play(),
      onLeave: () => tween.pause(),
      onLeaveBack: () => tween.pause(),
    });
  }

  if (document.fonts && document.fonts.status !== "loaded") {
    document.fonts.ready.then(start);
  } else {
    start();
  }
}

/* ---------- Botones magnéticos ---------- */
function initMagneticButtons() {
  document.querySelectorAll(".btn").forEach((el) => {
    const moveX = gsap.quickTo(el, "x", { duration: 0.35, ease: "power3" });
    const moveY = gsap.quickTo(el, "y", { duration: 0.35, ease: "power3" });
    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      moveX((e.clientX - rect.left - rect.width / 2) * 0.25);
      moveY((e.clientY - rect.top - rect.height / 2) * 0.4);
    });
    el.addEventListener("mouseleave", () => {
      moveX(0);
      moveY(0);
    });
  });
}

/* ---------- Tilt en tarjetas de terraza/momentos ---------- */
function initTiltCards() {
  document.querySelectorAll(".terraza-tile, .momento, .mesa-foco").forEach((el) => {
    const rotX = gsap.quickTo(el, "rotationX", { duration: 0.4, ease: "power2" });
    const rotY = gsap.quickTo(el, "rotationY", { duration: 0.4, ease: "power2" });
    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      rotY(px * 6);
      rotX(-py * 6);
    });
    el.addEventListener("mouseleave", () => {
      rotX(0);
      rotY(0);
    });
  });
}

/* ---------- Tilt 3D del hero ---------- */
function initHeroTilt() {
  const hero = document.querySelector(".hero");
  const content = document.querySelector(".hero-content");
  if (!hero || !content) return;

  const rotX = gsap.quickTo(content, "rotationX", { duration: 0.7, ease: "power2" });
  const rotY = gsap.quickTo(content, "rotationY", { duration: 0.7, ease: "power2" });

  hero.addEventListener("pointermove", (e) => {
    const rect = hero.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rotY(px * 4);
    rotX(-py * 4);
  });
  hero.addEventListener("pointerleave", () => {
    rotX(0);
    rotY(0);
  });
}

/* ---------- Cursor personalizado (solo puntero fino) ---------- */
function initCustomCursor() {
  const ring = document.querySelector(".cursor-ring");
  if (!ring) return;
  document.body.classList.add("custom-cursor-active");

  const moveX = gsap.quickTo(ring, "x", { duration: 0.35, ease: "power3" });
  const moveY = gsap.quickTo(ring, "y", { duration: 0.35, ease: "power3" });

  function onMove(e) {
    ring.classList.add("is-visible");
    moveX(e.clientX);
    moveY(e.clientY);
  }
  window.addEventListener("pointermove", onMove, { passive: true });

  document.querySelectorAll("a, button, [tabindex], .terraza-tile, .momento").forEach((el) => {
    el.addEventListener("mouseenter", () => ring.classList.add("is-hover"));
    el.addEventListener("mouseleave", () => ring.classList.remove("is-hover"));
  });

  window.addEventListener("blur", () => ring.classList.remove("is-visible"));
  document.addEventListener("mouseleave", () => ring.classList.remove("is-visible"));
}

/* Actualiza medidas de ScrollTrigger cuando las fuentes/el layout se
   asientan — protegido por gsapReady ya que GSAP/ScrollTrigger pueden no
   haberse cargado (CDN caído, bloqueador de anuncios, sin red). */
if (gsapReady) {
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
  window.addEventListener("load", () => ScrollTrigger.refresh());
}
