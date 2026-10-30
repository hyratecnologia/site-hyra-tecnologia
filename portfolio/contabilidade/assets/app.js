(function () {
  'use strict';
  document.documentElement.classList.add('js');
  var WA = '556299208147';
  window.waLink = function (msg) { return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(msg); };

  // Links de WhatsApp com mensagem por contexto
  document.querySelectorAll('[data-wa]').forEach(function (a) {
    a.href = window.waLink(a.getAttribute('data-wa'));
    a.target = '_blank';
    a.rel = 'noopener';
  });

  // Menu mobile
  var btn = document.querySelector('.menu-btn');
  var nav = document.getElementById('menu');
  function fechar() { nav.classList.remove('aberto'); btn.setAttribute('aria-expanded', 'false'); btn.querySelector('.sr').textContent = 'Abrir menu'; }
  btn.addEventListener('click', function () {
    var abrir = btn.getAttribute('aria-expanded') !== 'true';
    nav.classList.toggle('aberto', abrir);
    btn.setAttribute('aria-expanded', String(abrir));
    btn.querySelector('.sr').textContent = abrir ? 'Fechar menu' : 'Abrir menu';
  });
  nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', fechar); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('aberto')) { fechar(); btn.focus(); } });

  // Abas de perfil
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.perfis__tabs [role="tab"]'));
  function ativar(tab, foco) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    if (foco) tab.focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { ativar(t); });
    t.addEventListener('keydown', function (e) {
      var n = null;
      if (e.key === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
      if (e.key === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === 'Home') n = tabs[0];
      if (e.key === 'End') n = tabs[tabs.length - 1];
      if (n) { e.preventDefault(); ativar(n, true); }
    });
  });
  function abrirPorHash() {
    var h = location.hash.replace('#', '');
    var t = tabs.filter(function (x) { return x.getAttribute('aria-controls') === h; })[0];
    if (t) { ativar(t); document.getElementById('para-quem').scrollIntoView(); }
  }
  document.querySelectorAll('[data-tab]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var t = document.getElementById(a.getAttribute('data-tab'));
      ativar(t);
      history.replaceState(null, '', '#' + t.getAttribute('aria-controls'));
      document.getElementById('para-quem').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    });
  });
  abrirPorHash();
  window.addEventListener('hashchange', abrirPorHash);

  // Textos (dialog)
  document.querySelectorAll('[data-dlg]').forEach(function (b) {
    b.addEventListener('click', function () {
      var d = document.getElementById(b.getAttribute('data-dlg'));
      if (d && d.showModal) d.showModal();
    });
  });
  document.querySelectorAll('dialog').forEach(function (d) {
    d.addEventListener('click', function (e) { if (e.target === d) d.close(); });
  });

  // Carimbo do hero entra quando aparece
  var carimbo = document.querySelector('.carimbo');
  if (carimbo) {
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (en) { if (en.isIntersecting) { carimbo.classList.add('on'); io.disconnect(); } });
      }, { threshold: .4 });
      io.observe(carimbo.parentElement);
    } else carimbo.classList.add('on');
  }

  // Formulário de contato -> WhatsApp
  var form = document.getElementById('form-contato');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var nome = form.nome.value.trim();
    var erro = document.getElementById('c-nome-erro');
    if (!nome) { erro.hidden = false; form.nome.setAttribute('aria-invalid', 'true'); form.nome.setAttribute('aria-describedby', 'c-nome-erro'); form.nome.focus(); return; }
    erro.hidden = true; form.nome.removeAttribute('aria-invalid');
    var msg = 'Olá! Meu nome é ' + nome + '. Sou: ' + form.perfil.value + '. Preciso de: ' + form.assunto.value + '.';
    if (form.msg.value.trim()) msg += ' Detalhes: ' + form.msg.value.trim();
    window.open(window.waLink(msg), '_blank', 'noopener');
  });
})();
