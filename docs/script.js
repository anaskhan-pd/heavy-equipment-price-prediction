/**
 * Heavy Equipment Selling Price Prediction Showcase
 * Interactive JavaScript Engine
 * Author: Anas Khan (IIT Madras BS Data Science)
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavSpy();
  initValuationSimulator();
  initLightbox();
  checkLeaderboardImage();
});

/* -------------------------------------------------------------------
   1. Active Navigation Spy & Smooth Scroll
   ------------------------------------------------------------------- */
function initNavSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPosition = window.pageYOffset + 120;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

  // Mobile menu toggle
  const toggleBtn = document.querySelector('.mobile-menu-toggle');
  const navLinksList = document.querySelector('.nav-links');
  if (toggleBtn && navLinksList) {
    toggleBtn.addEventListener('click', () => {
      const isVisible = navLinksList.style.display === 'flex';
      navLinksList.style.display = isVisible ? 'none' : 'flex';
      if (!isVisible) {
        navLinksList.style.flexDirection = 'column';
        navLinksList.style.position = 'absolute';
        navLinksList.style.top = '64px';
        navLinksList.style.left = '0';
        navLinksList.style.right = '0';
        navLinksList.style.background = '#090b10';
        navLinksList.style.padding = '1.5rem';
        navLinksList.style.borderBottom = '1px solid var(--border-medium)';
      }
    });
  }
}

/* -------------------------------------------------------------------
   2. Interactive Equipment Valuation Simulator
   Learned coefficients approximate the ensembled log-linear response:
   log(price) ~ base + b_cat + b_age * log(age+1) + b_hours * log(hours+1) + b_hp * hp + b_ac
   ------------------------------------------------------------------- */
function initValuationSimulator() {
  const ageInput = document.getElementById('sim-age');
  const ageVal = document.getElementById('val-age');
  const hoursInput = document.getElementById('sim-hours');
  const hoursVal = document.getElementById('val-hours');
  const catInput = document.getElementById('sim-category');
  const acInput = document.getElementById('sim-ac');
  const hpInput = document.getElementById('sim-hp');
  const hpVal = document.getElementById('val-hp');

  const priceOutput = document.getElementById('out-price');
  const rangeOutput = document.getElementById('out-range');

  if (!ageInput || !priceOutput) return;

  function updatePrediction() {
    const age = parseFloat(ageInput.value);
    const hours = parseFloat(hoursInput.value);
    const catBase = parseFloat(catInput.value);
    const hasAc = acInput.checked ? 0.22 : 0.0;
    const hp = parseFloat(hpInput.value);

    // Update labels
    if (ageVal) ageVal.textContent = `${age} Years`;
    if (hoursVal) hoursVal.textContent = `${hours.toLocaleString()} Hrs`;
    if (hpVal) hpVal.textContent = `${hp} HP`;

    // Mathematical model derived from feature weights:
    // Base log price ~ 10.45
    // Age depreciation decay: -0.58 * log1p(age)
    // Operational hours wear: -0.14 * log1p(hours / 1000)
    // Equipment power scaling: +0.0035 * (hp - 100)
    // Cabin premium (EROPS w/ AC): +0.22
    // Category fixed baseline adjustment: catBase
    const logBase = 10.50 + catBase;
    const ageEffect = -0.52 * Math.log1p(age);
    const hoursEffect = -0.15 * Math.log1p(hours / 1500);
    const powerEffect = 0.0032 * (hp - 120);
    const cabinEffect = hasAc;

    const predLog = logBase + ageEffect + hoursEffect + powerEffect + cabinEffect;
    const estimatedPrice = Math.max(8500, Math.round(Math.exp(predLog)));

    // Confidence interval (+/- 14% based on 0.18335 RMSLE)
    const lowBound = Math.round(estimatedPrice * 0.85);
    const highBound = Math.round(estimatedPrice * 1.15);

    priceOutput.textContent = `$${estimatedPrice.toLocaleString()}`;
    if (rangeOutput) {
      rangeOutput.textContent = `Estimated Range (±1σ RMSLE): $${lowBound.toLocaleString()} – $${highBound.toLocaleString()}`;
    }
  }

  [ageInput, hoursInput, catInput, acInput, hpInput].forEach(input => {
    if (input) {
      input.addEventListener('input', updatePrediction);
      input.addEventListener('change', updatePrediction);
    }
  });

  updatePrediction();
}

/* -------------------------------------------------------------------
   3. Lightbox Inspection for Leaderboard
   ------------------------------------------------------------------- */
function initLightbox() {
  const trigger = document.getElementById('leaderboard-trigger');
  const modal = document.getElementById('lightbox-modal');
  const closeBtn = document.getElementById('lightbox-close');
  const modalImg = document.getElementById('lightbox-img');
  const sourceImg = document.getElementById('leaderboard-preview-img');

  if (!trigger || !modal) return;

  function openModal() {
    if (modalImg && sourceImg) {
      modalImg.src = sourceImg.src;
      modalImg.alt = sourceImg.alt;
    }
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  trigger.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
}

/* -------------------------------------------------------------------
   4. Leaderboard Image Detection
   Supports leaderboard_card.jpg, leaderboard_card.png, and svg fallback
   ------------------------------------------------------------------- */
function checkLeaderboardImage() {
  const previewImg = document.getElementById('leaderboard-preview-img');
  if (!previewImg) return;

  const testJpg = new Image();
  testJpg.src = 'assets/leaderboard_card.jpg';
  testJpg.onload = () => {
    previewImg.src = 'assets/leaderboard_card.jpg';
  };
  testJpg.onerror = () => {
    const testPng = new Image();
    testPng.src = 'assets/leaderboard_card.png';
    testPng.onload = () => {
      previewImg.src = 'assets/leaderboard_card.png';
    };
  };
}
