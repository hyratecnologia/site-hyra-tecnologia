/* Torque Oficina Mecânica · comportamento geral */
(function () {
  'use strict';

  var WA_NUM = '556299208147';
  window.torqueWA = function (msg) {
    return 'https://wa.me/' + WA_NUM + '?text=' + encodeURIComponent(msg);
  };

  /* Links de WhatsApp com mensagem por contexto */
  function ligaWA(root) {
    (root || document).querySelectorAll('[data-wa]').forEach(function (a) {
      a.href = window.torqueWA(a.getAttribute('data-wa'));
      a.target = '_blank';
      a.rel = 'noopener';
    });
  }
  ligaWA();
  window.torqueLigaWA = ligaWA;

  /* Menu mobile */
  var btn = document.querySelector('[data-menu-btn]');
  var menu = document.querySelector('[data-menu]');
  var header = document.querySelector('[data-header]');
  function fechaMenu(foco) {
    if (!menu.classList.contains('is-open')) return;
    menu.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Abrir menu');
    if (foco) btn.focus();
  }
  if (btn && menu) {
    btn.addEventListener('click', function () {
      var abrir = btn.getAttribute('aria-expanded') !== 'true';
      if (abrir) {
        menu.style.top = Math.max(0, header.getBoundingClientRect().bottom) + 'px';
        menu.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
        btn.setAttribute('aria-label', 'Fechar menu');
      } else {
        fechaMenu(false);
      }
    });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) fechaMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') fechaMenu(true); });
    document.addEventListener('click', function (e) {
      if (!menu.contains(e.target) && !btn.contains(e.target)) fechaMenu(false);
    });
    window.matchMedia('(min-width: 1081px)').addEventListener('change', function () { fechaMenu(false); menu.style.top = ''; });
  }

  /* Cabeçalho e barra de ação ao rolar */
  var bar = document.querySelector('[data-acao-bar]');
  var ticking = false;
  function onScroll() {
    var y = window.scrollY;
    if (header) header.classList.toggle('is-scrolled', y > 40);
    if (bar) bar.classList.toggle('is-on', y > 420);
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  /* Aberto agora? (hora local de quem visita) */
  function agoraLocal() {
    var d = new Date();
    return { dia: d.getDay(), min: d.getHours() * 60 + d.getMinutes() };
  }
  var HORARIO = { 1: [450, 1080], 2: [450, 1080], 3: [450, 1080], 4: [450, 1080], 5: [450, 1080], 6: [480, 720] };
  var t = agoraLocal();
  window.torqueAgora = t;
  var st = document.querySelector('[data-status]');
  if (st) {
    var h = HORARIO[t.dia];
    var txt = st.querySelector('[data-status-txt]');
    if (h && t.min >= h[0] && t.min < h[1]) {
      st.classList.add('is-open');
      txt.textContent = 'Aberto agora · fecha às ' + (t.dia === 6 ? '12h' : '18h');
    } else {
      var prox = (t.dia === 6 && t.min >= 720) || t.dia === 0 ? 'abre segunda às 7h30'
        : (h && t.min < h[0]) ? 'abre hoje às ' + (t.dia === 6 ? '8h' : '7h30')
        : (t.dia === 5 ? 'abre amanhã às 8h' : 'abre amanhã às 7h30');
      txt.textContent = 'Fechado agora · ' + prox;
    }
  }
  document.querySelectorAll('[data-horas] [data-dia]').forEach(function (row) {
    if (row.getAttribute('data-dia').split(',').indexOf(String(t.dia)) > -1) {
      row.classList.add('hoje');
      row.setAttribute('aria-label', 'Hoje: ' + row.textContent.trim());
    }
  });

  /* Entrada ao rolar, só onde ajuda a leitura (passos e fichas) */
  var alvos = document.querySelectorAll('.passo, .rv');
  if ('IntersectionObserver' in window && alvos.length) {
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px' });
    alvos.forEach(function (el) { io.observe(el); });
  } else {
    alvos.forEach(function (el) { el.classList.add('is-in'); });
  }
})();
