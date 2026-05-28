// =============================================================
//  VILLA ISLAMAR — main.js
//  Handles: top nav scroll effect, mobile toggle, AOS, GLightbox
// =============================================================

document.addEventListener('DOMContentLoaded', () => {

  // ----------------------------------------------------------
  // Top Navigation — scroll effect (transparent → solid)
  // ----------------------------------------------------------
  const topnav = document.getElementById('topnav');

  function handleScroll() {
    if (!topnav) return;
    if (window.scrollY > 60) {
      topnav.classList.add('topnav--scrolled');
    } else {
      // Only remove on pages with hero (index.html)
      if (document.querySelector('.hero')) {
        topnav.classList.remove('topnav--scrolled');
      }
    }
  }

  // If there's no hero section, keep nav scrolled (solid) always
  if (!document.querySelector('.hero')) {
    if (topnav) topnav.classList.add('topnav--scrolled');
  } else {
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  // ----------------------------------------------------------
  // Mobile nav toggle
  // ----------------------------------------------------------
  const navToggle = document.getElementById('navToggle');
  const navLinks  = document.getElementById('navLinks');
  const navOverlay = document.getElementById('navOverlay');

  function openNav() {
    navToggle.classList.add('open');
    navLinks.classList.add('open');
    if (navOverlay) navOverlay.classList.add('open');
  }

  function closeNav() {
    navToggle.classList.remove('open');
    navLinks.classList.remove('open');
    if (navOverlay) navOverlay.classList.remove('open');
  }

  if (navToggle) {
    navToggle.addEventListener('click', () => {
      if (navLinks.classList.contains('open')) {
        closeNav();
      } else {
        openNav();
      }
    });
  }

  if (navOverlay) {
    navOverlay.addEventListener('click', closeNav);
  }

  // Close nav when a link is clicked (mobile)
  if (navLinks) {
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeNav);
    });
  }

  // ----------------------------------------------------------
  // AOS — Animate on Scroll
  // ----------------------------------------------------------
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 680,
      easing:   'ease-out-quad',
      once:     true,
      offset:   60,
    });
  }

  // ----------------------------------------------------------
  // GLightbox — photo gallery lightbox (only on pages with gallery)
  // ----------------------------------------------------------
  if (typeof GLightbox !== 'undefined' && document.querySelector('.glightbox')) {
    GLightbox({
      selector:         '.glightbox',
      touchNavigation:  true,
      loop:             true,
      autoplayVideos:   false,
      svg: {
        close: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
      },
    });
  }

  // ----------------------------------------------------------
  // Scroll-triggered section entrance animations
  // ----------------------------------------------------------
  const sections = document.querySelectorAll('.section');
  if (sections.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    sections.forEach(s => observer.observe(s));
  } else {
    // Fallback: show all immediately
    sections.forEach(s => s.classList.add('in-view'));
  }

});
