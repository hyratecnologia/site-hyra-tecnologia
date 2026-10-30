/* Casa Brasa · cardápio online, detalhe do prato e sacola */
(function () {
  "use strict";
  var D = window.CASA_BRASA, C = window.Casa, CFG = D.config;
  var CHAVE = "casabrasa:sacola:v1";
  var porId = {};
  D.itens.forEach(function (i) { porId[i.id] = i; });
  var catPorId = {};
  D.categorias.forEach(function (c) { catPorId[c.id] = c; });
  var NOMES_DIA = ["", "Segunda", "Terça", "Quarta", "Quinta", "Sexta"];
  var TAGS = {
    veg: { nome: "Vegetariano", html: '<span class="m m-v" title="Vegetariano">V</span>' },
    sg: { nome: "Sem glúten", html: '<span class="m m-sg" title="Sem glúten">SG</span>' },
    picante: { nome: "Picante", html: '<span class="m m-picante" title="Picante"><svg aria-hidden="true"><use href="img/tracos.svg#ic-pimenta"/></svg></span>' },
    casa: { nome: "Da casa", html: '<span class="m m-casa" title="Receita da casa">da casa</span>' },
    dividir: { nome: "Para dividir", html: '<span class="m m-dividir" title="Para dividir">para dividir</span>' }
  };

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(t) { return String(t).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function norm(t) { return String(t).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }

  function ilu(it, alt) {
    if (it.foto) return '<img src="' + esc(it.foto) + '" alt="' + esc(alt ? it.nome : "") + '" loading="lazy">';
    return '<svg viewBox="0 0 64 64" aria-hidden="true"><use href="img/tracos.svg#' + esc(it.ilustra || "prato") + '"/></svg>';
  }
  function marcas(it, sr) {
    var h = (it.tags || []).map(function (t) { return TAGS[t] ? TAGS[t].html + (sr ? '<span class="sr">' + TAGS[t].nome + '</span>' : "") : ""; }).join("");
    return h;
  }

  /* ================= Montagem do cardápio ================= */
  var hoje = C.agora().getDay();
  function monta() {
    var box = $("#categorias"), nav = $("#cats");
    var html = "", navHtml = "";
    D.categorias.forEach(function (cat, n) {
      var itens = D.itens.filter(function (i) { return i.cat === cat.id; });
      if (!itens.length) return;
      navHtml += '<a href="#cat-' + cat.id + '" data-cat="' + cat.id + '">' + esc(cat.nome) + "</a>";
      html += '<section class="cat" id="cat-' + cat.id + '" data-cat="' + cat.id + '" aria-labelledby="h-' + cat.id + '">' +
        '<header class="cat-cab"><span class="cat-num">' + String(n + 1).padStart(2, "0") + '</span><h2 id="h-' + cat.id + '">' + esc(cat.nome) + "</h2>" +
        (cat.nota ? "<p>" + esc(cat.nota) + "</p>" : "") + "</header><div class=\"itens\">";
      itens.forEach(function (it) {
        var dia = it.dia ? '<span class="item-dia">' + NOMES_DIA[it.dia] + (it.dia === hoje ? ' <span class="carimbo">hoje</span>' : "") + "</span>" : "";
        var serve = it.serve ? '<span class="item-serve">serve ' + esc(it.serve) + "</span>" : "";
        var esgot = it.esgotado ? '<span class="item-serve" style="color:var(--brasa)">esgotado hoje</span>' : "";
        html += '<article class="item' + (it.esgotado ? " esgotado" : "") + '" id="' + it.id + '" data-id="' + it.id + '" data-busca="' + esc(norm(it.nome + " " + it.desc + " " + cat.nome + " " + (it.longa || ""))) + '">' +
          '<div class="item-texto">' + dia +
            '<h3 class="linha-preco"><button type="button" class="item-abrir" data-abrir="' + it.id + '">' + esc(it.nome) + '</button><span class="pontos" aria-hidden="true"></span><span class="preco">' + C.reais(it.preco) + "</span></h3>" +
            '<p class="item-desc">' + esc(it.desc) + "</p>" +
            '<p class="item-marcas">' + marcas(it, true) + serve + esgot + "</p>" +
          "</div>" +
          '<div class="item-ilu">' + ilu(it, false) + "</div>" +
          '<span class="item-qtd" data-qtd="' + it.id + '" aria-hidden="true"></span>' +
          '<button type="button" class="item-add" data-add="' + it.id + '" aria-label="Adicionar ' + esc(it.nome) + ' à sacola"' + (it.esgotado ? " disabled" : "") + '><svg aria-hidden="true"><use href="img/tracos.svg#ic-mais"/></svg></button>' +
          "</article>";
      });
      html += "</div></section>";
    });
    box.innerHTML = html;
    nav.innerHTML = navHtml;

    $("#t-delivery").textContent = CFG.tempoDelivery;
    $("#t-retirada").textContent = CFG.tempoRetirada;
    $("#t-taxa").textContent = C.reais(CFG.taxaEntrega);
    $("#t-minimo").textContent = C.reais(CFG.pedidoMinimoDelivery);
    $("#modo-delivery-t").textContent = CFG.tempoDelivery;
    $("#modo-retirada-t").textContent = CFG.tempoRetirada;
  }

  /* ================= Busca e filtros ================= */
  var filtrosAtivos = [];
  function aplicaFiltro() {
    var q = norm($("#busca").value.trim());
    var termos = q.split(/\s+/).filter(Boolean);
    var total = 0;
    $$(".cat").forEach(function (sec) {
      var vis = 0;
      $$(".item", sec).forEach(function (art) {
        var it = porId[art.dataset.id];
        var okTexto = termos.every(function (t) { return art.dataset.busca.indexOf(t) !== -1; });
        var okTag = filtrosAtivos.every(function (t) { return it.tags.indexOf(t) !== -1; });
        var ok = okTexto && okTag;
        art.hidden = !ok;
        if (ok) vis++;
      });
      sec.hidden = vis === 0;
      var link = $('.cats a[data-cat="' + sec.dataset.cat + '"]');
      if (link) link.hidden = vis === 0;
      total += vis;
    });
    $("#vazio").hidden = total > 0;
    var filtrando = termos.length || filtrosAtivos.length;
    $("#resultado").textContent = filtrando ? total + (total === 1 ? " item encontrado" : " itens encontrados") : "";
    $("#qtd-filtro").textContent = filtrosAtivos.length ? "(" + filtrosAtivos.length + ")" : "";
    $("#btn-filtro").classList.toggle("ativo", filtrosAtivos.length > 0);
    marcaCategoria();
  }
  function limpar() {
    $("#busca").value = ""; filtrosAtivos = [];
    $$("#filtros [data-tag]").forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
    aplicaFiltro();
  }
  function filtros() {
    var t;
    $("#busca").addEventListener("input", function () { clearTimeout(t); t = setTimeout(aplicaFiltro, 90); });
    $("#busca").addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); this.blur(); } });
    $("#btn-filtro").addEventListener("click", function () {
      var ab = this.getAttribute("aria-expanded") !== "true";
      this.setAttribute("aria-expanded", String(ab));
      $("#filtros").classList.toggle("aberto", ab);
      ajustaMargem();
    });
    $$("#filtros [data-tag]").forEach(function (b) {
      b.addEventListener("click", function () {
        var tag = b.dataset.tag, on = b.getAttribute("aria-pressed") !== "true";
        b.setAttribute("aria-pressed", String(on));
        filtrosAtivos = filtrosAtivos.filter(function (x) { return x !== tag; });
        if (on) filtrosAtivos.push(tag);
        aplicaFiltro();
      });
    });
    $("#limpar-filtros").addEventListener("click", limpar);
    $("#limpar-busca").addEventListener("click", limpar);
  }

  /* ================= Categoria atual ================= */
  var barra, catAtual = null;
  function ajustaMargem() {
    var h = barra.offsetHeight + 10;
    $$(".cat, .item").forEach(function (s) { s.style.scrollMarginTop = h + "px"; });
  }
  function marcaCategoria() {
    var limite = barra.getBoundingClientRect().bottom + 24;
    var atual = null;
    $$(".cat:not([hidden])").forEach(function (s) { if (s.getBoundingClientRect().top <= limite) atual = s.dataset.cat; });
    if (!atual) { var p = $(".cat:not([hidden])"); atual = p && p.dataset.cat; }
    if (atual === catAtual) return;
    catAtual = atual;
    $$(".cats a").forEach(function (a) {
      var on = a.dataset.cat === atual;
      if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
      if (on) {
        var nav = $("#cats");
        var alvo = a.offsetLeft - 16;
        if (alvo < nav.scrollLeft || a.offsetLeft + a.offsetWidth > nav.scrollLeft + nav.clientWidth) {
          nav.scrollTo({ left: Math.max(0, alvo), behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
        }
      }
    });
  }
  function rolagem() {
    barra = $(".barra");
    ajustaMargem();
    var pend = false;
    window.addEventListener("scroll", function () {
      if (pend) return; pend = true;
      requestAnimationFrame(function () { pend = false; marcaCategoria(); });
    }, { passive: true });
    window.addEventListener("resize", function () { ajustaMargem(); marcaCategoria(); });
    marcaCategoria();
  }

  /* ================= Sacola (estado + armazenamento) ================= */
  var S = { itens: [], modo: "delivery", nome: "", endereco: "", bairro: "", complemento: "", referencia: "", pag: "Pix", troco: "", obs: "" };
  function carrega() {
    try {
      var raw = localStorage.getItem(CHAVE);
      if (raw) {
        var o = JSON.parse(raw);
        if (o && Array.isArray(o.itens)) {
          Object.keys(S).forEach(function (k) { if (o[k] != null) S[k] = o[k]; });
          S.itens = S.itens.filter(function (l) { return porId[l.id] && l.qtd > 0; });
        }
      }
    } catch (e) { /* armazenamento indisponível: segue só na memória */ }
  }
  function salva() { try { localStorage.setItem(CHAVE, JSON.stringify(S)); } catch (e) { } }

  function adiciona(id, qtd, obs) {
    obs = (obs || "").trim();
    var l = S.itens.filter(function (x) { return x.id === id && (x.obs || "") === obs; })[0];
    if (l) l.qtd = Math.min(30, l.qtd + qtd); else S.itens.push({ id: id, qtd: qtd, obs: obs });
    salva(); pintaSacola();
    C.recado(qtd + "× " + porId[id].nome + " na sacola");
  }
  function conta() { return S.itens.reduce(function (s, l) { return s + l.qtd; }, 0); }
  function subtotal() { return S.itens.reduce(function (s, l) { return s + l.qtd * porId[l.id].preco; }, 0); }
  function taxa() { return S.modo === "delivery" && S.itens.length ? CFG.taxaEntrega : 0; }

  function pintaSacola() {
    var n = conta(), sub = subtotal(), tot = sub + taxa();
    var nEl = $("#sacola-n");
    nEl.textContent = n;
    if (n) nEl.removeAttribute("data-zero"); else nEl.setAttribute("data-zero", "");
    var barraS = $("#barra-sacola");
    barraS.classList.toggle("mostra", n > 0);
    barraS.setAttribute("aria-hidden", n > 0 ? "false" : "true");
    barraS.tabIndex = n > 0 ? 0 : -1;
    $("#barra-txt").textContent = "Ver sacola · " + n + (n === 1 ? " item" : " itens");
    $("#barra-total").textContent = C.reais(tot);

    var porItem = {};
    S.itens.forEach(function (l) { porItem[l.id] = (porItem[l.id] || 0) + l.qtd; });
    $$("[data-qtd]").forEach(function (b) { var q = porItem[b.dataset.qtd]; b.textContent = q ? q : ""; });

    // linhas
    var ul = $("#linhas");
    ul.innerHTML = S.itens.map(function (l, i) {
      var it = porId[l.id];
      return '<li class="linha">' +
        '<span class="linha-nome">' + esc(it.nome) + "</span>" +
        '<span class="preco">' + C.reais(it.preco * l.qtd) + "</span>" +
        (l.obs ? '<p class="linha-obs">Obs.: ' + esc(l.obs) + "</p>" : "") +
        '<div class="linha-acoes"><div class="contador contador--peq" role="group" aria-label="Quantidade de ' + esc(it.nome) + '">' +
        '<button type="button" data-l="' + i + '" data-d="-1" aria-label="Diminuir"><svg aria-hidden="true"><use href="img/tracos.svg#ic-menos"/></svg></button>' +
        "<output>" + l.qtd + "</output>" +
        '<button type="button" data-l="' + i + '" data-d="1" aria-label="Aumentar"><svg aria-hidden="true"><use href="img/tracos.svg#ic-mais"/></svg></button></div>' +
        '<button type="button" class="remover" data-rm="' + i + '"><svg aria-hidden="true"><use href="img/tracos.svg#ic-lixo"/></svg> Tirar</button></div>' +
        "</li>";
    }).join("");
    var vazia = S.itens.length === 0;
    $("#sacola-vazia").classList.toggle("oculto", !vazia);
    $("#sacola-dados").classList.toggle("oculto", vazia);
    $("#sacola-pe").classList.toggle("oculto", vazia);
    $("#sacola-conta").textContent = vazia ? "" : n + (n === 1 ? " item" : " itens");

    $("#r-sub").textContent = C.reais(sub);
    $("#r-taxa").textContent = C.reais(taxa());
    $("#r-taxa-linha").classList.toggle("oculto", S.modo !== "delivery");
    $("#r-total").textContent = C.reais(tot);
    $("#bloco-endereco").classList.toggle("oculto", S.modo !== "delivery");
    $("#bloco-troco").classList.toggle("oculto", S.pag !== "Dinheiro");
    var notas = {
      "Pix": "A chave Pix vai na confirmação do atendente.",
      "Cartão de crédito": S.modo === "delivery" ? "O entregador leva a maquininha." : "Pague no balcão, na retirada.",
      "Cartão de débito": S.modo === "delivery" ? "O entregador leva a maquininha." : "Pague no balcão, na retirada.",
      "Dinheiro": "Informe o troco abaixo, se precisar."
    };
    $("#pag-nota").textContent = notas[S.pag] || "";
    $("#alerta-pedido").textContent = alertas().join(" ");
  }

  function alertas() {
    var a = [], sit = C.situacao();
    if (!S.itens.length) return a;
    if (S.modo === "delivery" && subtotal() < CFG.pedidoMinimoDelivery) {
      a.push("O pedido mínimo para delivery é " + C.reais(CFG.pedidoMinimoDelivery) + ". Faltam " + C.reais(CFG.pedidoMinimoDelivery - subtotal()) + ", ou escolha retirada.");
    }
    if (sit.aberto === "nao") a.push("Estamos fechados agora (" + sit.curto.toLowerCase() + "). Pode mandar o pedido: confirmamos assim que a cozinha abrir.");
    var temExec = S.itens.some(function (l) { return porId[l.id].cat === "executivo"; });
    if (temExec) {
      var ag = C.agora(), d = ag.getDay(), m = ag.getHours() * 60 + ag.getMinutes();
      if (d === 0 || d === 6 || m >= 900) a.push("O executivo só sai de segunda a sexta, até as 15h. Ele fica agendado para o próximo almoço.");
    }
    return a;
  }

  function sacola() {
    var dlg = $("#sacola"), f = $("#form-pedido");
    function abre() { pintaSacola(); preencheForm(); dlg.showModal(); }
    $("#btn-sacola").addEventListener("click", abre);
    $("#barra-sacola").addEventListener("click", abre);

    $("#linhas").addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      if (b.dataset.rm != null) { var nomeRm = porId[S.itens[+b.dataset.rm].id].nome; S.itens.splice(+b.dataset.rm, 1); C.recado(nomeRm + " saiu da sacola"); }
      else if (b.dataset.l != null) {
        var l = S.itens[+b.dataset.l];
        l.qtd += +b.dataset.d;
        if (l.qtd <= 0) S.itens.splice(+b.dataset.l, 1);
        if (l.qtd > 30) l.qtd = 30;
      }
      salva(); pintaSacola();
      if (!S.itens.length) $("#sacola .fechar").focus();
    });

    function preencheForm() {
      $$("input[name=modo]", f).forEach(function (r) { r.checked = r.value === S.modo; });
      $$("input[name=pag]", f).forEach(function (r) { r.checked = r.value === S.pag; });
      ["nome", "endereco", "bairro", "complemento", "referencia", "troco", "obs"].forEach(function (k) {
        var el = f.elements[k]; if (el && el.value !== S[k]) el.value = S[k] || "";
      });
    }
    f.addEventListener("input", function (e) {
      var el = e.target; if (!el.name) return;
      if (el.name === "modo" || el.name === "pag") { if (el.checked) S[el.name] = el.value; }
      else S[el.name] = el.value;
      salva(); pintaSacola();
    });
    f.addEventListener("change", function (e) {
      var el = e.target;
      if ((el.name === "modo" || el.name === "pag") && el.checked) { S[el.name] = el.value; salva(); pintaSacola(); }
    });

    f.addEventListener("submit", function (e) {
      e.preventDefault();
      ["e-nome", "e-end", "e-bairro"].forEach(function (id) { $("#" + id).textContent = ""; });
      var erro = null;
      if (!S.itens.length) return;
      if (S.modo === "delivery" && subtotal() < CFG.pedidoMinimoDelivery) { $("#alerta-pedido").scrollIntoView({ block: "nearest" }); return; }
      if ((S.nome || "").trim().length < 2) { $("#e-nome").textContent = "Como podemos te chamar?"; erro = erro || "#p-nome"; }
      if (S.modo === "delivery") {
        if ((S.endereco || "").trim().length < 5) { $("#e-end").textContent = "Precisamos da rua e do número."; erro = erro || "#p-end"; }
        if ((S.bairro || "").trim().length < 2) { $("#e-bairro").textContent = "Qual é o bairro? A taxa depende dele."; erro = erro || "#p-bairro"; }
      }
      if (erro) { $(erro).focus(); return; }
      window.open(C.wa(mensagem()), "_blank", "noopener");
      C.recado("Pedido aberto no WhatsApp. É só tocar em enviar.");
    });
  }

  function mensagem() {
    var L = [];
    L.push("Olá, Casa Brasa! Quero fazer um pedido para *" + (S.modo === "delivery" ? "DELIVERY" : "RETIRADA") + "*.");
    L.push("");
    L.push("*Pedido*");
    S.itens.forEach(function (l) {
      var it = porId[l.id];
      L.push(l.qtd + "x " + it.nome + (it.dia ? " (executivo de " + NOMES_DIA[it.dia].toLowerCase() + ")" : "") + " · " + C.reais(it.preco * l.qtd));
      if (l.obs) L.push("   _obs.: " + l.obs + "_");
    });
    L.push("");
    L.push("Subtotal: " + C.reais(subtotal()));
    if (S.modo === "delivery") L.push("Taxa de entrega (estimada): " + C.reais(CFG.taxaEntrega));
    L.push("*Total: " + C.reais(subtotal() + taxa()) + "*");
    L.push("");
    L.push("*Nome:* " + S.nome.trim());
    if (S.modo === "delivery") {
      var end = S.endereco.trim() + " · " + S.bairro.trim() + (S.complemento.trim() ? " · " + S.complemento.trim() : "");
      L.push("*Endereço:* " + end);
      if (S.referencia.trim()) L.push("*Referência:* " + S.referencia.trim());
    }
    var pag = S.pag;
    if (S.pag === "Dinheiro" && S.troco.trim()) pag += " (troco para R$ " + S.troco.trim().replace(/^r\$\s*/i, "") + ")";
    L.push("*Pagamento:* " + pag);
    if (S.obs.trim()) L.push("*Observação:* " + S.obs.trim());
    return L.join("\n");
  }

  /* ================= Detalhe do prato ================= */
  var atual = null, qtd = 1;
  function abrePrato(id, foco) {
    var it = porId[id]; if (!it) return;
    var dlg = $("#folha");
    atual = it; qtd = 1;
    var cat = catPorId[it.cat];
    $("#folha-ilu").innerHTML = ilu(it, true);
    $("#folha-cat").textContent = cat.nome + (it.dia ? " · " + NOMES_DIA[it.dia] : "");
    $("#folha-nome").textContent = it.nome;
    $("#folha-marcas").innerHTML = (it.tags || []).map(function (t) { return TAGS[t] ? '<span style="display:inline-flex;align-items:center;gap:6px">' + TAGS[t].html + (t === "casa" || t === "dividir" ? "" : '<span style="font:500 .9rem/1 var(--f-rotulo);letter-spacing:.04em">' + TAGS[t].nome + "</span>") + "</span>" : ""; }).join("");
    $("#folha-longa").textContent = it.longa || it.desc;
    $("#folha-serve-box").classList.toggle("oculto", !it.serve);
    $("#folha-serve").textContent = it.serve ? it.serve.charAt(0).toUpperCase() + it.serve.slice(1) : "";
    $("#folha-alergenos").textContent = it.alergenos && it.alergenos.length ? "Contém " + lista(it.alergenos) + "." : "Sem os alérgenos mais comuns na receita. A cozinha é compartilhada.";
    var harm = (it.harmoniza || []).filter(function (h) { return porId[h]; });
    $("#folha-harm-box").classList.toggle("oculto", !harm.length);
    $("#folha-harm").innerHTML = harm.map(function (h) { return '<button type="button" data-harm="' + h + '">' + esc(porId[h].nome) + "</button>"; }).join("");
    $("#folha-obs").value = "";
    pintaQtd();
    $("#folha-add").disabled = !!it.esgotado;
    if (!dlg.open) dlg.showModal();
    $(".dlg-corpo", dlg).scrollTop = 0;
    try { history.replaceState(null, "", "#" + it.id); } catch (e) { }
    if (foco !== false) $(".fechar", dlg).focus();
  }
  function lista(a) { return a.length === 1 ? a[0] : a.slice(0, -1).join(", ") + " e " + a[a.length - 1]; }
  function pintaQtd() {
    $("#folha-qtd").textContent = qtd;
    $("#folha-add").textContent = atual.esgotado ? "Esgotado hoje" : "Adicionar · " + C.reais(atual.preco * qtd);
  }
  function folha() {
    var dlg = $("#folha");
    $("#folha-menos").addEventListener("click", function () { if (qtd > 1) { qtd--; pintaQtd(); } });
    $("#folha-mais").addEventListener("click", function () { if (qtd < 30) { qtd++; pintaQtd(); } });
    $("#folha-add").addEventListener("click", function () {
      adiciona(atual.id, qtd, $("#folha-obs").value);
      dlg.close();
    });
    $("#folha-harm").addEventListener("click", function (e) {
      var b = e.target.closest("[data-harm]"); if (b) abrePrato(b.dataset.harm);
    });
    dlg.addEventListener("close", function () {
      try { history.replaceState(null, "", location.pathname + location.search); } catch (e) { }
      if (atual) { var b = document.querySelector('[data-abrir="' + atual.id + '"]'); if (b && document.activeElement === document.body) b.focus({ preventScroll: true }); }
    });

    document.addEventListener("click", function (e) {
      var ab = e.target.closest("[data-abrir]"), ad = e.target.closest("[data-add]");
      if (ad) { adiciona(ad.dataset.add, 1, ""); return; }
      if (ab) abrePrato(ab.dataset.abrir);
    });
  }

  function dialogosComuns() {
    $$("dialog").forEach(function (d) {
      d.addEventListener("click", function (e) { if (e.target === d) d.close(); });
      $$("[data-fechar]", d).forEach(function (b) { b.addEventListener("click", function () { d.close(); }); });
    });
  }

  function hashInicial() {
    var id = decodeURIComponent(location.hash.replace("#", ""));
    if (id && porId[id]) {
      var art = document.getElementById(id);
      if (art) art.scrollIntoView({ block: "center" });
      abrePrato(id);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    monta(); carrega(); filtros(); rolagem(); sacola(); folha(); dialogosComuns(); pintaSacola();
    hashInicial();
    window.addEventListener("hashchange", function () {
      var id = decodeURIComponent(location.hash.replace("#", ""));
      if (id && porId[id]) abrePrato(id);
    });
  });
})();
