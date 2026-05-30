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

  // ----------------------------------------------------------
  // Reviews — load from localStorage + handle form submit
  // ----------------------------------------------------------
  const reviewsList = document.getElementById('reviewsList');
  const reviewForm = document.getElementById('reviewForm');

  function getStoredReviews() {
    try { return JSON.parse(localStorage.getItem('islamar_reviews') || '[]'); }
    catch { return []; }
  }

  function saveReviews(reviews) {
    localStorage.setItem('islamar_reviews', JSON.stringify(reviews));
  }

  function renderStoredReviews() {
    if (!reviewsList) return;
    const reviews = getStoredReviews();
    reviews.forEach(r => {
      const stars = '★'.repeat(parseInt(r.rating)) + '☆'.repeat(5 - parseInt(r.rating));
      const initials = r.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
      const card = document.createElement('div');
      card.className = 'review-card';
      card.innerHTML = `
        <div class="review-stars">${stars}</div>
        <p class="review-text">"${r.text}"</p>
        <div class="review-author">
          <div class="review-avatar">${initials}</div>
          <div class="review-meta">
            <span class="review-name">${r.name}</span>
            <span class="review-source">Guest · ${r.date || '2025'}</span>
          </div>
        </div>`;
      reviewsList.appendChild(card);
    });
  }

  renderStoredReviews();

  if (reviewForm) {
    reviewForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('reviewName').value.trim();
      const rating = document.getElementById('reviewRating').value;
      const text = document.getElementById('reviewText').value.trim();
      if (!name || !rating || !text) return;

      const reviews = getStoredReviews();
      reviews.push({ name, rating, text, date: new Date().getFullYear().toString() });
      saveReviews(reviews);

      reviewForm.hidden = true;
      document.getElementById('reviewSuccess').hidden = false;

      // Render the new review immediately
      const stars = '★'.repeat(parseInt(rating)) + '☆'.repeat(5 - parseInt(rating));
      const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
      const card = document.createElement('div');
      card.className = 'review-card';
      card.innerHTML = `
        <div class="review-stars">${stars}</div>
        <p class="review-text">"${text}"</p>
        <div class="review-author">
          <div class="review-avatar">${initials}</div>
          <div class="review-meta">
            <span class="review-name">${name}</span>
            <span class="review-source">Guest · ${new Date().getFullYear()}</span>
          </div>
        </div>`;
      if (reviewsList) reviewsList.appendChild(card);
    });
  }

});
