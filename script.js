/* =========================================================
   LENAR EVANGELISTA · interactions
   - Reveal on scroll (Intersection Observer)
   - Stat counter animation
   - Active section in nav
   ========================================================= */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Reveal on scroll ---------- */
  const animTargets = document.querySelectorAll('[data-anim]');

  if (prefersReducedMotion) {
    animTargets.forEach(el => el.classList.add('is-visible'));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            // small stagger for elements that appear together
            const idx = Array.from(entry.target.parentElement?.children || []).indexOf(entry.target);
            const delay = Math.min(Math.max(idx, 0), 8) * 80;
            setTimeout(() => entry.target.classList.add('is-visible'), delay);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    animTargets.forEach(el => io.observe(el));
  }

  /* ---------- Stat counter ---------- */
  const counters = document.querySelectorAll('.stat__num[data-count]');

  const animateCount = (el) => {
    const target = parseInt(el.dataset.count, 10);
    if (isNaN(target)) return;
    if (prefersReducedMotion) { el.textContent = target; return; }

    const duration = 1600;
    const start = performance.now();
    const pad = el.textContent.length; // preserve "00" / "0" formatting visually

    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      const value = Math.round(target * eased);
      el.textContent = String(value).padStart(pad, '0');
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = String(target).padStart(pad, '0');
    };
    requestAnimationFrame(tick);
  };

  const counterIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          counterIO.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  counters.forEach(el => counterIO.observe(el));

  /* ---------- Active link in nav ---------- */
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav__links a');

  const setActive = (id) => {
    navLinks.forEach(link => {
      const isActive = link.getAttribute('href') === `#${id}`;
      link.style.color = isActive ? 'var(--forest)' : '';
      link.style.fontWeight = isActive ? '600' : '';
    });
  };

  const activeIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    },
    { rootMargin: '-30% 0px -60% 0px' }
  );
  sections.forEach(s => activeIO.observe(s));

  /* ---------- Subtle parallax on work figures ---------- */
  if (!prefersReducedMotion) {
    const figs = document.querySelectorAll('.work__fig img');
    let ticking = false;

    const updateParallax = () => {
      figs.forEach(img => {
        const rect = img.getBoundingClientRect();
        const vh = window.innerHeight;
        if (rect.bottom < 0 || rect.top > vh) return;
        // Map element position to a small Y shift (-8px to 8px)
        const progress = (rect.top + rect.height / 2) / vh; // 0 -> 1
        const shift = (0.5 - progress) * 16;
        img.style.transform = `scale(1.06) translateY(${shift}px)`;
      });
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });
    updateParallax();
  }

})();
