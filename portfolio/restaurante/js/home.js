/* Casa Brasa · página inicial */
(function () {
  "use strict";
  var D = window.CASA_BRASA, C = window.Casa;
  var porId = {};
  D.itens.forEach(function (i) { porId[i.id] = i; });

  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }

  /* ---------- Pedidos da casa ---------- */
  var CORES = { entradas: "pequi", brasa: "tijolo", peixes: "folha", guarnicoes: "pequi", executivo: "brasa", sobremesas: "brasa", "sem-alcool": "folha", drinks: "carvao", cervejas: "tijolo", vinhos: "carvao" };
  function destaques() {
    var ids = ["provoleta-baru", "couve-flor-brasa", "arroz-pequi", "barriga-laqueada", "pamonha-brulee", "pequi-tonic"];
    var ul = document.getElementById("lista-destaques");
    if (!ul) return;
    ids.forEach(function (id) {
      var it = porId[id]; if (!it) return;
      var li = el("li"), a = el("a");
      a.href = "cardapio.html#" + it.id;
      var tile = el("span", "mini foto--" + (CORES[it.cat] || "pequi"));
      tile.setAttribute("aria-hidden", "true");
      tile.innerHTML = '<svg viewBox="0 0 100 100"><use href="img/casa.svg#' + (it.ilustra || "prato") + '"/></svg>';
      var txt = el("span", "mini-texto");
      txt.appendChild(el("span", "mini-nome", it.nome));
      txt.appendChild(el("span", "mini-desc", it.desc));
      a.appendChild(tile); a.appendChild(txt);
      a.appendChild(el("span", "mini-preco", C.reais(it.preco)));
      li.appendChild(a); ul.appendChild(li);
    });
    [["preco-costela", "costela-de-chao"], ["preco-picanha", "picanha-da-casa"], ["preco-pintado", "pintado-bananeira"]].forEach(function (p) {
      var e = document.getElementById(p[0]);
      if (e && porId[p[1]]) e.textContent = C.reais(porId[p[1]].preco);
    });
  }

  /* ---------- Almoço executivo ---------- */
  function executivo() {
    var agora = C.agora(), dia = agora.getDay(), m = agora.getHours() * 60 + agora.getMinutes();
    var execs = D.itens.filter(function (i) { return i.cat === "executivo"; }).sort(function (a, b) { return a.dia - b.dia; });
    var corpo = document.getElementById("exec-corpo");
    var nomes = ["", "Segunda", "Terça", "Quarta", "Quinta", "Sexta"];
    execs.forEach(function (it) {
      var tr = el("tr"); if (it.dia === dia) tr.className = "hoje-linha";
      var th = el("th", null, nomes[it.dia]); th.scope = "row";
      if (it.dia === dia) th.appendChild(el("span", "tag-hoje", "hoje"));
      var td = el("td");
      td.appendChild(el("span", "prato-nome", it.nome));
      td.appendChild(el("p", "prato-desc", it.desc));
      var tv = el("td", "v preco", C.reais(it.preco));
      tr.appendChild(th); tr.appendChild(td); tr.appendChild(tv);
      corpo.appendChild(tr);
    });

    var fimAlmoco = C.min("15:00");
    var alvo, rotulo, nota, aviso, ehHoje = false;
    if (dia >= 1 && dia <= 5 && m < fimAlmoco) {
      alvo = execs.filter(function (e) { return e.dia === dia; })[0];
      rotulo = "Executivo de hoje, " + nomes[dia].toLowerCase();
      nota = m < C.min("11:30") ? "sai às 11h30" : "saindo agora";
      aviso = "Servido até as 15h. Inclui salada ou caldo e a sobremesa do dia.";
      ehHoje = true;
    } else {
      var prox = dia >= 1 && dia <= 4 ? dia + 1 : 1;
      alvo = execs.filter(function (e) { return e.dia === prox; })[0];
      rotulo = (prox === dia + 1 ? "Amanhã, " : "Na ") + nomes[prox].toLowerCase();
      nota = dia === 0 || dia === 6 ? "fim de semana não tem executivo" : "o de hoje já encerrou";
      aviso = dia === 0 || dia === 6
        ? "Sábado e domingo o almoço é à la carte. O executivo volta na segunda."
        : "O executivo é servido até as 15h. Você pode deixar o pedido de amanhã combinado.";
    }
    if (!alvo) return;
    document.getElementById("exec-nota").textContent = nota;
    document.getElementById("exec-dia").textContent = rotulo;
    document.getElementById("exec-nome").textContent = alvo.nome;
    document.getElementById("exec-preco").textContent = C.reais(alvo.preco);
    document.getElementById("exec-aviso").textContent = aviso;
    var msg = ehHoje
      ? "Olá, Casa Brasa! Quero pedir o executivo de hoje: " + alvo.nome + " (" + C.reais(alvo.preco) + "). Vou querer: ( ) retirar ( ) delivery."
      : "Olá, Casa Brasa! Quero encomendar o executivo de " + nomes[alvo.dia].toLowerCase() + ": " + alvo.nome + " (" + C.reais(alvo.preco) + ").";
    document.getElementById("exec-pedir").href = C.wa(msg);

    var hoje = document.getElementById("hoje-exec"), hr = document.getElementById("hoje-exec-rotulo");
    if (hoje) {
      hoje.innerHTML = "";
      var a = el("a"); a.href = "#executivo";
      a.textContent = alvo.nome + " · " + C.reais(alvo.preco);
      hoje.appendChild(a);
      hr.textContent = ehHoje ? "Executivo de hoje" : (dia === 0 || dia === 6 ? "Executivo de segunda" : "Executivo de amanhã");
    }
  }

  /* ---------- Tabela de horários ---------- */
  function horarios() {
    var tb = document.getElementById("tabela-horarios"); if (!tb) return;
    var hoje = C.agora().getDay();
    var nomes = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    [1, 2, 3, 4, 5, 6, 0].forEach(function (d) {
      var tr = el("tr"); if (d === hoje) tr.className = "hoje-linha";
      var th = el("th", null, nomes[d]); th.scope = "row";
      tr.appendChild(th);
      tr.appendChild(el("td", null, C.textoTurnos(d)));
      tb.appendChild(tr);
    });
  }

  /* ---------- Reserva ---------- */
  function iso(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }

  function horariosReserva(data, agora) {
    var lista = [];
    C.turnos(data.getDay()).forEach(function (t) {
      for (var m = t[0]; m <= t[1] - 90; m += 30) lista.push(m);
    });
    if (iso(data) === iso(agora)) {
      var limite = agora.getHours() * 60 + agora.getMinutes() + 30;
      lista = lista.filter(function (m) { return m >= limite; });
    }
    return lista;
  }

  function reserva() {
    var f = document.getElementById("form-reserva"); if (!f) return;
    var agora = C.agora();
    var inData = f.querySelector("#r-data"), sel = f.querySelector("#r-hora"), pes = f.querySelector("#r-pessoas");
    var avData = document.getElementById("r-aviso-data"), avPes = document.getElementById("r-aviso-pessoas"), avNome = document.getElementById("r-aviso-nome");
    var max = new Date(agora); max.setDate(max.getDate() + 60);
    inData.min = iso(agora); inData.max = iso(max);

    function lerData() {
      if (!inData.value) return null;
      var p = inData.value.split("-");
      return new Date(+p[0], +p[1] - 1, +p[2]);
    }

    function preencheHorarios() {
      var d = lerData();
      sel.innerHTML = "";
      avData.textContent = "";
      if (!d) { sel.appendChild(new Option("Escolha a data", "")); return; }
      var hs = horariosReserva(d, C.agora());
      if (!hs.length) {
        sel.appendChild(new Option("Sem horários", ""));
        avData.textContent = iso(d) === iso(C.agora())
          ? "Para hoje não temos mais horários de reserva. Venha direto ou escolha outro dia."
          : "Não abrimos nesse horário. Escolha outra data.";
        return;
      }
      sel.appendChild(new Option("Escolha", ""));
      hs.forEach(function (m) {
        var h = Math.floor(m / 60), mm = m % 60;
        var rot = String(h).padStart(2, "0") + ":" + String(mm).padStart(2, "0");
        sel.appendChild(new Option(rot + (m < 960 ? " · almoço" : " · jantar"), rot));
      });
      if (d.getDay() === 1) avData.textContent = "Na segunda abrimos só no almoço.";
    }

    // data inicial: hoje, se ainda houver horário; senão o próximo dia com horário
    var d0 = new Date(agora);
    for (var k = 0; k < 8; k++) {
      if (horariosReserva(d0, agora).length) break;
      d0.setDate(d0.getDate() + 1);
    }
    inData.value = iso(d0);
    preencheHorarios();
    inData.addEventListener("change", preencheHorarios);

    function ajustaPessoas(v) {
      v = Math.max(1, Math.min(18, Math.round(v) || 1));
      pes.value = v;
      avPes.textContent = v >= 13 ? "Grupo de " + v + ": vamos reservar a Sala da Brasa, com cardápio combinado antes." : "";
    }
    f.querySelectorAll("[data-passo]").forEach(function (b) {
      b.addEventListener("click", function () { ajustaPessoas(+pes.value + (+b.getAttribute("data-passo"))); });
    });
    pes.addEventListener("change", function () { ajustaPessoas(+pes.value); });

    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      var d = lerData();
      if (!d || !sel.value) { avData.textContent = !d ? "Escolha a data." : (avData.textContent || "Escolha o horário."); ok = false; if (!d) inData.focus(); else sel.focus(); }
      var nome = f.querySelector("#r-nome").value.trim();
      if (nome.length < 2) { avNome.textContent = "Em nome de quem fica a reserva?"; if (ok) f.querySelector("#r-nome").focus(); ok = false; }
      else avNome.textContent = "";
      if (!ok) return;

      var dias = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
      var oc = f.querySelector("input[name=ocasiao]:checked").value;
      var area = f.querySelector("input[name=area]:checked").value;
      var obs = f.querySelector("#r-obs").value.trim();
      var linhas = [
        "Olá, Casa Brasa! Quero reservar uma mesa.",
        "",
        "*Data:* " + dias[d.getDay()] + ", " + String(d.getDate()).padStart(2, "0") + "/" + String(d.getMonth() + 1).padStart(2, "0") + "/" + d.getFullYear(),
        "*Horário:* " + sel.value,
        "*Pessoas:* " + pes.value,
        "*Onde sentar:* " + area
      ];
      if (oc) linhas.push("*Ocasião:* " + oc);
      linhas.push("*Nome:* " + nome);
      if (obs) linhas.push("*Observação:* " + obs);
      window.open(C.wa(linhas.join("\n")), "_blank", "noopener");
      C.recado("Abrimos o WhatsApp com a sua reserva. É só enviar.");
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    destaques(); executivo(); horarios(); reserva();
  });
})();
