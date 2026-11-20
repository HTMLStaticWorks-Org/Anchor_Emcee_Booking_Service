/**
 * Anchor & Emcee Booking Service — Main Interactive Controller
 * Pure Vanilla JavaScript (ES6+)
 */
document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ==========================================================================
     1. STICKY HEADER & BACK TO TOP ON SCROLL
     ========================================================================== */
  const siteHeader = document.querySelector('.site-header');
  const backToTopBtn = document.querySelector('.back-to-top-btn');

  const handleScroll = () => {
    const scrollY = window.scrollY;
    if (siteHeader) {
      siteHeader.classList.toggle('scrolled', scrollY > 30);
    }
    if (backToTopBtn) {
      backToTopBtn.classList.toggle('show', scrollY > 450);
    }
  };

  handleScroll();
  window.addEventListener('scroll', handleScroll, { passive: true });

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });
    });
  }

  /* ==========================================================================
     2. MOBILE HAMBURGER MENU & DRAWER
     ========================================================================== */
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const menuClose = document.querySelector('.mobile-drawer-close');
  const menuDrawer = document.querySelector('.mobile-nav-drawer');
  const menuOverlay = document.querySelector('.mobile-nav-overlay');

  const openMobileMenu = () => {
    if (!menuDrawer || !menuOverlay) return;
    menuDrawer.classList.add('active');
    menuOverlay.classList.add('active');
    menuDrawer.setAttribute('aria-hidden', 'false');
    if (menuToggle) menuToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  const closeMobileMenu = () => {
    if (!menuDrawer || !menuOverlay) return;
    menuDrawer.classList.remove('active');
    menuOverlay.classList.remove('active');
    menuDrawer.setAttribute('aria-hidden', 'true');
    if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  if (menuToggle) menuToggle.addEventListener('click', openMobileMenu);
  if (menuClose) menuClose.addEventListener('click', closeMobileMenu);
  if (menuOverlay) menuOverlay.addEventListener('click', closeMobileMenu);

  document.querySelectorAll('.mobile-nav-list a').forEach((link) => {
    link.addEventListener('click', closeMobileMenu);
  });

  /* ==========================================================================
     3. SCROLL REVEAL ANIMATIONS
     ========================================================================== */
  const revealElements = document.querySelectorAll('[data-reveal]');

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealElements.forEach((el) => el.classList.add('revealed'));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const delay = entry.target.getAttribute('data-reveal-delay') || 0;
            setTimeout(() => {
              entry.target.classList.add('revealed');
            }, Number(delay));
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  }

  /* ==========================================================================
     4. ANIMATED METRIC COUNTERS
     ========================================================================== */
  const counterElements = document.querySelectorAll('[data-counter]');

  const animateCounter = (el) => {
    const targetText = el.getAttribute('data-counter') || el.textContent.trim();
    const match = targetText.match(/^(\D*)([\d,]+)(.*)$/);
    if (!match) return;

    const [, prefix, numberStr, suffix] = match;
    const targetValue = parseInt(numberStr.replace(/,/g, ''), 10);
    if (isNaN(targetValue)) return;

    const hasComma = numberStr.includes(',');
    const duration = 1500;
    let startTime = null;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.floor(targetValue * eased);
      const formatted = hasComma ? currentVal.toLocaleString('en-US') : String(currentVal);
      el.textContent = `${prefix}${formatted}${suffix}`;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = targetText;
      }
    };

    requestAnimationFrame(step);
  };

  if (counterElements.length > 0 && !prefersReducedMotion && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.35 }
    );
    counterElements.forEach((el) => counterObserver.observe(el));
  }

  /* ==========================================================================
     5. CATEGORY FILTERING (GALLERY & HOSTS DIRECTORY)
     ========================================================================== */
  const filterGroups = document.querySelectorAll('[data-filter-group]');

  filterGroups.forEach((group) => {
    const targetSelector = group.getAttribute('data-filter-target');
    const filterButtons = group.querySelectorAll('[data-filter]');
    const filterItems = document.querySelectorAll(targetSelector);

    filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const filterVal = btn.getAttribute('data-filter');

        filterButtons.forEach((b) => {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');

        filterItems.forEach((item) => {
          const itemCategory = item.getAttribute('data-category') || '';
          const categories = itemCategory.split(' ');
          if (filterVal === 'all' || categories.includes(filterVal)) {
            item.classList.remove('hidden-item');
            item.style.display = '';
          } else {
            item.classList.add('hidden-item');
            item.style.display = 'none';
          }
        });
      });
    });
  });

  /* ==========================================================================
     6. GALLERY LIGHTBOX INTERACTION
     ========================================================================== */
  const lightboxModal = document.getElementById('galleryLightbox');
  const galleryCards = Array.from(document.querySelectorAll('.gallery-item'));

  if (lightboxModal && galleryCards.length > 0) {
    const lightboxImg = document.getElementById('lightboxImage');
    const lightboxTitle = document.getElementById('lightboxTitle');
    const lightboxDesc = document.getElementById('lightboxDesc');
    const lightboxCategory = document.getElementById('lightboxCategory');
    const closeBtn = lightboxModal.querySelector('.lightbox-close');
    const prevBtn = lightboxModal.querySelector('.lightbox-nav.prev');
    const nextBtn = lightboxModal.querySelector('.lightbox-nav.next');

    let currentIndex = 0;

    const getVisibleCards = () => galleryCards.filter((card) => !card.classList.contains('hidden-item'));

    const updateLightbox = (card) => {
      if (!card) return;
      const imgEl = card.querySelector('img');
      const titleEl = card.querySelector('h3');
      const descEl = card.querySelector('p');
      const tagEl = card.querySelector('.gallery-tag');

      if (lightboxImg && imgEl) {
        lightboxImg.src = imgEl.src;
        lightboxImg.alt = imgEl.alt || 'Event Host Gallery Photograph';
      }
      if (lightboxTitle && titleEl) lightboxTitle.textContent = titleEl.textContent;
      if (lightboxDesc && descEl) lightboxDesc.textContent = descEl.textContent;
      if (lightboxCategory && tagEl) lightboxCategory.textContent = tagEl.textContent;
    };

    const openLightbox = (card) => {
      const visibleCards = getVisibleCards();
      currentIndex = visibleCards.indexOf(card);
      if (currentIndex === -1) currentIndex = 0;
      updateLightbox(visibleCards[currentIndex]);
      lightboxModal.classList.add('active');
      lightboxModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
      lightboxModal.classList.remove('active');
      lightboxModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    const navigateLightbox = (direction) => {
      const visibleCards = getVisibleCards();
      if (!visibleCards.length) return;
      currentIndex = (currentIndex + direction + visibleCards.length) % visibleCards.length;
      updateLightbox(visibleCards[currentIndex]);
    };

    galleryCards.forEach((card) => {
      card.addEventListener('click', () => openLightbox(card));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(card);
        }
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); navigateLightbox(-1); });
    if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); navigateLightbox(1); });

    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (!lightboxModal.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigateLightbox(-1);
      if (e.key === 'ArrowRight') navigateLightbox(1);
    });
  }

  /* ==========================================================================
     7. HOST PROFILE QUICK-VIEW MODAL (HOSTS PAGE)
     ========================================================================== */
  const hostModal = document.getElementById('hostProfileModal');
  const hostViewBtns = document.querySelectorAll('[data-host-modal]');

  if (hostModal && hostViewBtns.length > 0) {
    const mImg = document.getElementById('modalHostImg');
    const mName = document.getElementById('modalHostName');
    const mRole = document.getElementById('modalHostRole');
    const mExp = document.getElementById('modalHostExp');
    const mLang = document.getElementById('modalHostLang');
    const mBio = document.getElementById('modalHostBio');
    const mEvents = document.getElementById('modalHostEvents');
    const mBookBtn = document.getElementById('modalHostBookLink');
    const mClose = hostModal.querySelector('.host-modal-close');

    const closeHostModal = () => {
      hostModal.classList.remove('active');
      hostModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    hostViewBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const name = btn.getAttribute('data-name') || '';
        const role = btn.getAttribute('data-role') || '';
        const exp = btn.getAttribute('data-exp') || '';
        const lang = btn.getAttribute('data-lang') || '';
        const bio = btn.getAttribute('data-bio') || '';
        const img = btn.getAttribute('data-img') || '';
        const events = btn.getAttribute('data-events') || '450+ Live Stages Hosted';

        if (mImg) { mImg.src = img; mImg.alt = name; }
        if (mName) mName.textContent = name;
        if (mRole) mRole.textContent = role;
        if (mExp) mExp.textContent = exp;
        if (mLang) mLang.textContent = lang;
        if (mBio) mBio.textContent = bio;
        if (mEvents) mEvents.textContent = events;
        if (mBookBtn) {
          mBookBtn.href = `contact.html?host=${encodeURIComponent(name)}`;
        }

        hostModal.classList.add('active');
        hostModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      });
    });

    if (mClose) mClose.addEventListener('click', closeHostModal);
    hostModal.addEventListener('click', (e) => {
      if (e.target === hostModal) closeHostModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && hostModal.classList.contains('active')) {
        closeHostModal();
      }
    });
  }

  /* ==========================================================================
     8. BOOKING ENQUIRY FORM PREFILL & VALIDATION (CONTACT PAGE)
     ========================================================================== */
  const urlParams = new URLSearchParams(window.location.search);
  const requestedHost = urlParams.get('host');
  const requestedService = urlParams.get('service');

  const requirementsField = document.getElementById('additionalRequirements');
  const eventTypeSelect = document.getElementById('eventType');

  if (requestedHost && requirementsField) {
    requirementsField.value = `Preferred Host Enquiry: ${requestedHost}. `;
  }
  if (requestedService && eventTypeSelect) {
    Array.from(eventTypeSelect.options).forEach((opt) => {
      if (opt.value.toLowerCase().includes(requestedService.toLowerCase())) {
        opt.selected = true;
      }
    });
  }

  // Set minimum selectable date on Event Date input to today
  const eventDateInput = document.getElementById('eventDate');
  if (eventDateInput) {
    const today = new Date().toISOString().split('T')[0];
    eventDateInput.setAttribute('min', today);
  }

  const bookingForm = document.getElementById('bookingEnquiryForm');
  const successBanner = document.getElementById('bookingSuccessBanner');

  if (bookingForm) {
    const validateField = (field) => {
      const wrapper = field.closest('.form-field-wrap');
      const value = field.value.trim();
      let valid = true;

      if (field.hasAttribute('required') && !value) {
        valid = false;
      } else if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        valid = emailRegex.test(value);
      } else if (field.type === 'tel' && value) {
        const phoneRegex = /^[+\d][\d\s\-()]{6,18}$/;
        valid = phoneRegex.test(value);
      }

      field.classList.toggle('is-invalid', !valid);
      field.classList.toggle('is-valid', valid && value !== '');
      if (wrapper) wrapper.classList.toggle('has-error', !valid);

      return valid;
    };

    const formInputs = bookingForm.querySelectorAll('input, select, textarea');
    formInputs.forEach((input) => {
      input.addEventListener('blur', () => validateField(input));
      input.addEventListener('input', () => {
        if (input.classList.contains('is-invalid')) {
          validateField(input);
        }
      });
    });

    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let isFormValid = true;
      let firstInvalidField = null;

      formInputs.forEach((input) => {
        const valid = validateField(input);
        if (!valid) {
          isFormValid = false;
          if (!firstInvalidField) firstInvalidField = input;
        }
      });

      if (!isFormValid) {
        if (firstInvalidField) firstInvalidField.focus();
        return;
      }

      const fullName = document.getElementById('fullName')?.value.trim() || 'Valued Client';
      const eventType = document.getElementById('eventType')?.value || 'Upcoming Event';
      const eventDate = document.getElementById('eventDate')?.value || 'Scheduled Date';
      const successNameSpan = document.getElementById('bookingConfirmName');
      const successDetailsSpan = document.getElementById('bookingConfirmDetails');

      if (successNameSpan) successNameSpan.textContent = fullName;
      if (successDetailsSpan) successDetailsSpan.textContent = `${eventType} (${eventDate})`;

      if (successBanner) {
        successBanner.classList.add('show');
        successBanner.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'center' });
      }

      bookingForm.reset();
      formInputs.forEach((input) => {
        input.classList.remove('is-valid', 'is-invalid');
        const wrapper = input.closest('.form-field-wrap');
        if (wrapper) wrapper.classList.remove('has-error');
      });
    });
  }
});


