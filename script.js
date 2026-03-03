/**
 * Md Faiyaz Ansari — Portfolio v2
 * JavaScript: Modular, performance-optimised, accessible
 *
 * Modules:
 *  1. CustomCursor      — pointer:fine devices only
 *  2. NavigationManager — scroll state, active link, hamburger
 *  3. ReadingProgress   — header progress bar
 *  4. ScrollReveal      — IntersectionObserver-based reveals
 *  5. SkillBars         — animate widths when visible
 *  6. SmoothScroll      — accessible anchor scroll
 *  7. ContactForm       — validation + success state
 */

'use strict';

/* ─────────────────────────────────
   1. CUSTOM CURSOR
   Only initialised on fine-pointer devices
───────────────────────────────── */
class CustomCursor {
  constructor() {
    this.dot  = document.querySelector('.cursor__dot');
    this.ring = document.querySelector('.cursor__ring');
    if (!this.dot || !this.ring) return;

    // Only activate on devices with a mouse
    if (!window.matchMedia('(pointer: fine)').matches) {
      document.querySelector('.cursor')?.remove();
      return;
    }

    this.mouseX = 0; this.mouseY = 0;
    this.ringX = 0;  this.ringY = 0;
    this.isVisible = false;

    this._bindEvents();
    this._animateRing();
  }

  _bindEvents() {
    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;

      if (!this.isVisible) {
        this.dot.style.opacity = '1';
        this.ring.style.opacity = '1';
        this.isVisible = true;
      }

      this.dot.style.left = `${e.clientX}px`;
      this.dot.style.top  = `${e.clientY}px`;
    });

    document.addEventListener('mouseleave', () => {
      this.dot.style.opacity = '0';
      this.ring.style.opacity = '0';
      this.isVisible = false;
    });

    // Hover effect on interactive elements
    const interactives = 'a, button, [role="button"], input, textarea, select, label';
    document.querySelectorAll(interactives).forEach(el => {
      el.addEventListener('mouseenter', () => {
        document.querySelector('.cursor')?.classList.add('cursor--hover');
      });
      el.addEventListener('mouseleave', () => {
        document.querySelector('.cursor')?.classList.remove('cursor--hover');
      });
    });
  }

  _animateRing() {
    // Smooth lag on ring
    const lerp = (a, b, t) => a + (b - a) * t;

    const tick = () => {
      this.ringX = lerp(this.ringX, this.mouseX, 0.12);
      this.ringY = lerp(this.ringY, this.mouseY, 0.12);
      this.ring.style.left = `${this.ringX}px`;
      this.ring.style.top  = `${this.ringY}px`;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
}


/* ─────────────────────────────────
   2. NAVIGATION MANAGER
───────────────────────────────── */
class NavigationManager {
  constructor() {
    this.header    = document.getElementById('header');
    this.hamburger = document.getElementById('navHamburger');
    this.mobileNav = document.getElementById('mobileNav');
    this.navLinks  = document.querySelectorAll('.nav__link');
    this.sections  = document.querySelectorAll('section[id]');

    if (!this.header) return;

    this._initScrollState();
    this._initHamburger();
    this._initActiveLinks();
  }

  _initScrollState() {
    const onScroll = () => {
      this.header.classList.toggle('is-scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // Run once on init
  }

  _initHamburger() {
    if (!this.hamburger || !this.mobileNav) return;

    this.hamburger.addEventListener('click', () => {
      const isOpen = this.hamburger.getAttribute('aria-expanded') === 'true';
      this._setMobileMenu(!isOpen);
    });

    // Close on link click
    this.mobileNav.querySelectorAll('.nav__mobile-link, .nav__mobile-cta').forEach(link => {
      link.addEventListener('click', () => this._setMobileMenu(false));
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!this.header.contains(e.target)) {
        this._setMobileMenu(false);
      }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this._setMobileMenu(false);
    });
  }

  _setMobileMenu(open) {
    this.hamburger.setAttribute('aria-expanded', String(open));
    this.hamburger.classList.toggle('is-open', open);
    if (open) {
      this.mobileNav.removeAttribute('hidden');
    } else {
      this.mobileNav.setAttribute('hidden', '');
    }
  }

  _initActiveLinks() {
    if (!this.sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            this.navLinks.forEach(link => {
              const matches = link.getAttribute('data-section') === id;
              link.classList.toggle('is-active', matches);
              link.setAttribute('aria-current', matches ? 'true' : 'false');
            });
          }
        });
      },
      {
        rootMargin: `-${parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) + 20}px 0px -60% 0px`,
        threshold: 0
      }
    );

    this.sections.forEach(section => observer.observe(section));
  }
}


