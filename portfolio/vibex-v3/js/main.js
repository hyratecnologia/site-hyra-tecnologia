/* Vibex AudioCar · interações da página */
(function () {
  'use strict';
  var WA = '556296166397';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var waUrl = function (msg) { return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(msg); };
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;

  /* ---------- WhatsApp com mensagem por contexto ---------- */
  function bindWa(root) {
    $$('[data-wa]', root).forEach(function (a) {
      a.href = waUrl(a.getAttribute('data-wa'));
      a.target = '_blank'; a.rel = 'noopener';
    });
  }
  bindWa(document);

  /* ---------- ano ---------- */
  var ano = $('#ano'); if (ano) ano.textContent = new Date().getFullYear();

  /* ---------- cabeçalho, barra fixa ---------- */
  var hdr = $('#hdr'), bar = $('#actionbar');
  function onScroll() {
    var y = window.scrollY || 0;
    hdr.classList.toggle('solid', y > 20);
    if (bar) bar.classList.toggle('show', y > 360);
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- menu do celular ---------- */
  var mb = $('#menuBtn'), dr = $('#drawer');
  function setMenu(open) {
    mb.setAttribute('aria-expanded', String(open));
    mb.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    dr.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) { var f = $('a', dr); if (f) f.focus(); }
  }
  mb.addEventListener('click', function () { setMenu(mb.getAttribute('aria-expanded') !== 'true'); });
  $$('a', dr).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && dr.classList.contains('open')) { setMenu(false); mb.focus(); } });
  window.addEventListener('resize', function () { if (window.innerWidth >= 1100 && dr.classList.contains('open')) setMenu(false); });

  /* ---------- link ativo no menu ---------- */
  if ('IntersectionObserver' in window) {
    var links = $$('.nav a');
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach(function (a) { var s = $(a.getAttribute('href')); if (s) io.observe(s); });
  }

  /* ---------- aberto agora? (horário de Brasília) ---------- */
  (function () {
    var el = $('#openNow'); if (!el) return;
    try {
      var parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(new Date());
      var get = function (t) { var p = parts.filter(function (x) { return x.type === t; })[0]; return p ? p.value : ''; };
      var wd = get('weekday'), h = (+get('hour') % 24) + (+get('minute')) / 60;
      var workday = wd !== 'Sun';
      if (workday && h >= 8 && h < 19) { el.textContent = 'Aberto agora · fecha às 19h'; el.className = 'open-now is-open'; }
      else {
        var msg = 'Fechado agora · ';
        if (workday && h < 8) msg += 'abre hoje às 8h';
        else if (wd === 'Sat' || wd === 'Sun') msg += 'abre segunda às 8h';
        else msg += 'abre amanhã às 8h';
        el.textContent = msg; el.className = 'open-now is-closed';
      }
    } catch (_) { }
  })();

  if (!window.VibexCar) return;
  var V = window.VibexCar;

  /* ==================== TOPO + POR DENTRO DO SOM ==================== */
  /* o palco fica preso na tela; a etapa que passa da "linha de leitura" manda no carro.
     O carro realista (carro3d.js) ouve o evento "step" do palco; sem 3D, o traço abaixo faz o mesmo */
  var STEPS = ['inicio', 'completo', 'portas', 'grave', 'modulos', 'midia', 'bateria'];
  var NOW = {
    inicio: 'Vibex AudioCar', completo: 'Por dentro do som',
    portas: '<b>01</b> · Portas', grave: '<b>02</b> · Grave', modulos: '<b>03</b> · Módulos', midia: '<b>04</b> · Multimídia', bateria: '<b>05</b> · Elétrica'
  };
  /* poses do traço (convenção do engine.js) */
  var CFG = {
    inicio: { yaw: 35, pit: 14, open: [], pad: 10 },
    completo: { yaw: -52, pit: 16, open: ['fl', 'fr', 'rl', 'rr', 'tail'], pad: 18 },
    portas: { yaw: 64, pit: 9, open: ['fl', 'fr'], pad: 90, anchor: [470, 268, 150], label: 'Falantes e tweeter' },
    grave: { yaw: -46, pit: 30, open: ['tail'], pad: 120, anchor: [750, 226, 0], label: 'Caixa de grave' },
    modulos: { yaw: -28, pit: 30, open: ['tail'], pad: 110, anchor: [610, 250, -75], label: 'Módulos e DSP' },
    midia: { yaw: 72, pit: 6, open: ['fl'], pad: 190, anchor: [352, 236, 0], label: 'Multimídia' },
    bateria: { yaw: 44, pit: 22, open: [], pad: 60, anchor: [197, 246, 85], label: 'Bateria e fusível' }
  };

  (function () {
    var show = $('#show'), stage = $('#carStage'); if (!show || !stage) return;
    var steps = $$('.chap', show), nav = $$('#stepsNav a'), now = $('#stepNow');
    var co = $('#callout'), coTxt = $('#calloutTxt'), coDot = $('#coDot'), coLine = $('#coLine');
    var cur = null, wide = function () { return window.innerWidth >= 1024; };

    function set(k) {
      if (k === cur) return;
      cur = k;
      nav.forEach(function (a) { if (a.getAttribute('data-go') === k) a.setAttribute('aria-current', 'step'); else a.removeAttribute('aria-current'); });
      now.innerHTML = NOW[k];
      stage.setAttribute('data-step', k);
      stage.dispatchEvent(new CustomEvent('step', { detail: { k: k } }));
    }
    window.VibexStory = { step: function () { return cur; } };

    /* linha de leitura: no celular, um pouco abaixo do carro; no desktop, no meio da tela */
    function readLine() {
      var vh = window.innerHeight;
      if (wide()) return vh * .55;
      var b = stage.getBoundingClientRect().bottom;
      return b + (vh - b) * .3;
    }
    function pick() {
      var L = readLine(), k = STEPS[0];
      steps.forEach(function (s) { if (s.getBoundingClientRect().top < L) k = s.getAttribute('data-step'); });
      set(k);
    }
    var ticking = false;
    function onScrollStory() { if (ticking) return; ticking = true; requestAnimationFrame(function () { ticking = false; pick(); }); }
    window.addEventListener('scroll', onScrollStory, { passive: true });
    window.addEventListener('resize', onScrollStory);
    pick();

    /* links para uma etapa: no celular a etapa tem de parar logo abaixo do carro, não atrás dele */
    function goTo(el) {
      var hdrH = $('#hdr').offsetHeight, top = el.getBoundingClientRect().top + window.scrollY;
      var y = wide() ? top - hdrH : top - hdrH - stage.offsetHeight + 1;
      if (el.getAttribute('data-step') === 'inicio') y = 0;
      window.scrollTo({ top: Math.max(0, y), behavior: reduced ? 'auto' : 'smooth' });
    }
    $$('a[href^="#"]').forEach(function (a) {
      var id = a.getAttribute('href').slice(1); if (!id) return;
      var el = document.getElementById(id);
      var step = el && (el.classList.contains('chap') ? el : (el === show ? steps[0] : null));
      if (!step) return;
      a.addEventListener('click', function (e) { e.preventDefault(); goTo(step); history.replaceState(null, '', '#' + id); });
    });

    /* etiqueta: bolinha na peça, linha fina e o texto num canto que não cobre nada */
    window.VibexCallout = function (x, y, w, h, left) {
      var lw = coTxt.offsetWidth, lh = coTxt.offsetHeight;
      var m = 14, bottom = wide() ? 18 : 40, topY = wide() ? 64 : 56;
      var lx = (left === undefined ? x > w / 2 : left) ? m : w - lw - m;
      var ly = h - lh - bottom; if (y > ly - 24) ly = topY;
      coDot.style.transform = 'translate(' + x.toFixed(0) + 'px,' + y.toFixed(0) + 'px)';
      coTxt.style.transform = 'translate(' + lx.toFixed(0) + 'px,' + ly.toFixed(0) + 'px)';
      var tx = Math.max(lx + 10, Math.min(lx + lw - 10, x)), ty = ly < y ? ly + lh : ly;
      var dx = tx - x, dy = ty - y, len = Math.sqrt(dx * dx + dy * dy);
      coLine.style.width = Math.max(0, len - 5).toFixed(0) + 'px';
      coLine.style.transform = 'translate(' + x.toFixed(0) + 'px,' + y.toFixed(0) + 'px) rotate(' + Math.atan2(dy, dx).toFixed(3) + 'rad) translateX(5px)';
      co.classList.add('on');
    };
    window.VibexCalloutOff = function () { co.classList.remove('on'); };
    window.VibexCalloutText = function (t) { if (coTxt.textContent !== t) coTxt.textContent = t; };

    /* reserva sem 3D: o carro em traço segue as mesmas etapas */
    function traco() {
      show.classList.add('gl-off'); stage.classList.add('gl-off');
      var svg = $('#carSvg'), car = V.create(svg, {
        auto: 7, fps30: coarse,
        onRender: function (c) {
          var cf = CFG[cur || 'inicio'];
          if (cf.anchor && !c.tw) {
            var p = c.toScreen(cf.anchor[0], cf.anchor[1], cf.anchor[2]), r = svg.getBoundingClientRect();
            window.VibexCallout(p[0], p[1], r.width, r.height);
          } else window.VibexCalloutOff();
        }
      });
      function poseFor(k) {
        var cf = CFG[k], rev = {};
        V.LAYERS.forEach(function (l) { rev[l] = k === 'inicio' ? .55 : (k === 'completo' ? 1 : (l === k ? 1 : .07)); });
        var p = V.pose({ yaw: cf.yaw, pit: cf.pit, open: cf.open, rev: rev, dim: k === 'inicio' ? 0 : (k === 'completo' ? .3 : 1) });
        var b;
        if (k === 'inicio') {
          // enquadramento que serve para qualquer ângulo do giro
          [0, 30].forEach(function (pp) { for (var a = 0; a < 360; a += 20) b = car.bounds(V.pose({ yaw: a, pit: pp, rev: .55 }), null, b || undefined); });
        } else b = k === 'completo' ? car.bounds(p) : car.bounds(p, function (m) { return m.layer === k; });
        p.vb = car.fit(b, cf.pad, car.aspect());
        return p;
      }
      function apply(animate) {
        var k = cur || 'inicio';
        car.o.auto = k === 'inicio' ? 7 : 0;
        svg.setAttribute('data-focus', k);
        coTxt.textContent = CFG[k].label || '';
        if (animate && !reduced) car.goTo(poseFor(k), 1400); else car.set(poseFor(k));
      }
      apply(false);
      stage.addEventListener('step', function () { apply(true); });
      var t; window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(function () { apply(false); }, 150); });
    }

    var hasGL = (function () { try { var c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (_) { return false; } })();
    var saveData = navigator.connection && navigator.connection.saveData;
    if (hasGL && !saveData && 'noModule' in HTMLScriptElement.prototype) window.VibexTraco = traco;
    else traco();
  })();

  /* ==================== RTA: antes / depois ==================== */
  (function () {
    var svg = $('#rtaSvg'); if (!svg) return;
    var N = 72, F = [], L20 = Math.log10(20);
    for (var i = 0; i < N; i++) F.push(Math.pow(10, L20 + 3 * i / (N - 1)));
    var X = function (f) { return 60 + (Math.log10(f) - L20) / 3 * 640; };
    var Y = function (db) { return 160 - db * 9; };
    var g = function (f, fc, gain, w) { var o = Math.log2(f / fc) / w; return gain * Math.exp(-o * o); };
    var target = F.map(function (f) { return 7 / (1 + Math.pow(f / 90, 2.2)) - 2.5 / (1 + Math.pow(9000 / f, 2)); });
    var before = F.map(function (f, i) {
      return target[i] - 9 / (1 + Math.pow(f / 32, 2)) + g(f, 110, 6.5, .55) + g(f, 260, -6, .5) + g(f, 1300, 4.2, .5) + g(f, 3400, -6.5, .4) + g(f, 7800, 5.5, .45) + g(f, 15000, -4, .4) + 1.1 * Math.sin(i * 1.7);
    });
    var after = F.map(function (f, i) { return target[i] + .9 * Math.sin(i * 1.3) * Math.exp(-i / 90) - g(f, 18000, 1.2, .5); });
    var path = function (arr, off) { return arr.map(function (v, i) { return (i ? 'L' : 'M') + X(F[i]).toFixed(1) + ' ' + Y(v + (off || 0)).toFixed(1); }).join(''); };
    // grade
    var grid = '', ticks = [[20, '20'], [50, '50'], [100, '100'], [200, '200'], [500, '500'], [1000, '1k'], [2000, '2k'], [5000, '5k'], [10000, '10k'], [20000, '20k Hz']];
    ticks.forEach(function (t) { grid += '<path class="gl" d="M' + X(t[0]).toFixed(1) + ' 52 V268"/><text x="' + X(t[0]).toFixed(1) + '" y="288" text-anchor="' + (t[0] === 20000 ? 'end' : 'middle') + '">' + t[1] + '</text>'; });
    [-12, -6, 0, 6, 12].forEach(function (d) { grid += '<path class="' + (d === 0 ? 'ax' : 'gl') + '" d="M60 ' + Y(d) + ' H700"/><text x="50" y="' + (Y(d) + 4) + '" text-anchor="end">' + (d > 0 ? '+' : '') + d + '</text>'; });
    [[60, 0], [250, 0], [4000, 0]].forEach(function (b) { grid += '<path class="bandsep" d="M' + X(b[0]).toFixed(1) + ' 300 V320"/>'; });
    [['SUB', 20, 60], ['GRAVE', 60, 250], ['MÉDIO', 250, 4000], ['AGUDO', 4000, 20000]].forEach(function (b) {
      grid += '<text class="band" x="' + ((X(b[1]) + X(b[2])) / 2).toFixed(1) + '" y="314" text-anchor="middle">' + b[0] + '</text>';
    });
    grid += '<text x="60" y="40">dB</text>';
    $('#rtaGrid').innerHTML = grid;
    $('#rtaTgt').setAttribute('d', path(target));
    var up = target.map(function (v, i) { return X(F[i]).toFixed(1) + ' ' + Y(v + 3).toFixed(1); });
    var dn = target.map(function (v, i) { return X(F[i]).toFixed(1) + ' ' + Y(v - 3).toFixed(1); }).reverse();
    $('#rtaTol').setAttribute('d', 'M' + up.join('L') + 'L' + dn.join('L') + 'Z');
    var curEl = $('#rtaCur'), area = $('#rtaArea'), dev = $('#rtaDev');
    var now = after.slice(), raf = 0;
    function draw(arr) {
      var d = path(arr); curEl.setAttribute('d', d);
      area.setAttribute('d', d + 'L700 268 L60 268 Z');
      var m = arr.reduce(function (s, v, i) { return s + Math.abs(v - target[i]); }, 0) / arr.length;
      dev.textContent = '±' + m.toFixed(1).replace('.', ',') + ' dB';
    }
    function morph(to) {
      cancelAnimationFrame(raf);
      var from = now.slice(), t0 = performance.now(), dur = reduced ? 1 : 900;
      (function step(t) {
        var k = Math.min(1, (t - t0) / dur), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        now = from.map(function (v, i) { return v + (to[i] - v) * e; });
        draw(now);
        if (k < 1) raf = requestAnimationFrame(step);
      })(t0);
    }
    draw(before); now = before.slice();
    var btns = $$('[data-curve]');
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        btns.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        morph(b.getAttribute('data-curve') === 'antes' ? before : after);
      });
    });
    btns.forEach(function (x) { x.setAttribute('aria-pressed', String(x.getAttribute('data-curve') === 'antes')); });
    // ao aparecer, mostra a regulagem acontecendo
    if ('IntersectionObserver' in window) {
      var done = false;
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting && !done) {
            done = true;
            setTimeout(function () { btns.forEach(function (x) { x.setAttribute('aria-pressed', String(x.getAttribute('data-curve') === 'depois')); }); morph(after); }, 700);
          }
        });
      }, { threshold: .5 }).observe(svg);
    } else { draw(after); now = after.slice(); }
  })();

  /* ==================== ORÇAMENTO GUIADO ==================== */
  (function () {
    var f = $('#qform'); if (!f) return;
    var carro = $('#qCarro'), nome = $('#qNome'), obs = $('#qObs'), err = $('#qCarroErr');
    var val = function (n) { var r = f.querySelector('input[name="' + n + '"]:checked'); return r ? r.value : ''; };
    function message() {
      var lines = ['Olá, Vibex! Vim pelo site e quero um orçamento.', '',
        '• Carro: ' + (carro.value.trim() || '(a informar)'),
        '• Objetivo: ' + val('obj'),
        '• Investimento: ' + val('inv'),
        '• Equipamento: ' + val('eq')];
      if (obs.value.trim()) lines.push('• Observação: ' + obs.value.trim());
      if (nome.value.trim()) lines.push('', 'Meu nome é ' + nome.value.trim() + '.');
      return lines.join('\n');
    }
    function update() {
      var c = carro.value.trim();
      var tc = $('#tCarro'); tc.textContent = c || 'a preencher'; tc.classList.toggle('empty', !c);
      $('#tObj').textContent = val('obj'); $('#tInv').textContent = val('inv'); $('#tEq').textContent = val('eq');
      $('#tMsg').textContent = message();
      if (c) { err.textContent = ''; carro.removeAttribute('aria-invalid'); }
    }
    f.addEventListener('input', update); f.addEventListener('change', update); update();
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (carro.value.trim().length < 2) {
        err.textContent = 'Conta qual é o carro (modelo e ano) pra gente montar o orçamento.';
        carro.setAttribute('aria-invalid', 'true'); carro.focus();
        return;
      }
      window.open(waUrl(message()), '_blank', 'noopener');
    });
  })();
})();
