/**
 * ═══════════════════════════════════════════════════════════
 *  MD FAIYAZ ANSARI — PORTFOLIO v4  ★ PREMIUM 3D UPGRADE
 *  script.js — All interactive features
 *
 *  MODULES:
 *  1.  Loading Screen         — progress + arc animation
 *  2.  Theme Toggle           — dark/light with localStorage
 *  3.  Custom Cursor          — magnetic, label, click states
 *  4.  Three.js Hero          — 3D particle field
 *  5.  GSAP Scroll Animations — reveal, parallax, stagger
 *  6.  Skill Bar Animation    — fills on scroll into view
 *  7.  Counter Animation      — counting-up numbers
 *  8.  3D Card Tilt           — pointer-follow perspective
 *  9.  Card Shine Effect      — light sweep on mouse move
 *  10. Typewriter Effect      — hero tagline roles
 *  11. Nav Behaviour          — scroll state, active link, progress
 *  12. Hamburger / Drawer     — mobile menu
 *  13. Smooth Scroll          — intercept all anchor clicks
 *  14. Back to Top Button
 *  15. Contact Form           — validation + success state
 *  16. Magnetic Buttons       — subtle pull-toward-cursor
 *  17. Parallax Orbs          — gentle mouse-parallax on orbs
 * ═══════════════════════════════════════════════════════════
 */

/* ───────────────────────────────────────────────────────────
   UTILITIES
─────────────────────────────────────────────────────────── */
const $  = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
const lerp  = (a, b, t) => a + (b - a) * t;
const isMobile = () => window.innerWidth <= 768;
const isFinePointer = () => window.matchMedia('(pointer: fine)').matches;



/* ───────────────────────────────────────────────────────────
   2. THEME TOGGLE  (dark ↔ light)
─────────────────────────────────────────────────────────── */
(function initTheme() {
  const btn  = $('#themeToggle');
  const html = document.documentElement;

  // Persist preference
  const saved = localStorage.getItem('fa-theme') || 'dark';
  html.setAttribute('data-theme', saved);

  btn && btn.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next    = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('fa-theme', next);

    // Briefly pulse the toggle button
    btn.style.transform = 'scale(0.85)';
    setTimeout(() => btn.style.transform = '', 200);
  });
})();

/* ───────────────────────────────────────────────────────────
   CUSTOM CURSOR — from scratch
   #fa-cursor wrapper moves via transform (GPU layer).
   .fac__outer  = large ring, lags behind mouse (lerp 0.10)
   .fac__inner  = small dot, snaps exactly to mouse
   .fac__text   = label pill, fades in on hover
─────────────────────────────────────────────────────────── */
(function initCursor() {
  if (!window.matchMedia('(pointer: fine)').matches) return;

  const wrap  = document.getElementById('fa-cursor');
  const outer = wrap && wrap.querySelector('.fac__outer');
  const inner = wrap && wrap.querySelector('.fac__inner');
  const text  = document.getElementById('faCursorText');
  if (!wrap || !outer || !inner) return;

  // Raw mouse — updated on every mousemove
  let mx = -300, my = -300;
  // Outer ring lerped position
  let ox = -300, oy = -300;

  // ── RAF loop ─────────────────────────────────────────────
  function tick() {
    // Lerp outer ring toward mouse (slower = more lag)
    ox += (mx - ox) * 0.10;
    oy += (my - oy) * 0.10;

    // Inner dot sits exactly on mouse — move the wrapper there
    wrap.style.transform  = `translate(${mx}px, ${my}px)`;
    // Outer ring independently lags behind using its own translate
    outer.style.transform = `translate(${ox - mx}px, ${oy - my}px)`;

    requestAnimationFrame(tick);
  }
  tick();

  // ── Mouse tracking ───────────────────────────────────────
  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
  }, { passive: true });

  // ── Hover: detect interactive targets ───────────────────
  const SEL = 'a, button, [data-cursor], .tilt-card, .magnetic, label, input, textarea';

  document.addEventListener('mouseover', e => {
    const t = e.target.closest(SEL);
    if (!t) return;
    wrap.classList.add('fac--hover');
    if (text) text.textContent = t.getAttribute('data-cursor') || '';
  });

  document.addEventListener('mouseout', e => {
    const t = e.target.closest(SEL);
    if (!t || t.contains(e.relatedTarget)) return;
    wrap.classList.remove('fac--hover');
    if (text) text.textContent = '';
  });

  // ── Click ────────────────────────────────────────────────
  document.addEventListener('mousedown', () => wrap.classList.add('fac--click'));
  document.addEventListener('mouseup',   () => wrap.classList.remove('fac--click'));

  // ── Visibility ──────────────────────────────────────────
  document.documentElement.addEventListener('mouseleave', () => { wrap.style.opacity = '0'; });
  document.documentElement.addEventListener('mouseenter', () => { wrap.style.opacity = '1'; });
})();


