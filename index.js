/**
 * AETHER PORTFOLIO - DYNAMIC LOGIC & INTERACTIONS
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initMobileMenu();
  initScrollReveal();
  initCardTilt();
  initFormValidation();
  initScrollProgress();
});

/**
 * 1a. Dark / Light Theme Toggle
 */
function initThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle');
  const moonIcon = document.getElementById('theme-icon-moon');
  const sunIcon = document.getElementById('theme-icon-sun');
  if (!toggleBtn) return;

  const applyTheme = (theme) => {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
      moonIcon.style.display = 'none';
      sunIcon.style.display = 'block';
      toggleBtn.classList.add('active');
    } else {
      document.documentElement.removeAttribute('data-theme');
      moonIcon.style.display = 'block';
      sunIcon.style.display = 'none';
      toggleBtn.classList.remove('active');
    }
  };

  const saved = localStorage.getItem('portfolio-theme');
  const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  applyTheme(saved || (prefersLight ? 'light' : 'dark'));

  toggleBtn.addEventListener('click', () => {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const next = isLight ? 'dark' : 'light';
    applyTheme(next);
    localStorage.setItem('portfolio-theme', next);
  });
}

/**
 * 1b. Scroll Progress Bar
 */
function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = pct + '%';
  }, { passive: true });
}

/**
 * 2. Mobile Menu Toggle
 */
function initMobileMenu() {
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  navToggle.addEventListener('click', () => {
    const isOpen = navToggle.classList.toggle('open');
    navMenu.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen);
  });

  // Close menu when clicking on a nav link
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('open');
      navMenu.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/**
 * 3. Scroll Reveal Animation using IntersectionObserver
 */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal');
  
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // Once revealed, we don't need to observe it anymore
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => {
    observer.observe(el);
  });
}

/**
 * 4. Premium Mouse Hover Tilt Effect for Hero Card
 */
function initCardTilt() {
  const card = document.querySelector('.hero-visual-card');
  const wrapper = document.querySelector('.hero-visual');
  
  if (!card || !wrapper) return;

  wrapper.addEventListener('mousemove', (e) => {
    const rect = wrapper.getBoundingClientRect();
    const x = e.clientX - rect.left; // Mouse position X within wrapper
    const y = e.clientY - rect.top;  // Mouse position Y within wrapper
    
    // Normalize coordinates (from -0.5 to 0.5)
    const normalizedX = (x / rect.width) - 0.5;
    const normalizedY = (y / rect.height) - 0.5;
    
    // Set max tilt angle (degrees)
    const maxTilt = 15;
    const tiltX = (normalizedY * maxTilt).toFixed(2);
    const tiltY = -(normalizedX * maxTilt).toFixed(2);
    
    // Apply transform and slight shift
    card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;
  });

  wrapper.addEventListener('mouseleave', () => {
    // Reset back smoothly
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    card.style.transition = 'transform 0.5s ease-out';
  });
  
  wrapper.addEventListener('mouseenter', () => {
    // Remove transition when mouse is moving so tilting is responsive
    card.style.transition = 'none';
  });
}

/**
 * 5. Interactive Form Validation and Submission
 */
function initFormValidation() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const inputs = form.querySelectorAll('.form-input');

  // Validate on blur/input
  inputs.forEach(input => {
    input.addEventListener('blur', () => validateInput(input));
    input.addEventListener('input', () => {
      // If error is currently displayed, validate in real time
      const errorSpan = document.getElementById(`${input.id}-error`);
      if (errorSpan && errorSpan.style.display === 'block') {
        validateInput(input);
      }
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let isFormValid = true;
    inputs.forEach(input => {
      if (!validateInput(input)) {
        isFormValid = false;
      }
    });

    if (!isFormValid) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerText;
    submitBtn.disabled = true;
    submitBtn.innerText = 'Invio in corso...';

    fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' }
    })
      .then(response => {
        if (response.ok) {
          showToast('Messaggio inviato con successo! Ti risponderò al più presto.');
          form.reset();
          inputs.forEach(input => {
            input.classList.remove('valid');
            const errorSpan = document.getElementById(`${input.id}-error`);
            if (errorSpan) errorSpan.style.display = 'none';
          });
        } else {
          showToast('Errore nell\'invio. Riprova o scrivimi direttamente via email.');
        }
      })
      .catch(() => {
        showToast('Errore di connessione. Riprova o scrivimi direttamente via email.');
      })
      .finally(() => {
        submitBtn.disabled = false;
        submitBtn.innerText = originalBtnText;
      });
  });
}

function validateInput(input) {
  const errorSpan = document.getElementById(`${input.id}-error`);
  let isValid = true;

  if (input.type === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    isValid = emailRegex.test(input.value.trim());
  } else if (input.id === 'subject') {
    isValid = input.value.trim().length >= 3;
  } else if (input.id === 'message') {
    isValid = input.value.trim().length >= 10;
  }

  if (!isValid) {
    if (errorSpan) errorSpan.style.display = 'block';
    input.style.borderColor = 'hsl(0, 85%, 60%)';
    return false;
  } else {
    if (errorSpan) errorSpan.style.display = 'none';
    input.style.borderColor = 'var(--glass-border)';
    return true;
  }
}

/**
 * Helper: Floating Toast Notification
 */
function showToast(message) {
  // Check if a toast already exists
  const existingToast = document.querySelector('.toast-notification');
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.innerText = message;
  
  // Style toast dynamically
  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '30px',
    right: '30px',
    backgroundColor: 'var(--glass-bg)',
    backdropFilter: 'blur(10px)',
    webkitBackdropFilter: 'blur(10px)',
    border: '1px solid var(--accent-primary)',
    color: 'var(--text-primary)',
    padding: '16px 28px',
    borderRadius: '12px',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.35)',
    zIndex: '1000',
    fontFamily: 'var(--font-heading)',
    fontWeight: '600',
    opacity: '0',
    transform: 'translateY(20px)',
    transition: 'opacity 0.4s ease, transform 0.4s ease'
  });

  document.body.appendChild(toast);

  // Trigger animation
  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  }, 50);

  // Auto-remove after 4 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}
