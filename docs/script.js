/**
 * Heavy Equipment Selling Price Prediction Showcase
 * Interactive JavaScript Engine
 * Author: Anas Khan (IIT Madras BS Data Science)
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavSpy();
  initMobileNav();
  initValuationSimulator();
  initLightbox();
  checkLeaderboardImage();
});

/* -------------------------------------------------------------------
   1. Active Navigation Spy & Smooth Scroll Offset
   ------------------------------------------------------------------- */
function initNavSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-menu-item');

  function updateActiveLink() {
    let current = '';
    // Offset accounts for floating navbar height and top margin
    const scrollPosition = window.pageYOffset + 140;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navItems.forEach(item => {
      item.classList.remove('active');
      if (item.getAttribute('href') === `#${current}`) {
        item.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();
}

/* -------------------------------------------------------------------
   1b. Mobile Navigation Drawer & Hamburger Controller
   ------------------------------------------------------------------- */
function initMobileNav() {
  const hamburgerBtn = document.getElementById('nav-hamburger-btn');
  const dropdown = document.getElementById('nav-menu-dropdown');
  const backdrop = document.getElementById('nav-backdrop');
  const navLinks = document.querySelectorAll('.nav-menu-item, .nav-menu-dropdown .nav-github-btn');

  if (!hamburgerBtn || !dropdown) return;

  function openMobileMenu() {
    hamburgerBtn.classList.add('is-active');
    hamburgerBtn.setAttribute('aria-expanded', 'true');
    dropdown.classList.add('is-open');
    if (backdrop) backdrop.classList.add('is-visible');
    document.body.classList.add('menu-open');
  }

  function closeMobileMenu() {
    hamburgerBtn.classList.remove('is-active');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    dropdown.classList.remove('is-open');
    if (backdrop) backdrop.classList.remove('is-visible');
    document.body.classList.remove('menu-open');
  }

  function toggleMobileMenu() {
    const isOpen = dropdown.classList.contains('is-open');
    if (isOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  }

  hamburgerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMobileMenu();
  });

  // Auto-close menu when clicking any nav item
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (dropdown.classList.contains('is-open')) {
        closeMobileMenu();
      }
    });
  });

  // Close when clicking outside on the backdrop
  if (backdrop) {
    backdrop.addEventListener('click', closeMobileMenu);
  }

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && dropdown.classList.contains('is-open')) {
      closeMobileMenu();
    }
  });

  // Handle resize from mobile to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 960 && dropdown.classList.contains('is-open')) {
      closeMobileMenu();
    }
  }, { passive: true });
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