/* ───────────────────────────────────────────────────────────
   4. THREE.JS HERO PARTICLE FIELD
   Wrapped in try/catch — CDN failure won't crash the page.
─────────────────────────────────────────────────────────── */
(function initThreeJS() {
  try {
  const canvas = $('#heroCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  // ─── Setup ───
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
  renderer.setClearColor(0x000000, 0);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
  camera.position.z = 80;

  // Resolve accent colour from CSS variable (handles both themes)
  function getAccentColor() {
    const theme = document.documentElement.getAttribute('data-theme');
    return theme === 'light' ? 0x00a87e : 0x00e5a8;
  }

  // ─── Particle geometry ───
  const PARTICLE_COUNT = isMobile() ? 600 : 1400;
  const positions  = new Float32Array(PARTICLE_COUNT * 3);
  const colors     = new Float32Array(PARTICLE_COUNT * 3);
  const sizes      = new Float32Array(PARTICLE_COUNT);
  const velocity   = new Float32Array(PARTICLE_COUNT * 3);

  const colorA = new THREE.Color(getAccentColor()); // mint
  const colorB = new THREE.Color(0x4d9fff);         // blue
  const colorC = new THREE.Color(0xffffff);          // white

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    // Spread in a sphere
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.acos(Math.random() * 2 - 1);
    const r     = 30 + Math.random() * 60;

    positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi) - 30;

    // Random velocities for drift
    velocity[i * 3]     = (Math.random() - 0.5) * 0.008;
    velocity[i * 3 + 1] = (Math.random() - 0.5) * 0.006;
    velocity[i * 3 + 2] = (Math.random() - 0.5) * 0.004;

    // Mix colour palette
    const mix  = Math.random();
    const baseColor = mix < 0.5 ? colorA : mix < 0.8 ? colorB : colorC;
    colors[i * 3]     = baseColor.r;
    colors[i * 3 + 1] = baseColor.g;
    colors[i * 3 + 2] = baseColor.b;

    sizes[i] = Math.random() * 1.6 + 0.3;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color',    new THREE.BufferAttribute(colors,    3));
  geometry.setAttribute('size',     new THREE.BufferAttribute(sizes,     1));

  // Custom shader for circular, soft particles
  const material = new THREE.ShaderMaterial({
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime:        { value: 0 },
      uMouseInfluence: { value: new THREE.Vector2(0, 0) },
    },
    vertexShader: `
      attribute float size;
      varying vec3 vColor;
      uniform float uTime;
      uniform vec2 uMouseInfluence;
      void main() {
        vColor = color;
        vec3 pos = position;
        // Gentle wave motion
        pos.y += sin(uTime * 0.5 + pos.x * 0.03) * 0.4;
        pos.x += cos(uTime * 0.4 + pos.z * 0.03) * 0.3;
        // Mouse repulsion (subtle)
        vec2 toMouse = pos.xy - uMouseInfluence * 80.0;
        float dist   = length(toMouse);
        if (dist < 20.0) {
          float force = (20.0 - dist) / 20.0;
          pos.xy += normalize(toMouse) * force * 2.5;
        }
        vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = size * (280.0 / -mvPos.z);
        gl_Position  = projectionMatrix * mvPos;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      void main() {
        // Circular soft particle
        vec2 uv = gl_PointCoord - 0.5;
        float d = length(uv);
        if (d > 0.5) discard;
        float alpha = smoothstep(0.5, 0.1, d);
        gl_FragColor = vec4(vColor, alpha * 0.75);
      }
    `
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  // ─── Connection lines between nearby particles (up to 80) ───
  const lineMat = new THREE.LineBasicMaterial({
    color: getAccentColor(), transparent: true, opacity: 0.04, depthWrite: false
  });
  function updateLineColor() {
    lineMat.color.set(getAccentColor());
  }

  // ─── Resize handling ───
  function onResize() {
    const hero = $('#hero');
    if (!hero) return;
    const W = hero.offsetWidth, H = hero.offsetHeight;
    renderer.setSize(W, H);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
  }
  onResize();
  window.addEventListener('resize', onResize, { passive: true });

  // ─── Mouse tracking ───
  let mouseNorm = { x: 0, y: 0 };
  let targetRot = { x: 0, y: 0 };

  document.addEventListener('mousemove', e => {
    mouseNorm.x = (e.clientX / window.innerWidth  - 0.5);
    mouseNorm.y = (e.clientY / window.innerHeight - 0.5);
  }, { passive: true });

  // ─── Animation loop ───
  let clock = { t: 0 };
  let lastTime = 0;

  function animate(time) {
    requestAnimationFrame(animate);
    const dt = (time - lastTime) * 0.001;
    lastTime  = time;
    clock.t  += dt;

    // Smooth camera rotation follows mouse
    targetRot.x = lerp(targetRot.x, mouseNorm.y *  0.3, 0.04);
    targetRot.y = lerp(targetRot.y, mouseNorm.x * -0.4, 0.04);
    particles.rotation.x += (targetRot.x - particles.rotation.x) * 0.06;
    particles.rotation.y += (targetRot.y - particles.rotation.y) * 0.06;

    // Slow auto-rotation
    particles.rotation.y += 0.0005;

    // Update shader time + mouse
    material.uniforms.uTime.value = clock.t;
    material.uniforms.uMouseInfluence.value.set(mouseNorm.x, -mouseNorm.y);

    renderer.render(scene, camera);
  }
  animate(0);

  // Update particle colour on theme change
  const observer = new MutationObserver(() => {
    const c = new THREE.Color(getAccentColor());
    colorA.set(c);
    updateLineColor();
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  } catch(e) {
    // Three.js unavailable or WebGL not supported — page still works fine
    console.warn('Three.js particle field skipped:', e.message);
  }
})();

/* ───────────────────────────────────────────────────────────
   5. GSAP SCROLL ANIMATIONS
   Progressive reveal + stagger effects triggered by scroll.
   Falls back to IntersectionObserver if GSAP unavailable.
─────────────────────────────────────────────────────────── */
(function initScrollAnimations() {

  /* — CSS fallback (always runs, ensures elements become visible) — */
  function setupRevealObserver() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);

          // Stagger children if parent has data-stagger
          if (e.target.dataset.stagger) {
            $$('[data-stagger-child]', e.target).forEach((child, i) => {
              child.style.transitionDelay = `${i * 80}ms`;
              child.classList.add('visible');
            });
          }
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    $$('.reveal').forEach(el => io.observe(el));
  }
  setupRevealObserver();

  /* — GSAP enhanced animations (if available) — */
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  // Section titles split character animation
  $$('.section__title').forEach(title => {
    gsap.from(title, {
      scrollTrigger: { trigger: title, start: 'top 85%', once: true },
      y: 40, opacity: 0, duration: 1, ease: 'power4.out',
      clearProps: 'all'
    });
  });

  // Stagger skill cards
  gsap.from('.skill-card', {
    scrollTrigger: { trigger: '.skills__grid', start: 'top 80%', once: true },
    y: 50, opacity: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out',
    clearProps: 'all'
  });

  // Stagger tech pills
  gsap.from('.tech-pill', {
    scrollTrigger: { trigger: '.tech-wall__grid', start: 'top 85%', once: true },
    scale: 0.7, opacity: 0, duration: 0.4, stagger: 0.04, ease: 'back.out(2)',
    clearProps: 'all'
  });

  // Project cards stagger
  gsap.from('.project', {
    scrollTrigger: { trigger: '.projects__grid', start: 'top 80%', once: true },
    y: 60, opacity: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out',
    clearProps: 'all'
  });

  // Timeline items slide in from left
  gsap.from('.timeline__item', {
    scrollTrigger: { trigger: '.timeline', start: 'top 80%', once: true },
    x: -40, opacity: 0, duration: 0.7, stagger: 0.2, ease: 'power3.out',
    clearProps: 'all'
  });

  // Cred cards stagger
  gsap.from('.cred', {
    scrollTrigger: { trigger: '.creds', start: 'top 85%', once: true },
    x: 30, opacity: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out',
    clearProps: 'all'
  });

  // Parallax on section alt backgrounds
  $$('.section--alt').forEach(section => {
    gsap.to(section, {
      scrollTrigger: {
        trigger: section,
        start: 'top bottom', end: 'bottom top',
        scrub: 1.5
      },
      backgroundPositionY: '30%',
      ease: 'none'
    });
  });

  // Hero stats count up triggered by scroll
  ScrollTrigger.create({
    trigger: '.hero__stats',
    start: 'top 90%',
    once: true,
    onEnter: () => startCounters()
  });
})();

/* ───────────────────────────────────────────────────────────
   6. SKILL BAR ANIMATION
   Fills progress bars when they scroll into view.
─────────────────────────────────────────────────────────── */
(function initSkillBars() {
  const bars = $$('.bar span');
  if (!bars.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const targetWidth = e.target.style.getPropertyValue('--w') ||
                            e.target.style.width || '0%';
        e.target.style.width = targetWidth;
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });

  bars.forEach(bar => {
    // Store width as CSS variable if set inline as 'width'
    const w = bar.style.width;
    if (w) {
      bar.style.setProperty('--w', w);
      bar.style.width = '0%'; // reset before animation
    }
    io.observe(bar);
  });
})();