/* ==========================================================================
   9. THEME TOGGLE (LIGHT / DARK) & RTL TOGGLE (LTR / RTL)
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const htmlEl = document.documentElement;
  const themeButtons = document.querySelectorAll('.theme-toggle-btn');
  const rtlButtons = document.querySelectorAll('.rtl-toggle-btn');

  // Initialize Theme
  const savedTheme = localStorage.getItem('anchor_theme') || 'light';
  const applyTheme = (theme) => {
    htmlEl.setAttribute('data-theme', theme);
    localStorage.setItem('anchor_theme', theme);
    const isDark = theme === 'dark';
    themeButtons.forEach((btn) => {
      btn.setAttribute('aria-pressed', String(isDark));
      btn.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
      btn.setAttribute('title', isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode');
      const icon = btn.querySelector('i');
      const label = btn.querySelector('.theme-btn-text');
      if (icon) {
        icon.className = isDark ? 'bi bi-sun-fill' : 'bi bi-moon-stars-fill';
      }
      if (label) {
        label.textContent = isDark ? 'Light' : 'Dark';
      }
    });
  };

  applyTheme(savedTheme);

  themeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const current = htmlEl.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
  });

  // Initialize Direction (LTR / RTL)
  const savedDir = localStorage.getItem('anchor_dir') || 'ltr';
  const applyDirection = (dir) => {
    htmlEl.setAttribute('dir', dir);
    localStorage.setItem('anchor_dir', dir);
    const isRtl = dir === 'rtl';
    rtlButtons.forEach((btn) => {
      btn.setAttribute('aria-pressed', String(isRtl));
      btn.setAttribute('aria-label', isRtl ? 'Switch to Left-to-Right (LTR)' : 'Switch to Right-to-Left (RTL)');
      btn.setAttribute('title', isRtl ? 'Switch to LTR' : 'Switch to RTL');
      const label = btn.querySelector('.rtl-btn-text');
      if (label) {
        label.textContent = isRtl ? 'LTR' : 'RTL';
      }
    });
  };

  applyDirection(savedDir);

  rtlButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const current = htmlEl.getAttribute('dir') === 'rtl' ? 'rtl' : 'ltr';
      applyDirection(current === 'rtl' ? 'ltr' : 'rtl');
    });
  });
});
