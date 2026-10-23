// Hyra Tecnologia — v2
(function () {
  'use strict';

  // Número de WhatsApp que recebe os pedidos (somente dígitos, com 55 + DDD).
  var WHATSAPP = '55XXXXXXXXXXX';

  /* ---------- Menu do celular ---------- */
  var menu = document.getElementById('menu');
  var menuBtn = document.querySelector('.menu-btn');

  function fecharMenu() {
    menu.classList.remove('aberto');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Abrir menu');
  }

  menuBtn.addEventListener('click', function () {
    var abrir = !menu.classList.contains('aberto');
    menu.classList.toggle('aberto', abrir);
    menuBtn.setAttribute('aria-expanded', String(abrir));
    menuBtn.setAttribute('aria-label', abrir ? 'Fechar menu' : 'Abrir menu');
  });
  menu.addEventListener('click', function (e) { if (e.target.tagName === 'A') fecharMenu(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') fecharMenu(); });

  /* ---------- Filtro do portfólio ---------- */
  var chips = document.querySelectorAll('.chip');
  var trabalhos = document.querySelectorAll('.trab');

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var f = chip.dataset.f;
      chips.forEach(function (c) {
        var on = c === chip;
        c.classList.toggle('on', on);
        c.setAttribute('aria-pressed', String(on));
      });
      trabalhos.forEach(function (t) { t.hidden = f !== 'todos' && t.dataset.cat !== f; });
    });
  });

  /* ---------- Demonstração do Hyra Agenda ---------- */
  var SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  var HORAS = ['09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00', '16:00'];

  // Próximos 5 dias úteis a partir de amanhã.
  var dias = [];
  var d = new Date();
  while (dias.length < 5) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) dias.push(new Date(d));
  }

  var estado = { dia: 0, hora: null, confirmado: false };
  var elDias = document.getElementById('dias');
  var elHoras = document.getElementById('horas');
  var elOk = document.getElementById('demo-ok');
  var elConf = document.getElementById('demo-conf');

  function dd(n) { return (n < 10 ? '0' : '') + n; }

  function render() {
    elDias.innerHTML = '';
    dias.forEach(function (dia, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'dia' + (i === estado.dia ? ' on' : '');
      b.setAttribute('aria-pressed', String(i === estado.dia));
      b.innerHTML = '<small>' + SEMANA[dia.getDay()] + '</small>' + dia.getDate();
      b.addEventListener('click', function () { estado = { dia: i, hora: null, confirmado: false }; render(); });
      elDias.appendChild(b);
    });

    elHoras.innerHTML = '';
    HORAS.forEach(function (h, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'hora' + (estado.hora === h ? ' on' : '');
      b.textContent = h;
      b.disabled = ((i * 7 + estado.dia * 3) % 5) === 0;
      b.setAttribute('aria-pressed', String(estado.hora === h));
      b.addEventListener('click', function () { estado.hora = h; estado.confirmado = false; render(); });
      elHoras.appendChild(b);
    });

    var dia = dias[estado.dia];
    var nome = SEMANA[dia.getDay()];
    elOk.hidden = !estado.confirmado;
    elConf.hidden = estado.confirmado;
    if (estado.confirmado) {
      elOk.innerHTML = '<strong>Horário confirmado.</strong> ' + nome + ', ' + dd(dia.getDate()) + '/' + dd(dia.getMonth() + 1) + ' às ' + estado.hora + '. Até lá!';
    }
    elConf.disabled = !estado.hora;
    elConf.textContent = estado.hora ? 'Confirmar ' + nome + ' às ' + estado.hora : 'Escolha um horário';
  }

  elConf.addEventListener('click', function () {
    if (estado.hora) { estado.confirmado = true; render(); }
  });
  render();

  /* ---------- Formulário → WhatsApp ---------- */
  document.getElementById('form').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target;
    var linhas = [
      'Olá! Quero um orçamento.',
      'Nome: ' + f.nome.value.trim(),
      f.negocio.value.trim() && 'Negócio: ' + f.negocio.value.trim(),
      f.tel.value.trim() && 'WhatsApp: ' + f.tel.value.trim(),
      'Preciso de: ' + f.servico.value
    ].filter(Boolean);
    window.open('https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(linhas.join('\n')), '_blank', 'noopener');
  });
})();