/* ───────────────────────────────────────────────────────────
   7. COUNTER ANIMATION
   Counts up from 0 to data-target value.
─────────────────────────────────────────────────────────── */
let countersStarted = false;

function startCounters() {
  if (countersStarted) return;
  countersStarted = true;

  $$('.counter').forEach(el => {
    const target  = parseInt(el.dataset.target, 10);
    const duration = 1800;
    const start    = performance.now();

    function tick(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased    = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}

// Also trigger on intersection in case GSAP isn't available
(function() {
  const statsEl = $('.hero__stats');
  if (!statsEl) return;
  const io = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      startCounters();
      io.disconnect();
    }
  }, { threshold: 0.5 });
  io.observe(statsEl);
})();

/* ───────────────────────────────────────────────────────────
   8 & 9. 3D CARD TILT + SHINE EFFECT
   Cards rotate on mouse-move for a 3D parallax illusion.
   A light-sweep shine follows the pointer.
─────────────────────────────────────────────────────────── */
(function initTiltCards() {
  if (isMobile()) return; // Disable on touch/mobile

  const TILT_MAX  = 12;    // max tilt degrees
  const SHINE_W   = 600;   // shine gradient diameter (px)

  $$('.tilt-card').forEach(card => {
    let rafId = null;
    let currentRX = 0, currentRY = 0;
    let targetRX  = 0, targetRY  = 0;

    function onMove(e) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width  / 2;
      const cy = rect.height / 2;

      targetRY =  ((x - cx) / cx) * TILT_MAX;
      targetRX = -((y - cy) / cy) * TILT_MAX;

      // Update shine gradient position
      const shine = card.querySelector('.card-shine');
      if (shine) {
        const px = (x / rect.width  * 100).toFixed(1) + '%';
        const py = (y / rect.height * 100).toFixed(1) + '%';
        shine.style.setProperty('--mx', px);
        shine.style.setProperty('--my', py);
      }
    }

    function animate() {
      currentRX = lerp(currentRX, targetRX, 0.1);
      currentRY = lerp(currentRY, targetRY, 0.1);

      card.style.transform =
        `perspective(800px) rotateX(${currentRX}deg) rotateY(${currentRY}deg) translateZ(4px)`;
      card.style.transition = 'box-shadow 300ms, border-color 300ms';

      if (Math.abs(currentRX - targetRX) > 0.05 || Math.abs(currentRY - targetRY) > 0.05) {
        rafId = requestAnimationFrame(animate);
      } else {
        rafId = null;
      }
    }

    function onLeave() {
      targetRX = 0;
      targetRY = 0;
      if (!rafId) rafId = requestAnimationFrame(animate);

      const shine = card.querySelector('.card-shine');
      if (shine) {
        shine.style.setProperty('--mx', '50%');
        shine.style.setProperty('--my', '0%');
      }
    }

    card.addEventListener('mousemove', e => {
      onMove(e);
      if (!rafId) rafId = requestAnimationFrame(animate);
    });
    card.addEventListener('mouseleave', onLeave);
  });
})();

