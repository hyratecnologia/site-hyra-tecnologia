(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* menu do celular */
  var btn = document.getElementById('menuBtn');
  var nav = document.getElementById('nav');
  function setMenu(open) {
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    nav.classList.toggle('open', open);
  }
  btn.addEventListener('click', function () { setMenu(btn.getAttribute('aria-expanded') !== 'true'); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { setMenu(false); btn.focus(); }
  });
  document.addEventListener('click', function (e) {
    if (btn.getAttribute('aria-expanded') === 'true' && !e.target.closest('.pill')) setMenu(false);
  });

  /* cards sobem com escalonamento */
  var items = Array.prototype.slice.call(document.querySelectorAll('.rv'));
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      var batch = entries.filter(function (en) { return en.isIntersecting; });
      batch.forEach(function (en, i) {
        en.target.style.setProperty('--d', (Math.min(i, 6) * 0.07) + 's');
        en.target.classList.add('in');
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* inclinação leve no desktop */
  if (!reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('[data-tilt]').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        if (!card.classList.contains('in')) return;
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = 'perspective(900px) translateY(-4px) rotateX(' + (-y * 3).toFixed(2) + 'deg) rotateY(' + (x * 3).toFixed(2) + 'deg)';
      });
      card.addEventListener('pointerleave', function () { card.style.transform = ''; });
    });
  }

  /* aberto agora / dia de hoje (horário da loja) */
  try {
    var parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo', weekday: 'short', hour: 'numeric', hourCycle: 'h23' }).formatToParts(new Date());
    var wd = parts.find(function (p) { return p.type === 'weekday'; }).value;
    var hr = parseInt(parts.find(function (p) { return p.type === 'hour'; }).value, 10);
    var day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(wd);
    var row = document.querySelector('#hours [data-d="' + day + '"]');
    if (row) row.classList.add('today');
    var st = document.getElementById('status');
    var open = day >= 1 && day <= 6 && hr >= 8 && hr < 19;
    if (st) {
      st.textContent = open ? 'Aberto agora' : (day === 0 ? 'Hoje fechado · domingo' : 'Fechado agora');
      st.classList.toggle('on', open);
    }
  } catch (err) { /* mantém o texto padrão */ }

  var ano = document.getElementById('ano');
  if (ano) ano.textContent = new Date().getFullYear();
})();
