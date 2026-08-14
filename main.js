(function () {
  "use strict";

  var nav = document.getElementById("nav");
  var menu = document.getElementById("menu");
  var menuBtn = document.querySelector(".menu-btn");
  var form = document.getElementById("intake");
  var success = document.getElementById("form-success");
  var hero = document.querySelector(".hero");
  var progress = document.getElementById("progress");
  var motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  var parallaxQuery = window.matchMedia("(min-width: 760px) and (pointer: fine)");
  var reduceMotion = motionQuery.matches;
  var menuOpen = false;
  var menuHideTimer = 0;
  var ticking = false;

  function setScrolled() {
    if (!nav) return;
    nav.classList.toggle("is-scrolled", window.scrollY > 8);
  }

  function setProgress() {
    if (!progress) return;
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var value = max > 0 ? window.scrollY / max : 0;
    if (value < 0) value = 0;
    if (value > 1) value = 1;
    progress.style.setProperty("--progress", value.toFixed(4));
  }

  function parallaxEnabled() {
    return !reduceMotion && parallaxQuery.matches;
  }

  function setParallax() {
    if (!hero) return;
    if (!parallaxEnabled()) {
      hero.style.setProperty("--hero-shift", "0px");
      return;
    }
    var shift = Math.round(window.scrollY * 0.16);
    hero.style.setProperty("--hero-shift", shift + "px");
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      setScrolled();
      setProgress();
      setParallax();
      ticking = false;
    });
  }

  setScrolled();
  setProgress();
  setParallax();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () {
    setProgress();
    setParallax();
  }, { passive: true });

  if (hero) {
    if (reduceMotion) {
      hero.classList.add("is-ready");
    } else {
      window.requestAnimationFrame(function () {
        hero.classList.add("is-ready");
      });
    }
  }

  function finishCloseMenu() {
    if (!menu || menuOpen) return;
    menu.hidden = true;
  }

  function closeMenu() {
    if (!menu || !menuBtn) return;
    if (menu.hidden && !menu.classList.contains("is-open")) return;

    menuOpen = false;
    menu.classList.remove("is-open");
    menuBtn.classList.remove("is-open");
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.setAttribute("aria-label", "Open menu");
    document.body.classList.remove("menu-open");

    window.clearTimeout(menuHideTimer);
    if (reduceMotion) {
      menu.hidden = true;
      return;
    }
    menuHideTimer = window.setTimeout(finishCloseMenu, 450);
  }

  function openMenu() {
    if (!menu || !menuBtn) return;
    menuOpen = true;
    window.clearTimeout(menuHideTimer);
    menu.hidden = false;
    menuBtn.classList.add("is-open");
    menuBtn.setAttribute("aria-expanded", "true");
    menuBtn.setAttribute("aria-label", "Close menu");
    document.body.classList.add("menu-open");

    if (reduceMotion) {
      menu.classList.add("is-open");
      return;
    }

    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        if (menuOpen) menu.classList.add("is-open");
      });
    });
  }

  if (menuBtn && menu) {
    menuBtn.addEventListener("click", function () {
      if (menuOpen || (!menu.hidden && menu.classList.contains("is-open"))) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeMenu();
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth >= 760) closeMenu();
    });
  }

  if (form && success) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var data = {
        name: form.name.value.trim(),
        firm: form.firm.value.trim(),
        role: form.role.value.trim(),
        email: form.email.value.trim(),
        website: form.website.value.trim(),
        firmtype: form.firmtype.value
      };

      var body = [
        "Name: " + data.name,
        "Firm: " + data.firm,
        "Role: " + data.role,
        "Email: " + data.email,
        "Website: " + data.website,
        "Firm type: " + data.firmtype
      ].join("\n");

      var mailto =
        "mailto:hello@aismbagency.com" +
        "?subject=" + encodeURIComponent("Sprint inquiry — " + (data.firm || data.name)) +
        "&body=" + encodeURIComponent(body);

      window.location.href = mailto;

      form.hidden = true;
      success.hidden = false;
    });
  }

  function clearRevealDelay(el) {
    var raw = el.style.getPropertyValue("--reveal-delay") || "0ms";
    var ms = parseInt(raw, 10) || 0;
    window.setTimeout(function () {
      el.style.setProperty("--reveal-delay", "0ms");
    }, ms + 900);
  }

  function markIn(el) {
    el.classList.add("is-in");
    clearRevealDelay(el);
  }

  function prepareReveals() {
    var groups = [
      { selector: ".leaks li", delay: 80 },
      { selector: ".cards .card", delay: 80 },
      { selector: ".steps li", delay: 80 }
    ];

    groups.forEach(function (group) {
      document.querySelectorAll(group.selector).forEach(function (el, index) {
        el.style.setProperty("--reveal-delay", index * group.delay + "ms");
      });
    });

    var revealables = document.querySelectorAll(
      ".section-head, .leaks li, .card, .steps li, .work-copy, .browser, .form-panel"
    );

    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealables.forEach(function (el) {
        el.classList.add("is-in");
        el.setAttribute("data-reveal", "");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          markIn(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0, rootMargin: "0px 0px 0px 0px" }
    );

    revealables.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      var inView = rect.top < window.innerHeight * 0.92 && rect.bottom > 40;
      el.setAttribute("data-reveal", "");
      if (inView) {
        window.requestAnimationFrame(function () {
          window.requestAnimationFrame(function () {
            markIn(el);
          });
        });
      } else {
        observer.observe(el);
      }
    });
  }

  prepareReveals();

  function revealHashTarget() {
    var id = (window.location.hash || "").replace(/^#/, "");
    if (!id) return;
    var target = document.getElementById(id);
    if (!target) return;
    target.querySelectorAll("[data-reveal]").forEach(markIn);
  }

  window.addEventListener("hashchange", revealHashTarget);
  revealHashTarget();

  window.setTimeout(function () {
    document.querySelectorAll("[data-reveal]:not(.is-in)").forEach(markIn);
  }, 1500);

  function onMotionChange(event) {
    reduceMotion = event.matches;
    if (reduceMotion) {
      document.querySelectorAll("[data-reveal]").forEach(function (el) {
        el.classList.add("is-in");
        el.style.setProperty("--reveal-delay", "0ms");
      });
      if (hero) hero.classList.add("is-ready");
      setParallax();
    }
  }

  if (motionQuery.addEventListener) {
    motionQuery.addEventListener("change", onMotionChange);
  } else if (motionQuery.addListener) {
    motionQuery.addListener(onMotionChange);
  }

  if (parallaxQuery.addEventListener) {
    parallaxQuery.addEventListener("change", setParallax);
  } else if (parallaxQuery.addListener) {
    parallaxQuery.addListener(setParallax);
  }
})();
