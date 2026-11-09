/* =========================================================
   Портфолио Даши — лёгкий JavaScript без библиотек.
   Задачи: мобильное меню, подсветка раздела, появление
   блоков при прокрутке, год в подвале.
   ========================================================= */

(function () {
  "use strict";

  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("primary-nav");
  var year = document.getElementById("year");
  var navLinks = nav ? Array.prototype.slice.call(nav.querySelectorAll("a")) : [];

  /* --- Тень шапки при прокрутке --- */

  function updateHeader() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  /* --- Мобильное меню --- */

  function setMenuLabel(isOpen) {
    if (!toggle) return;
    var label = toggle.querySelector(".sr-only");
    if (label) {
      label.textContent = isOpen ? "Закрыть меню" : "Открыть меню";
    }
  }

  function closeMenu() {
    if (!nav || !toggle) return;
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    setMenuLabel(false);
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      setMenuLabel(isOpen);
    });

    navLinks.forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        closeMenu();
        toggle.focus();
      }
    });

    document.addEventListener("click", function (event) {
      if (!nav.classList.contains("is-open")) return;
      if (!nav.contains(event.target) && !toggle.contains(event.target)) {
        closeMenu();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 900) closeMenu();
    });
  }

  /* --- Год в подвале --- */

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  /* --- Появление блоков при прокрутке --- */

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revealItems = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  if (!reduceMotion && "IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    revealItems.forEach(function (item) {
      revealObserver.observe(item);
    });
  } else {
    revealItems.forEach(function (item) {
      item.classList.add("is-visible");
    });
  }

  /* --- Подсветка текущего раздела в меню --- */

  var sections = navLinks
    .map(function (link) {
      var hash = link.getAttribute("href");
      if (!hash || hash.charAt(0) !== "#") return null;
      var element = document.querySelector(hash);
      return element ? { link: link, element: element } : null;
    })
    .filter(Boolean);

  if (sections.length && "IntersectionObserver" in window) {
    var linkByElement = new Map();
    sections.forEach(function (item) {
      linkByElement.set(item.element, item.link);
    });

    var spyObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          navLinks.forEach(function (link) {
            link.removeAttribute("aria-current");
          });
          var current = linkByElement.get(entry.target);
          if (current) {
            current.setAttribute("aria-current", "true");
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach(function (item) {
      spyObserver.observe(item.element);
    });
  }
})();
