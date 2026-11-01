(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // revelar ao rolar
  var items = document.querySelectorAll('.rv');
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  }

  // barra fixa do WhatsApp: aparece depois do hero, some no CTA final
  var dock = document.getElementById('dock');
  var hero = document.getElementById('topo');
  var final = document.getElementById('orcamento');
  if (dock && hero && 'IntersectionObserver' in window) {
    var pastHero = false, atFinal = false;
    var link = dock.querySelector('a');
    var update = function () {
      var show = pastHero && !atFinal;
      dock.classList.toggle('on', show);
      dock.setAttribute('aria-hidden', show ? 'false' : 'true');
      link.tabIndex = show ? 0 : -1;
    };
    new IntersectionObserver(function (e) {
      pastHero = !e[0].isIntersecting && e[0].boundingClientRect.top < 0; update();
    }).observe(hero);
    if (final) new IntersectionObserver(function (e) {
      atFinal = e[0].isIntersecting; update();
    }, { threshold: 0.15 }).observe(final);
  }

  // setas da galeria
  var rail = document.querySelector('.rail');
  document.querySelectorAll('.nav-btn').forEach(function (b) {
    b.addEventListener('click', function () {
      var card = rail.querySelector('.work');
      var step = card ? card.getBoundingClientRect().width + 14 : 300;
      rail.scrollBy({ left: step * Number(b.dataset.dir), behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  // FAQ: uma aberta por vez
  var dets = document.querySelectorAll('.acc details');
  dets.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (d.open) dets.forEach(function (o) { if (o !== d) o.open = false; });
    });
  });

  var ano = document.getElementById('ano');
  if (ano) ano.textContent = new Date().getFullYear();
})();
