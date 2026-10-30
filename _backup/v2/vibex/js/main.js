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
  var V = window.VibexCar, DEG = V.DEG;

  function viewName(deg) {
    if (deg < 22 || deg > 338 || (deg > 158 && deg < 202)) return 'Lateral';
    if (deg > 68 && deg < 112) return 'Frontal';
    if (deg > 248 && deg < 292) return 'Traseira';
    return "3/4";
  }
  function degOf(yaw) { return Math.round(((yaw / DEG) % 360 + 360) % 360); }
  function pad3(n) { return ('00' + n).slice(-3); }

  /* ==================== HERO: carro girando ==================== */
  (function () {
    var svg = $('#heroCar'); if (!svg) return;
    var angEl = $('#heroAng'), viewEl = $('#heroView'), hand = $('.hand-hero'), lastDeg = -1;
    var car = V.create(svg, {
      auto: 7, fps30: coarse,
      onRender: function (c) {
        var d = degOf(c.s.yaw);
        if (d !== lastDeg) {
          lastDeg = d; angEl.textContent = 'vista ' + pad3(d) + '°';
          var n = viewName(d); if (viewEl.textContent !== n) viewEl.textContent = n;
        }
      },
      onDrag: function () { if (hand) hand.classList.add('gone'); }
    });
    var rest = V.pose({ yaw: 35, pit: 14, rev: .55 });
    function frame() {
      // enquadramento que serve para qualquer ângulo do giro
      var b = null, ar = car.aspect();
      [0, 30].forEach(function (p) {
        for (var a = 0; a < 360; a += 20) {
          var q = V.pose({ yaw: a, pit: p, rev: .55 });
          b = car.bounds(q, null, b || undefined);
        }
      });
      return car.fit(b, 10, ar);
    }
    rest.vb = frame();
    if (reduced) { car.set(rest); }
    else {
      var start = V.pose({ yaw: -70, pit: 26, rev: 0 }); start.vb = rest.vb.slice();
      car.set(start);
      setTimeout(function () { car.goTo(rest, 2600); }, 250);
    }
    var t; window.addEventListener('resize', function () {
      clearTimeout(t); t = setTimeout(function () { var vb = frame(); car.s.vb = vb; rest.vb = vb; if (car.tw) car.tw.to.vb = vb.slice(); car.dirty = true; car.render(); }, 150);
    });
  })();

  /* ==================== RAIO-X ==================== */
  var CFG = {
    completo: { yaw: -52, pit: 16, open: ['fl', 'fr', 'rl', 'rr', 'tail'], pad: 18 },
    portas: { yaw: 64, pit: 9, open: ['fl', 'fr'], pad: 90, anchor: [470, 268, 150], label: 'Portas · tweeters e falantes' },
    grave: { yaw: -46, pit: 30, open: ['tail'], pad: 120, anchor: [750, 226, 0], label: 'Grave · caixa com 6 subs' },
    modulos: { yaw: -28, pit: 30, open: ['tail'], pad: 110, anchor: [610, 250, -75], label: 'Módulos · 2 amps, fonte, DSP' },
    midia: { yaw: 72, pit: 6, open: ['fl'], pad: 190, anchor: [352, 236, 0], label: 'Multimídia no painel' },
    bateria: { yaw: 44, pit: 22, open: [], pad: 60, anchor: [197, 246, 85], label: 'Bateria e fusível' }
  };
  var SVC = {
    completo: {
      no: 'Camada 00 de 05', tag: 'visão geral', title: 'Sistema completo',
      what: 'Som de carro é um conjunto: falantes nas portas, grave no porta-malas, módulos dando potência, a central mandando o sinal e a elétrica segurando tudo. Toque em cada camada pra ver onde fica e o que entra.',
      inc: ['Projeto desenhado antes da instalação', 'Orçamento fechado, item por item', 'Regulagem com RTA na entrega', 'Garantia da instalação por escrito'],
      ideal: 'Dá pra montar por etapas: começa pelas portas e cresce depois, sem refazer o que já foi feito.',
      btn: 'Orçar projeto completo', msg: 'Olá, Vibex! Vi o raio-X no site e quero orçamento de um projeto de som completo. Meu carro é: '
    },
    portas: {
      no: 'Camada 01 de 05', tag: 'portas abertas', title: 'Portas e falantes',
      what: 'Falante de fábrica costuma ter cone de papel fino e ímã pequeno. Trocar por um kit 2 vias, com tweeter separado, é a mudança que mais aparece pelo valor investido.',
      inc: ['Kit 2 vias ou coaxial, conforme o projeto', 'Anel em MDF pra o falante não vibrar no forro', 'Vedação da porta pra segurar o médio-grave', 'Tweeter apontado pro motorista'],
      ideal: 'Primeiro passo de quem quer sair do som de fábrica sem mudar o visual.',
      btn: 'Orçar falantes das portas', msg: 'Olá, Vibex! Quero orçamento para trocar os falantes das portas. Meu carro é: '
    },
    grave: {
      no: 'Camada 02 de 05', tag: 'tampa aberta', title: 'Grave no porta-malas',
      what: 'A caixa é metade do grave. Volume e sintonia são calculados pro falante que vai nela e pro espaço que você tem, seja um sub, um trio ou um projeto de pressão.',
      inc: ['Cálculo de volume e sintonia, selada ou dutada', 'Caixa em MDF com acabamento em carpete', 'Fixação firme, nada de caixa solta', 'Ligação ao módulo com cabo na bitola certa'],
      ideal: 'Pra quem quer sentir o grave no peito sem a lataria vibrar junto.',
      btn: 'Orçar caixa de grave', msg: 'Olá, Vibex! Quero orçamento de caixa de grave / subwoofer. Meu carro é: '
    },
    modulos: {
      no: 'Camada 03 de 05', tag: 'atrás do banco', title: 'Módulos e processador',
      what: 'O módulo dá a potência. O processador (DSP) separa as frequências e acerta o tempo de cada falante. É aqui que o som para de embolar quando você aumenta.',
      inc: ['Potência escolhida pelo RMS de cada falante', 'Instalação em placa, com ventilação', 'Crossover, ganho e atraso configurados', 'Barramento com fusível por módulo'],
      ideal: 'Obrigatório no trio, na pressão e em qualquer sistema com mais de um par de falantes.',
      btn: 'Orçar módulo e DSP', msg: 'Olá, Vibex! Quero orçamento de módulo amplificador e processador (DSP). Meu carro é: '
    },
    midia: {
      no: 'Camada 04 de 05', tag: 'painel', title: 'Multimídia no painel',
      what: 'A central é de onde sai o sinal. Uma multimídia com saída RCA limpa faz diferença no som e ainda traz CarPlay, Android Auto e câmera de ré.',
      inc: ['Central com CarPlay e Android Auto', 'Moldura específica pro painel do seu carro', 'Chicote e adaptador de antena, sem corte', 'Comandos de volante, quando o carro permite'],
      ideal: 'Pra quem quer aposentar o rádio de fábrica e já deixar a saída pronta pros módulos.',
      btn: 'Orçar multimídia', msg: 'Olá, Vibex! Quero orçamento de multimídia (CarPlay/Android Auto). Meu carro é: '
    },
    bateria: {
      no: 'Camada 05 de 05', tag: 'cofre e assoalho', title: 'Elétrica e alimentação',
      what: 'Grave pede corrente. Sem elétrica dimensionada a tensão cai, o farol pisca e o módulo desarma. É a camada que ninguém vê e a que mais segura o projeto.',
      inc: ['Cálculo de consumo do sistema', 'Cabo na bitola certa, correndo pelo assoalho', 'Fusível principal perto da bateria', 'Aterramento em ponto limpo da carroceria', 'Bateria auxiliar quando o projeto pede'],
      ideal: 'Indispensável a partir do trio. Em projeto de pressão, é por onde a gente começa.',
      btn: 'Orçar parte elétrica', msg: 'Olá, Vibex! Quero orçamento da parte elétrica do som (cabos, fusível, bateria). Meu carro é: '
    }
  };
  function esc(t) { return t.replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function svcHTML(k) {
    var s = SVC[k];
    return '<h3>' + esc(s.title) + '</h3><p class="what">' + esc(s.what) + '</p><h4>O que entra</h4><ul class="checks">' +
      s.inc.map(function (i) { return '<li>' + esc(i) + '</li>'; }).join('') + '</ul><p class="ideal"><b>Pra quem é:</b> ' + esc(s.ideal) + '</p>' +
      '<a class="btn block" data-wa="' + esc(s.msg).replace(/"/g, '&quot;') + '" href="https://wa.me/' + WA + '"><svg class="ic fill" aria-hidden="true"><use href="#i-zap"/></svg>' + esc(s.btn) + '</a>';
  }

  (function () {
    var svg = $('#xrayCar'); if (!svg) return;
    var body = $('#svcBody'), no = $('#svcNo'), tag = $('#svcTag'), hud = $('#xrayHud'), ang = $('#xrayAng');
    var co = $('#callout'), coTxt = $('#calloutTxt'), coDot = $('#coDot'), coLine = $('#coLine');
    var cur = 'completo', lastDeg = -1;
    var car = V.create(svg, {
      onRender: function (c) {
        var d = degOf(c.s.yaw);
        if (d !== lastDeg) { lastDeg = d; ang.textContent = 'vista ' + pad3(d) + '°'; }
        var cf = CFG[cur];
        if (cf.anchor && !c.tw) {
          var p = c.toScreen(cf.anchor[0], cf.anchor[1], cf.anchor[2]), r = svg.getBoundingClientRect();
          var lw = coTxt.offsetWidth, lh = coTxt.offsetHeight;
          // etiqueta acima do ponto, sempre dentro do quadro (abaixo dele se faltar espaço)
          var lx = Math.max(10, Math.min(r.width - lw - 10, p[0] - lw / 2 + (p[0] < r.width / 2 ? 40 : -40)));
          var ly = p[1] - 70 - lh; if (ly < 36) ly = Math.min(r.height - lh - 10, p[1] + 56);
          coDot.style.transform = 'translate(' + p[0].toFixed(0) + 'px,' + p[1].toFixed(0) + 'px)';
          coTxt.style.transform = 'translate(' + lx.toFixed(0) + 'px,' + ly.toFixed(0) + 'px)';
          var tx = Math.max(lx + 6, Math.min(lx + lw - 6, p[0])), ty = ly < p[1] ? ly + lh : ly;
          var dx = tx - p[0], dy = ty - p[1], len = Math.sqrt(dx * dx + dy * dy);
          coLine.style.width = Math.max(0, len - 7).toFixed(0) + 'px';
          coLine.style.transform = 'translate(' + p[0].toFixed(0) + 'px,' + p[1].toFixed(0) + 'px) rotate(' + Math.atan2(dy, dx).toFixed(3) + 'rad) translateX(7px)';
          co.classList.add('on');
        } else co.classList.remove('on');
      }
    });
    function poseFor(k) {
      var cf = CFG[k], rev = {};
      V.LAYERS.forEach(function (l) { rev[l] = k === 'completo' ? 1 : (l === k ? 1 : .07); });
      var p = V.pose({ yaw: cf.yaw, pit: cf.pit, open: cf.open, rev: rev, dim: k === 'completo' ? .3 : 1 });
      var b = k === 'completo' ? car.bounds(p) : car.bounds(p, function (m) { return m.layer === k; });
      p.vb = car.fit(b, cf.pad);
      return p;
    }
    function show(k, animate) {
      cur = k;
      svg.setAttribute('data-focus', k);
      $$('.layer-btn').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-layer') === k)); });
      var s = SVC[k];
      hud.textContent = s.no.replace(' de 05', '');
      coTxt.textContent = CFG[k].label || '';
      co.classList.remove('on');
      var fill = function () { body.innerHTML = svcHTML(k); bindWa(body); no.textContent = s.no; tag.textContent = s.tag; body.classList.remove('swap'); };
      if (animate && !reduced) { body.classList.add('swap'); setTimeout(fill, 220); } else fill();
      if (animate) car.goTo(poseFor(k), 1500); else car.set(poseFor(k));
    }
    $$('.layer-btn').forEach(function (b) {
      b.addEventListener('click', function () { var k = b.getAttribute('data-layer'); if (k !== cur || car.tw === null) show(k, true); });
    });
    // estado inicial: carro fechado; entra girando quando a seção aparece
    var first = V.pose({ yaw: 20, pit: 10, rev: 0, dim: 0 });
    first.vb = poseFor('completo').vb;
    car.set(first);
    show('completo', false);
    car.set(first);
    car.s.vb = first.vb;
    var started = false;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting && !started) { started = true; car.goTo(poseFor(cur), reduced ? 0 : 2200); } });
      }, { threshold: .3 }).observe(svg);
    } else car.set(poseFor('completo'));
    var t; window.addEventListener('resize', function () {
      clearTimeout(t); t = setTimeout(function () { if (!started) return; var p = poseFor(cur); car.s.vb = p.vb; if (car.tw) car.tw.to.vb = p.vb; car.dirty = true; car.render(); }, 150);
    });
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
