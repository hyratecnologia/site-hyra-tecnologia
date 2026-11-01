(function () {
  'use strict';
  var WA = 'https://wa.me/556296166397';

  // Links de WhatsApp com mensagem própria de cada botão
  document.querySelectorAll('[data-wa]').forEach(function (a) {
    a.href = WA + '?text=' + encodeURIComponent(a.getAttribute('data-wa'));
  });

  // Ano no rodapé
  var ano = document.getElementById('ano');
  if (ano) ano.textContent = new Date().getFullYear();

  // Menu mobile
  var hdr = document.getElementById('hdr');
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  var waFloat = document.querySelector('.wa-float');

  function setMenu(open) {
    if (open) document.documentElement.style.setProperty('--nav-top', hdr.getBoundingClientRect().bottom + 'px');
    nav.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    document.body.style.overflow = open ? 'hidden' : '';
    if (waFloat) waFloat.classList.toggle('hide', open);
  }
  burger.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('open')) { setMenu(false); burger.focus(); }
  });
  window.matchMedia('(min-width: 1000px)').addEventListener('change', function (m) { if (m.matches) setMenu(false); });

  // Sombra no cabeçalho ao rolar
  function onScroll() { hdr.classList.toggle('scrolled', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // FAQ: abre um por vez
  var items = document.querySelectorAll('.faq details');
  items.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (d.open) items.forEach(function (o) { if (o !== d) o.open = false; });
    });
  });

  // Entrada suave ao rolar
  var reveals = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('in'); });
  } else {
    // pequeno atraso em cascata para itens irmãos
    reveals.forEach(function (el) {
      var sibs = Array.prototype.filter.call(el.parentNode.children, function (c) { return c.classList.contains('reveal'); });
      var i = sibs.indexOf(el);
      if (i > 0) el.style.setProperty('--d', Math.min(i, 6) * 0.06 + 's');
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });

    // Esconde o botão fixo quando o bloco de contato está na tela
    var contato = document.getElementById('contato');
    if (waFloat && contato) {
      new IntersectionObserver(function (en) {
        if (!nav.classList.contains('open')) waFloat.classList.toggle('hide', en[0].isIntersecting);
      }, { threshold: 0.15 }).observe(contato);
    }
  }
})();