/* ───────────────────────────────────────────────────────────
   10. TYPEWRITER EFFECT
   Cycles through developer roles in hero tagline.
─────────────────────────────────────────────────────────── */
(function initTypewriter() {
  const el = $('#typewriterText');
  if (!el) return;

  const phrases = [
    'scale reliably.',
    'handle millions of requests.',
    'never go down.',
    'stay secure & fast.',
    'power real products.',
    'are built to last.',
    'make engineers proud.',
    'ship on time.'
  ];

  let phraseIdx = 0;
  let charIdx   = 0;
  let deleting  = false;
  let pausing   = false;

  function tick() {
    const phrase = phrases[phraseIdx];

    if (pausing) return;

    if (!deleting) {
      el.textContent = phrase.slice(0, charIdx + 1);
      charIdx++;
      if (charIdx >= phrase.length) {
        // Pause at end of word
        pausing = true;
        setTimeout(() => { pausing = false; deleting = true; }, 1800);
      }
      setTimeout(tick, 55 + Math.random() * 30);
    } else {
      el.textContent = phrase.slice(0, charIdx - 1);
      charIdx--;
      if (charIdx <= 0) {
        deleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        setTimeout(tick, 300);
        return;
      }
      setTimeout(tick, 30);
    }
  }

  // Start after short delay for page render
  setTimeout(tick, 800);
})();