/* ─────────────────────────────────
   3. READING PROGRESS BAR
───────────────────────────────── */
class ReadingProgress {
  constructor() {
    this.bar = document.getElementById('readingProgress');
    if (!this.bar) return;
    window.addEventListener('scroll', this._update.bind(this), { passive: true });
  }

  _update() {
    const scrollTop    = window.scrollY;
    const docHeight    = document.documentElement.scrollHeight - window.innerHeight;
    const progress     = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    this.bar.style.width = `${Math.min(progress, 100)}%`;
    this.bar.setAttribute('aria-valuenow', Math.round(progress));
  }
}


/* ─────────────────────────────────
   4. SCROLL REVEAL
───────────────────────────────── */
class ScrollReveal {
  constructor() {
    this.elements = document.querySelectorAll('.reveal');
    if (!this.elements.length) return;
    this._initObserver();
  }

  _initObserver() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            // Stagger siblings slightly
            const siblings = [...entry.target.parentElement.querySelectorAll('.reveal:not(.is-visible)')];
            const idx = siblings.indexOf(entry.target);
            entry.target.style.transitionDelay = idx > 0 ? `${idx * 60}ms` : '0ms';

            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    this.elements.forEach(el => observer.observe(el));
  }
}


/* ─────────────────────────────────
   5. SKILL BAR ANIMATION
───────────────────────────────── */
class SkillBars {
  constructor() {
    this.cards = document.querySelectorAll('.skill-card');
    if (!this.cards.length) return;
    this._initObserver();
  }

  _initObserver() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    this.cards.forEach(card => observer.observe(card));
  }
}


/* ─────────────────────────────────
   6. SMOOTH SCROLL
───────────────────────────────── */
class SmoothScroll {
  constructor() {
    this._initLinks();
  }

  _initLinks() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const href   = link.getAttribute('href');
        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();

        const navHeight = parseInt(
          getComputedStyle(document.documentElement).getPropertyValue('--nav-height')
        ) || 68;

        const targetY = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;

        window.scrollTo({ top: targetY, behavior: 'smooth' });

        // Update URL hash without jumping
        history.pushState(null, '', href);

        // Move focus to section for accessibility
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
        target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
      });
    });
  }
}


/* ─────────────────────────────────
   7. CONTACT FORM
───────────────────────────────── */
class ContactForm {
  constructor() {
    this.form    = document.getElementById('contactForm');
    this.success = document.getElementById('formSuccess');
    if (!this.form || !this.success) return;
    this._init();
  }

  _init() {
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!this.form.checkValidity()) {
        this.form.reportValidity();
        return;
      }

      const btn = this.form.querySelector('.contact-form__submit');
      const originalText = btn.innerHTML;

      // Loading state
      btn.disabled = true;
      btn.innerHTML = '<span>Sending...</span>';

      // Simulate async (replace with real fetch to Formspree / EmailJS)
      setTimeout(() => {
        this.success.classList.add('is-visible');
        this.form.reset();
        btn.disabled = false;
        btn.innerHTML = originalText;

        // Hide success after 6s
        setTimeout(() => {
          this.success.classList.remove('is-visible');
        }, 6000);
      }, 900);
    });

    // Live validation feedback
    this.form.querySelectorAll('.contact-form__input').forEach(input => {
      input.addEventListener('blur', () => {
        if (!input.validity.valid && input.value.length > 0) {
          input.style.borderColor = '#ef4444';
        } else {
          input.style.borderColor = '';
        }
      });
      input.addEventListener('focus', () => {
        input.style.borderColor = '';
      });
    });
  }
}


/* ─────────────────────────────────
   8. HERO ENTRANCE ANIMATION
   Stagger hero elements on load
───────────────────────────────── */
class HeroEntrance {
  constructor() {
    // Elements already animated via CSS animation-delay
    // This just ensures they're visible even if CSS animation fails
    document.querySelectorAll('.hero__eyebrow, .hero__name, .hero__tagline, .hero__actions, .hero__meta, .hero__focus')
      .forEach((el, i) => {
        el.style.animationDelay = `${i * 0.1}s`;
      });
  }
}


/* ─────────────────────────────────
   INIT — Boot all modules when DOM is ready
───────────────────────────────── */
function init() {
  new CustomCursor();
  new NavigationManager();
  new ReadingProgress();
  new ScrollReveal();
  new SkillBars();
  new SmoothScroll();
  new ContactForm();
  new HeroEntrance();

  // Log init in dev
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('%c✦ Portfolio v2 initialised', 'color: #00c896; font-weight: bold; font-size: 14px;');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}