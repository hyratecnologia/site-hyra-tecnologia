/* Raiar Energia Solar · scripts da página */
(function () {
  'use strict';
  document.documentElement.classList.add('js');

  var ZAP = '556299208147';
  var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var zap = function (msg) { return 'https://wa.me/' + ZAP + '?text=' + encodeURIComponent(msg); };

  var nf0 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });
  var nf1 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  var nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  /* ---------- Menu ---------- */
  var btnMenu = $('.menu-btn');
  var menu = $('#menu');
  function fechaMenu() { btnMenu.setAttribute('aria-expanded', 'false'); menu.classList.remove('aberto'); }
  btnMenu.addEventListener('click', function () {
    var aberto = btnMenu.getAttribute('aria-expanded') === 'true';
    btnMenu.setAttribute('aria-expanded', String(!aberto));
    menu.classList.toggle('aberto', !aberto);
  });
  $$('#menu a').forEach(function (a) { a.addEventListener('click', fechaMenu); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && btnMenu.getAttribute('aria-expanded') === 'true') { fechaMenu(); btnMenu.focus(); }
  });

  /* ---------- Hero: sol percorrendo o dia ---------- */
  (function () {
    var sol = $('.hero .sol');
    var linha = $('.hero .curva-linha');
    var ponto = $('.hero .curva-ponto');
    if (!sol || !linha) return;
    var elHora = $('#hora-sim'), elKw = $('#kw-agora'), elKwh = $('#kwh-dia');
    var KWP = 6.1, PR = 0.8;
    // amostra a curva para achar y por x
    var L = linha.getTotalLength(), amostras = [];
    for (var i = 0; i <= 160; i++) { var p = linha.getPointAtLength(L * i / 160); amostras.push(p); }
    function pontoEmX(x) {
      for (var j = 1; j < amostras.length; j++) if (amostras[j].x >= x) return amostras[j];
      return amostras[amostras.length - 1];
    }
    function pot(h) { if (h <= 6 || h >= 18) return 0; return KWP * PR * Math.pow(Math.sin(Math.PI * (h - 6) / 12), 1.4); }
    // energia acumulada até h (integração numérica simples)
    function energia(h) { var e = 0, passo = 0.05; for (var t = 6; t < h; t += passo) e += pot(t) * passo; return e; }
    function desenha(f) {
      var h = 6 + 12 * f;
      var ang = Math.PI * (1 - f);
      sol.setAttribute('transform', 'translate(' + (280 + 220 * Math.cos(ang)).toFixed(1) + ' ' + (300 - 220 * Math.sin(ang)).toFixed(1) + ')');
      var pt = pontoEmX(480 * f);
      ponto.setAttribute('cx', pt.x.toFixed(1)); ponto.setAttribute('cy', pt.y.toFixed(1));
      var hh = Math.floor(h), mm = Math.floor((h - hh) * 60 / 5) * 5;
      elHora.textContent = (hh < 10 ? '0' : '') + hh + ':' + (mm < 10 ? '0' : '') + mm;
      elKw.textContent = nf2.format(pot(h));
      elKwh.textContent = nf1.format(energia(h));
    }
    if (reduz) { desenha(0.62); return; }
    var DUR = 16000, inicio = null, rodando = true, raf;
    function quadro(t) {
      if (inicio === null) inicio = t;
      var f = ((t - inicio) % DUR) / DUR;
      desenha(f);
      if (rodando) raf = requestAnimationFrame(quadro);
    }
    raf = requestAnimationFrame(quadro);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (ents) {
        ents.forEach(function (e) {
          if (e.isIntersecting && !rodando) { rodando = true; inicio = null; raf = requestAnimationFrame(quadro); }
          else if (!e.isIntersecting) { rodando = false; cancelAnimationFrame(raf); }
        });
      }).observe($('.hero__arte'));
    }
  })();

  /* ---------- Simulador ---------- */
  var HSP = 5.3, PERDAS = 0.20, MOD_W = 610, MOD_M2 = 2.7;
  var DIAS_MES = 30.42;
  // irradiação relativa mês a mês em Goiânia, plano inclinado (perfil CRESESB)
  var IRR_MES = [5.12, 5.40, 5.24, 5.47, 5.38, 5.30, 5.55, 6.05, 5.62, 5.42, 5.06, 5.03];
  var DIAS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  var MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  var MEDIA_IRR = IRR_MES.reduce(function (a, b) { return a + b; }, 0) / 12;
  var SIMULT = { residencial: 0.30, comercial: 0.55, rural: 0.45 };
  var TELHADO = {
    ceramico: { f: 1.00, area: 1.15, nome: 'telhado' },
    fibrocimento: { f: 0.98, area: 1.15, nome: 'telhado' },
    metalico: { f: 0.96, area: 1.12, nome: 'cobertura' },
    laje: { f: 1.07, area: 1.35, nome: 'laje' },
    solo: { f: 1.12, area: 1.6, nome: 'terreno' }
  };
  var NOMES_TELHADO = { ceramico: 'telha cerâmica', fibrocimento: 'fibrocimento', metalico: 'telha metálica', laje: 'laje', solo: 'estrutura no solo' };
  var NOMES_TIPO = { residencial: 'residência', comercial: 'comércio', rural: 'propriedade rural' };
  var NOMES_LIG = { 30: 'monofásico', 50: 'bifásico', 100: 'trifásico' };
  var FIO_B = 0.28;                         // fração da tarifa que é fio B (aprox.)
  var FIO_B_ANO = [0.75, 0.90];             // 2027, 2028; depois 100% (hipótese conservadora)
  var REAJ = 0.05, DEGR = 0.005, OM = 0.005, INV_TROCA = 0.12, ANO_INV = 12, CO2 = 0.055;

  function precoWp(kwp) { return 1.85 + 2.5 / Math.sqrt(Math.max(kwp, 1)); }

  var form = $('#sim-form');
  var inValor = $('#sim-valor'), inFaixa = $('#sim-faixa'), inTarifa = $('#sim-tarifa');
  var inTelhado = $('#sim-telhado'), inLig = $('#sim-ligacao');
  var abaAtual = 'mes', ultimo = null;

  function modo() { return $('input[name="modo"]:checked').value; }
  function tipo() { return $('input[name="tipo"]:checked').value; }

  function calcula() {
    var tarifa = parseFloat(String(inTarifa.value).replace(',', '.'));
    if (!(tarifa > 0.2 && tarifa < 5)) tarifa = 1.05;
    var v = parseFloat(String(inValor.value).replace(',', '.')) || 0;
    var consumo = modo() === 'conta' ? v / tarifa : v;
    var disp = parseInt(inLig.value, 10);
    var t = tipo(), tel = TELHADO[inTelhado.value];
    var alvo = Math.max(consumo - disp, 0);
    var kwhPorKwp = HSP * DIAS_MES * (1 - PERDAS);
    var mods = Math.max(Math.ceil(alvo / kwhPorKwp * 1000 / MOD_W), alvo > 0 ? 2 : 0);
    var kwp = mods * MOD_W / 1000;
    var gerMes = kwp * kwhPorKwp;
    var gerMeses = IRR_MES.map(function (irr, i) { return kwp * irr / MEDIA_IRR * HSP * DIAS[i] * (1 - PERDAS); });
    var gerAno = gerMeses.reduce(function (a, b) { return a + b; }, 0);
    var inv = kwp * 1000 * precoWp(kwp) * tel.f;
    var area = mods * MOD_M2 * tel.area;

    var consAno = consumo * 12;
    var anos = [], acum = -inv, payback = null, somaEco = 0;
    for (var y = 0; y < 25; y++) {
      var tar = tarifa * Math.pow(1 + REAJ, y);
      var ger = gerAno * Math.pow(1 - DEGR, y);
      var usado = Math.min(ger, consAno);
      var simult = usado * SIMULT[t];
      var comp = usado - simult;
      var pctB = y < FIO_B_ANO.length ? FIO_B_ANO[y] : 1;
      var antes = consAno * tar;
      var falta = (consAno - usado) * tar;
      var depois = Math.max(disp * 12 * tar, falta + comp * tar * FIO_B * pctB);
      var custo = inv * OM + (y === ANO_INV - 1 ? inv * INV_TROCA : 0);
      var eco = antes - depois - custo;
      if (payback === null && acum + eco >= 0) payback = y + (-acum / eco);
      acum += eco; somaEco += eco;
      anos.push({ ano: y + 1, eco: eco, acum: acum, antes: antes, depois: depois });
    }
    return {
      consumo: consumo, tarifa: tarifa, kwp: kwp, mods: mods, area: area, gerMes: gerMes, gerMeses: gerMeses,
      inv: inv, anos: anos, payback: payback, saldo25: acum, co2: gerAno * 25 * (1 - DEGR * 6) * CO2 / 1000,
      contaAntes: consumo * tarifa, contaDepois: anos[0].depois / 12, ecoMes: anos[0].eco / 12, ecoAno: anos[0].eco,
      disp: disp, tipo: t
    };
  }

  function txtPayback(p) {
    if (p === null) return 'acima de 25 anos';
    var a = Math.floor(p), m = Math.round((p - a) * 12);
    if (m === 12) { a++; m = 0; }
    var s = '';
    if (a > 0) s += a + (a === 1 ? ' ano' : ' anos');
    if (m > 0) s += (s ? ' e ' : '') + m + (m === 1 ? ' mês' : ' meses');
    return s || 'menos de 1 mês';
  }
  function reais(v) { return nf0.format(Math.round(v)); }
  function milhar(v) { return Math.abs(v) >= 1000 ? nf0.format(Math.round(v / 100) * 100) : nf0.format(Math.round(v)); }

  function atualiza() {
    var r = calcula(); ultimo = r;
    var set = function (id, txt) { var el = document.getElementById(id); if (el) el.textContent = txt; };
    set('r-kwp', nf2.format(r.kwp));
    set('r-mod', String(r.mods));
    set('r-area', nf0.format(Math.round(r.area)));
    set('r-ger', nf0.format(Math.round(r.gerMes)));
    set('r-antes', reais(r.contaAntes));
    set('r-depois', reais(r.contaDepois));
    set('r-eco-mes', reais(r.ecoMes));
    set('r-eco-ano', milhar(r.ecoAno));
    set('r-inv', 'R$ ' + milhar(r.inv * 0.9) + ' a ' + milhar(r.inv * 1.1));
    set('r-pay', txtPayback(r.payback));
    set('r-25', milhar(r.saldo25));
    set('r-co2', nf1.format(r.co2));
    set('m-ref', 'Ref. RAI-' + String(Math.round(r.consumo)).padStart(4, '0') + '-' + r.tipo.slice(0, 3).toUpperCase());

    var alerta = $('#r-alerta'), msg = '';
    if (r.consumo < 180) msg = 'Com consumo abaixo de 180 kWh, a taxa mínima pesa mais e o retorno fica mais longo. Ainda dá para fazer, mas vale conversar antes.';
    else if (r.kwp > 75) msg = 'Acima de 75 kWp o sistema passa a ser minigeração, com prazos e exigências diferentes na distribuidora. Nesses casos, fazemos um estudo sob medida.';
    alerta.hidden = !msg; alerta.textContent = msg;

    var resumo = 'Olá, Raiar! Fiz a simulação no site e quero uma proposta.\n' +
      '- Conta média: R$ ' + reais(r.contaAntes) + ' (' + nf0.format(Math.round(r.consumo)) + ' kWh/mês)\n' +
      '- Imóvel: ' + NOMES_TIPO[r.tipo] + ', ' + NOMES_TELHADO[inTelhado.value] + ', ' + NOMES_LIG[r.disp] + '\n' +
      '- Sistema sugerido: ' + nf2.format(r.kwp) + ' kWp (' + r.mods + ' módulos de 610 W)\n' +
      '- Geração estimada: ' + nf0.format(Math.round(r.gerMes)) + ' kWh/mês\n' +
      '- Economia estimada: R$ ' + reais(r.ecoMes) + '/mês, retorno em ' + txtPayback(r.payback) + '\n' +
      'Podemos agendar a visita técnica?';
    $('#btn-proposta').href = zap(resumo);
    desenhaGrafico();
  }

  /* ---------- Gráficos SVG ---------- */
  var svg = $('#graf-svg'), leg = $('#graf-leg');
  var NS = 'http://www.w3.org/2000/svg';
  function el(nome, attrs, txt) {
    var e = document.createElementNS(NS, nome);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (txt != null) e.textContent = txt;
    return e;
  }
  var W = 560, H = 240, M = { l: 44, r: 8, t: 14, b: 26 };

  function desenhaGrafico() {
    if (!ultimo) return;
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    if (abaAtual === 'mes') graficoMeses(ultimo); else graficoFluxo(ultimo);
  }

  function escalaTopo(max) {
    var exp = Math.pow(10, Math.floor(Math.log10((max || 1) / 4)));
    var passos = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];
    for (var i = 0; i < passos.length; i++) { if (passos[i] * exp * 4 >= max) return passos[i] * exp * 4; }
    return 40 * exp;
  }

  function graficoMeses(r) {
    var max = escalaTopo(Math.max.apply(null, r.gerMeses.concat([r.consumo])) * 1.05);
    var iw = W - M.l - M.r, ih = H - M.t - M.b;
    var y = function (v) { return M.t + ih - v / max * ih; };
    for (var g = 0; g <= 4; g++) {
      var val = max * g / 4;
      svg.appendChild(el('line', { x1: M.l, x2: W - M.r, y1: y(val), y2: y(val), stroke: '#14211C', 'stroke-opacity': g === 0 ? .8 : .12 }));
      svg.appendChild(el('text', { x: M.l - 8, y: y(val) + 4, 'text-anchor': 'end' }, nf0.format(val)));
    }
    var bw = iw / 12;
    r.gerMeses.forEach(function (v, i) {
      var x = M.l + i * bw + bw * 0.18, w = bw * 0.64;
      var rect = el('rect', { class: 'barra', x: x.toFixed(1), y: y(v).toFixed(1), width: w.toFixed(1), height: (y(0) - y(v)).toFixed(1) });
      rect.appendChild(el('title', {}, MESES[i] + ': ' + nf0.format(Math.round(v)) + ' kWh gerados'));
      svg.appendChild(rect);
      svg.appendChild(el('text', { x: (x + w / 2).toFixed(1), y: H - 8, 'text-anchor': 'middle' }, MESES[i]));
    });
    var yc = y(r.consumo);
    svg.appendChild(el('line', { x1: M.l, x2: W - M.r, y1: yc, y2: yc, stroke: '#BF4520', 'stroke-width': 2, 'stroke-dasharray': '6 4' }));
    var rot = el('text', { x: W - M.r, y: yc - 6, 'text-anchor': 'end', class: 'rot-forte' }, 'consumo ' + nf0.format(Math.round(r.consumo)) + ' kWh');
    svg.appendChild(rot);
    svg.setAttribute('aria-label', 'Geração estimada por mês, de ' + nf0.format(Math.round(Math.min.apply(null, r.gerMeses))) + ' a ' + nf0.format(Math.round(Math.max.apply(null, r.gerMeses))) + ' kWh, comparada ao consumo de ' + nf0.format(Math.round(r.consumo)) + ' kWh por mês.');
    leg.innerHTML = '<span><i style="background:#14211C"></i>Geração estimada (kWh)</span><span><i style="background:repeating-linear-gradient(90deg,#BF4520 0 6px,transparent 6px 9px);height:2px;vertical-align:3px"></i>Seu consumo médio</span><span>Meses com menos sol usam os créditos da seca.</span>';
  }

  function graficoFluxo(r) {
    var pts = [{ ano: 0, acum: -r.inv }].concat(r.anos);
    var minV = -r.inv, maxV = Math.max(r.saldo25, 1);
    var topo = escalaTopo(maxV), base = -Math.ceil(r.inv / (topo / 4)) * (topo / 4);
    var iw = W - M.l - M.r, ih = H - M.t - M.b;
    var x = function (a) { return M.l + a / 25 * iw; };
    var y = function (v) { return M.t + (topo - v) / (topo - base) * ih; };
    var passo = topo / 4;
    for (var v = base; v <= topo + 1; v += passo) {
      svg.appendChild(el('line', { x1: M.l, x2: W - M.r, y1: y(v), y2: y(v), stroke: '#14211C', 'stroke-opacity': Math.abs(v) < 1 ? .8 : .12 }));
      svg.appendChild(el('text', { x: M.l - 8, y: y(v) + 4, 'text-anchor': 'end' }, (v / 1000 >= 1000 ? nf1.format(v / 1e6) + ' mi' : nf0.format(v / 1000) + ' mil')));
    }
    [0, 5, 10, 15, 20, 25].forEach(function (a) { svg.appendChild(el('text', { x: x(a), y: H - 8, 'text-anchor': 'middle' }, a === 0 ? 'hoje' : 'ano ' + a)); });
    var d = pts.map(function (p, i) { return (i ? 'L' : 'M') + x(p.ano).toFixed(1) + ' ' + y(p.acum).toFixed(1); }).join(' ');
    svg.appendChild(el('path', { d: d + ' L' + x(25) + ' ' + y(0) + ' L' + x(0) + ' ' + y(0) + 'Z', fill: '#14211C', 'fill-opacity': .07 }));
    svg.appendChild(el('path', { d: d, fill: 'none', stroke: '#14211C', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }));
    // troca do inversor
    var pi = pts[ANO_INV];
    svg.appendChild(el('circle', { cx: x(pi.ano), cy: y(pi.acum), r: 3.5, fill: '#FBF8F2', stroke: '#14211C', 'stroke-width': 1.5 }));
    svg.appendChild(el('text', { x: x(pi.ano) + 6, y: y(pi.acum) + 16 }, 'troca do inversor'));
    if (r.payback !== null) {
      var xp = x(r.payback);
      svg.appendChild(el('line', { x1: xp, x2: xp, y1: y(0), y2: y(base), stroke: '#BF4520', 'stroke-width': 1.5, 'stroke-dasharray': '3 3' }));
      svg.appendChild(el('circle', { cx: xp, cy: y(0), r: 5, fill: '#BF4520' }));
      svg.appendChild(el('text', { x: xp + 8, y: y(0) + 16, class: 'rot-forte' }, 'retorno: ' + txtPayback(r.payback)));
    }
    var ult = pts[pts.length - 1];
    svg.appendChild(el('text', { x: x(25), y: y(ult.acum) - 8, 'text-anchor': 'end', class: 'rot-forte' }, 'R$ ' + milhar(ult.acum)));
    svg.setAttribute('aria-label', 'Caixa acumulado em 25 anos: começa em menos R$ ' + milhar(r.inv) + ', volta a zero em ' + txtPayback(r.payback) + ' e termina em R$ ' + milhar(r.saldo25) + '.');
    leg.innerHTML = '<span>Investimento no ponto central da faixa. Já descontados manutenção e troca do inversor no 12º ano.</span>';
  }

  // abas do gráfico
  var abas = $$('.graf__abas [role="tab"]');
  function ativaAba(btn) {
    abas.forEach(function (b) { var s = b === btn; b.setAttribute('aria-selected', String(s)); b.tabIndex = s ? 0 : -1; });
    $('#graf-painel').setAttribute('aria-labelledby', btn.id);
    abaAtual = btn.id === 'aba-mes' ? 'mes' : 'fluxo';
    desenhaGrafico();
  }
  abas.forEach(function (b, i) {
    b.addEventListener('click', function () { ativaAba(b); });
    b.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        var n = abas[(i + (e.key === 'ArrowRight' ? 1 : abas.length - 1)) % abas.length];
        n.focus(); ativaAba(n);
      }
    });
  });

  // entradas
  function ajustaModo() {
    var conta = modo() === 'conta';
    var tarifa = parseFloat(inTarifa.value) || 1.05;
    var atual = parseFloat(inValor.value) || 0;
    $('#sim-valor-rot').textContent = conta ? 'Conta média (R$ por mês)' : 'Consumo médio (kWh por mês)';
    $('#sim-pre').textContent = conta ? 'R$' : '';
    $('#sim-pre').hidden = !conta;
    $('#sim-suf').textContent = conta ? '/mês' : 'kWh/mês';
    inValor.value = Math.round(conta ? atual * tarifa : atual / tarifa);
    inFaixa.min = conta ? 150 : 120;
    inFaixa.value = inValor.value;
    atualiza();
  }
  $$('input[name="modo"]').forEach(function (r) { r.addEventListener('change', ajustaModo); });
  inFaixa.addEventListener('input', function () { inValor.value = inFaixa.value; atualiza(); });
  inValor.addEventListener('input', function () { inFaixa.value = inValor.value; atualiza(); });
  form.addEventListener('change', atualiza);
  inTarifa.addEventListener('input', atualiza);
  form.addEventListener('submit', function (e) { e.preventDefault(); });

  // atalho do hero
  $('#form-rapido').addEventListener('submit', function (e) {
    e.preventDefault();
    var v = parseFloat($('#rapido-valor').value);
    if ($('#modo-kwh').checked) { $('#modo-conta').checked = true; ajustaModo(); }
    if (v > 0) { inValor.value = Math.round(v); inFaixa.value = inValor.value; atualiza(); }
    $('#simulador').scrollIntoView({ behavior: reduz ? 'auto' : 'smooth' });
    setTimeout(function () { inValor.focus({ preventScroll: true }); }, reduz ? 0 : 600);
  });

  atualiza();

  /* ---------- Diagrama do sistema ---------- */
  var PECAS = [
    { t: 'Módulos fotovoltaicos',
      dia: 'Cada módulo de 610 W tem 132 meias-células de silício monocristalino. A luz solta elétrons nas células e gera corrente contínua. Ligamos de 8 a 14 módulos em série, formando uma string.',
      noite: 'Sem luz, a tensão cai a zero. Os módulos ficam parados até o amanhecer, sem consumo e sem desgaste.',
      dado: 'Ao meio-dia de um dia limpo, um módulo de 610 W entrega na prática uns 500 W: a 60 °C sobre o telhado, o calor rouba de 8% a 12%.' },
    { t: 'Inversor',
      dia: 'Converte a corrente contínua dos módulos em alternada, na tensão e frequência da rede (60 Hz). A cada segundo ele procura o ponto de máxima potência das strings (MPPT).',
      noite: 'Em espera. Ele desliga sozinho quando a tensão dos módulos cai no fim da tarde e religa de manhã.',
      dado: 'Eficiência de 97% a 98,5%. Se a rede cair, ele se desconecta em menos de 2 segundos: é a proteção anti-ilhamento, que protege quem trabalha nos postes.' },
    { t: 'Quadro de distribuição e casa',
      dia: 'A energia do inversor entra no quadro por um disjuntor exclusivo, com DPS contra surtos. Geladeira, ar-condicionado e bomba usam primeiro a energia do telhado: é o consumo simultâneo, que não paga fio B.',
      noite: 'A casa funciona normalmente, agora com energia da rede. Não há chave para virar nem nada para fazer; você não percebe a troca.',
      dado: 'Numa casa, de 25% a 35% da geração é usada na hora. Num comércio aberto de dia, de 45% a 70%.' },
    { t: 'Medidor bidirecional',
      dia: 'A Equatorial troca o seu medidor por um que registra em separado a energia que entra e a que sai. O excedente do dia é injetado na rede e vira crédito em kWh.',
      noite: 'Agora o medidor conta energia entrando. No fechamento do mês, esse consumo é abatido com os créditos do dia, pagando a parcela do fio B.',
      dado: 'Na conta aparecem duas leituras: energia consumida e energia injetada. O crédito que sobra vale por 60 meses.' },
    { t: 'Rede da distribuidora',
      dia: 'A rede funciona como uma conta corrente de energia: guarda os seus créditos. Fisicamente, o excedente é consumido pelos vizinhos mais próximos.',
      noite: 'A rede devolve a energia que você precisa. É aqui que entra o fio B: o uso de postes, cabos e transformadores para trazer essa energia de volta.',
      dado: 'Sem rede, o sistema on-grid não funciona: é ela que dá a referência de tensão e frequência para o inversor. Por isso não há luz quando falta energia na rua.' }
  ];
  var ESTADO = {
    dia: '12h · 5,1 kW gerando · a casa usa 1,4 kW · 3,7 kW indo para a rede',
    noite: '21h · geração zero · a casa puxa 1,8 kW da rede e usa os créditos'
  };
  var fluxo = $('#fluxo'), pecaAtual = 0;
  function mostraPeca(i) {
    pecaAtual = i;
    var per = fluxo.getAttribute('data-periodo');
    $$('.peca').forEach(function (b) { b.setAttribute('aria-pressed', String(+b.getAttribute('data-peca') === i)); });
    $('#det-titulo').textContent = PECAS[i].t;
    $('#det-texto').textContent = PECAS[i][per];
    $('#det-dado').textContent = PECAS[i].dado;
    $('#fluxo-estado').textContent = ESTADO[per];
  }
  $$('.peca').forEach(function (b) { b.addEventListener('click', function () { mostraPeca(+b.getAttribute('data-peca')); }); });
  $$('.periodo__op').forEach(function (b) {
    b.addEventListener('click', function () {
      $$('.periodo__op').forEach(function (o) { o.setAttribute('aria-pressed', String(o === b)); });
      fluxo.setAttribute('data-periodo', b.getAttribute('data-periodo'));
      mostraPeca(pecaAtual);
    });
  });
  mostraPeca(0);

  /* ---------- Gráficos que se desenham ao entrar na tela ---------- */
  var animaveis = $$('.escada, .gantt');
  if ('IntersectionObserver' in window && !reduz) {
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visto'); io.unobserve(e.target); } });
    }, { threshold: 0, rootMargin: '0px 0px -12% 0px' });
    animaveis.forEach(function (a) { io.observe(a); });
  } else animaveis.forEach(function (a) { a.classList.add('visto'); });

  /* ---------- Formulário de contato ---------- */
  $('#form-contato').addEventListener('submit', function (e) {
    e.preventDefault();
    var nome = $('#c-nome').value.trim();
    var erro = $('#c-erro');
    if (!nome) { erro.hidden = false; $('#c-nome').setAttribute('aria-invalid', 'true'); $('#c-nome').focus(); return; }
    erro.hidden = true; $('#c-nome').removeAttribute('aria-invalid');
    var conta = $('#c-conta').value, msg = $('#c-msg').value.trim();
    var txt = 'Olá, Raiar! Sou ' + nome + ', de ' + ($('#c-cidade').value.trim() || 'Goiânia') + '.\n' +
      'Quero agendar uma visita técnica para ' + $('#c-tipo').value.toLowerCase() + '.' +
      (conta ? '\nConta média: R$ ' + conta + ' por mês.' : '') +
      (msg ? '\nObservação: ' + msg : '');
    window.open(zap(txt), '_blank', 'noopener');
  });

  var ano = $('#ano'); if (ano) ano.textContent = new Date().getFullYear();
})();