/* ───────────────────────────────────────────────────────────
   11. NAV BEHAVIOUR
   • Scroll progress bar
   • Scrolled state (glassmorphism)
   • Active section highlight
─────────────────────────────────────────────────────────── */
(function initNav() {
  const nav      = $('#nav');
  const progress = $('#navProgress');
  const links    = $$('.nav__links a, .nav__drawer-link');

  // Scroll progress bar + scrolled class
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const total    = document.documentElement.scrollHeight - window.innerHeight;
    const pct      = total > 0 ? (scrolled / total * 100) : 0;

    if (progress) progress.style.width = pct + '%';
    if (nav)      nav.classList.toggle('scrolled', scrolled > 30);
  }, { passive: true });

  // Active nav link via IntersectionObserver
  const sections = $$('section[id]');
  const sectionIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const id = e.target.id;
        links.forEach(a => {
          a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { threshold: 0.3, rootMargin: '-60px 0px -40% 0px' });

  sections.forEach(s => sectionIO.observe(s));
})();

/* ───────────────────────────────────────────────────────────
   12. HAMBURGER / MOBILE DRAWER
─────────────────────────────────────────────────────────── */
(function initMobileMenu() {
  const toggle = $('#navToggle');
  const drawer = $('#navDrawer');
  if (!toggle || !drawer) return;

  function openDrawer() {
    toggle.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    drawer.hidden = false;
    // Animate in
    drawer.style.opacity = '0';
    drawer.style.transform = 'translateY(-10px)';
    requestAnimationFrame(() => {
      drawer.style.transition = 'opacity 250ms, transform 250ms';
      drawer.style.opacity = '1';
      drawer.style.transform = 'translateY(0)';
    });
  }

  function closeDrawer() {
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    drawer.style.opacity = '0';
    drawer.style.transform = 'translateY(-10px)';
    setTimeout(() => { drawer.hidden = true; drawer.style.transition = ''; }, 260);
  }

  toggle.addEventListener('click', () => {
    drawer.hidden ? openDrawer() : closeDrawer();
  });

  // Close on link click
  $$('.nav__drawer-link, .nav__drawer-cta', drawer).forEach(a => {
    a.addEventListener('click', closeDrawer);
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!drawer.hidden && !$('#nav').contains(e.target)) closeDrawer();
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !drawer.hidden) closeDrawer();
  });
})();

/* ───────────────────────────────────────────────────────────
   13. SMOOTH SCROLL
   Intercepts anchor clicks and smoothly scrolls.
─────────────────────────────────────────────────────────── */
(function initSmoothScroll() {
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const id  = link.getAttribute('href');
    const target = $(id);
    if (!target) return;

    e.preventDefault();
    const navH   = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 66;
    const top    = target.getBoundingClientRect().top + window.scrollY - navH;

    window.scrollTo({ top, behavior: 'smooth' });

    // Update URL without jump
    history.pushState(null, '', id);
  });
})();

