(function () {
  'use strict';

  var BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 });
  var BRL0 = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
  var NUM = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });
  var PCT = function (x) { return (x * 100).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%'; };
  var m2 = function (v) { return BRL.format(v); };
  var m0 = function (v) { return BRL0.format(Math.round(v)); };
  function ler(el) { var n = parseInt(String(el.value).replace(/\D/g, ''), 10); return isNaN(n) ? 0 : n; }
  function escrever(el, n) { el.value = NUM.format(n); }
  function guardar(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sem armazenamento */ } }
  function recuperar(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }

  /* =========================================================
     1. SIMULADOR DE ENQUADRAMENTO (regras vigentes em out/2026)
     ========================================================= */
  var R = {
    salMin: 1621,                // Decreto 12.797/2025
    tetoINSS: 8475.55,           // Portaria Interministerial MPS/MF 13/2026
    meiLimite: 81000,
    meiDAS: { comercio: 82.05, servico: 86.05 }, // 5% do mínimo + R$1 ICMS / R$5 ISS
    simplesLimite: 4800000,
    sublimite: 3600000,
    // LC 123/2006, redação LC 155/2016: [teto RBT12, alíquota nominal, parcela a deduzir]
    anexos: {
      I:   [[180000, .04, 0], [360000, .073, 5940], [720000, .095, 13860], [1800000, .107, 22500], [3600000, .143, 87300], [4800000, .19, 378000]],
      III: [[180000, .06, 0], [360000, .112, 9360], [720000, .135, 17640], [1800000, .16, 35640], [3600000, .21, 125640], [4800000, .33, 648000]],
      V:   [[180000, .155, 0], [360000, .18, 4500], [720000, .195, 9900], [1800000, .205, 17100], [3600000, .23, 62100], [4800000, .305, 540000]]
    },
    icmsPadrao: .19
  };

  function aliqEfetiva(rbt12, anexo) {
    var faixas = R.anexos[anexo];
    for (var i = 0; i < faixas.length; i++) {
      if (rbt12 <= faixas[i][0]) {
        return { ef: rbt12 > 0 ? (rbt12 * faixas[i][1] - faixas[i][2]) / rbt12 : faixas[0][1], faixa: i + 1, nominal: faixas[i][1] };
      }
    }
    return null;
  }

  function inssSocio(pl) { return pl > 0 ? .11 * Math.min(pl, R.tetoINSS) : 0; }

  // IRRF mensal 2026: tabela progressiva + redução da Lei 15.270/2025
  function irrf(pl) {
    if (pl <= 0) return 0;
    var base = pl - Math.max(inssSocio(pl), 607.20);
    var t = [[2428.80, 0, 0], [2826.65, .075, 182.16], [3751.05, .15, 394.16], [4664.68, .225, 675.49], [Infinity, .275, 908.73]];
    var imp = 0;
    for (var i = 0; i < t.length; i++) { if (base <= t[i][0]) { imp = base * t[i][1] - t[i][2]; break; } }
    imp = Math.max(0, imp);
    var red = 0;
    if (pl <= 5000) red = Math.min(imp, 312.89);
    else if (pl <= 7350) red = Math.max(0, 978.62 - .133145 * pl);
    return Math.max(0, imp - red);
  }

  var ROTULO = { fatorR: 'Serviço profissional', anexo3: 'Serviço em geral', comercio: 'Comércio' };

  function calcular(e) {
    var fat = e.fat, ano = fat * 12, out = [];
    var inss = inssSocio(e.pl), ir = irrf(e.pl);
    var fr = fat > 0 ? (e.pl + e.sal * 1.08) / fat : 0;

    // MEI
    var mei = { id: 'mei', nome: 'MEI', sub: 'valor fixo mensal (DAS-MEI)' };
    if (e.ativ === 'fatorR') { mei.off = 'Profissões intelectuais e regulamentadas não podem ser MEI.'; }
    else if (ano > R.meiLimite * 1.2) { mei.off = 'Acima de R$ 97.200 por ano o MEI é desenquadrado desde janeiro.'; }
    else if (ano > R.meiLimite) { mei.off = 'Passou do limite em até 20%: paga DAS sobre o excesso e vira ME em janeiro.'; }
    else {
      var das = e.ativ === 'comercio' ? R.meiDAS.comercio : R.meiDAS.servico;
      var cpp = e.sal > 0 ? .03 * e.sal : 0;
      mei.mes = das + cpp;
      mei.linhas = [['DAS-MEI fixo', das]];
      if (cpp) mei.linhas.push(['INSS patronal de 3% sobre o funcionário', cpp]);
    }
    out.push(mei);

    // Simples Nacional
    var anexo = e.ativ === 'comercio' ? 'I' : (e.ativ === 'anexo3' || fr >= .28 ? 'III' : 'V');
    var sn = { id: 'simples', nome: 'Simples Nacional · Anexo ' + anexo };
    if (ano > R.simplesLimite) { sn.off = 'Faturamento acima de R$ 4,8 milhões por ano não cabe no Simples.'; sn.sub = 'fora do limite'; }
    else {
      var a = aliqEfetiva(ano, anexo);
      var dasS = fat * a.ef;
      sn.sub = e.ativ === 'fatorR' ? 'fator R de ' + PCT(fr) + ' · ' + a.faixa + 'ª faixa' : a.faixa + 'ª faixa da tabela';
      sn.mes = dasS + inss + ir;
      sn.linhas = [['DAS (alíquota efetiva de ' + PCT(a.ef) + ')', dasS], ['INSS do sócio (11% do pró-labore)', inss], ['IR retido do pró-labore', ir]];
      sn.anexo = anexo; sn.ef = a.ef;
      if (ano > R.sublimite) sn.nota = 'Acima de R$ 3,6 milhões, ICMS e ISS saem do DAS e são pagos à parte (não calculado).';
    }
    out.push(sn);

    // Simples com pró-labore ajustado ao fator R
    if (e.ativ === 'fatorR' && fr < .28 && ano <= R.simplesLimite) {
      var plN = Math.max(e.pl, Math.ceil((.28 * fat - e.sal * 1.08) / 10 - 1e-9) * 10);
      var a3 = aliqEfetiva(ano, 'III');
      var dasA = fat * a3.ef, inssA = inssSocio(plN), irA = irrf(plN);
      out.push({
        id: 'fatorR', nome: 'Simples · Anexo III com fator R', sub: 'pró-labore ajustado para ' + m0(plN),
        mes: dasA + inssA + irA, plN: plN,
        linhas: [['DAS (alíquota efetiva de ' + PCT(a3.ef) + ')', dasA], ['INSS do sócio sobre ' + m0(plN), inssA], ['IR retido do pró-labore', irA]]
      });
    }

    // Lucro Presumido
    var com = e.ativ === 'comercio';
    var bIR = fat * (com ? .08 : .32), bCS = fat * (com ? .12 : .32);
    var irpj = .15 * bIR + .10 * Math.max(0, bIR - 20000);
    var csll = .09 * bCS, pis = .0065 * fat, cofins = .03 * fat;
    var icms = e.icms || R.icmsPadrao;
    var local = com ? icms * fat * (1 - e.cmv) : fat * e.iss;
    var cppP = .20 * (e.pl + e.sal) + .078 * e.sal;
    out.push({
      id: 'presumido', nome: 'Lucro Presumido', sub: com ? 'presunção de 8% (IRPJ) e 12% (CSLL)' : 'presunção de 32% sobre o faturamento',
      mes: irpj + csll + pis + cofins + local + cppP + inss + ir,
      linhas: [['IRPJ (15% + adicional de 10%)', irpj], ['CSLL (9%)', csll], ['PIS (0,65%)', pis], ['Cofins (3%)', cofins],
        [com ? 'ICMS estimado sobre a margem (' + PCT(icms).replace(',0', '') + ')' : 'ISS (' + PCT(e.iss).replace(',0', '') + ')', local],
        ['INSS patronal (20%) + RAT/terceiros', cppP], ['INSS do sócio (11% do pró-labore)', inss], ['IR retido do pró-labore', ir]]
    });

    var validos = out.filter(function (r) { return !r.off; }).sort(function (a, b) { return a.mes - b.mes; });
    return { regimes: out, melhor: validos[0], segundo: validos[1], fr: fr, anexo: anexo, e: e };
  }

  var f = {
    fat: document.getElementById('fat'), fatR: document.getElementById('fat-r'),
    pl: document.getElementById('pl'), sal: document.getElementById('sal'),
    iss: document.getElementById('iss'), icms: document.getElementById('icms'), cmv: document.getElementById('cmv'), cmvOut: document.getElementById('cmv-out')
  };
  if (f.fat) {
    var campoISS = document.getElementById('campo-iss'), campoCMV = document.getElementById('campo-cmv');

    function estado() {
      var ativ = document.querySelector('input[name="ativ"]:checked').value;
      return { ativ: ativ, fat: Math.max(ler(f.fat), 0), pl: ler(f.pl), sal: ler(f.sal), iss: parseFloat(f.iss.value), icms: parseFloat(f.icms.value), cmv: parseInt(f.cmv.value, 10) / 100 };
    }

    function render() {
      var e = estado();
      campoISS.hidden = e.ativ === 'comercio';
      campoCMV.hidden = e.ativ !== 'comercio';
      f.cmvOut.textContent = f.cmv.value + '%';
      var bar = document.getElementById('barras');
      if (e.fat < 500) {
        document.getElementById('reco-nome').textContent = 'Informe o faturamento';
        ['reco-mes', 'reco-ano', 'reco-pct'].forEach(function (id) { document.getElementById(id).textContent = '—'; });
        document.getElementById('reco-eco').textContent = '';
        bar.innerHTML = ''; document.getElementById('explica').innerHTML = '';
        return;
      }
      var r = calcular(e), b = r.melhor;
      document.getElementById('reco-nome').textContent = b.nome;
      document.getElementById('reco-mes').textContent = m0(b.mes);
      document.getElementById('reco-ano').textContent = m0(b.mes * 12);
      document.getElementById('reco-pct').textContent = PCT(b.mes / e.fat);
      document.getElementById('reco-eco').textContent = r.segundo
        ? 'Cerca de ' + m0((r.segundo.mes - b.mes) * 12) + ' por ano a menos que a segunda opção (' + r.segundo.nome + ').' : '';

      var max = Math.max.apply(null, r.regimes.filter(function (x) { return !x.off; }).map(function (x) { return x.mes; }));
      bar.innerHTML = r.regimes.map(function (x) {
        var cls = 'barra' + (x === b ? ' barra--melhor' : '') + (x.off ? ' barra--off' : '');
        var val = x.off ? '<span class="barra__val">não se aplica</span>'
          : '<span class="barra__val">' + m0(x.mes) + '/mês<small>' + m0(x.mes * 12) + '/ano</small></span>';
        var det = x.off ? '<p class="ajuda">' + x.off + '</p>'
          : '<details><summary>Ver a conta</summary><dl>' + x.linhas.map(function (l) { return '<dt>' + l[0] + '</dt><dd>' + m2(l[1]) + '</dd>'; }).join('') +
            '<dt><b>Total por mês</b></dt><dd><b>' + m2(x.mes) + '</b></dd></dl>' + (x.nota ? '<p class="ajuda">' + x.nota + '</p>' : '') + '</details>';
        return '<li class="' + cls + '"><div class="barra__top"><span class="barra__nome">' + x.nome + '<small>' + (x.sub || '') + '</small></span>' + val + '</div>' +
          '<div class="barra__trilho"><span class="barra__fill" style="width:' + (x.off ? 0 : Math.max(2, x.mes / max * 100)).toFixed(1) + '%"></span></div>' + det + '</li>';
      }).join('');

      // Explicação em linguagem simples
      var p = [];
      var fr = r.regimes.filter(function (x) { return x.id === 'fatorR'; })[0];
      var sn = r.regimes.filter(function (x) { return x.id === 'simples'; })[0];
      if (b.id === 'mei') p.push('Até R$ 81 mil por ano, o MEI tem a menor carga: o valor é fixo, independentemente do faturamento do mês. Acompanhe o limite, que equivale a uma média de R$ 6.750 por mês.');
      if (e.ativ === 'fatorR') {
        if (fr) p.push('Hoje seu fator R é de <b>' + PCT(r.fr) + '</b> (pró-labore e salários divididos pelo faturamento). Abaixo de 28%, serviço profissional cai no Anexo V, o mais caro. Com pró-labore de <b>' + m0(fr.plN) + '</b> a empresa passa para o Anexo III' +
          (fr.mes < sn.mes ? ' e, mesmo pagando mais INSS e IR sobre esse pró-labore, a conta fica ' + m0(sn.mes - fr.mes) + ' menor por mês.' : ', mas aqui o INSS e o IR extras comem a economia.'));
        else p.push('Seu fator R é de <b>' + PCT(r.fr) + '</b>, acima de 28%. Por isso a empresa fica no Anexo III, que começa em 6%. Mantenha o pró-labore nesse patamar todo mês.');
      }
      if (e.ativ === 'comercio') p.push('No comércio, o DAS do Anexo I já inclui o ICMS. No Lucro Presumido, o ICMS foi estimado em ' + PCT(e.icms).replace(',0', '') + ' sobre a sua margem de ' + Math.round((1 - e.cmv) * 100) + '%; produtos com substituição tributária ou monofásicos mudam bastante essa conta.');
      if (b.id === 'presumido') p.push('O Lucro Presumido saiu na frente porque, com esse faturamento, as alíquotas do Simples já estão altas. Ele exige mais controle (PIS e Cofins mensais, IRPJ e CSLL por trimestre) e vale confirmar com o histórico real.');
      if (b.id !== 'presumido' && e.fat * 12 > 1800000) p.push('Nessa faixa de faturamento, Simples e Presumido costumam ficar próximos. Uma análise com os números reais dos últimos 12 meses é obrigatória antes de decidir.');
      document.getElementById('explica').innerHTML = p.map(function (t) { return '<p>' + t + '</p>'; }).join('');

      var msg = 'Olá! Fiz a simulação no site da Âncora. Atividade: ' + ROTULO[e.ativ] + '. Faturamento: ' + m0(e.fat) + ' por mês. Pró-labore: ' + m0(e.pl) +
        '. Salários: ' + m0(e.sal) + '. O simulador indicou ' + b.nome + ' (cerca de ' + m0(b.mes) + ' por mês). Quero uma análise com os meus números reais.';
      document.getElementById('sim-wa').href = window.waLink ? window.waLink(msg) : '#';
    }

    function mascara(el) {
      el.addEventListener('input', function () {
        var n = ler(el);
        escrever(el, n);
        try { el.setSelectionRange(el.value.length, el.value.length); } catch (x) { /* ok */ }
        if (el === f.fat) f.fatR.value = Math.min(400000, Math.max(2000, n));
        render();
      });
    }
    [f.fat, f.pl, f.sal].forEach(mascara);
    f.fatR.addEventListener('input', function () { escrever(f.fat, parseInt(f.fatR.value, 10)); render(); });
    [f.iss, f.icms, f.cmv].forEach(function (el) { el.addEventListener('input', render); el.addEventListener('change', render); });
    document.querySelectorAll('input[name="ativ"]').forEach(function (r) { r.addEventListener('change', render); });
    document.getElementById('sim-wa').target = '_blank';
    document.getElementById('sim-wa').rel = 'noopener';
    render();
    window.__simular = calcular; // usado nos testes
  }

  /* =========================================================
     2. CALENDÁRIO DE OBRIGAÇÕES
     ========================================================= */
  var MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  var SEM = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
  var feriadosCache = {};
  function pascoa(y) {
    var a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f2 = Math.floor((b + 8) / 25), g = Math.floor((b - f2 + 1) / 3),
      h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451),
      mes = Math.floor((h + l - 7 * m + 114) / 31), dia = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(y, mes - 1, dia);
  }
  function chave(d) { return d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate(); }
  function feriados(y) {
    if (feriadosCache[y]) return feriadosCache[y];
    var s = {};
    [[0, 1], [3, 21], [4, 1], [8, 7], [9, 12], [10, 2], [10, 15], [10, 20], [11, 25]].forEach(function (x) { s[chave(new Date(y, x[0], x[1]))] = 1; });
    var p = pascoa(y);
    [-48, -47, -2, 60].forEach(function (o) { s[chave(new Date(y, p.getMonth(), p.getDate() + o))] = 1; });
    return (feriadosCache[y] = s);
  }
  function util(d) { var w = d.getDay(); return w !== 0 && w !== 6 && !feriados(d.getFullYear())[chave(d)]; }
  function antes(d) { d = new Date(d); while (!util(d)) d.setDate(d.getDate() - 1); return d; }
  function depois(d) { d = new Date(d); while (!util(d)) d.setDate(d.getDate() + 1); return d; }
  function ultimoUtil(y, m) { return antes(new Date(y, m + 1, 0)); }
  function enesimoUtil(y, m, n) { var d = new Date(y, m, 1), c = 0; while (true) { if (util(d) && ++c === n) return d; d.setDate(d.getDate() + 1); } }

  function obrigacoes(y, m) {
    var comp = MESES[(m + 11) % 12];
    var L = [
      { d: enesimoUtil(y, m, 5), t: 'Salário dos funcionários', x: 'Pagamento até o 5º dia útil do mês (CLT).', g: ['func'] },
      { d: antes(new Date(y, m, 15)), t: 'DCTFWeb e EFD-Reinf', x: 'Declarações que informam o INSS de ' + comp + ' (pró-labore e folha). Quem tem pró-labore também entrega.', g: ['simples', 'presumido', 'func'] },
      { d: antes(new Date(y, m, 15)), t: 'Fechamento da folha no eSocial', x: 'Envio dos eventos da folha de ' + comp + '.', g: ['func'] },
      { d: depois(new Date(y, m, 20)), t: 'DAS do Simples Nacional', x: 'Imposto único sobre o faturamento de ' + comp + '. Se cair em dia sem expediente, passa para o dia útil seguinte.', g: ['simples'] },
      { d: depois(new Date(y, m, 20)), t: 'DAS-MEI', x: 'Valor fixo de R$ 82,05 a R$ 87,05 em 2026, referente a ' + comp + '.', g: ['mei'] },
      { d: antes(new Date(y, m, 20)), t: 'FGTS Digital', x: 'Depósito de 8% sobre os salários de ' + comp + '.', g: ['func'] },
      { d: antes(new Date(y, m, 20)), t: 'INSS e IR retidos (DARF da DCTFWeb)', x: 'Guia do INSS do pró-labore e dos salários, e do IR retido na fonte.', g: ['simples', 'presumido', 'func'] },
      { d: antes(new Date(y, m, 25)), t: 'PIS e Cofins', x: 'Apuração mensal sobre o faturamento de ' + comp + '.', g: ['presumido'] }
    ];
    if ([0, 3, 6, 9].indexOf(m) > -1) L.push({ d: ultimoUtil(y, m), t: 'IRPJ e CSLL do trimestre', x: 'Cota única ou 1ª de 3 cotas do trimestre que terminou em ' + comp + '.', g: ['presumido'] });
    if (m === 0) L.push({ d: ultimoUtil(y, 0), t: 'Prazo para optar pelo Simples Nacional', x: 'Para empresas já abertas que querem entrar no Simples este ano.', g: ['simples', 'presumido'] });
    if (m === 1) L.push({ d: ultimoUtil(y, 1), t: 'Informe de rendimentos aos funcionários', x: 'Comprovante para a declaração de IR de cada funcionário.', g: ['func'] });
    if (m === 2) L.push({ d: antes(new Date(y, 2, 31)), t: 'DEFIS', x: 'Declaração anual do Simples Nacional, com dados do ano anterior.', g: ['simples'] });
    if (m >= 2 && m <= 4) L.push({ d: ultimoUtil(y, 4), t: 'Prazo final da declaração do IRPF', x: m === 4 ? 'Último dia para entregar sem multa (prazo típico: último dia útil de maio).' : 'Período de entrega aberto. Quem entrega cedo recebe a restituição antes.', g: ['pf', 'mei', 'simples', 'presumido'] });
    if (m === 4) L.push({ d: antes(new Date(y, 4, 31)), t: 'DASN-SIMEI', x: 'Declaração anual do MEI com o faturamento do ano anterior.', g: ['mei'] });
    if (m === 10) L.push({ d: antes(new Date(y, 10, 30)), t: '13º salário · 1ª parcela', x: 'Metade do 13º dos funcionários, sem descontos.', g: ['func'] });
    if (m === 11) L.push({ d: antes(new Date(y, 11, 20)), t: '13º salário · 2ª parcela', x: 'Restante do 13º, com INSS e IR descontados.', g: ['func'] });
    return L.filter(function (o) { return o.d.getMonth() === m || o.t.indexOf('IRPF') > -1; }).sort(function (a, b) { return a.d - b.d || a.t.localeCompare(b.t); });
  }

  var lista = document.getElementById('cal-lista');
  if (lista) {
    var hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    var vis = { y: hoje.getFullYear(), m: hoje.getMonth() }, filtro = 'todos';
    var ROT = { mei: 'MEI', simples: 'Simples', presumido: 'Presumido', func: 'Funcionários', pf: 'Pessoa física' };
    function dias(d) { return Math.round((d - hoje) / 864e5); }
    function status(d) {
      var n = dias(d);
      if (n < 0) return ['passou', n === -1 ? 'venceu ontem' : 'venceu há ' + (-n) + ' dias'];
      if (n === 0) return ['hoje', 'vence hoje'];
      if (n <= 7) return ['breve', n === 1 ? 'amanhã' : 'em ' + n + ' dias'];
      return ['futuro', 'em ' + n + ' dias'];
    }
    function passa(o) { return filtro === 'todos' || o.g.indexOf(filtro) > -1; }
    function renderCal() {
      document.getElementById('cal-mes').textContent = MESES[vis.m].charAt(0).toUpperCase() + MESES[vis.m].slice(1) + ' de ' + vis.y;
      var obs = obrigacoes(vis.y, vis.m).filter(passa);
      lista.innerHTML = obs.length ? obs.map(function (o) {
        var s = status(o.d);
        return '<li class="ob ob--' + s[0] + '"><div class="ob__data"><b>' + String(o.d.getDate()).padStart(2, '0') + '</b><span>' + (o.d.getMonth() !== vis.m ? MESES[o.d.getMonth()].slice(0, 3) : SEM[o.d.getDay()]) + '</span></div>' +
          '<div class="ob__corpo"><h4>' + o.t + '</h4><p>' + o.x + '</p><div class="ob__tags"><span class="ob__st">' + s[1] + '</span>' +
          o.g.map(function (g) { return '<span class="ob__tag">' + ROT[g] + '</span>'; }).join('') + '</div></div></li>';
      }).join('') : '<li class="cal__vazio">Nenhuma obrigação típica para esse perfil neste mês.</li>';
      // Próximo vencimento a partir de hoje
      var prox = null;
      for (var k = 0; k < 3 && !prox; k++) {
        var dt = new Date(hoje.getFullYear(), hoje.getMonth() + k, 1);
        prox = obrigacoes(dt.getFullYear(), dt.getMonth()).filter(passa).filter(function (o) { return dias(o.d) >= 0; })[0] || null;
      }
      document.getElementById('cal-prox').innerHTML = prox ? 'Próximo vencimento: <b>' + prox.t + '</b>, ' + SEM[prox.d.getDay()] + ' ' + prox.d.getDate() + ' de ' + MESES[prox.d.getMonth()] + ' (' + status(prox.d)[1] + ').' : '';
    }
    document.getElementById('cal-prev').addEventListener('click', function () { vis.m--; if (vis.m < 0) { vis.m = 11; vis.y--; } renderCal(); });
    document.getElementById('cal-next').addEventListener('click', function () { vis.m++; if (vis.m > 11) { vis.m = 0; vis.y++; } renderCal(); });
    document.querySelectorAll('#calendario .chip').forEach(function (c) {
      c.addEventListener('click', function () {
        filtro = c.getAttribute('data-f');
        document.querySelectorAll('#calendario .chip').forEach(function (x) { x.setAttribute('aria-pressed', String(x === c)); });
        renderCal();
      });
    });
    renderCal();
  }

  /* =========================================================
     3. ABRIR EMPRESA: CHECKLIST
     ========================================================= */
  var ETAPAS = [
    { id: 'conversa', t: 'Definir atividade, sócios e regime', p: '1 dia', q: 'Você e a Âncora', tipos: '*', d: 'Reunião de 30 minutos para escolher o CNAE certo (é ele que define o imposto) e o regime.', docs: ['O que você vai vender ou fazer', 'Quanto espera faturar no primeiro ano', 'Quem serão os sócios e a participação de cada um'] },
    { id: 'docs', t: 'Separar os documentos dos sócios', p: '1 dia', q: 'Você', tipos: '*', d: 'Fotos legíveis bastam.', docs: ['RG ou CNH e CPF', 'Comprovante de residência dos últimos 90 dias', 'Certidão de casamento, se for casado', 'Conta gov.br nível prata ou ouro (para assinar)'] },
    { id: 'viab', t: 'Consulta de viabilidade na prefeitura', p: '1 a 3 dias úteis', q: 'Âncora', tipos: '*', d: 'A prefeitura confirma se a atividade é permitida no endereço. Muitos serviços podem usar endereço residencial.', docs: ['Endereço completo', 'Inscrição do IPTU do imóvel'] },
    { id: 'junta', t: 'Contrato social e registro na Junta Comercial', p: '2 a 5 dias úteis', q: 'Âncora redige, você assina', tipos: '*', d: 'Registro na Junta Comercial do seu estado. Assinatura digital pelo gov.br, sem cartório.', docs: ['Nome empresarial (2 ou 3 opções)', 'Capital social'] },
    { id: 'cnpj', t: 'CNPJ emitido', p: 'junto com o registro', q: 'Automático', tipos: '*', d: 'O CNPJ sai pelo sistema integrado (REDESIM) assim que a junta aprova.', docs: [] },
    { id: 'municipal', t: 'Inscrição municipal e alvará', p: '1 a 10 dias úteis', q: 'Âncora', tipos: '*', d: 'Atividades de baixo risco costumam ter alvará automático. As demais passam por análise.', docs: [] },
    { id: 'ie', t: 'Inscrição estadual na SEFAZ', p: '1 a 5 dias úteis', q: 'Âncora', tipos: 'comercio', d: 'Obrigatória para vender mercadoria e emitir NF-e.', docs: [] },
    { id: 'bombeiros', t: 'Vistoria ou dispensa dos Bombeiros', p: '5 a 15 dias úteis', q: 'Você e a Âncora', tipos: 'comercio', d: 'Depende do tamanho do imóvel e do risco. Lojas pequenas costumam ter dispensa.', docs: ['Planta ou croqui do imóvel', 'Área em m²'] },
    { id: 'conselho', t: 'Registro da empresa no conselho (CRM, CRO, CRP...)', p: '5 a 20 dias úteis', q: 'Âncora', tipos: 'saude', d: 'A PJ precisa de registro próprio e de um responsável técnico.', docs: ['Carteira do conselho', 'Contrato social registrado'] },
    { id: 'sanitaria', t: 'Licença sanitária do consultório', p: '10 a 30 dias úteis', q: 'Você e a Âncora', tipos: 'saude', d: 'Exigida para consultório próprio. Em sala compartilhada ou atendimento online, as regras mudam.', docs: ['Layout da sala', 'Contrato de coleta de resíduos, quando houver'] },
    { id: 'simples', t: 'Opção pelo Simples Nacional', p: 'até 30 dias após a última inscrição', q: 'Âncora', tipos: '*', d: 'Prazo curto. Perder significa ficar fora do Simples até janeiro do ano seguinte.', docs: [] },
    { id: 'cert', t: 'Certificado digital e-CNPJ', p: '1 dia', q: 'Você', tipos: '*', d: 'Validação por videoconferência. Serve para nota fiscal e declarações.', docs: [] },
    { id: 'nota', t: 'Nota fiscal liberada', p: '1 a 3 dias úteis', q: 'Âncora', tipos: '*', d: 'NFS-e para serviços, NF-e ou NFC-e para comércio. Deixamos o emissor configurado e fazemos a primeira nota com você.', docs: [] },
    { id: 'banco', t: 'Conta bancária PJ', p: '1 dia', q: 'Você', tipos: '*', d: 'Separar o dinheiro da empresa do pessoal é o que permite distribuir lucro sem imposto.', docs: ['Contrato social e cartão CNPJ'] }
  ];
  var PRAZO = { servico: '7 a 15 dias úteis', comercio: '10 a 20 dias úteis', saude: '15 a 30 dias úteis' };
  var MSG_TIPO = { servico: 'de serviços', comercio: 'de comércio', saude: 'na área da saúde' };
  var ol = document.getElementById('etapas');
  if (ol) {
    var st = recuperar('ancora-abertura') || {};
    var tipo = st.tipo || 'servico', feitos = st.feitos || [];
    function visiveis() { return ETAPAS.filter(function (e) { return e.tipos === '*' || e.tipos === tipo; }); }
    function salvar() { guardar('ancora-abertura', { tipo: tipo, feitos: feitos }); }
    function progresso() {
      var v = visiveis(), n = v.filter(function (e) { return feitos.indexOf(e.id) > -1; }).length, pc = Math.round(n / v.length * 100);
      document.getElementById('prog-pct').textContent = pc + '%';
      document.getElementById('prog-arco').style.strokeDashoffset = (119.4 * (1 - n / v.length)).toFixed(1);
      document.getElementById('prog-txt').textContent = n === v.length ? 'Todas as etapas concluídas.' : n + ' de ' + v.length + ' etapas concluídas';
      document.getElementById('prog-prazo').textContent = 'Prazo médio total: ' + PRAZO[tipo];
      var falta = v.filter(function (e) { return feitos.indexOf(e.id) < 0; })[0];
      var msg = 'Olá! Quero abrir uma empresa ' + MSG_TIPO[tipo] + ' com a Âncora. Já fiz ' + n + ' de ' + v.length + ' etapas' + (falta ? '; a próxima é: ' + falta.t + '.' : '.');
      var a = document.getElementById('chk-wa'); a.href = window.waLink ? window.waLink(msg) : '#'; a.target = '_blank'; a.rel = 'noopener';
    }
    function renderChk() {
      ol.innerHTML = visiveis().map(function (e) {
        var ok = feitos.indexOf(e.id) > -1;
        return '<li class="etapa' + (ok ? ' etapa--feita' : '') + '" data-id="' + e.id + '"><div class="etapa__lin">' +
          '<span class="etapa__chk"><input type="checkbox" id="e-' + e.id + '"' + (ok ? ' checked' : '') + '><span><svg aria-hidden="true"><use href="#i-check"/></svg></span></span>' +
          '<label class="etapa__tit" for="e-' + e.id + '">' + e.t + '</label><span class="etapa__prazo">' + e.p + '</span></div>' +
          '<button type="button" class="etapa__mais" aria-expanded="false" aria-controls="d-' + e.id + '">Detalhes <svg aria-hidden="true"><use href="#i-chev"/></svg></button>' +
          '<div class="etapa__det" id="d-' + e.id + '" hidden><p>' + e.d + '</p>' + (e.docs.length ? '<ul>' + e.docs.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>' : '') +
          '<span class="quem">Quem faz: ' + e.q + '</span></div></li>';
      }).join('');
      progresso();
    }
    ol.addEventListener('change', function (ev) {
      if (ev.target.type !== 'checkbox') return;
      var li = ev.target.closest('.etapa'), id = li.getAttribute('data-id');
      if (ev.target.checked) { if (feitos.indexOf(id) < 0) feitos.push(id); } else feitos = feitos.filter(function (x) { return x !== id; });
      li.classList.toggle('etapa--feita', ev.target.checked);
      salvar(); progresso();
    });
    ol.addEventListener('click', function (ev) {
      var b = ev.target.closest('.etapa__mais'); if (!b) return;
      var abre = b.getAttribute('aria-expanded') !== 'true';
      b.setAttribute('aria-expanded', String(abre));
      document.getElementById(b.getAttribute('aria-controls')).hidden = !abre;
      b.firstChild.textContent = abre ? 'Fechar ' : 'Detalhes ';
    });
    document.querySelectorAll('.chk__tipo .chip').forEach(function (c) {
      c.setAttribute('aria-pressed', String(c.getAttribute('data-tipo') === tipo));
      c.addEventListener('click', function () {
        tipo = c.getAttribute('data-tipo');
        document.querySelectorAll('.chk__tipo .chip').forEach(function (x) { x.setAttribute('aria-pressed', String(x === c)); });
        salvar(); renderChk();
      });
    });
    document.getElementById('chk-limpar').addEventListener('click', function () { feitos = []; salvar(); renderChk(); });
    renderChk();
  }

  /* =========================================================
     4. PLANOS: funcionários
     ========================================================= */
  var nOut = document.getElementById('func-n');
  if (nOut) {
    var n = 0;
    function renderPlanos() {
      nOut.textContent = n;
      document.querySelectorAll('.plano').forEach(function (p) {
        var base = parseInt(p.getAttribute('data-base'), 10), max = p.getAttribute('data-max');
        var excede = max && n > parseInt(max, 10);
        p.querySelector('.plano__valor').textContent = NUM.format(base + 49 * (excede ? parseInt(max, 10) : n));
        p.classList.toggle('plano--off', !!excede);
        var aviso = p.querySelector('.plano__aviso');
        if (excede && !aviso) { aviso = document.createElement('p'); aviso.className = 'plano__aviso'; aviso.textContent = 'O MEI pode ter só 1 funcionário. Com mais, a empresa precisa virar ME.'; p.querySelector('.plano__preco').after(aviso); }
        if (!excede && aviso) aviso.remove();
      });
    }
    document.getElementById('func-mais').addEventListener('click', function () { if (n < 30) { n++; renderPlanos(); } });
    document.getElementById('func-menos').addEventListener('click', function () { if (n > 0) { n--; renderPlanos(); } });
    renderPlanos();
  }
})();
