/* Veio Marcenaria · interações */
(function () {
  'use strict';
  var V = window.VEIO, D = window.VeioDesenho, FOTOS = window.VEIO_FOTOS || [];
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduz && 'IntersectionObserver' in window) document.documentElement.classList.add('anima');

  function zap(msg) { return 'https://wa.me/' + V.whatsapp + '?text=' + encodeURIComponent(msg); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* foto real (se listada em fotos-config.js) ou desenho técnico */
  function montaFoto(el, arquivo, gerar, alt) {
    if (arquivo && FOTOS.indexOf(arquivo) >= 0) {
      el.innerHTML = '<img src="fotos/' + encodeURI(arquivo) + '" alt="' + esc(alt || '') + '" loading="lazy" decoding="async">';
    } else {
      el.innerHTML = gerar();
      var svg = el.querySelector('svg');
      if (svg && alt) svg.setAttribute('aria-label', alt);
    }
  }

  /* ---------- links de WhatsApp fixos ---------- */
  var msgGeral = 'Olá! Vim pelo site da Veio e quero conversar sobre móveis planejados.';
  [['#zapFlut', msgGeral], ['#zapRodape', msgGeral],
   ['#zapArq', 'Olá! Sou arquiteto(a) e quero enviar um projeto executivo para orçamento de marcenaria.'],
   ['#zapVisita', 'Olá! Quero agendar uma visita ao showroom da Veio no Setor Marista. Qual horário vocês têm nesta semana?']
  ].forEach(function (p) { var a = $(p[0]); if (a) a.href = zap(p[1]); });

  /* ---------- topo e menu ---------- */
  var topo = $('#topo'), menuBt = $('#menuBt'), nav = $('#nav'), flut = $('#zapFlut');
  function aoRolar() {
    var y = window.scrollY;
    topo.classList.toggle('rolou', y > 8);
    flut.classList.toggle('mostra', y > window.innerHeight * 0.8);
  }
  window.addEventListener('scroll', aoRolar, { passive: true }); aoRolar();
  function fechaMenu(foco) { nav.classList.remove('aberto'); menuBt.setAttribute('aria-expanded', 'false'); if (foco) menuBt.focus(); }
  menuBt.addEventListener('click', function () {
    var abre = menuBt.getAttribute('aria-expanded') !== 'true';
    menuBt.setAttribute('aria-expanded', String(abre)); nav.classList.toggle('aberto', abre);
    if (abre) { var a = nav.querySelector('a'); if (a) a.focus(); }
  });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) fechaMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('aberto')) fechaMenu(true); });
  document.addEventListener('click', function (e) { if (nav.classList.contains('aberto') && !nav.contains(e.target) && !menuBt.contains(e.target)) fechaMenu(false); });

  if ('IntersectionObserver' in window) {
    var links = $$('.nav a[href^="#"]');
    var obsNav = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        if (en.isIntersecting) links.forEach(function (l) { l.setAttribute('aria-current', l.getAttribute('href') === '#' + en.target.id ? 'true' : 'false'); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['projetos', 'acabamento', 'processo', 'materiais', 'arquitetos', 'faq'].forEach(function (id) { var s = document.getElementById(id); if (s) obsNav.observe(s); });
  }

  /* ---------- desenhos declarados no HTML ---------- */
  $$('.foto[data-desenho]').forEach(function (el) {
    var mat = JSON.parse(el.dataset.mat || '{}'), opts = JSON.parse(el.dataset.opts || '{}');
    opts.label = el.dataset.alt;
    montaFoto(el, el.dataset.foto, function () { return D[el.dataset.desenho](el.dataset.tipo, mat, opts); }, el.dataset.alt);
  });

  /* ---------- ambientes ---------- */
  var ambKeys = Object.keys(V.ambientes);
  var contagem = {};
  V.projetos.forEach(function (p) { contagem[p.ambiente] = (contagem[p.ambiente] || 0) + 1; });
  var ambExemplo = {};
  V.projetos.forEach(function (p) { if (!ambExemplo[p.ambiente]) ambExemplo[p.ambiente] = p; });
  var ambLista = $('#ambLista'), ambPrev = $('#ambPreview'), ambPrevLeg = $('#ambPreviewLeg');
  var cacheElev = {};
  function elevAmb(k) {
    if (!cacheElev[k]) { var p = ambExemplo[k]; cacheElev[k] = D.elevacao(k, Object.assign({ seed: p.slug }, p.mat), { cotas: true, label: 'Elevação de ' + V.ambientes[k].nome.toLowerCase() }); }
    return cacheElev[k];
  }
  ambKeys.forEach(function (k, i) {
    var a = V.ambientes[k], n = contagem[k] || 0;
    var li = document.createElement('li');
    li.innerHTML = '<button type="button" class="amb-item" data-amb="' + k + '"><span class="a-n">' + String(i + 1).padStart(2, '0') + '</span><span class="a-nome">' + a.plural + '</span><span class="a-qtd">' + n + (n === 1 ? ' projeto' : ' projetos') + '</span><span class="a-nota">' + a.nota + '</span><span class="a-mini" aria-hidden="true"></span></button>';
    ambLista.appendChild(li);
  });
  function mostraAmb(k) {
    $$('.amb-item').forEach(function (b) { b.classList.toggle('ativo', b.dataset.amb === k); });
    ambPrev.innerHTML = elevAmb(k);
    var p = ambExemplo[k];
    ambPrevLeg.textContent = 'Elevação · ' + p.titulo + ' · ' + D.MDF[p.mat.mdf].nome;
  }
  var miniFeito = false;
  function minis() {
    if (miniFeito || window.innerWidth > 960) return; miniFeito = true;
    $$('.amb-item').forEach(function (b) { b.querySelector('.a-mini').innerHTML = elevAmb(b.dataset.amb).replace('role="img"', 'aria-hidden="true"'); });
  }
  ambLista.addEventListener('mouseover', function (e) { var b = e.target.closest('.amb-item'); if (b) mostraAmb(b.dataset.amb); });
  ambLista.addEventListener('focusin', function (e) { var b = e.target.closest('.amb-item'); if (b) mostraAmb(b.dataset.amb); });
  ambLista.addEventListener('click', function (e) {
    var b = e.target.closest('.amb-item'); if (!b) return;
    filtra(b.dataset.amb);
    document.getElementById('projetos').scrollIntoView({ behavior: reduz ? 'auto' : 'smooth' });
  });
  mostraAmb('cozinha'); minis();
  window.addEventListener('resize', minis);

  /* ---------- portfólio ---------- */
  var filtrosEl = $('#filtros'), grade = $('#projGrade'), status = $('#filtroStatus');
  var filtroAtual = 'todos';
  function botaoFiltro(k, nome, n) { return '<button type="button" class="filtro" data-f="' + k + '" aria-pressed="' + (k === 'todos') + '">' + nome + ' <sup>' + n + '</sup></button>'; }
  filtrosEl.innerHTML = botaoFiltro('todos', 'Todos', V.projetos.length) + ambKeys.map(function (k) { return botaoFiltro(k, V.ambientes[k].plural, contagem[k] || 0); }).join('');

  function matResumo(p) { var m = p.mat; return D.MDF[m.mdf].nome + (m.mdf2 && m.mdf2 !== m.mdf ? ' + ' + D.MDF[m.mdf2].nome : '') + (['cozinha', 'banheiro', 'gourmet'].indexOf(p.ambiente) >= 0 ? ' · ' + D.PEDRA[m.pedra].nome : ''); }
  function persp(p) { return D.perspectiva(p.ambiente, Object.assign({ seed: p.slug }, p.mat), Object.assign({ label: 'Perspectiva do projeto ' + p.titulo }, p.persp)); }

  V.projetos.forEach(function (p, i) {
    var a = document.createElement('a');
    a.className = 'card'; a.href = '#projeto/' + p.slug; a.dataset.amb = p.ambiente; a.dataset.i = i;
    a.innerHTML = '<div class="card-fig" data-foto="' + p.slug + '-1.jpg"><span class="card-fl">FL. 04.' + String(i + 1).padStart(2, '0') + '</span></div>' +
      '<p class="card-meta"><span>' + V.ambientes[p.ambiente].nome + ' · ' + p.bairro + '</span><span>' + p.area + '</span></p>' +
      '<h3>' + p.titulo + '</h3><p class="card-mat">' + matResumo(p) + '</p>';
    grade.appendChild(a);
  });
  var cards = $$('.card', grade);
  function desenhaCard(card) {
    if (card.dataset.ok) return; card.dataset.ok = '1';
    var p = V.projetos[+card.dataset.i], fig = card.querySelector('.card-fig'), fl = fig.querySelector('.card-fl');
    montaFoto(fig, p.slug + '-1.jpg', function () { return persp(p); }, 'Perspectiva do projeto ' + p.titulo + ', ' + V.ambientes[p.ambiente].nome.toLowerCase() + ' em ' + matResumo(p));
    fig.appendChild(fl);
  }
  if ('IntersectionObserver' in window) {
    var obsCard = new IntersectionObserver(function (ents) { ents.forEach(function (en) { if (en.isIntersecting) { desenhaCard(en.target); obsCard.unobserve(en.target); } }); }, { rootMargin: '400px 0px' });
    cards.forEach(function (c) { obsCard.observe(c); });
  } else cards.forEach(desenhaCard);

  function filtra(k) {
    filtroAtual = k; var vis = 0;
    $$('.filtro', filtrosEl).forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.f === k)); });
    cards.forEach(function (c) {
      var ok = k === 'todos' || c.dataset.amb === k;
      c.hidden = !ok; c.classList.remove('largo');
      if (ok) { if (vis % 5 === 0) c.classList.add('largo'); vis++; desenhaCard(c); }
    });
    status.textContent = (k === 'todos' ? 'Mostrando todos os ' : 'Mostrando ') + vis + (vis === 1 ? ' projeto' : ' projetos') + (k === 'todos' ? '.' : ' de ' + V.ambientes[k].plural.toLowerCase() + '.');
  }
  filtrosEl.addEventListener('click', function (e) { var b = e.target.closest('.filtro'); if (b) filtra(b.dataset.f); });
  filtra('todos');

  /* ---------- folha de projeto ---------- */
  var dlg = $('#folhaProj'), atual = -1, imgs = [], imgAtual = 0, cardOrigem = null;
  var NOMES_IMG = ['Perspectiva', 'Elevação com cotas', 'Planta de layout', 'Detalhe de acabamento'];
  function imagensDe(p) {
    var o = Object.assign({ seed: p.slug }, p.mat);
    return [
      { arq: p.slug + '-1.jpg', leg: 'Perspectiva do ambiente', gerar: function () { return persp(p); } },
      { arq: p.slug + '-2.jpg', leg: 'Elevação frontal com cotas gerais', gerar: function () { return D.elevacao(p.ambiente, o, { label: 'Elevação frontal de ' + p.titulo }); } },
      { arq: p.slug + '-3.jpg', leg: 'Planta de layout · ' + p.dims[0] + ' × ' + p.dims[1], gerar: function () { return D.planta(p.ambiente, o, p.dims, { label: 'Planta de layout de ' + p.titulo }); } },
      { arq: p.slug + '-4.jpg', leg: 'Detalhe de acabamento: chapa, fita de borda, puxador e dobradiça', gerar: function () { return D.detalhe(o, { label: 'Detalhe de acabamento de ' + p.titulo }); } }
    ];
  }
  function mostraImg(i) {
    imgAtual = i;
    var im = imgs[i];
    if (!im.cache) im.cache = im.gerar();
    var alvo = $('#fpImg');
    montaFoto(alvo, im.arq, function () { return im.cache; }, im.leg);
    $('#fpLeg').textContent = String(i + 1).padStart(2, '0') + ' / 0' + imgs.length + ' · ' + im.leg;
    $$('#fpMinis button').forEach(function (b, k) { b.setAttribute('aria-current', String(k === i)); });
  }
  function abreProjeto(i) {
    var p = V.projetos[i]; if (!p) return;
    atual = i; imgs = imagensDe(p);
    $('#fpFl').textContent = 'FL. 04.' + String(i + 1).padStart(2, '0') + ' · ' + (i + 1) + ' de ' + V.projetos.length;
    $('#fpAmb').textContent = V.ambientes[p.ambiente].nome + ' · ' + p.bairro + ' · ' + p.ano;
    $('#fpTitulo').textContent = p.titulo;
    $('#fpTexto').textContent = p.texto;
    var linhas = [
      ['Ambiente', V.ambientes[p.ambiente].nome], ['Área', p.area + ' (' + p.dims[0] + ' × ' + p.dims[1] + ')'],
      ['Chapas', 'MDF 18 mm ' + D.MDF[p.mat.mdf].nome + (p.mat.mdf2 && p.mat.mdf2 !== p.mat.mdf ? ' e ' + D.MDF[p.mat.mdf2].nome : '')]
    ];
    if (['cozinha', 'banheiro', 'gourmet', 'closet'].indexOf(p.ambiente) >= 0) linhas.push([p.ambiente === 'closet' ? 'Tampo da ilha' : 'Bancada', D.PEDRA[p.mat.pedra].nome]);
    linhas.push(['Puxador', D.PUX[p.mat.pux].nome], ['Ferragens', p.ferragens], ['Prazo', p.prazo]);
    $('#fpDl').innerHTML = linhas.map(function (l) { return '<div><dt>' + l[0] + '</dt><dd>' + esc(l[1]) + '</dd></div>'; }).join('');
    $('#fpZap').href = zap('Olá! Vi o projeto "' + p.titulo + '" (' + V.ambientes[p.ambiente].nome.toLowerCase() + ', ' + p.bairro + ') no site da Veio e quero algo parecido para a minha casa.');
    var minisEl = $('#fpMinis');
    minisEl.innerHTML = '';
    imgs.forEach(function (im, k) {
      var b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', 'Ver ' + NOMES_IMG[k].toLowerCase());
      im.cache = im.gerar();
      montaFoto(b, im.arq, function () { return im.cache.replace('role="img"', 'aria-hidden="true"'); }, '');
      b.addEventListener('click', function () { mostraImg(k); });
      minisEl.appendChild(b);
    });
    mostraImg(0);
    if (!dlg.open) dlg.showModal();
    dlg.scrollTop = 0;
    $('#fpFechar').focus();
  }
  function fechaProjeto() {
    if (dlg.open) dlg.close();
    if (/^#projeto\//.test(location.hash)) history.replaceState(null, '', '#projetos');
    var c = cards[atual]; if (c) c.focus({ preventScroll: false });
  }
  function rota() {
    var m = location.hash.match(/^#projeto\/([\w-]+)/);
    if (m) {
      var i = V.projetos.findIndex(function (p) { return p.slug === m[1]; });
      if (i >= 0) { abreProjeto(i); return; }
    }
    if (dlg.open) dlg.close();
  }
  window.addEventListener('hashchange', rota);
  rota();
  $('#fpFechar').addEventListener('click', fechaProjeto);
  dlg.addEventListener('cancel', function (e) { e.preventDefault(); fechaProjeto(); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) fechaProjeto(); });
  function vaiProjeto(d) { var n = (atual + d + V.projetos.length) % V.projetos.length; history.replaceState(null, '', '#projeto/' + V.projetos[n].slug); abreProjeto(n); }
  $('#fpAnt').addEventListener('click', function () { vaiProjeto(-1); });
  $('#fpProx').addEventListener('click', function () { vaiProjeto(1); });
  $('#fpPrincipal').addEventListener('click', function () { abreLb(imgAtual); });

  /* ---------- lightbox ---------- */
  var lb = $('#lightbox'), lbImg = $('#lbImg'), lbI = 0;
  function lbMostra(i, dir) {
    lbI = (i + imgs.length) % imgs.length;
    var im = imgs[lbI];
    montaFoto(lbImg, im.arq, function () { return im.cache || (im.cache = im.gerar()); }, im.leg);
    $('#lbCont').textContent = (lbI + 1) + ' / ' + imgs.length;
    $('#lbLeg').textContent = V.projetos[atual].titulo + ' · ' + im.leg;
    if (!reduz && dir) { lbImg.style.setProperty('--dx', (dir * 40) + 'px'); lbImg.classList.remove('anim'); void lbImg.offsetWidth; lbImg.classList.add('anim'); }
  }
  function abreLb(i) { lbMostra(i, 0); lb.showModal(); $('#lbFechar').focus(); }
  function fechaLb() { lb.close(); mostraImg(lbI); $('#fpPrincipal').focus(); }
  $('#lbAnt').addEventListener('click', function () { lbMostra(lbI - 1, -1); });
  $('#lbProx').addEventListener('click', function () { lbMostra(lbI + 1, 1); });
  $('#lbFechar').addEventListener('click', fechaLb);
  lb.addEventListener('cancel', function (e) { e.preventDefault(); fechaLb(); });
  lb.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); lbMostra(lbI - 1, -1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); lbMostra(lbI + 1, 1); }
  });
  dlg.addEventListener('keydown', function (e) {
    if (lb.open) return;
    if (e.target.closest('input, textarea')) return;
    if (e.key === 'ArrowLeft') mostraImg((imgAtual + imgs.length - 1) % imgs.length);
    if (e.key === 'ArrowRight') mostraImg((imgAtual + 1) % imgs.length);
  });
  var toque = null;
  lbImg.addEventListener('pointerdown', function (e) { toque = { x: e.clientX, y: e.clientY }; });
  lbImg.addEventListener('pointerup', function (e) {
    if (!toque) return;
    var dx = e.clientX - toque.x, dy = e.clientY - toque.y; toque = null;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) lbMostra(lbI + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
  });
  lbImg.addEventListener('pointercancel', function () { toque = null; });

  /* ---------- mostruário ---------- */
  var most = { movel: 'cozinha', mdf: 'salvia', mdf2: 'carvalho-hanover', pedra: 'quartzo-branco', pux: 'cava' };
  var PRESETS = [
    { mdf: 'salvia', mdf2: 'carvalho-hanover', pedra: 'quartzo-branco', pux: 'cava' },
    { mdf: 'nogueira', mdf2: 'preto-fosco', pedra: 'sao-gabriel', pux: 'perfil-preto' },
    { mdf: 'linho', mdf2: 'freijo', pedra: 'travertino', pux: 'ponto' }
  ];
  var GRUPOS = { amadeirado: ['Amadeirados', 'MD'], liso: ['Lisos', 'LS'], tom: ['Tons', 'TM'] };
  function montaAmostras(campo) {
    var box = $('.amostras[data-campo="' + campo + '"]'), html = '';
    if (campo === 'pedra') {
      Object.keys(D.PEDRA).forEach(function (k, i) {
        html += '<label class="amostra"><input type="radio" name="' + campo + '" value="' + k + '"' + (most[campo] === k ? ' checked' : '') + '><span class="amostra-chapa">' + D.amostra('pedra', k) + '</span><span class="amostra-etq"><b>PD-' + String(i + 1).padStart(2, '0') + '</b>' + D.PEDRA[k].nome + '</span></label>';
      });
    } else {
      Object.keys(GRUPOS).forEach(function (g) {
        html += '<p class="amostras-sub">' + GRUPOS[g][0] + '</p>';
        var n = 0;
        Object.keys(D.MDF).forEach(function (k) {
          var m = D.MDF[k]; if (m.grupo !== g) return; n++;
          html += '<label class="amostra"><input type="radio" name="' + campo + '" value="' + k + '"' + (most[campo] === k ? ' checked' : '') + '><span class="amostra-chapa">' + D.amostra('mdf', k) + '</span><span class="amostra-etq"><b>' + GRUPOS[g][1] + '-' + String(n).padStart(2, '0') + '</b>' + m.nome + '</span></label>';
        });
      });
    }
    box.innerHTML = html;
  }
  ['mdf', 'mdf2', 'pedra'].forEach(montaAmostras);
  var PUX_ICON = {
    'cava': '<rect x="4" y="4" width="92" height="30" fill="#E6DDCD" stroke="#2E2A25"/><rect x="4" y="4" width="92" height="6" fill="rgba(25,18,12,.45)"/>',
    'perfil': '<rect x="4" y="4" width="92" height="30" fill="#E6DDCD" stroke="#2E2A25"/><rect x="4" y="3" width="92" height="4" fill="#A3A09A" stroke="#2E2A25" stroke-width=".5"/>',
    'perfil-preto': '<rect x="4" y="4" width="92" height="30" fill="#E6DDCD" stroke="#2E2A25"/><rect x="4" y="3" width="92" height="4" fill="#222"/>',
    'ponto': '<rect x="4" y="4" width="92" height="30" fill="#E6DDCD" stroke="#2E2A25"/><circle cx="84" cy="14" r="4.5" fill="#B8955D" stroke="#2E2A25" stroke-width=".6"/>',
    'ponto-preto': '<rect x="4" y="4" width="92" height="30" fill="#E6DDCD" stroke="#2E2A25"/><circle cx="84" cy="14" r="4.5" fill="#262626"/>',
    'toque': '<rect x="4" y="4" width="92" height="30" fill="#E6DDCD" stroke="#2E2A25"/><circle cx="84" cy="14" r="5" fill="none" stroke="#2E2A25" stroke-dasharray="2 2"/>'
  };
  $('.puxadores').innerHTML = Object.keys(D.PUX).map(function (k) {
    return '<label class="pux"><input type="radio" name="pux" value="' + k + '"' + (most.pux === k ? ' checked' : '') + '><svg viewBox="0 0 100 38" aria-hidden="true">' + PUX_ICON[k] + '</svg><span>' + D.PUX[k].nome + '</span></label>';
  }).join('');

  var palco = $('#mostDesenho');
  function desenhaMost() {
    var o = { mdf: most.mdf, mdf2: most.mdf2, pedra: most.pedra, pux: most.pux, seed: 'mostruario' };
    var nome = most.movel === 'cozinha' ? 'Cozinha' : 'Guarda-roupa';
    var svg = D.elevacao(most.movel, o, { label: nome + ' em ' + D.MDF[most.mdf].nome + ' com destaque em ' + D.MDF[most.mdf2].nome + (most.movel === 'cozinha' ? ', bancada em ' + D.PEDRA[most.pedra].nome : '') + ' e ' + D.PUX[most.pux].nome.toLowerCase() });
    var velhos = $$('svg', palco);
    palco.insertAdjacentHTML('beforeend', svg);
    velhos.forEach(function (v) { v.classList.add('saindo'); setTimeout(function () { v.remove(); }, reduz ? 0 : 460); });
    var novo = palco.lastElementChild;
    if (!reduz && velhos.length) { novo.style.opacity = '0'; requestAnimationFrame(function () { requestAnimationFrame(function () { novo.style.opacity = ''; }); }); }
    $('#mostLegenda').textContent = (most.movel === 'cozinha' ? 'Elevação · cozinha com torre quente, 4,40 m' : 'Elevação · guarda-roupa até o forro com nicho, 4,20 m') + ' · sem escala';
    var linhas = [['Móvel', nome], ['Chapa', D.MDF[most.mdf].nome], ['Destaque', D.MDF[most.mdf2].nome]];
    if (most.movel === 'cozinha') linhas.push(['Bancada', D.PEDRA[most.pedra].nome]);
    linhas.push(['Puxador', D.PUX[most.pux].nome]);
    $('#mostResumo').innerHTML = linhas.map(function (l) { return '<dt>' + l[0] + '</dt><dd>' + l[1] + '</dd>'; }).join('');
    var msg = 'Olá! Montei esta combinação no mostruário do site da Veio:\n' + linhas.map(function (l) { return '• ' + l[0] + ': ' + l[1]; }).join('\n') + '\nQueria um orçamento com esses acabamentos.';
    $('#mostZap').href = zap(msg);
  }
  $('#mostForm').addEventListener('change', function (e) {
    if (e.target.name && most.hasOwnProperty(e.target.name)) { most[e.target.name] = e.target.value; desenhaMost(); }
  });
  $('#mostForm').addEventListener('submit', function (e) { e.preventDefault(); });
  function marcaRadios() { ['mdf', 'mdf2', 'pedra', 'pux'].forEach(function (c) { var i = $('#mostForm input[name="' + c + '"][value="' + most[c] + '"]'); if (i) i.checked = true; }); }
  $$('[data-preset]').forEach(function (b) {
    b.addEventListener('click', function () { Object.assign(most, PRESETS[+b.dataset.preset]); marcaRadios(); desenhaMost(); });
  });
  var abas = $$('.most-abas [role="tab"]');
  function escolheAba(tab, foco) {
    abas.forEach(function (t) { var s = t === tab; t.setAttribute('aria-selected', String(s)); t.tabIndex = s ? 0 : -1; });
    palco.setAttribute('aria-labelledby', tab.id);
    most.movel = tab.dataset.movel;
    var gp = $('#grupoPedra'); gp.disabled = most.movel !== 'cozinha';
    $('#legB').textContent = most.movel === 'cozinha' ? 'prateleiras e aéreos' : 'fundo do nicho central';
    if (foco) tab.focus();
    desenhaMost();
  }
  abas.forEach(function (t, i) {
    t.addEventListener('click', function () { escolheAba(t); });
    t.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); escolheAba(abas[(i + (e.key === 'ArrowRight' ? 1 : abas.length - 1)) % abas.length], true); }
    });
  });
  desenhaMost();

  /* ---------- cronograma ---------- */
  var gantt = $('.gantt');
  if ('IntersectionObserver' in window) {
    var obsG = new IntersectionObserver(function (ents) { ents.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('visto'); obsG.unobserve(en.target); } }); }, { threshold: 0.25 });
    obsG.observe(gantt);
  } else gantt.classList.add('visto');

  /* ---------- materiais: corte didático ---------- */
  $('#matDesenho').innerHTML = D.corte({ mdf: 'carvalho-hanover', pux: 'cava' });
  var itensMat = $$('#matLista li'), pinos = $$('#matDesenho .pino');
  function ativaPino(n, fixo) {
    itensMat.forEach(function (li) { var on = li.dataset.pino === String(n); li.classList.toggle('ativo', on); li.querySelector('button').setAttribute('aria-pressed', String(on && !!fixo)); });
    pinos.forEach(function (p) { p.classList.toggle('ativo', p.dataset.pino === String(n)); });
  }
  itensMat.forEach(function (li) {
    var b = li.querySelector('button');
    b.addEventListener('click', function () { ativaPino(li.dataset.pino, true); });
    li.addEventListener('mouseenter', function () { ativaPino(li.dataset.pino); });
  });
  pinos.forEach(function (p) {
    p.addEventListener('mouseenter', function () { ativaPino(p.dataset.pino); });
    p.addEventListener('click', function () {
      ativaPino(p.dataset.pino, true);
      var li = itensMat[+p.dataset.pino - 1];
      if (window.innerWidth <= 1100) li.scrollIntoView({ behavior: reduz ? 'auto' : 'smooth', block: 'center' });
      li.querySelector('button').focus({ preventScroll: true });
    });
  });
  ativaPino(1);

  /* ---------- plano de corte ---------- */
  (function () {
    var CW = 2750, CH = 1850;
    var P = [
      ['P01', 'Lateral torre', 10, 10, 2180, 580], ['P08', 'Divisória', 2194, 10, 540, 580],
      ['P02', 'Lateral', 10, 594, 720, 580], ['P02', 'Lateral', 734, 594, 720, 580], ['P02', 'Lateral', 1458, 594, 720, 580], ['P09', 'Fundo gav.', 2182, 594, 550, 540],
      ['P04', 'Porta', 10, 1178, 716, 396], ['P04', 'Porta', 730, 1178, 716, 396], ['P04', 'Porta', 1450, 1178, 716, 396],
      ['P10', 'Lat. gaveta', 2170, 1178, 500, 150], ['P10', 'Lat. gaveta', 2170, 1332, 500, 150],
      ['P05', 'Frente gav.', 10, 1578, 796, 176], ['P05', 'Frente gav.', 810, 1578, 796, 176], ['P05', 'Frente gav.', 1610, 1578, 796, 176],
      ['P06', 'Sarrafo', 10, 1758, 764, 70], ['P06', 'Sarrafo', 810, 1758, 764, 70], ['P06', 'Sarrafo', 1610, 1758, 764, 70],
      ['P11', 'Divisória', 2410, 1578, 320, 250]
    ];
    var usado = P.reduce(function (s, p) { return s + p[4] * p[5]; }, 0);
    var aprov = (usado / (CW * CH) * 100).toFixed(1).replace('.', ',') + '%';
    var s = '<svg viewBox="-130 -150 3010 2120" role="img" aria-label="Plano de corte de uma chapa de MDF 2750 por 1850 milímetros com 18 peças encaixadas e ' + aprov + ' de aproveitamento">';
    s += '<defs><pattern id="hach" patternUnits="userSpaceOnUse" width="34" height="34" patternTransform="rotate(45)"><rect width="34" height="34" fill="#F3EEE5"/><line x1="0" y1="0" x2="0" y2="34" stroke="#A3442A" stroke-opacity=".45" stroke-width="5"/></pattern></defs>';
    s += '<rect x="0" y="0" width="' + CW + '" height="' + CH + '" fill="url(#hach)" stroke="#2E2A25" stroke-width="5"/>';
    P.forEach(function (p) {
      var x = p[2], y = p[3], w = p[4], h = p[5], fs = Math.min(54, h * 0.32, w / 7.2);
      s += '<g><rect class="peca" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="#EADFCB" stroke="#2E2A25" stroke-width="3"/>';
      if (h >= 120) {
        s += '<text x="' + (x + 22) + '" y="' + (y + 22 + fs) + '" font-family="IBM Plex Mono, monospace" font-size="' + fs + '" fill="#A3442A" font-weight="500">' + p[0] + '</text>';
        s += '<text x="' + (x + 22) + '" y="' + (y + 30 + fs * 2.1) + '" font-family="IBM Plex Mono, monospace" font-size="' + fs * 0.85 + '" fill="#2E2A25">' + p[1] + '</text>';
        s += '<text x="' + (x + 22) + '" y="' + (y + 36 + fs * 3.1) + '" font-family="IBM Plex Mono, monospace" font-size="' + fs * 0.8 + '" fill="#5A544B">' + w + ' × ' + h + '</text>';
      } else {
        s += '<text x="' + (x + 18) + '" y="' + (y + h / 2 + fs * 0.35) + '" font-family="IBM Plex Mono, monospace" font-size="' + fs + '" fill="#2E2A25">' + p[0] + ' · ' + w + ' × ' + h + '</text>';
      }
      s += '</g>';
    });
    s += '<path d="M0 -70H2750M0 -95V-45M2750 -95V-45" stroke="#2E2A25" stroke-width="4"/><rect x="1265" y="-105" width="220" height="70" fill="#F8F5EF"/><text x="1375" y="-52" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="52" fill="#2E2A25">2750</text>';
    s += '<path d="M-70 0V1850M-95 0H-45M-95 1850H-45" stroke="#2E2A25" stroke-width="4"/><rect x="-105" y="815" width="70" height="220" fill="#F8F5EF"/><text x="-52" y="925" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="52" fill="#2E2A25" transform="rotate(-90 -52 925)">1850</text>';
    s += '<path d="M2400 1930H2740M2700 1910L2740 1930L2700 1950" fill="none" stroke="#2E2A25" stroke-width="4"/><text x="2390" y="1945" text-anchor="end" font-family="IBM Plex Mono, monospace" font-size="44" fill="#5A544B">sentido do veio</text>';
    s += '</svg>';
    $('#planoCorte').innerHTML = s;
    var alvo = $('#planoAprov'); alvo.textContent = aprov;
  })();

  /* ---------- revelação dos desenhos (com moderação) ---------- */
  if (document.documentElement.classList.contains('anima')) {
    var rev = $$('#matDesenho, #planoCorte');
    rev.forEach(function (el) { el.classList.add('revela'); });
    var obsR = new IntersectionObserver(function (ents) { ents.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('visto'); obsR.unobserve(en.target); } }); }, { threshold: 0.15 });
    rev.forEach(function (el) { obsR.observe(el); });
  }

  /* ---------- ficha de pedido ---------- */
  var ficha = $('#ficha'), passo = 1, TOTAL = 4;
  $('#fichaAmb').innerHTML = ambKeys.map(function (k) { return '<label><input type="checkbox" name="amb" value="' + k + '"> ' + V.ambientes[k].nome + '</label>'; }).join('');
  var medidasEl = $('#fichaMedidas'), medidasVal = {};
  var DICA_MED = { cozinha: 'ex.: 3,20 m + 2,10 m em L', dormitorio: 'ex.: parede de 3,40 m', closet: 'ex.: 2,60 × 1,90 m', homeoffice: 'ex.: bancada de 1,80 m', sala: 'ex.: parede da TV com 4,10 m', banheiro: 'ex.: bancada de 1,20 m', gourmet: 'ex.: 4,50 m lineares' };
  function selecionados() { return $$('input[name="amb"]:checked', ficha).map(function (i) { return i.value; }); }
  function montaMedidas() {
    $$('input', medidasEl).forEach(function (i) { medidasVal[i.dataset.amb] = i.value; });
    medidasEl.innerHTML = selecionados().map(function (k) {
      return '<label class="campo"><span>' + V.ambientes[k].nome + '</span><input type="text" data-amb="' + k + '" inputmode="text" placeholder="' + DICA_MED[k] + '" value="' + esc(medidasVal[k] || '') + '"></label>';
    }).join('');
  }
  function val(nome) { var i = $('[name="' + nome + '"]:checked', ficha) || $('[name="' + nome + '"]:not([type=radio])', ficha); return i ? i.value.trim() : ''; }
  function valida(n) {
    var ok = true, err;
    if (n === 1) { ok = selecionados().length > 0; err = '#erro1'; }
    if (n === 3) { ok = !!val('projeto') && !!val('prazo'); err = '#erro3'; }
    if (n === 4) { ok = !!val('faixa') && !!$('[name="nome"]', ficha).value.trim(); err = '#erro4'; }
    if (err) $(err).hidden = ok;
    if (!ok && err) $('#fichaStatus').textContent = $(err).textContent;
    return ok;
  }
  function linhasFicha() {
    $$('input', medidasEl).forEach(function (i) { medidasVal[i.dataset.amb] = i.value; });
    var amb = selecionados().map(function (k) { var m = (medidasVal[k] || '').trim(); return V.ambientes[k].nome + (m ? ' (' + m + ')' : ''); }).join(', ');
    var l = [['Ambientes', amb], ['Imóvel', val('imovel')], ['Projeto', val('projeto')], ['Prazo', val('prazo')], ['Investimento', val('faixa')], ['Nome', $('[name="nome"]', ficha).value.trim()]];
    var b = $('[name="bairro"]', ficha).value.trim(); if (b) l.push(['Bairro', b]);
    var o = $('[name="obs"]', ficha).value.trim(); if (o) l.push(['Observação', o]);
    return l;
  }
  function irPara(n) {
    passo = n;
    var revisao = n > TOTAL;
    $$('.passo', ficha).forEach(function (fs) { fs.hidden = revisao || +fs.dataset.passo !== n; });
    $$('.ficha-passos li', ficha).forEach(function (li, i) { li.classList.toggle('ativo', i + 1 === n); li.classList.toggle('feito', i + 1 < n); });
    $('#fichaVoltar').hidden = n === 1;
    $('#fichaAvancar').hidden = revisao;
    $('#fichaEnviar').hidden = !revisao;
    $('#fichaResumo').hidden = !revisao;
    $('#fichaAvancar').innerHTML = (n === TOTAL ? 'Revisar ficha' : 'Continuar') + ' <svg class="ic" aria-hidden="true"><use href="#i-seta"/></svg>';
    $('#fichaPg').textContent = revisao ? 'Revisão' : n + ' de ' + TOTAL;
    if (n === 2) montaMedidas();
    if (revisao) {
      var l = linhasFicha();
      $('#fichaResumoLista').innerHTML = l.map(function (x) { return '<div><dt>' + x[0] + '</dt><dd>' + esc(x[1]) + '</dd></div>'; }).join('');
      $('#fichaEnviar').href = zap('Olá! Preenchi a ficha de pedido no site da Veio:\n' + l.map(function (x) { return '• ' + x[0] + ': ' + x[1]; }).join('\n'));
      $('#fichaStatus').textContent = 'Ficha pronta para revisão.';
      $('#fichaResumo .mini-tit').setAttribute('tabindex', '-1'); $('#fichaResumo .mini-tit').focus();
    } else {
      var leg = $('.passo[data-passo="' + n + '"] legend', ficha);
      $('#fichaStatus').textContent = 'Etapa ' + n + ' de ' + TOTAL + ': ' + leg.textContent;
    }
    var topoFicha = ficha.getBoundingClientRect().top;
    if (topoFicha < 0) ficha.scrollIntoView({ behavior: reduz ? 'auto' : 'smooth', block: 'start' });
  }
  $('#fichaAvancar').addEventListener('click', function () {
    if (!valida(passo)) return;
    irPara(passo + 1);
    var alvo = $('.passo:not([hidden]) input', ficha); if (alvo) alvo.focus({ preventScroll: true });
  });
  $('#fichaVoltar').addEventListener('click', function () { irPara(passo - 1); var alvo = $('.passo:not([hidden]) input', ficha); if (alvo) alvo.focus({ preventScroll: true }); });
  ficha.addEventListener('change', function () { ['#erro1', '#erro3', '#erro4'].forEach(function (e) { if (!$(e).hidden) valida(+e.slice(-1)); }); });
  ficha.addEventListener('submit', function (e) { e.preventDefault(); $('#fichaAvancar').click(); });
  ficha.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.target.tagName === 'INPUT') { e.preventDefault(); if (passo <= TOTAL) $('#fichaAvancar').click(); } });
})();
