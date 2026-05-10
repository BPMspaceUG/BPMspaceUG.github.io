// assets/js/main.js
// Extracted from the former inline <script> in index.html, byte-for-byte the same behaviour.
// The only change vs. before: the four handlers are bound with addEventListener instead of
// inline onclick= attributes, so the page works under a script-src 'self' CSP. No DOM/visual
// change. No storage APIs.

function toggleLang() {
    const body = document.body;
    const btn = document.querySelector('.lang-toggle');
    if (body.classList.contains('lang-en')) {
        body.classList.remove('lang-en');
        body.classList.add('lang-de');
        btn.textContent = 'EN';
    } else {
        body.classList.remove('lang-de');
        body.classList.add('lang-en');
        btn.textContent = 'DE';
    }
}
window.addEventListener('scroll', function() {
    document.getElementById('header').classList.toggle('scrolled', window.scrollY > 80);
});
function toggleMenu() { document.getElementById('navMenu').classList.toggle('open'); }
function closeMenu() { document.getElementById('navMenu').classList.remove('open'); }
function toggleImpressum() {
    const imp = document.getElementById('impressum');
    imp.classList.toggle('open');
    const icon = document.querySelector('.impressum-toggle .fa-chevron-down');
    if (icon) icon.style.transform = imp.classList.contains('open') ? 'rotate(180deg)' : '';
}

// Wire up the handlers that used to be inline onclick= attributes.
(function () {
    var btn = document.querySelector('.mobile-menu-btn');
    if (btn) btn.addEventListener('click', toggleMenu);

    var closeBtn = document.querySelector('.mobile-menu-close');
    if (closeBtn) closeBtn.addEventListener('click', toggleMenu);

    var navLinks = document.querySelectorAll('#navMenu a');
    for (var i = 0; i < navLinks.length; i++) navLinks[i].addEventListener('click', closeMenu);

    var langBtn = document.querySelector('.lang-toggle');
    if (langBtn) langBtn.addEventListener('click', toggleLang);

    var impBtn = document.querySelector('.impressum-toggle');
    if (impBtn) impBtn.addEventListener('click', toggleImpressum);
})();