/* ───────────────────────────────────────────────────────────
   14. BACK TO TOP BUTTON
─────────────────────────────────────────────────────────── */
(function initBackTop() {
  const btn = $('#backTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 500);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ───────────────────────────────────────────────────────────
   15. CONTACT FORM
   Client-side validation + animated success state.
─────────────────────────────────────────────────────────── */
(function initContactForm() {
  const form    = $('#contactForm');
  const success = $('#formSuccess');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    const name    = $('#cf-name');
    const email   = $('#cf-email');
    const message = $('#cf-message');
    let valid     = true;

    // Simple inline validation
    [name, email, message].forEach(field => {
      if (!field) return;
      const ok = field.value.trim() &&
        (field.type !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim()));
      field.style.borderColor = ok ? '' : '#ef4444';
      field.style.boxShadow   = ok ? '' : '0 0 0 3px rgba(239,68,68,0.15)';
      if (!ok) valid = false;
    });

    if (!valid) {
      // Shake animation on the form
      form.style.animation = 'none';
      form.offsetHeight; // reflow
      form.style.animation = 'shake 400ms ease';
      return;
    }

    // Simulate async send
    const submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.querySelector('span').textContent = 'Sending...';
    }

    setTimeout(() => {
      if (success) { success.hidden = false; }
      if (submitBtn) { submitBtn.style.display = 'none'; }
      form.reset();
      // Reset field styles
      [name, email, message].forEach(f => {
        if (f) { f.style.borderColor = ''; f.style.boxShadow = ''; }
      });
    }, 900);
  });

  // Clear error on typing
  $$('input, textarea', form).forEach(field => {
    field.addEventListener('input', () => {
      field.style.borderColor = '';
      field.style.boxShadow   = '';
    });
  });
})();

/* ───────────────────────────────────────────────────────────
   16. MAGNETIC BUTTONS
   Buttons subtly pull toward the cursor — luxury feel.
─────────────────────────────────────────────────────────── */
(function initMagnetic() {
  if (!isFinePointer() || isMobile()) return;

  $$('.magnetic').forEach(btn => {
    const STRENGTH = 0.35;

    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const dx   = e.clientX - (rect.left + rect.width  / 2);
      const dy   = e.clientY - (rect.top  + rect.height / 2);
      btn.style.transform    = `translate(${dx * STRENGTH}px, ${dy * STRENGTH}px)`;
      btn.style.transition   = 'transform 100ms linear';
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform  = 'translate(0,0)';
      btn.style.transition = 'transform 400ms cubic-bezier(0.34,1.56,0.64,1)';
    });
  });
})();

/* ───────────────────────────────────────────────────────────
   17. PARALLAX ORBS
   Orbs move subtly opposite to mouse for depth illusion.
─────────────────────────────────────────────────────────── */
(function initParallaxOrbs() {
  if (isMobile()) return;

  const orbs = [
    { el: $('.orb--1'), speed: 0.018 },
    { el: $('.orb--2'), speed: 0.012 },
    { el: $('.orb--3'), speed: 0.025 }
  ];

  let mx = 0, my = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX - window.innerWidth  / 2;
    my = e.clientY - window.innerHeight / 2;
  }, { passive: true });

  function animateOrbs() {
    orbs.forEach(({ el, speed }) => {
      if (!el) return;
      const tx = mx * speed;
      const ty = my * speed;
      el.style.transform = `translate(${tx}px, ${ty}px)`;
    });
    requestAnimationFrame(animateOrbs);
  }
  animateOrbs();
})();

/* ───────────────────────────────────────────────────────────
   INJECT CSS ANIMATIONS not easily doable in stylesheet
   (shake for form, page enter)
─────────────────────────────────────────────────────────── */
(function injectKeyframes() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%,100%{transform:translateX(0)}
      20%{transform:translateX(-8px)}
      40%{transform:translateX(8px)}
      60%{transform:translateX(-5px)}
      80%{transform:translateX(5px)}
    }
  `;
  document.head.appendChild(style);
})();

/* ───────────────────────────────────────────────────────────
   PERFORMANCE: Disable heavy effects on low-end devices
   Uses navigator.hardwareConcurrency as a simple heuristic.
─────────────────────────────────────────────────────────── */
(function performanceGuard() {
  const cores = navigator.hardwareConcurrency || 4;
  if (cores <= 2) {
    // Kill Three.js canvas on very low-end devices
    const canvas = $('#heroCanvas');
    if (canvas) canvas.style.display = 'none';
    // Disable orb animations
    $$('.orb').forEach(o => o.style.animation = 'none');
  }
})();

/* ───────────────────────────────────────────────────────────
   INIT SUMMARY  (console signature)
─────────────────────────────────────────────────────────── */
console.log(
  '%c✦ Faiyaz Portfolio v4 %c 3D + GSAP + Premium \n%c Built with Three.js · GSAP · Vanilla JS',
  'background:#00e5a8;color:#000;font-weight:700;padding:4px 8px;border-radius:3px 0 0 3px;font-family:monospace',
  'background:#4d9fff;color:#fff;font-weight:700;padding:4px 8px;border-radius:0 3px 3px 0;font-family:monospace',
  'color:#8e8a84;font-family:monospace;font-size:11px'
);
