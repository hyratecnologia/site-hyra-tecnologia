/* Casa Brasa · funções usadas nas duas páginas */
(function () {
  "use strict";
  var D = window.CASA_BRASA;
  var DIAS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
  var DIAS_CURTOS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  var MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

  function min(hhmm) { var p = hhmm.split(":"); return (+p[0]) * 60 + (+p[1]); }
  function hora(m) { m = m % 1440; var h = Math.floor(m / 60), mm = m % 60; return h + "h" + (mm ? String(mm).padStart(2, "0") : ""); }
  function reais(v) { return "R$ " + v.toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, "."); }

  /* Hora oficial de Brasília, seja qual for o fuso do visitante */
  function agora() {
    var d = new Date();
    try {
      var partes = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Sao_Paulo", year: "numeric", month: "numeric", day: "numeric",
        hour: "numeric", minute: "numeric", hourCycle: "h23"
      }).formatToParts(d);
      var o = {};
      partes.forEach(function (p) { o[p.type] = p.value; });
      var local = new Date(+o.year, +o.month - 1, +o.day, +o.hour % 24, +o.minute);
      return local;
    } catch (e) { return d; }
  }

  function turnos(dia) {
    return (D.horarios[dia] || []).map(function (t) { return [min(t[0]), min(t[1])]; });
  }

  /* Situação agora: aberto, fecha em breve ou fechado + próxima abertura */
  function situacao(data) {
    var d = data || agora();
    var dia = d.getDay(), m = d.getHours() * 60 + d.getMinutes();
    var hoje = turnos(dia);
    for (var i = 0; i < hoje.length; i++) {
      if (m >= hoje[i][0] && m < hoje[i][1]) {
        var falta = hoje[i][1] - m;
        if (falta <= 45) return { aberto: "quase", texto: "Fecha em " + falta + " min", curto: "Fecha em " + falta + " min" };
        return { aberto: "sim", texto: "Aberto agora · fecha às " + hora(hoje[i][1]), curto: "Aberto até " + hora(hoje[i][1]) };
      }
    }
    for (var k = 0; k < 8; k++) {
      var dd = (dia + k) % 7, lista = turnos(dd);
      for (var j = 0; j < lista.length; j++) {
        if (k === 0 && lista[j][0] <= m) continue;
        var quando = k === 0 ? "hoje" : k === 1 ? "amanhã" : DIAS[dd];
        return { aberto: "nao", texto: "Fechado agora · abre " + quando + " às " + hora(lista[j][0]), curto: "Abre " + quando + " " + hora(lista[j][0]) };
      }
    }
    return { aberto: "nao", texto: "Fechado", curto: "Fechado" };
  }

  function textoTurnos(dia) {
    var t = turnos(dia);
    if (!t.length) return "fechado";
    return t.map(function (x) { return hora(x[0]) + " às " + hora(x[1]); }).join(" · ");
  }

  function wa(msg) {
    return "https://wa.me/" + D.config.whatsapp + "?text=" + encodeURIComponent(msg);
  }

  function dataExtenso(d) {
    var s = DIAS[d.getDay()];
    if (d.getDay() > 0 && d.getDay() < 6) s += "-feira";
    return s + ", " + d.getDate() + " de " + MESES[d.getMonth()];
  }

  var recadoTimer;
  function recado(txt) {
    var el = document.querySelector(".recado");
    if (!el) {
      el = document.createElement("div");
      el.className = "recado"; el.setAttribute("role", "status"); el.setAttribute("aria-live", "polite");
      document.body.appendChild(el);
    }
    el.textContent = txt;
    el.classList.add("mostra");
    clearTimeout(recadoTimer);
    recadoTimer = setTimeout(function () { el.classList.remove("mostra"); }, 2600);
  }

  /* Atualiza todos os indicadores de status da página */
  function pintaStatus() {
    var s = situacao();
    document.querySelectorAll("[data-status]").forEach(function (el) {
      el.setAttribute("data-aberto", s.aberto);
      el.textContent = el.getAttribute("data-status") === "curto" ? s.curto : s.texto;
    });
    var d = agora();
    document.querySelectorAll("[data-hoje-data]").forEach(function (el) { var t = dataExtenso(d); el.textContent = t.charAt(0).toUpperCase() + t.slice(1); });
  }

  /* Menu mobile */
  function menu() {
    var btn = document.querySelector(".menu-btn"), nav = document.getElementById("nav");
    if (!btn || !nav) return;
    function fecha() { nav.classList.remove("aberto"); btn.setAttribute("aria-expanded", "false"); btn.querySelector("span").textContent = "Menu"; }
    btn.addEventListener("click", function () {
      var abrir = btn.getAttribute("aria-expanded") !== "true";
      nav.classList.toggle("aberto", abrir);
      btn.setAttribute("aria-expanded", String(abrir));
      btn.querySelector("span").textContent = abrir ? "Fechar" : "Menu";
    });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) fecha(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && nav.classList.contains("aberto")) { fecha(); btn.focus(); } });
  }

  /* Entrada ao rolar, só nos blocos marcados com .surge */
  function surge() {
    var els = document.querySelectorAll(".surge");
    if (!("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("visivel"); }); return; }
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("visivel"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (e) { io.observe(e); });
  }

  /* Links de WhatsApp com mensagem fixa: <a data-wa="mensagem"> */
  function linksWa() {
    document.querySelectorAll("[data-wa]").forEach(function (a) {
      a.href = wa(a.getAttribute("data-wa"));
      a.target = "_blank"; a.rel = "noopener";
    });
  }

  window.Casa = {
    DIAS: DIAS, DIAS_CURTOS: DIAS_CURTOS, MESES: MESES,
    min: min, hora: hora, reais: reais, agora: agora, turnos: turnos, situacao: situacao,
    textoTurnos: textoTurnos, wa: wa, dataExtenso: dataExtenso, recado: recado
  };

  document.addEventListener("DOMContentLoaded", function () {
    pintaStatus(); setInterval(pintaStatus, 30000);
    menu(); surge(); linksWa();
    var ano = document.querySelectorAll("[data-ano]");
    ano.forEach(function (e) { e.textContent = agora().getFullYear(); });
  });
})();
