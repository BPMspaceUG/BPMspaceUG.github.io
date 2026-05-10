// assets/js/main.js — extracted page behaviours. No inline handlers, no storage APIs.
(function () {
  'use strict';

  // Language toggle (EN <-> DE). In-memory only — language resets on reload.
  var langBtn = document.querySelector('.lang-toggle');
  if (langBtn) {
    langBtn.addEventListener('click', function () {
      var body = document.body;
      var toDE = body.classList.contains('lang-en');
      body.classList.toggle('lang-en', !toDE);
      body.classList.toggle('lang-de', toDE);
      document.documentElement.lang = toDE ? 'de' : 'en';
      langBtn.textContent = toDE ? 'EN' : 'DE';
    });
  }

  // Sticky-header shadow on scroll.
  var header = document.getElementById('header');
  if (header) {
    window.addEventListener('scroll', function () {
      header.classList.toggle('scrolled', window.scrollY > 80);
    });
  }

  // Mobile nav menu.
  var navMenu = document.getElementById('navMenu');
  function closeMenu() { if (navMenu) { navMenu.classList.remove('open'); } }
  var openBtn = document.querySelector('.mobile-menu-btn');
  var closeBtn = document.querySelector('.mobile-menu-close');
  if (openBtn && navMenu) {
    openBtn.addEventListener('click', function () { navMenu.classList.toggle('open'); });
  }
  if (closeBtn) { closeBtn.addEventListener('click', closeMenu); }
  if (navMenu) {
    Array.prototype.forEach.call(navMenu.querySelectorAll('a[href^="#"]'), function (a) {
      a.addEventListener('click', closeMenu);
    });
  }
})();
