/* Torque Oficina Mecânica · ferramentas: sintomas, revisão por km e agendamento */
(function () {
  'use strict';

  var ICO = function (id, cls) {
    return '<svg class="ico' + (cls ? ' ' + cls : '') + '" aria-hidden="true"><use href="assets/icons.svg#' + id + '"/></svg>';
  };
  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  };
  var fmt = function (n) { return Number(n).toLocaleString('pt-BR'); };
  var wa = function (msg) { return window.torqueWA ? window.torqueWA(msg) : 'https://wa.me/556299208147?text=' + encodeURIComponent(msg); };

  /* =====================================================================
     1. O que seu carro está sentindo?
     ===================================================================== */
  var CATS = [
    ['todos', 'Todos'], ['freios', 'Freios'], ['painel', 'Luz no painel'], ['motor', 'Motor'],
    ['direcao', 'Direção e suspensão'], ['ar', 'Ar-condicionado'], ['cambio', 'Câmbio'],
    ['eletrica', 'Bateria e partida'], ['vaz', 'Vazamento e cheiro']
  ];
  var NIVEL = [
    { t: 'Pode programar', c: 'Incomoda, mas não compromete a segurança. Encaixe na próxima revisão.', i: 'i-check', curto: 'pode programar' },
    { t: 'Agende nas próximas semanas', c: 'Não é emergência, mas tende a piorar e ficar mais caro se esperar muito.', i: 'i-prazo', curto: 'em semanas' },
    { t: 'Traga nesta semana', c: 'Dá para rodar com cuidado até aqui, mas não deixe passar dos próximos dias.', i: 'i-relogio', curto: 'nesta semana' },
    { t: 'Melhor não rodar', c: 'Pelo menos um sintoma pode causar acidente ou estragar o motor. Fale com a gente antes de sair com o carro.', i: 'i-alerta', curto: 'não rode' }
  ];
  var SINT = [
    { id: 'freio-chiado', cat: 'freios', t: 'Chiado ou rangido ao frear', s: 'barulho agudo, metálico', lv: 2,
      c: [[80, 'Pastilha no fim', 'muitas têm uma lingueta de metal que chia de propósito quando sobra pouco material.'], [45, 'Disco riscado ou com degrau', 'o disco gasta junto com a pastilha e forma uma borda.'], [25, 'Poeira ou pastilha vitrificada', 'às vezes resolve com limpeza, sem trocar nada.']],
      d: 'Se o chiado virou um ronco grave, de metal com metal, a pastilha acabou e o disco já está sendo comido.' },
    { id: 'freio-pedal', cat: 'freios', t: 'Pedal do freio baixo ou borrachudo', s: 'afunda mais que o normal', lv: 3,
      c: [[60, 'Ar ou fluido vencido no sistema', 'o fluido absorve umidade com o tempo e perde eficiência.'], [45, 'Vazamento de fluido', 'veja se tem mancha perto das rodas e se o reservatório baixou.'], [25, 'Cilindro mestre', 'a vedação interna gasta e o pedal vai descendo.']],
      d: 'Se o pedal vai até o fundo, não rode. Chame a gente ou um guincho.' },
    { id: 'freio-trepida', cat: 'freios', t: 'Volante ou pedal treme ao frear', s: 'só na frenagem', lv: 1,
      c: [[70, 'Disco empenado ou com espessura irregular', 'comum depois de frear forte em descida ou lavar a roda quente.'], [35, 'Bucha ou pivô com folga', 'a folga aparece quando a frente carrega peso na frenagem.'], [15, 'Rolamento de roda', 'costuma vir com um ronco que aumenta com a velocidade.']],
      d: 'Até resolver, evite frear forte em descida longa.' },
    { id: 'luz-injecao', cat: 'painel', t: 'Luz da injeção acesa', s: 'desenho de motor, amarela', lv: 1,
      c: [[50, 'Vela ou bobina falhando', 'o motor treme parado e perde força nas subidas.'], [40, 'Sensor com defeito', 'sonda lambda, MAP ou temperatura. O carro anda normal, mas gasta mais.'], [20, 'Tampa do tanque ou combustível ruim', 'em alguns modelos isso já acende a luz.']],
      d: 'Luz fixa: dá para trazer rodando com calma. Luz piscando: pare, porque é falha forte e pode estragar o catalisador.' },
    { id: 'luz-oleo', cat: 'painel', t: 'Luz do óleo acendeu', s: 'desenho de almotolia, vermelha', lv: 3,
      c: [[55, 'Nível de óleo baixo', 'consumo ou vazamento. Confira a vareta com o carro no plano.'], [30, 'Pressão baixa', 'bomba de óleo gasta ou pescador entupido por borra.'], [15, 'Interruptor de pressão', 'a peça que acende a luz pode estar com defeito.']],
      d: 'Desligue o motor assim que for seguro. Sem pressão de óleo, o motor funde em poucos minutos.' },
    { id: 'luz-bateria', cat: 'painel', t: 'Luz da bateria acesa rodando', s: 'com o motor ligado', lv: 2,
      c: [[65, 'Alternador ou regulador de voltagem', 'o carro está rodando só com a carga da bateria.'], [30, 'Correia de acessórios frouxa ou partida', 'às vezes vem com um chiado ao ligar.']],
      d: 'Desligue ar, som e farol se for de dia e venha direto. A bateria vai descarregando no caminho.' },
    { id: 'temperatura', cat: 'motor', t: 'Temperatura subindo', s: 'ponteiro alto ou luz de arrefecimento', lv: 3,
      c: [[50, 'Falta de água por vazamento', 'mangueira, radiador ou bomba d\'água.'], [35, 'Ventoinha não liga', 'esquenta parado no trânsito e melhora na estrada.'], [25, 'Válvula termostática travada', 'esquenta rápido mesmo com o reservatório cheio.']],
      d: 'Não abra a tampa do reservatório com o motor quente. Desligue e espere esfriar.' },
    { id: 'falhando', cat: 'motor', t: 'Motor falhando ou sem força', s: 'engasga, treme, demora a responder', lv: 2,
      c: [[55, 'Velas, cabos ou bobinas', 'item de revisão que muita gente esquece.'], [35, 'Bico injetor sujo', 'pior em carro que fica muito parado ou roda só no etanol.'], [25, 'Filtro de combustível ou bomba', 'falha mais em subida e com o tanque baixo.']],
      d: 'Se a luz da injeção começar a piscar junto, pare o carro.' },
    { id: 'fumaca', cat: 'motor', t: 'Fumaça no escapamento', s: 'branca, azulada ou preta', lv: 2,
      c: [[45, 'Azulada: queimando óleo', 'anéis ou retentores de válvula gastos.'], [35, 'Branca e contínua, cheiro adocicado', 'líquido de arrefecimento entrando na câmara. Pode ser junta do cabeçote.'], [30, 'Preta: mistura rica', 'sensor, bico ou filtro de ar entupido.']],
      d: 'Fumacinha branca só nos primeiros minutos de manhã fria costuma ser vapor, e é normal.' },
    { id: 'puxando', cat: 'direcao', t: 'Carro puxa para um lado', s: 'em reta, soltando o volante', lv: 1,
      c: [[55, 'Alinhamento fora', 'basta um buraco ou meio-fio para desalinhar.'], [40, 'Calibragem diferente entre os pneus', 'confira antes de tudo. É de graça.'], [25, 'Pinça de freio prendendo', 'a roda daquele lado fica mais quente que as outras.']],
      d: 'Pneu desalinhado gasta só de um lado. Quanto antes alinhar, mais o pneu dura.' },
    { id: 'volante-vibra', cat: 'direcao', t: 'Volante vibra em velocidade', s: 'entre 80 e 110 km/h', lv: 1,
      c: [[70, 'Balanceamento', 'chumbo que caiu ou pneu montado sem balancear.'], [30, 'Pneu com bolha ou roda empenada', 'aparece passando a mão na lateral do pneu.'], [20, 'Terminal ou bandeja com folga', 'costuma vir junto com batida em buraco.']],
      d: '' },
    { id: 'toc-toc', cat: 'direcao', t: 'Batida na suspensão em buraco', s: 'toc-toc, estalo em lombada', lv: 1,
      c: [[55, 'Bieleta da barra estabilizadora', 'peça barata e a causa mais comum do toc-toc.'], [40, 'Batente ou coxim do amortecedor', 'barulho seco quando a roda desce e sobe.'], [30, 'Buchas da bandeja', 'o carro fica "solto" na curva.']],
      d: 'Barulho na suspensão raramente é emergência, mas amortecedor vencido aumenta a distância de frenagem.' },
    { id: 'ar-nao-gela', cat: 'ar', t: 'Ar-condicionado não gela', s: 'ou só gela andando', lv: 0,
      c: [[50, 'Falta de gás por vazamento', 'o gás não acaba sozinho. Se faltou, tem vazamento em algum ponto.'], [35, 'Compressor não arma', 'embreagem do compressor, relé ou sensor de pressão.'], [30, 'Filtro de cabine entupido ou condensador sujo', 'o vento sai fraco ou só gela em movimento.']],
      d: 'Desconfie de quem só completa o gás sem testar vazamento. Daqui a dois meses ele acaba de novo.' },
    { id: 'ar-cheiro', cat: 'ar', t: 'Cheiro ruim ao ligar o ar', s: 'cheiro de mofo ou chulé', lv: 0,
      c: [[70, 'Fungo e bactéria no evaporador', 'a higienização resolve.'], [40, 'Filtro de cabine vencido', 'troca a cada 10.000 km ou um ano.']],
      d: 'Desligue o botão do ar (A/C) uns dois minutos antes de chegar e deixe só a ventilação. Seca o evaporador.' },
    { id: 'tranco', cat: 'cambio', t: 'Tranco ou marcha arranhando', s: 'na saída ou na troca', lv: 1,
      c: [[45, 'Embreagem gasta ou mal regulada', 'no câmbio manual, a marcha arranha ao engatar.'], [35, 'Fluido do câmbio automático vencido', 'muitos manuais dizem "vitalício", mas no calor e no trânsito ele sofre.'], [25, 'Coxim do motor ou do câmbio quebrado', 'dá tranco na saída e na troca de marcha.']],
      d: '' },
    { id: 'patinando', cat: 'cambio', t: 'Embreagem patinando', s: 'acelera e o carro não acompanha', lv: 2,
      c: [[75, 'Disco de embreagem no fim', 'o giro sobe e o carro não ganha velocidade, pior na subida.'], [25, 'Óleo no disco', 'retentor do motor ou do câmbio vazando.']],
      d: 'Quanto mais rodar patinando, maior a chance de estragar o volante do motor, que é caro.' },
    { id: 'nao-pega', cat: 'eletrica', t: 'Demora a pegar ou não pega', s: 'principalmente de manhã', lv: 2,
      c: [[55, 'Bateria no fim', 'dura de 2 a 4 anos. Em cidade quente, mais perto de 2.'], [30, 'Alternador não carrega', 'a luz da bateria fica acesa com o motor ligado.'], [20, 'Consumo fantasma', 'algo puxa energia com o carro desligado: som, rastreador, alarme.']],
      d: 'Se pegou na chupeta, não desligue o motor no caminho até aqui.' },
    { id: 'mancha', cat: 'vaz', t: 'Mancha embaixo do carro', s: 'pinga onde estaciona', lv: 1,
      c: [[50, 'Preta ou marrom: óleo do motor', 'cárter, junta ou retentor.'], [30, 'Verde, rosa ou laranja: arrefecimento', 'fique de olho no nível e no ponteiro de temperatura.'], [20, 'Água limpa perto da frente', 'é a água do ar-condicionado. Normal.']],
      d: 'Ponha um papelão embaixo à noite e tire foto de manhã. Ajuda muito no diagnóstico.' },
    { id: 'cheiro-gasolina', cat: 'vaz', t: 'Cheiro de combustível', s: 'dentro ou perto do carro', lv: 3,
      c: [[50, 'Mangueira ou conexão da linha de combustível', 'ressecada ou solta.'], [30, 'Anel de vedação do bico injetor', 'resseca com o calor do motor.'], [20, 'Cânister', 'o filtro que segura os vapores do tanque.']],
      d: 'Risco de incêndio. Não deixe o carro em garagem fechada até olhar.' }
  ];

  var diag = document.querySelector('[data-diag]');
  if (diag) {
    var catsEl = diag.querySelector('[data-diag-cats]');
    var listEl = diag.querySelector('[data-diag-list]');
    var outEl = diag.querySelector('[data-diag-out]');
    var countEl = diag.querySelector('[data-diag-count]');
    var carroEl = diag.querySelector('[data-diag-carro]');
    var verEl = diag.querySelector('[data-diag-ver]');
    var sel = [];
    var catAtual = 'todos';

    catsEl.innerHTML = CATS.map(function (c) {
      return '<button type="button" class="cat" data-cat="' + c[0] + '" aria-pressed="' + (c[0] === 'todos') + '">' + c[1] + '</button>';
    }).join('');

    function desenhaLista() {
      listEl.innerHTML = SINT.filter(function (s) { return catAtual === 'todos' || s.cat === catAtual; }).map(function (s) {
        var on = sel.indexOf(s.id) > -1;
        return '<button type="button" class="sint" data-sint="' + s.id + '" aria-pressed="' + on + '"><span class="sint__box">' + ICO('i-check') + '</span><span>' + s.t + '<small>' + s.s + '</small></span></button>';
      }).join('');
    }

    var VAZIO = '<div class="diag__vazio">' +
      '<svg viewBox="0 0 360 150" aria-hidden="true">' +
      '<rect x="0" y="10" width="360" height="130" fill="#2A2F38"/>' +
      '<circle cx="110" cy="80" r="50" fill="#14161B"/><circle cx="250" cy="80" r="50" fill="#14161B"/>' +
      '<path d="M78 98 a40 40 0 0 1 64 -44" stroke="#3A404A" stroke-width="6" fill="none"/><path d="M218 98 a40 40 0 0 1 64 -44" stroke="#3A404A" stroke-width="6" fill="none"/>' +
      '<path d="M110 80 L86 62" stroke="#fff" stroke-width="4" stroke-linecap="round"/><path d="M250 80 L276 70" stroke="#FF5A2E" stroke-width="4" stroke-linecap="round"/>' +
      '<rect x="164" y="56" width="32" height="24" fill="#FFC21A"/><path d="M180 61 v8 M180 73 v2" stroke="#14161B" stroke-width="3"/>' +
      '<rect x="160" y="104" width="40" height="18" fill="#D9310B"/>' +
      '</svg><h3>Nenhum sintoma marcado</h3><p>Marque o que você está percebendo no carro. Pode marcar mais de um, porque às vezes um defeito puxa o outro.</p></div>';

    function desenhaResultado() {
      countEl.textContent = sel.length + (sel.length === 1 ? ' marcado' : ' marcados');
      if (verEl) verEl.classList.toggle('is-on', sel.length > 0);
      if (!sel.length) { outEl.innerHTML = VAZIO; return; }
      var itens = SINT.filter(function (s) { return sel.indexOf(s.id) > -1; }).sort(function (a, b) { return b.lv - a.lv; });
      var max = itens[0].lv;
      var nv = NIVEL[max];
      var carro = carroEl.value.trim();
      var msg = 'Olá! Vim pelo site da Torque. Meu carro' + (carro ? ' (' + carro + ')' : '') + ' está com:\n' +
        itens.map(function (s) { return '- ' + s.t.toLowerCase(); }).join('\n') +
        (max === 3 ? '\n\nAcho que é urgente. Posso rodar até aí ou é melhor não ligar o carro?' : '\n\nQueria agendar uma avaliação.');

      var h = '<div class="resumo lv-' + max + '"><span class="resumo__lvl">' + ICO(nv.i) + '</span><div><b>' + nv.t + '</b><span>' + nv.c + '</span></div></div>';
      h += '<div class="medidor lv-' + max + '" aria-hidden="true">' + [0, 1, 2, 3].map(function (i) { return '<i class="' + (i <= max ? 'on' : '') + '"></i>'; }).join('') +
        '<small><span>pode esperar</span><span>não rode</span></small></div>';
      h += '<div class="causas">';
      itens.forEach(function (s) {
        h += '<div class="causa-grupo"><div class="causa-grupo__h"><h4>' + s.t + '</h4><span class="urg lv-' + s.lv + '">' + NIVEL[s.lv].curto + '</span></div><ol>';
        s.c.forEach(function (c) {
          var rot = c[0] >= 60 ? 'muito comum' : c[0] >= 35 ? 'comum' : 'às vezes';
          h += '<li><span class="prob">' + rot + '<i style="--p:' + c[0] + '%"></i></span><span><strong>' + c[1] + '.</strong> ' + c[2] + '</span></li>';
        });
        h += '</ol>' + (s.d ? '<p class="dica"><strong>Dica do balcão:</strong> ' + s.d + '</p>' : '') + '</div>';
      });
      h += '<div class="causas__cta"><a class="btn btn--block" href="' + wa(msg) + '" target="_blank" rel="noopener" data-diag-wa>' + ICO('i-whats') +
        (max === 3 ? 'Falar agora no WhatsApp' : 'Mandar isso no WhatsApp') + '</a>' +
        '<p>A mensagem vai com os sintomas marcados. Isto é orientação geral, não diagnóstico: só olhando o carro dá para confirmar.</p></div></div>';
      outEl.innerHTML = h;
    }

    catsEl.addEventListener('click', function (e) {
      var b = e.target.closest('[data-cat]');
      if (!b) return;
      catAtual = b.getAttribute('data-cat');
      catsEl.querySelectorAll('[data-cat]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      desenhaLista();
    });
    listEl.addEventListener('click', function (e) {
      var b = e.target.closest('[data-sint]');
      if (!b) return;
      var id = b.getAttribute('data-sint');
      var i = sel.indexOf(id);
      if (i > -1) sel.splice(i, 1); else sel.push(id);
      b.setAttribute('aria-pressed', String(i === -1));
      desenhaResultado();
    });
    carroEl.addEventListener('input', function () { if (sel.length) desenhaResultado(); });
    if (verEl) verEl.addEventListener('click', function (e) {
      e.preventDefault();
      outEl.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    });
    desenhaLista();
    desenhaResultado();
  }

  /* =====================================================================
     2. Revisão por quilometragem
     ===================================================================== */
  var ITENS = [
    { n: 'Óleo do motor e filtro de óleo', km: 10000, sev: 5000, meses: 12, o: 'Na norma do manual (API, ACEA ou da montadora), não só na viscosidade.' },
    { n: 'Filtro de ar do motor', km: 20000, sev: 10000 },
    { n: 'Filtro de cabine (ar-condicionado)', km: 10000, sev: 10000 },
    { n: 'Filtro de combustível', km: 30000, sev: 20000, o: 'Em muitos carros novos ele fica dentro do tanque e dura mais.' },
    { n: 'Velas de ignição', km: 40000, sev: 30000, o: 'Vela de irídio pode passar de 60 mil.' },
    { n: 'Fluido de freio', km: 20000, sev: 20000, meses: 24, o: 'Vence por tempo também: a cada 2 anos.' },
    { n: 'Limpeza dos bicos injetores', km: 40000, sev: 30000 },
    { n: 'Líquido de arrefecimento', km: 40000, sev: 40000, meses: 36 },
    { n: 'Correia dentada e tensor', km: 60000, sev: 50000, crit: true, o: 'Se arrebentar, pode entortar válvulas. Alguns motores usam corrente: conferimos pelo modelo.' },
    { n: 'Correia de acessórios', km: 60000, sev: 50000 },
    { n: 'Óleo do câmbio', km: 60000, sev: 40000, o: 'Automático: vários fabricantes pedem troca entre 40 e 60 mil em uso severo.' }
  ];
  var VERIF = [
    { n: 'Pastilhas e discos de freio', km: 10000, o: 'Medição de espessura, com foto.' },
    { n: 'Pneus, rodízio e calibragem', km: 10000 },
    { n: 'Alinhamento e balanceamento', km: 10000 },
    { n: 'Bateria e sistema de carga', km: 10000 },
    { n: 'Mangueiras, vazamentos e fluidos', km: 10000 },
    { n: 'Suspensão: amortecedores, buchas e bieletas', km: 20000 },
    { n: 'Embreagem: curso e ponto do pedal', km: 40000 }
  ];

  var rev = document.querySelector('[data-rev]');
  if (rev) {
    var kmEl = rev.querySelector('[data-rev-km]');
    var rangeEl = rev.querySelector('[data-rev-range]');
    var modEl = rev.querySelector('[data-rev-modelo]');
    var anoEl = rev.querySelector('[data-rev-ano]');
    var sevEl = rev.querySelector('[data-rev-severo]');
    var outR = rev.querySelector('[data-rev-out]');
    var anoAtual = new Date().getFullYear();
    for (var y = anoAtual + 1; y >= 1995; y--) {
      var op = document.createElement('option');
      op.value = y; op.textContent = y;
      anoEl.appendChild(op);
    }
    rev.querySelector('[data-rev-form]').addEventListener('submit', function (e) { e.preventDefault(); });

    function lerKm() { return Math.min(999999, parseInt((kmEl.value || '').replace(/\D/g, ''), 10) || 0); }

    function calcula() {
      var km = lerKm();
      var sev = sevEl.checked;
      var passo = sev ? 5000 : 10000;
      var alvo = Math.max(passo, Math.ceil(km / passo) * passo);
      var falta = alvo - km;
      var ano = parseInt(anoEl.value, 10);
      var idade = ano ? Math.max(0, anoAtual - ano) : null;
      var modelo = modEl.value.trim();
      var iv = function (it) { return sev ? it.sev : it.km; };

      var troca = ITENS.filter(function (it) { return alvo % iv(it) === 0; });
      var porTempo = [];
      if (idade !== null) {
        ITENS.forEach(function (it) {
          if (!it.meses || troca.indexOf(it) > -1) return;
          var kmAno = idade > 0 ? km / idade : km;
          if (idade * 12 >= it.meses && (it.meses > 12 || kmAno < iv(it))) porTempo.push(it);
        });
      }
      var verif = VERIF.filter(function (it) { return alvo % it.km === 0; });
      if (idade !== null && idade >= 3) verif.push({ n: 'Teste de carga da bateria', o: 'Com ' + idade + ' anos de carro, vale testar mesmo se ela parece boa.' });

      var titulo = 'Revisão dos ' + fmt(alvo) + ' km';
      var falTxt = falta === 0 ? 'está na hora' : 'faltam ' + fmt(falta) + ' km';
      var h = '<div class="rev__head"><div><h3>' + titulo + '</h3><p>' + (modelo ? esc(modelo) + (ano ? ' ' + ano : '') + ' · ' : (ano ? ano + ' · ' : '')) + fmt(km) + ' km rodados' + (sev ? ' · uso severo' : '') + '</p></div><span class="falta">' + falTxt + '</span></div>';
      h += '<div class="rev__lists"><div class="rev__col rev__col--troca"><h4><i></i>Trocar nesta revisão</h4><ul>';
      if (!troca.length && !porTempo.length) h += '<li class="rev__vazio">Nada para trocar por quilometragem nesta faixa.</li>';
      troca.forEach(function (it) {
        h += '<li' + (it.crit ? ' class="critico"' : '') + '><b>' + it.n + '</b><em>a cada ' + fmt(iv(it) / 1000) + ' mil</em>' + (it.o ? '<small>' + it.o + '</small>' : '') + '</li>';
      });
      porTempo.forEach(function (it) {
        h += '<li class="alerta"><b>' + it.n + '</b><em>' + it.meses + ' meses</em><small>Seu carro tem ' + idade + (idade === 1 ? ' ano' : ' anos') + '. Se a última troca foi há mais de ' + (it.meses / 12) + (it.meses === 12 ? ' ano' : ' anos') + ', venceu pelo tempo.</small></li>';
      });
      h += '</ul></div><div class="rev__col rev__col--verif"><h4><i></i>Verificar e medir</h4><ul>';
      verif.forEach(function (it) {
        h += '<li><b>' + it.n + '</b>' + (it.km ? '<em>a cada ' + fmt(it.km / 1000) + ' mil</em>' : '<em>por idade</em>') + (it.o ? '<small>' + it.o + '</small>' : '') + '</li>';
      });
      h += '</ul></div></div>';

      /* plano das próximas três revisões */
      var cols = [alvo, alvo + passo, alvo + 2 * passo];
      h += '<div class="plano"><p class="plano__title">Plano das próximas revisões <span>● trocar &nbsp; ○ verificar</span></p><div class="plano__scroll"><table><thead><tr><th scope="col">Item</th>' +
        cols.map(function (c, i) { return '<th scope="col"' + (i === 0 ? ' class="atual"' : '') + '>' + fmt(c / 1000) + ' mil</th>'; }).join('') + '</tr></thead><tbody>';
      ITENS.forEach(function (it) {
        h += '<tr><td>' + it.n + '</td>' + cols.map(function (c, i) {
          var due = c % iv(it) === 0;
          return '<td' + (i === 0 ? ' class="atual"' : '') + '>' + (due ? '<span class="dot dot--t" role="img" aria-label="trocar"></span>' : '<span class="dot dot--n" role="img" aria-label="não"></span>') + '</td>';
        }).join('') + '</tr>';
      });
      h += '<tr><td>Inspeção de freio, pneu e suspensão</td>' + cols.map(function (c, i) { return '<td' + (i === 0 ? ' class="atual"' : '') + '><span class="dot dot--v" role="img" aria-label="verificar"></span></td>'; }).join('') + '</tr>';
      h += '</tbody></table></div></div>';

      var msg = 'Olá! Quero orçar a revisão dos ' + fmt(alvo) + ' km' + (modelo ? ' do meu ' + modelo + (ano ? ' ' + ano : '') : (ano ? ' do meu carro ' + ano : '')) + '. Ele está com ' + fmt(km) + ' km' + (sev ? ' (uso severo)' : '') + '.';
      h += '<div class="rev__cta"><a class="btn" href="' + wa(msg) + '" target="_blank" rel="noopener" data-rev-wa>' + ICO('i-whats') + 'Orçar esta revisão</a><a class="link-arrow" href="servicos.html#revisao">Como fazemos a revisão' + ICO('i-seta') + '</a></div>';
      h += '<p class="aviso">' + ICO('i-alerta') + '<span>Esta tabela é uma média de mercado. <strong>Quem manda é o manual do fabricante</strong> do seu carro, principalmente para correia dentada e câmbio automático. Na oficina, conferimos pelo manual antes de orçar.</span></p>';
      outR.innerHTML = h;
    }

    kmEl.addEventListener('input', function () {
      var km = lerKm();
      kmEl.value = km ? fmt(km) : '';
      rangeEl.value = Math.min(200000, km);
      calcula();
    });
    rangeEl.addEventListener('input', function () { kmEl.value = fmt(rangeEl.value); calcula(); });
    [modEl, anoEl, sevEl].forEach(function (el) { el.addEventListener(el.tagName === 'INPUT' && el.type === 'text' ? 'input' : 'change', calcula); });
    calcula();
  }

  /* =====================================================================
     3. Agendamento
     ===================================================================== */
  var ag = document.querySelector('[data-agenda]');
  if (ag) {
    var diasEl = ag.querySelector('[data-ag-dias]');
    var perEl = ag.querySelector('[data-ag-periodos]');
    var msgEl = ag.querySelector('[data-ag-msg]');
    var DS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
    var DL = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
    var MS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    var escolha = { dia: null, periodo: null };
    var hoje = new Date();
    var dias = [];
    var d = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    var agora = window.torqueAgora || { min: hoje.getHours() * 60 + hoje.getMinutes() };
    if (agora.min >= 15 * 60 || d.getDay() === 0 || (d.getDay() === 6 && agora.min >= 10 * 60)) d.setDate(d.getDate() + 1);
    while (dias.length < 12) {
      if (d.getDay() !== 0) dias.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    diasEl.innerHTML = dias.map(function (x, i) {
      var label = DL[x.getDay()] + ', ' + x.getDate() + ' de ' + MS[x.getMonth()];
      var eHoje = x.toDateString() === hoje.toDateString();
      return '<button type="button" class="dia" data-i="' + i + '" aria-pressed="false" aria-label="' + label + '"><small>' + (eHoje ? 'hoje' : DS[x.getDay()]) + '</small><strong>' + x.getDate() + '</strong><small>' + MS[x.getMonth()] + '</small></button>';
    }).join('');

    function ajustaPeriodos() {
      var dia = escolha.dia;
      var tarde = perEl.querySelector('[data-periodo="tarde"]');
      var manha = perEl.querySelector('[data-periodo="manhã"]');
      var sab = dia && dia.getDay() === 6;
      var eHoje = dia && dia.toDateString() === hoje.toDateString();
      tarde.disabled = !!sab;
      tarde.querySelector('small').textContent = sab ? 'sábado fecha 12h' : 'chegada 13h às 16h';
      manha.disabled = !!(eHoje && agora.min >= 11 * 60);
      [tarde, manha].forEach(function (b) {
        if (b.disabled && b.getAttribute('aria-pressed') === 'true') { b.setAttribute('aria-pressed', 'false'); escolha.periodo = null; }
      });
    }
    diasEl.addEventListener('click', function (e) {
      var b = e.target.closest('.dia');
      if (!b) return;
      diasEl.querySelectorAll('.dia').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      escolha.dia = dias[+b.getAttribute('data-i')];
      ajustaPeriodos();
      msgEl.textContent = '';
    });
    perEl.addEventListener('click', function (e) {
      var b = e.target.closest('.periodo');
      if (!b || b.disabled) return;
      perEl.querySelectorAll('.periodo').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      escolha.periodo = b.getAttribute('data-periodo');
      msgEl.textContent = '';
    });
    ag.querySelector('[data-agenda-form]').addEventListener('submit', function (e) {
      e.preventDefault();
      msgEl.classList.remove('ok');
      if (!escolha.dia) { msgEl.textContent = 'Escolha um dia.'; diasEl.querySelector('.dia').focus(); return; }
      if (!escolha.periodo) { msgEl.textContent = 'Escolha manhã ou tarde.'; perEl.querySelector('.periodo:not(:disabled)').focus(); return; }
      var x = escolha.dia;
      var nome = ag.querySelector('[data-ag-nome]').value.trim();
      var carro = ag.querySelector('[data-ag-carro]').value.trim();
      var dd = ('0' + x.getDate()).slice(-2) + '/' + ('0' + (x.getMonth() + 1)).slice(-2);
      var msg = 'Olá! ' + (nome ? 'Sou ' + nome + '. ' : '') + 'Quero agendar pelo site da Torque:\n' +
        '- Serviço: ' + ag.querySelector('[data-ag-servico]').value + '\n' +
        '- Dia: ' + DL[x.getDay()] + ', ' + dd + ', de ' + escolha.periodo + '\n' +
        (carro ? '- Carro: ' + carro + '\n' : '') + 'Pode confirmar?';
      var url = wa(msg);
      msgEl.classList.add('ok');
      msgEl.textContent = 'Abrindo o WhatsApp com o pedido de ' + DL[x.getDay()] + ', ' + dd + '.';
      ag.setAttribute('data-ultimo-link', url);
      window.open(url, '_blank', 'noopener');
    });
  }
})();
