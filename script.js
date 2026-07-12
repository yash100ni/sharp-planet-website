/* ==========================================================================
   SHARP PLANET — SCRIPT
   Smooth scroll, scroll reveals, hero constellation, counters,
   magnetic buttons, ecosystem modals, navbar behaviour.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {

  /* Lucide icons */
  if (window.lucide) lucide.createIcons();
  else window.addEventListener("load", () => window.lucide && lucide.createIcons());

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------
     1. LENIS SMOOTH SCROLL
  ------------------------------------------------------------ */
  let lenis;
  if (window.Lenis && !prefersReducedMotion) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    if (window.gsap && window.ScrollTrigger) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    }
  }

  /* Anchor links -> lenis scrollTo */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (id.length > 1) {
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          if (lenis) lenis.scrollTo(target, { offset: -20 });
          else target.scrollIntoView({ behavior: "smooth" });
          closeMobileMenu();
        }
      }
    });
  });

  /* ------------------------------------------------------------
     2. NAVBAR — scrolled state + mobile burger
  ------------------------------------------------------------ */
  const navbar = document.getElementById("navbar");
  const burger = document.getElementById("navBurger");
  const navMobile = document.getElementById("navMobile");

  const onScroll = () => {
    if (window.scrollY > 40) navbar.classList.add("is-scrolled");
    else navbar.classList.remove("is-scrolled");
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  function closeMobileMenu() {
    navMobile.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
  }
  burger.addEventListener("click", () => {
    const isOpen = navMobile.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", String(isOpen));
  });

  /* ------------------------------------------------------------
     3. SCROLL REVEALS (GSAP ScrollTrigger, fallback IntersectionObserver)
  ------------------------------------------------------------ */
  const revealEls = document.querySelectorAll(".reveal-up");

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    revealEls.forEach((el, i) => {
      ScrollTrigger.create({
        trigger: el,
        start: "top 88%",
        once: true,
        onEnter: () => {
          gsap.to(el, {
            opacity: 1, y: 0, duration: 0.9,
            delay: (i % 4) * 0.06,
            ease: "power3.out",
          });
          el.classList.add("is-visible");
        },
      });
    });

    /* Hero headline line reveal */
    gsap.to(".reveal-line__inner", {
      y: "0%", duration: 1.1, ease: "power4.out", stagger: 0.1, delay: 0.2,
    });
  } else {
    // Fallback
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach((el) => io.observe(el));
    document.querySelectorAll(".reveal-line__inner").forEach((el) => (el.style.transform = "translateY(0)"));
  }

  /* ------------------------------------------------------------
     4. ANIMATED COUNTERS
  ------------------------------------------------------------ */
  function formatNumber(num, format) {
    if (format === "compact") {
      if (num >= 1000) return Math.round(num / 1000) + "K";
    }
    return num.toLocaleString("en-US");
  }

  const counters = document.querySelectorAll(".stat__num");
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || "";
      const format = el.dataset.format || "default";
      const duration = 1800;
      const start = performance.now();

      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.floor(eased * target);
        el.textContent = formatNumber(value, format) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = formatNumber(target, format) + suffix;
      }
      requestAnimationFrame(tick);
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.6 });
  counters.forEach((el) => counterObserver.observe(el));

  /* ------------------------------------------------------------
     5. MAGNETIC BUTTONS
  ------------------------------------------------------------ */
  if (!prefersReducedMotion && window.matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll(".magnetic").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "translate(0,0)";
      });
    });
  }

  /* ------------------------------------------------------------
     6. ECOSYSTEM MODALS
  ------------------------------------------------------------ */
  const overlay = document.getElementById("modalOverlay");
  const openers = document.querySelectorAll("[data-modal]");
  const closers = document.querySelectorAll("[data-close]");

  function openModal(key) {
    const modal = document.getElementById(`modal-${key}`);
    if (!modal) return;
    overlay.classList.add("is-open");
    document.querySelectorAll(".modal").forEach((m) => m.classList.remove("is-active"));
    modal.classList.add("is-active");
    document.body.style.overflow = "hidden";
  }
  function closeModal() {
    overlay.classList.remove("is-open");
    document.body.style.overflow = "";
  }
  openers.forEach((btn) => btn.addEventListener("click", () => openModal(btn.dataset.modal)));
  closers.forEach((btn) => btn.addEventListener("click", closeModal));
  overlay.addEventListener("click", (e) => { if (e.target === overlay) closeModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

  /* ------------------------------------------------------------
     6b. BOOK FREE ASSESSMENT MODAL
     Any element with class "js-book-assessment" opens this modal
     instead of navigating anywhere. Frontend-only for now — see the
     "SUBMIT TO BACKEND" marker below for where to POST to Systeme.io
     or any other API once one is ready.
  ------------------------------------------------------------ */
  (function initAssessmentModal() {
    const amOverlay = document.getElementById("amOverlay");
    if (!amOverlay) return;

    const amModal = document.getElementById("amModal");
    const amClose = document.getElementById("amClose");
    const amForm = document.getElementById("amForm");
    const amFormView = document.getElementById("amFormView");
    const amSuccessView = document.getElementById("amSuccessView");
    const amSuccessClose = document.getElementById("amSuccessClose");
    const amSubmit = document.getElementById("amSubmit");

    let lastFocusedEl = null;

    function openAssessmentModal() {
      lastFocusedEl = document.activeElement;
      amOverlay.classList.add("is-open");
      amOverlay.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      const firstField = document.getElementById("amName");
      if (firstField) setTimeout(() => firstField.focus(), 350);
    }

    function resetAssessmentModal() {
      amForm.reset();
      amForm.querySelectorAll(".am-field.is-invalid").forEach((f) => f.classList.remove("is-invalid"));
      amForm.querySelectorAll(".am-error").forEach((e) => (e.textContent = ""));
      amSubmit.classList.remove("is-loading");
      amSubmit.disabled = false;
      amFormView.hidden = false;
      amSuccessView.hidden = true;
    }

    function closeAssessmentModal() {
      amOverlay.classList.remove("is-open");
      amOverlay.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      if (lastFocusedEl) lastFocusedEl.focus();
      // Reset after the close transition finishes so it doesn't flash mid-close.
      setTimeout(resetAssessmentModal, 400);
    }

    // Open triggers — any button/link across the site with this class.
    document.querySelectorAll(".js-book-assessment").forEach((trigger) => {
      trigger.addEventListener("click", (e) => {
        e.preventDefault();
        openAssessmentModal();
      });
    });

    amClose.addEventListener("click", closeAssessmentModal);
    amSuccessClose.addEventListener("click", closeAssessmentModal);
    amOverlay.addEventListener("click", (e) => { if (e.target === amOverlay) closeAssessmentModal(); });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && amOverlay.classList.contains("is-open")) closeAssessmentModal();
    });

    // Basic focus trap while the modal is open.
    amModal.addEventListener("keydown", (e) => {
      if (e.key !== "Tab") return;
      const focusable = amModal.querySelectorAll(
        'input, select, textarea, button, [href]'
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });

    /* ---------------- validation ---------------- */
    function setFieldError(fieldEl, errorEl, message) {
      fieldEl.classList.add("is-invalid");
      if (errorEl) errorEl.textContent = message;
    }
    function clearFieldError(fieldEl, errorEl) {
      fieldEl.classList.remove("is-invalid");
      if (errorEl) errorEl.textContent = "";
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function validateAssessmentForm() {
      let isValid = true;

      const checks = [
        { input: "amName", error: "amNameError", test: (v) => v.trim().length > 1, msg: "Please enter your full name." },
        { input: "amEmail", error: "amEmailError", test: (v) => emailPattern.test(v.trim()), msg: "Please enter a valid email address." },
        { input: "amPhone", error: "amPhoneError", test: (v) => v.replace(/\D/g, "").length >= 7, msg: "Please enter a valid phone number." },
        { input: "amProblem", error: "amProblemError", test: (v) => v.trim().length > 1, msg: "Please describe the challenge you're currently facing." },
      ];

      checks.forEach(({ input, error, test, msg }) => {
        const inputEl = document.getElementById(input);
        const errorEl = document.getElementById(error);
        const fieldEl = inputEl.closest(".am-field");
        if (!test(inputEl.value)) {
          setFieldError(fieldEl, errorEl, msg);
          isValid = false;
        } else {
          clearFieldError(fieldEl, errorEl);
        }
      });

      // Consent — required.
      const consentInput = document.getElementById("amConsent");
      const consentField = consentInput.closest(".am-field");
      const consentError = document.getElementById("amConsentError");
      if (!consentInput.checked) {
        setFieldError(consentField, consentError, "Please confirm you agree to be contacted.");
        isValid = false;
      } else {
        clearFieldError(consentField, consentError);
      }

      return isValid;
    }

    // Clear a field's error state as soon as the person starts fixing it.
    amForm.querySelectorAll("input, select, textarea").forEach((el) => {
      el.addEventListener("input", () => {
        const fieldEl = el.closest(".am-field");
        if (fieldEl) clearFieldError(fieldEl, fieldEl.querySelector(".am-error"));
      });
      el.addEventListener("change", () => {
        const fieldEl = el.closest(".am-field");
        if (fieldEl) clearFieldError(fieldEl, fieldEl.querySelector(".am-error"));
      });
    });

    /* ---------------- submit ---------------- */
    amForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!validateAssessmentForm()) {
        const firstInvalid = amForm.querySelector(".am-field.is-invalid input, .am-field.is-invalid select, .am-field.is-invalid textarea");
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      amSubmit.classList.add("is-loading");
      amSubmit.disabled = true;

      const formData = new FormData(amForm);
      const payload = {
        fullName: formData.get("fullName"),
        workEmail: formData.get("workEmail"),
        phone: `${formData.get("countryCode")} ${formData.get("phone")}`,
        problem: formData.get("current_problem"),
        contactMethod: formData.get("contactMethod"),
        consent: true,
      };

      const formErrorEl = document.getElementById("amFormError");
      formErrorEl.hidden = true;

      if (!navigator.onLine) {
        formErrorEl.hidden = false;
        amSubmit.classList.remove("is-loading");
        amSubmit.disabled = false;
        return;
      }

      // ---------------------------------------------------------------
      // SUBMIT DIRECTLY TO SYSTEME.IO — no backend needed. This is
      // Systeme's own public opt-in form endpoint (safe to call straight
      // from the browser — unlike the private api.systeme.io REST API,
      // this one is designed for exactly this).
      //
      // Confirmed fields: email, first_name, phone_number.
      // Best-effort fields: current_problem, preferred_contact_method —
      // these only actually save if you've added matching fields to the
      // Inline Form in Systeme.io. See "buildSystemeFields" above and the
      // README for how to confirm/expand this.
      // ---------------------------------------------------------------
      const systemeFields = buildSystemeFields(payload);
      submitToSysteme(systemeFields).then(() => {
        showAssessmentSuccess();
      });
    });

    function showAssessmentSuccess() {
      amSubmit.classList.remove("is-loading");
      amSubmit.disabled = false;
      amFormView.hidden = true;
      amSuccessView.hidden = false;
      // Restart the SVG draw-in animations every time success is shown.
      const ring = amSuccessView.querySelector(".am-success__ring");
      const check = amSuccessView.querySelector(".am-success__check");
      [ring, check].forEach((el) => {
        el.style.animation = "none";
        void el.offsetWidth; // force reflow
        el.style.animation = "";
      });
    }
  })();
  /* ------------------------------------------------------------
     7. HERO — NEURAL CONSTELLATION (signature element)
     A field of nodes that drift slowly and connect to nearby
     nodes and to the cursor, symbolising synapses forming.
  ------------------------------------------------------------ */
  const canvas = document.getElementById("constellation");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let w, h, nodes, mouse = { x: -9999, y: -9999 };
    const NODE_COUNT_DESKTOP = 70;
    const NODE_COUNT_MOBILE = 34;
    const LINK_DIST = 150;

    function resize() {
      const hero = canvas.closest(".hero");
      w = canvas.width = hero.offsetWidth;
      h = canvas.height = hero.offsetHeight;
      const count = w < 720 ? NODE_COUNT_MOBILE : NODE_COUNT_DESKTOP;
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.6 + 1,
      }));
    }
    resize();
    window.addEventListener("resize", resize);

    canvas.addEventListener("mousemove", (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });
    canvas.addEventListener("mouseleave", () => { mouse.x = -9999; mouse.y = -9999; });

    function draw() {
      ctx.clearRect(0, 0, w, h);

      // update
      nodes.forEach((n) => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      });

      // links
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK_DIST) {
            ctx.strokeStyle = `rgba(37,99,235,${0.14 * (1 - dist / LINK_DIST)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
        // link to mouse
        const dxm = nodes[i].x - mouse.x, dym = nodes[i].y - mouse.y;
        const dm = Math.sqrt(dxm * dxm + dym * dym);
        if (dm < LINK_DIST * 1.3) {
          ctx.strokeStyle = `rgba(56,189,248,${0.35 * (1 - dm / (LINK_DIST * 1.3))})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }

      // nodes
      nodes.forEach((n) => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(37,99,235,0.5)";
        ctx.fill();
      });

      requestAnimationFrame(draw);
    }
    if (!prefersReducedMotion) draw();
  }

  /* ------------------------------------------------------------
     8. FUTURE VISION — starfield canvas
  ------------------------------------------------------------ */
  const starCanvas = document.getElementById("starfield");
  if (starCanvas) {
    const sctx = starCanvas.getContext("2d");
    let sw, sh, stars;

    function resizeStars() {
      const section = starCanvas.closest(".vision");
      sw = starCanvas.width = section.offsetWidth;
      sh = starCanvas.height = section.offsetHeight;
      stars = Array.from({ length: 160 }, () => ({
        x: Math.random() * sw,
        y: Math.random() * sh,
        r: Math.random() * 1.4 + 0.3,
        tw: Math.random() * Math.PI * 2,
      }));
    }
    resizeStars();
    window.addEventListener("resize", resizeStars);

    function drawStars(t) {
      sctx.clearRect(0, 0, sw, sh);
      stars.forEach((s) => {
        const twinkle = 0.5 + 0.5 * Math.sin(t / 900 + s.tw);
        sctx.beginPath();
        sctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        sctx.fillStyle = `rgba(255,255,255,${0.25 + twinkle * 0.55})`;
        sctx.fill();
      });
      requestAnimationFrame(drawStars);
    }
    if (!prefersReducedMotion) requestAnimationFrame(drawStars);
    else drawStars(0);
  }

  /* ------------------------------------------------------------
     9. SHARED LIGHTBOX — Featured In / Moments of Impact / Media Gallery
  ------------------------------------------------------------ */
  const lightbox = document.getElementById("lightbox");
  if (lightbox) {
    const lbImg = document.getElementById("lightboxImg");
    const lbCaption = document.getElementById("lightboxCaption");
    const lbClose = document.getElementById("lightboxClose");
    const lbPrev = document.getElementById("lightboxPrev");
    const lbNext = document.getElementById("lightboxNext");

    const groups = {};
    let currentGroup = null;
    let currentIndex = 0;

    function showLightbox() {
      const item = groups[currentGroup][currentIndex];
      lbImg.src = item.src;
      lbImg.alt = item.caption;
      lbCaption.textContent = item.caption;
      lightbox.classList.add("is-open");
      document.body.style.overflow = "hidden";
    }
    function closeLightbox() {
      lightbox.classList.remove("is-open");
      document.body.style.overflow = "";
    }
    function nextImage() {
      const arr = groups[currentGroup];
      currentIndex = (currentIndex + 1) % arr.length;
      showLightbox();
    }
    function prevImage() {
      const arr = groups[currentGroup];
      currentIndex = (currentIndex - 1 + arr.length) % arr.length;
      showLightbox();
    }

    document.querySelectorAll("[data-lightbox-group]").forEach((el) => {
      const group = el.dataset.lightboxGroup;
      if (!groups[group]) groups[group] = [];
      const index = groups[group].length;
      groups[group].push({ src: el.dataset.lightboxSrc, caption: el.dataset.caption || "" });
      el.addEventListener("click", (e) => {
        e.preventDefault();
        currentGroup = group;
        currentIndex = index;
        showLightbox();
      });
    });

    lbClose.addEventListener("click", closeLightbox);
    lbNext.addEventListener("click", nextImage);
    lbPrev.addEventListener("click", prevImage);
    lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener("keydown", (e) => {
      if (!lightbox.classList.contains("is-open")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
    });
  }

  /* ------------------------------------------------------------
     10. FOOTER YEAR
  ------------------------------------------------------------ */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

});
