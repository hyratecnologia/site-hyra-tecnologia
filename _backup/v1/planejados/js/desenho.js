/* Veio Marcenaria · motor de ilustrações em traço (SVG gerado).
   Gera perspectiva, elevação com cotas, planta e detalhe de cada ambiente
   a partir dos materiais escolhidos. Usado no portfólio, no hero e no
   "Monte seu acabamento". Quando houver foto real, ela substitui o desenho. */
(function (global) {
  'use strict';

  var INK = '#2E2A25';
  var SW = 1.1;
  var FONTE = "'IBM Plex Mono', ui-monospace, monospace";

  /* ---------- Catálogo de materiais ---------- */
  var MDF = {
    'carvalho-hanover': { nome: 'Carvalho Hanover', grupo: 'amadeirado', base: '#CDA97E', veio: '#A47F57' },
    'carvalho-claro':   { nome: 'Carvalho Natural', grupo: 'amadeirado', base: '#DFC7A4', veio: '#BC9F78' },
    'freijo':           { nome: 'Freijó Puro', grupo: 'amadeirado', base: '#BB8E60', veio: '#8F663F' },
    'jequitiba':        { nome: 'Jequitibá Rosa', grupo: 'amadeirado', base: '#C49073', veio: '#9A6A4F' },
    'nogueira':         { nome: 'Nogueira Cádiz', grupo: 'amadeirado', base: '#7D573B', veio: '#563A28' },
    'branco-tx':        { nome: 'Branco TX', grupo: 'liso', base: '#F4F2ED' },
    'linho':            { nome: 'Linho Off-white', grupo: 'liso', base: '#E6DDCD' },
    'areia':            { nome: 'Areia', grupo: 'liso', base: '#CDBDA2' },
    'grafite':          { nome: 'Grafite', grupo: 'liso', base: '#4B4D4F' },
    'preto-fosco':      { nome: 'Preto Fosco', grupo: 'liso', base: '#2B2B2C' },
    'salvia':           { nome: 'Verde Sálvia', grupo: 'tom', base: '#9EA68F' },
    'oliva':            { nome: 'Verde Oliva', grupo: 'tom', base: '#6C6F4F' },
    'azul-petroleo':    { nome: 'Azul Petróleo', grupo: 'tom', base: '#36515B' },
    'terracota':        { nome: 'Terracota', grupo: 'tom', base: '#B26B4D' },
    'rosa-argila':      { nome: 'Rosa Argila', grupo: 'tom', base: '#CFA493' }
  };

  var PEDRA = {
    'quartzo-branco': { nome: 'Quartzo Branco', base: '#F1EFEA', tipo: 'pontos', cor2: '#CFCAC0' },
    'carrara':        { nome: 'Mármore Carrara', base: '#EEEDEA', tipo: 'veios', cor2: '#9E9D9B' },
    'taj-mahal':      { nome: 'Quartzito Taj Mahal', base: '#E9DDC7', tipo: 'veios', cor2: '#BFA47A' },
    'travertino':     { nome: 'Travertino Romano', base: '#DCCAAD', tipo: 'faixas', cor2: '#BFA781' },
    'concreto':       { nome: 'Porcelanato Cimento', base: '#ABA69D', tipo: 'pontos', cor2: '#8F8A81' },
    'sao-gabriel':    { nome: 'Granito São Gabriel', base: '#2D2C2C', tipo: 'pontos', cor2: '#77746F' }
  };

  var PUX = {
    'cava':         { nome: 'Cava usinada', desc: 'rebaixo na própria chapa, sem peça aparente' },
    'perfil':       { nome: 'Perfil em alumínio', desc: 'perfil fino na borda da porta', cor: '#A3A09A' },
    'perfil-preto': { nome: 'Perfil preto', desc: 'perfil fino com pintura preta fosca', cor: '#222222' },
    'ponto':        { nome: 'Ponto em latão', desc: 'puxador pontual escovado', cor: '#B8955D' },
    'ponto-preto':  { nome: 'Ponto preto', desc: 'puxador pontual preto fosco', cor: '#262626' },
    'toque':        { nome: 'Sem puxador (toque)', desc: 'abertura por pressão, frente limpa' }
  };

  /* ---------- utilidades ---------- */
  function hashStr(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { var a = seed >>> 0; return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function f(n) { return Math.round(n * 10) / 10; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }

  function R(x, y, w, h, fill, ex) { return '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(w) + '" height="' + f(h) + '" fill="' + fill + '"' + (ex || '') + '/>'; }
  function RS(x, y, w, h, fill, sw) { return R(x, y, w, h, fill, ' stroke="' + INK + '" stroke-width="' + (sw == null ? SW : sw) + '"'); }
  function L(x1, y1, x2, y2, sw, cor, ex) { return '<line x1="' + f(x1) + '" y1="' + f(y1) + '" x2="' + f(x2) + '" y2="' + f(y2) + '" stroke="' + (cor || INK) + '" stroke-width="' + (sw == null ? SW : sw) + '"' + (ex || '') + '/>'; }
  function poly(pts, fill, ex) { return '<polygon points="' + pts.map(function (p) { return f(p[0]) + ',' + f(p[1]); }).join(' ') + '" fill="' + fill + '"' + (ex || '') + '/>'; }
  function T(x, y, txt, ex) { return '<text x="' + f(x) + '" y="' + f(y) + '" font-family="' + FONTE + '"' + (ex || '') + '>' + esc(txt) + '</text>'; }

  var UID = 0;
  function Ctx() { this.u = 'vd' + (++UID); this.defs = {}; this.ordem = []; }
  Ctx.prototype.add = function (id, fn) { if (!this.defs[id]) { this.defs[id] = fn(); this.ordem.push(id); } return 'url(#' + id + ')'; };
  Ctx.prototype.mdf = function (key) {
    var m = MDF[key] || MDF.linho;
    if (m.grupo !== 'amadeirado') return m.base;
    var id = this.u + '-m-' + key;
    return this.add(id, function () { return padraoMadeira(id, m, key); });
  };
  Ctx.prototype.pedra = function (key) {
    var p = PEDRA[key] || PEDRA['quartzo-branco'];
    var id = this.u + '-p-' + key;
    return this.add(id, function () { return padraoPedra(id, p, key); });
  };
  Ctx.prototype.grad = function (nome) {
    var id = this.u + '-g-' + nome;
    return this.add(id, function () { return GRADS[nome](id); });
  };
  Ctx.prototype.out = function () { var self = this; return '<defs>' + this.ordem.map(function (k) { return self.defs[k]; }).join('') + '</defs>'; };

  function padraoMadeira(id, m, key) {
    var r = rng(hashStr(key)), W = 120, H = 360, i, k;
    var s = '<pattern id="' + id + '" patternUnits="userSpaceOnUse" width="' + W + '" height="' + H + '">' + R(0, 0, W, H, m.base);
    for (i = 0; i < 5; i++) { var w = 6 + r() * 16, x = r() * (W - w); s += R(x, 0, w, H, m.veio, ' opacity="' + f(0.05 + r() * 0.08) + '"'); }
    for (i = 0; i < 17; i++) {
      var x0 = 5 + r() * (W - 10), a = (r() - 0.5) * 8, b = (r() - 0.5) * 8;
      s += '<path d="M' + f(x0) + ' 0C' + f(x0 + a) + ' ' + H * 0.33 + ' ' + f(x0 + b) + ' ' + H * 0.66 + ' ' + f(x0) + ' ' + H + '" fill="none" stroke="' + m.veio + '" stroke-width="' + f(0.4 + r() * 0.8) + '" opacity="' + f(0.22 + r() * 0.38) + '"/>';
    }
    var cx = 24 + r() * (W - 48), cy = H * (0.3 + r() * 0.35);
    for (k = 0; k < 4; k++) {
      var ww = 5 + k * 5, hh = 36 + k * 20;
      s += '<path d="M' + f(cx - ww) + ' ' + f(cy + hh) + 'Q' + f(cx - ww) + ' ' + f(cy - hh * 0.2) + ' ' + f(cx) + ' ' + f(cy - hh * 0.35) + 'Q' + f(cx + ww) + ' ' + f(cy - hh * 0.2) + ' ' + f(cx + ww) + ' ' + f(cy + hh) + '" fill="none" stroke="' + m.veio + '" stroke-width=".7" opacity=".38"/>';
    }
    return s + '</pattern>';
  }

  function padraoPedra(id, p, key) {
    var r = rng(hashStr('p' + key)), W = 240, H = 160, i;
    var s = '<pattern id="' + id + '" patternUnits="userSpaceOnUse" width="' + W + '" height="' + H + '">' + R(0, 0, W, H, p.base);
    if (p.tipo === 'pontos') {
      for (i = 0; i < 110; i++) s += '<circle cx="' + f(r() * W) + '" cy="' + f(r() * H) + '" r="' + f(0.4 + r() * 1.2) + '" fill="' + p.cor2 + '" opacity="' + f(0.35 + r() * 0.5) + '"/>';
    } else if (p.tipo === 'veios') {
      for (i = 0; i < 4; i++) {
        var y0 = 14 + r() * (H - 28);
        s += '<path d="M0 ' + f(y0) + 'C' + 80 + ' ' + f(y0 + (r() - 0.5) * 50) + ' ' + 160 + ' ' + f(y0 + (r() - 0.5) * 50) + ' ' + W + ' ' + f(y0) + '" fill="none" stroke="' + p.cor2 + '" stroke-width="' + f(0.5 + r() * 1.3) + '" opacity="' + f(0.35 + r() * 0.35) + '"/>';
      }
      for (i = 0; i < 30; i++) s += '<circle cx="' + f(r() * W) + '" cy="' + f(r() * H) + '" r=".6" fill="' + p.cor2 + '" opacity=".3"/>';
    } else {
      for (i = 0; i < 10; i++) {
        var y = r() * H;
        s += '<path d="M0 ' + f(y) + 'Q' + W / 2 + ' ' + f(y + (r() - 0.5) * 5) + ' ' + W + ' ' + f(y) + '" fill="none" stroke="' + p.cor2 + '" stroke-width="' + f(1 + r() * 3) + '" opacity="' + f(0.2 + r() * 0.25) + '"/>';
      }
      for (i = 0; i < 26; i++) s += '<ellipse cx="' + f(r() * W) + '" cy="' + f(r() * H) + '" rx="' + f(1 + r() * 3) + '" ry=".6" fill="#8D7A5C" opacity=".35"/>';
    }
    return s + '</pattern>';
  }

  var GRADS = {
    led: function (id) { return '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE7BD" stop-opacity=".75"/><stop offset="1" stop-color="#FFE7BD" stop-opacity="0"/></linearGradient>'; },
    vidro: function (id) { return '<linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#46453F"/><stop offset=".55" stop-color="#26241F"/><stop offset="1" stop-color="#34322D"/></linearGradient>'; },
    tv: function (id) { return '<linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#34332F"/><stop offset=".6" stop-color="#191816"/><stop offset="1" stop-color="#22211E"/></linearGradient>'; },
    tela: function (id) { return '<linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#C9CFCB"/><stop offset="1" stop-color="#9FA8A5"/></linearGradient>'; },
    espelho: function (id) { return '<linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#DCE2E0"/><stop offset=".5" stop-color="#F3F5F2"/><stop offset="1" stop-color="#D2D9D7"/></linearGradient>'; },
    halo: function (id) { return '<radialGradient id="' + id + '"><stop offset=".55" stop-color="#FFE4B5" stop-opacity=".75"/><stop offset="1" stop-color="#FFE4B5" stop-opacity="0"/></radialGradient>'; },
    brasa: function (id) { return '<radialGradient id="' + id + '"><stop offset="0" stop-color="#E9894B" stop-opacity=".9"/><stop offset="1" stop-color="#E9894B" stop-opacity="0"/></radialGradient>'; },
    luzpiso: function (id) { return '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".10"/><stop offset=".35" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".12"/></linearGradient>'; },
    ceu: function (id) { return '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6F3EC"/><stop offset="1" stop-color="#E4E7E1"/></linearGradient>'; },
    vinheta: function (id) { return '<radialGradient id="' + id + '" cx=".5" cy=".45" r=".75"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#2E2A25" stop-opacity=".10"/></radialGradient>'; }
  };

  /* ---------- puxadores e portas ---------- */
  function puxador(x, y, w, h, pux, pos) {
    var e = pos.charAt(0), t, c;
    if (pux === 'cava') {
      t = 8; var sombra = 'rgba(25,18,12,.42)', luz = 'rgba(255,255,255,.38)';
      if (e === 'n') return R(x, y, w, t, sombra) + L(x, y + t, x + w, y + t, 0.7, luz);
      if (e === 's') return R(x, y + h - t, w, t, sombra) + L(x, y + h - t, x + w, y + h - t, 0.7, luz);
      if (e === 'e') return R(x + w - t, y, t, h, sombra) + L(x + w - t, y, x + w - t, y + h, 0.7, luz);
      return R(x, y, t, h, sombra) + L(x + t, y, x + t, y + h, 0.7, luz);
    }
    if (pux === 'perfil' || pux === 'perfil-preto') {
      c = PUX[pux].cor; t = 4;
      if (e === 'n') return R(x, y, w, t, c);
      if (e === 's') return R(x, y + h - t, w, t, c);
      if (e === 'e') return R(x + w - t, y, t, h, c);
      return R(x, y, t, h, c);
    }
    if (pux === 'ponto' || pux === 'ponto-preto') {
      c = PUX[pux].cor; var m = 14, cx = x + w / 2, cy = y + h / 2;
      if (pos.indexOf('n') === 0) cy = y + m;
      if (pos.indexOf('s') === 0) cy = y + h - m;
      if (pos.indexOf('e') >= 0) cx = x + w - m;
      if (pos.indexOf('w') >= 0) cx = x + m;
      if (pos === 'n' || pos === 's') cx = x + w / 2;
      return '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="4.6" fill="' + c + '" stroke="' + INK + '" stroke-width=".6"/><circle cx="' + f(cx - 1.4) + '" cy="' + f(cy - 1.4) + '" r="1.3" fill="rgba(255,255,255,.55)"/>';
    }
    return '';
  }
  function porta(c, x, y, w, h, mat, pux, pos) {
    var g = 1.5; x += g; y += g; w -= 2 * g; h -= 2 * g;
    return RS(x, y, w, h, c.mdf(mat), 0.9) + puxador(x, y, w, h, pux, pos);
  }
  function rodape(x, w, y) { return R(x + 6, y || 560, w - 12, 20, '#2E2A25', ' opacity=".78"'); }

  /* ---------- objetos de cena ---------- */
  var TONS = ['#D8CDBA', '#B9A688', '#8E8573', '#E8E1D4', '#6F6658', '#C59C78', '#A7AE98', '#5B4D41', '#CBB8A0'];
  function folha(px, py, dx, dy, cor) {
    return '<path d="M' + f(px) + ' ' + f(py) + 'Q' + f(px + dx * 0.5 - dy * 0.28) + ' ' + f(py + dy * 0.5 + dx * 0.28) + ' ' + f(px + dx) + ' ' + f(py + dy) + 'Q' + f(px + dx * 0.5 + dy * 0.28) + ' ' + f(py + dy * 0.5 - dx * 0.28) + ' ' + f(px) + ' ' + f(py) + 'Z" fill="' + (cor || '#8D9878') + '" stroke="' + INK + '" stroke-width=".5"/>';
  }
  function plantinha(r, x, y, esc) {
    esc = esc || 1;
    var s = '', w = 18 * esc, h = 16 * esc;
    var cx = x + w / 2, topo = y - h;
    for (var i = 0; i < 6; i++) { var ang = -Math.PI / 2 + (i - 2.5) * 0.42 + (r() - 0.5) * 0.2, len = (18 + r() * 14) * esc; s += folha(cx, topo, Math.cos(ang) * len, Math.sin(ang) * len); }
    s += '<path d="M' + f(x) + ' ' + f(topo) + 'L' + f(x + w) + ' ' + f(topo) + 'L' + f(x + w - 3 * esc) + ' ' + f(y) + 'L' + f(x + 3 * esc) + ' ' + f(y) + 'Z" fill="#C9A98A" stroke="' + INK + '" stroke-width=".7"/>';
    return s;
  }
  function objetos(r, x0, x1, y, hMax) {
    var s = '', x = x0 + 8, guard = 0;
    while (x < x1 - 20 && guard++ < 40) {
      var t = r(), w;
      if (t < 0.28) {
        var n = 3 + Math.floor(r() * 4), tot = 0, bs = [];
        for (var i = 0; i < n; i++) { var bw = 5 + r() * 5; bs.push(bw); tot += bw; }
        if (x + tot > x1 - 6) break;
        bs.forEach(function (bw) { var bh = hMax * (0.55 + r() * 0.35); s += RS(x, y - bh, bw, bh, TONS[Math.floor(r() * TONS.length)], 0.6); x += bw; });
        x += 8;
      } else if (t < 0.48) {
        w = 14 + r() * 10; var vh = hMax * (0.45 + r() * 0.4);
        if (x + w > x1 - 6) break;
        s += '<path d="M' + f(x) + ' ' + f(y) + 'L' + f(x + w) + ' ' + f(y) + 'Q' + f(x + w + 3) + ' ' + f(y - vh * 0.6) + ' ' + f(x + w * 0.66) + ' ' + f(y - vh) + 'L' + f(x + w * 0.34) + ' ' + f(y - vh) + 'Q' + f(x - 3) + ' ' + f(y - vh * 0.6) + ' ' + f(x) + ' ' + f(y) + 'Z" fill="' + TONS[Math.floor(r() * TONS.length)] + '" stroke="' + INK + '" stroke-width=".7"/>';
        if (r() < 0.5) s += '<path d="M' + f(x + w / 2) + ' ' + f(y - vh) + 'q-6 -' + f(hMax * 0.3) + ' -2 -' + f(hMax * 0.5) + 'M' + f(x + w / 2) + ' ' + f(y - vh) + 'q8 -' + f(hMax * 0.25) + ' 10 -' + f(hMax * 0.42) + '" fill="none" stroke="' + INK + '" stroke-width=".7"/>';
        x += w + 12;
      } else if (t < 0.64) {
        w = 24 + r() * 14; var bh2 = 9 + r() * 5;
        if (x + w > x1 - 6) break;
        s += '<path d="M' + f(x) + ' ' + f(y - bh2) + 'L' + f(x + w) + ' ' + f(y - bh2) + 'Q' + f(x + w * 0.86) + ' ' + f(y) + ' ' + f(x + w / 2) + ' ' + f(y) + 'Q' + f(x + w * 0.14) + ' ' + f(y) + ' ' + f(x) + ' ' + f(y - bh2) + 'Z" fill="' + TONS[Math.floor(r() * TONS.length)] + '" stroke="' + INK + '" stroke-width=".7"/>';
        x += w + 10;
      } else if (t < 0.8) {
        if (x + 30 > x1 - 6) break;
        s += plantinha(r, x, y, Math.min(1, hMax / 55));
        x += 34;
      } else { x += 16 + r() * 22; }
    }
    return s;
  }
  function roupas(r, x0, x1, y, len) {
    var s = L(x0 + 4, y, x1 - 4, y, 2.2, '#8E8B85'), x = x0 + 12;
    while (x < x1 - 20) {
      var w = 11 + r() * 8, h = len * (0.62 + r() * 0.38), c = TONS[Math.floor(r() * TONS.length)];
      s += '<path d="M' + f(x + w / 2) + ' ' + f(y - 3) + 'l0 7M' + f(x) + ' ' + f(y + 12) + 'L' + f(x + w / 2) + ' ' + f(y + 4) + 'L' + f(x + w) + ' ' + f(y + 12) + '" stroke="' + INK + '" stroke-width=".7" fill="none"/>';
      s += '<path d="M' + f(x - 1) + ' ' + f(y + 12) + 'L' + f(x + w + 1) + ' ' + f(y + 12) + 'L' + f(x + w + 2) + ' ' + f(y + 12 + h) + 'L' + f(x - 2) + ' ' + f(y + 12 + h) + 'Z" fill="' + c + '" stroke="' + INK + '" stroke-width=".6"/>';
      x += w * 0.6 + 3;
    }
    return s;
  }
  function pilha(r, x, y, w, alt) {
    var s = '', yy = y, n = Math.max(2, Math.round(alt / 8));
    for (var i = 0; i < n; i++) { var hh = 6 + r() * 3, dx = (r() - 0.5) * 4; yy -= hh; s += RS(x + dx, yy, w, hh, TONS[Math.floor(r() * TONS.length)], 0.5); }
    return s;
  }
  function caixa(r, x, y, w, h) { return RS(x, y - h, w, h, ['#D8CDBA', '#E8E1D4', '#CBB8A0'][Math.floor(r() * 3)], 0.7) + L(x + w * 0.35, y - h * 0.55, x + w * 0.65, y - h * 0.55, 1.2, INK); }
  function torneira(x, y) { return '<path d="M' + x + ' ' + y + 'L' + x + ' ' + (y - 66) + 'Q' + x + ' ' + (y - 78) + ' ' + (x + 12) + ' ' + (y - 78) + 'L' + (x + 26) + ' ' + (y - 78) + 'L' + (x + 26) + ' ' + (y - 70) + '" fill="none" stroke="' + INK + '" stroke-width="2.6" stroke-linecap="round"/>' + R(x - 5, y - 4, 10, 4, INK); }

  /* ---------- ambientes em elevação (1000 x 620; piso y=580; teto y=40; 2 un = 1 cm) ---------- */
  var AMB = {};

  AMB.cozinha = function (c, o, r) {
    var m = o.mdf, m2 = o.mdf2 || o.mdf, p = o.pux, s = '';
    s += RS(260, 270, 680, 122, c.pedra(o.pedra), 0.8);
    s += R(262, 183, 296, 7, 'rgba(0,0,0,.06)') + R(262, 253, 296, 7, 'rgba(0,0,0,.06)');
    s += objetos(r, 262, 558, 176, 52) + objetos(r, 262, 558, 246, 52);
    s += RS(262, 176, 296, 8, c.mdf(m2), 0.8) + RS(262, 246, 296, 8, c.mdf(m2), 0.8);
    s += R(560, 270, 380, 80, c.grad('led'));
    var wd = 380 / 3;
    for (var i = 0; i < 3; i++) s += porta(c, 560 + i * wd, 110, wd, 160, m2 === m ? m : m2, p, i === 0 ? 'se' : i === 2 ? 'sw' : 's');
    s += R(650, 270, 140, 5, '#9A968F');
    s += porta(c, 60, 60, 100, 90, m, p, 's') + porta(c, 60, 150, 100, 410, m, p, 'e');
    s += porta(c, 160, 60, 100, 170, m, p, 's');
    s += RS(161.5, 231.5, 97, 67, c.grad('vidro'), 0.9) + R(172, 240, 50, 46, 'rgba(255,255,255,.06)') + R(232, 244, 18, 5, '#9BC1B3', ' opacity=".7"');
    s += RS(161.5, 301.5, 97, 117, c.grad('vidro'), 0.9) + L(172, 314, 248, 314, 2.6, '#C9C4BB') + R(176, 330, 66, 76, 'rgba(255,255,255,.05)');
    s += porta(c, 160, 420, 100, 70, m, p, 'n') + porta(c, 160, 490, 100, 70, m, p, 'n');
    var h3 = 160 / 3;
    for (i = 0; i < 3; i++) s += porta(c, 260, 400 + i * h3, 120, h3, m, p, 'n');
    s += porta(c, 380, 400, 80, 160, m, p, 'ne') + porta(c, 460, 400, 80, 160, m, p, 'nw');
    s += porta(c, 540, 400, 100, 160, m, p, 'ne');
    s += porta(c, 640, 400, 160, 60, m, p, 'n') + porta(c, 640, 460, 160, 100, m, p, 'n');
    s += porta(c, 800, 400, 70, 160, m, p, 'ne') + porta(c, 870, 400, 70, 160, m, p, 'nw');
    s += rodape(60, 880);
    s += RS(256, 390, 688, 12, c.pedra(o.pedra), 1);
    s += R(662, 386, 116, 4, '#1B1B1B');
    s += torneira(462, 390);
    s += objetos(r, 840, 940, 390, 40);
    return { svg: s, x0: 60, x1: 940 };
  };

  AMB.dormitorio = function (c, o, r) {
    var m = o.mdf, m2 = o.mdf2 || o.mdf, p = o.pux, s = '', i;
    for (i = 0; i < 6; i++) s += porta(c, 80 + i * 140, 60, 140, 90, m, p, i % 2 ? 'sw' : 'se');
    s += porta(c, 80, 150, 140, 410, m, p, 'e') + porta(c, 220, 150, 140, 410, m, p, 'w');
    s += RS(361.5, 151.5, 277, 227, c.mdf(m2), 0.9);
    s += R(363, 153, 274, 46, c.grad('led'));
    s += objetos(r, 364, 636, 262, 70) + objetos(r, 364, 636, 378, 72);
    s += RS(364, 262, 272, 7, c.mdf(m), 0.7);
    for (i = 0; i < 3; i++) s += porta(c, 360, 380 + i * 60, 280, 60, m, p, 'n');
    s += porta(c, 640, 150, 140, 410, m, p, 'e') + porta(c, 780, 150, 140, 410, m, p, 'w');
    s += rodape(80, 840);
    return { svg: s, x0: 80, x1: 920 };
  };

  AMB.closet = function (c, o, r) {
    var m = o.mdf, m2 = o.mdf2 || o.mdf, p = o.pux, s = '', i, X = [90, 270, 410, 590, 730, 910];
    for (i = 0; i < 5; i++) s += RS(X[i], 60, X[i + 1] - X[i], 500, c.mdf(m2), 0.6);
    for (i = 0; i < 5; i++) s += R(X[i] + 4, 64, 3, 488, 'rgba(255,238,205,.75)');
    s += roupas(r, 94, 266, 100, 300);
    s += caixa(r, 104, 466, 46, 30) + caixa(r, 158, 466, 46, 30) + caixa(r, 212, 466, 46, 30);
    s += RS(94, 466, 172, 7, c.mdf(m), 0.8);
    [140, 210, 280, 350, 420, 490].forEach(function (y) { s += pilha(r, 284, y, 48, 36) + pilha(r, 346, y, 48, 30) + RS(274, y, 132, 7, c.mdf(m), 0.8); });
    s += roupas(r, 414, 586, 100, 170) + RS(414, 300, 172, 7, c.mdf(m), 0.8) + roupas(r, 414, 586, 330, 160);
    [160, 250].forEach(function (y) {
      s += '<path d="M604 ' + y + 'l6 -26h34l6 26z" fill="#B9A688" stroke="' + INK + '" stroke-width=".7"/><path d="M616 ' + (y - 26) + 'q11 -16 22 0" fill="none" stroke="' + INK + '" stroke-width=".8"/>';
      s += '<path d="M664 ' + y + 'l4 -20h42l4 20z" fill="#5B4D41" stroke="' + INK + '" stroke-width=".7"/>';
      s += RS(594, y, 132, 7, c.mdf(m), 0.8);
    });
    [330, 400, 470, 540].forEach(function (y) {
      s += '<g transform="rotate(-7 660 ' + y + ')">';
      for (var k = 0; k < 3; k++) { var sx = 604 + k * 40, cor = TONS[Math.floor(r() * TONS.length)]; s += '<path d="M' + sx + ' ' + y + 'h28l2 -5q-9 -2 -16 -9h-14z" fill="' + cor + '" stroke="' + INK + '" stroke-width=".6"/>'; }
      s += RS(594, y, 132, 6, c.mdf(m), 0.8) + '</g>';
    });
    [140, 220, 300].forEach(function (y) { s += caixa(r, 744, y, 70, 40) + caixa(r, 824, y, 70, 32) + RS(734, y, 172, 7, c.mdf(m), 0.8); });
    for (i = 0; i < 3; i++) s += porta(c, 730, 330 + i * 74, 180, 74, m, p, 'n');
    for (i = 0; i < 6; i++) s += RS(X[i] - 4, 56, 8, 504, c.mdf(m), 0.8);
    s += RS(86, 52, 828, 8, c.mdf(m), 0.9) + RS(86, 552, 828, 8, c.mdf(m), 0.9);
    s += rodape(90, 820);
    return { svg: s, x0: 86, x1: 914 };
  };

  AMB.homeoffice = function (c, o, r) {
    var m = o.mdf, m2 = o.mdf2 || o.mdf, p = o.pux, s = '', i;
    for (i = 0; i < 3; i++) s += porta(c, 120 + i * 120, 110, 120, 140, m, p, i === 0 ? 'se' : i === 2 ? 'sw' : 's');
    s += R(120, 250, 360, 60, c.grad('led'));
    s += objetos(r, 520, 880, 190, 62) + objetos(r, 520, 880, 290, 70);
    s += RS(520, 190, 360, 7, c.mdf(m2), 0.8) + RS(520, 290, 360, 7, c.mdf(m2), 0.8);
    s += R(522, 197, 356, 5, 'rgba(0,0,0,.06)') + R(522, 297, 356, 5, 'rgba(0,0,0,.06)');
    s += RS(300, 282, 190, 116, '#2A2A2B', 1) + R(306, 288, 178, 104, c.grad('tela')) + R(390, 398, 10, 20, '#55524D') + R(362, 416, 66, 4, '#55524D');
    s += RS(330, 412, 118, 6, '#D6D1C8', 0.6);
    s += '<path d="M150 420h40M170 420L160 352L204 320" stroke="' + INK + '" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M196 312l30 16l-8 13l-30 -16z" fill="#2E2A25"/>';
    s += plantinha(r, 600, 420, 1);
    s += RS(96, 420, 808, 12, c.mdf(m2), 1);
    s += RS(100, 432, 14, 148, c.mdf(m2), 0.8);
    for (i = 0; i < 3; i++) s += porta(c, 720, 432 + i * 36, 160, 36, m, p, 'n');
    s += R(726, 544, 148, 7, 'rgba(0,0,0,.08)');
    return { svg: s, x0: 96, x1: 904 };
  };

  AMB.sala = function (c, o, r) {
    var m = o.mdf, m2 = o.mdf2 || o.mdf, p = o.pux, s = '', i;
    s += R(262, 40, 476, 540, '#2A2420');
    for (var x = 264; x < 736; x += 16) s += R(x, 40, 11, 540, c.mdf(m));
    s += RS(262, 40, 476, 540, 'none', 1);
    s += R(330, 190, 340, 220, c.grad('halo'));
    s += RS(352, 210, 296, 170, c.grad('tv'), 1.2) + '<path d="M370 370L470 222" stroke="#fff" stroke-opacity=".06" stroke-width="30"/>';
    [110, 738].forEach(function (x0) {
      s += RS(x0, 120, 152, 300, c.mdf(m), 0.9) + RS(x0 + 8, 128, 136, 284, c.mdf(m2), 0.6);
      s += R(x0 + 9, 129, 134, 40, c.grad('led'));
      s += objetos(r, x0 + 8, x0 + 144, 220, 66) + objetos(r, x0 + 8, x0 + 144, 320, 70) + objetos(r, x0 + 8, x0 + 144, 412, 60);
      s += RS(x0 + 8, 220, 136, 7, c.mdf(m), 0.7) + RS(x0 + 8, 320, 136, 7, c.mdf(m), 0.7);
    });
    s += objetos(r, 130, 250, 428, 40) + objetos(r, 750, 870, 428, 40);
    s += RS(106, 428, 788, 9, c.mdf(m2), 0.9);
    for (i = 0; i < 4; i++) s += porta(c, 110 + i * 195, 437, 195, 68, m, p, 'n');
    s += R(124, 512, 752, 8, 'rgba(0,0,0,.07)');
    return { svg: s, x0: 106, x1: 894 };
  };

  AMB.banheiro = function (c, o, r) {
    var m = o.mdf, p = o.pux, s = '', i;
    s += R(200, 40, 600, 540, '#E4DCCD');
    for (i = 1; i < 5; i++) s += L(200 + i * 120, 40, 200 + i * 120, 580, 0.8, 'rgba(46,42,37,.13)');
    [130, 220, 310, 400, 490].forEach(function (y) { s += L(200, y, 800, y, 0.8, 'rgba(46,42,37,.13)'); });
    s += L(200, 40, 200, 580, 0.9) + L(800, 40, 800, 580, 0.9);
    s += '<ellipse cx="500" cy="220" rx="215" ry="150" fill="' + c.grad('halo') + '"/>';
    s += '<rect x="330" y="110" width="340" height="220" rx="18" fill="' + c.grad('espelho') + '" stroke="' + INK + '" stroke-width="1"/>';
    s += '<path d="M380 300L470 130M420 300L500 150" stroke="#fff" stroke-width="5" stroke-opacity=".55"/>';
    s += R(496, 318, 8, 10, '#A9A6A0', ' stroke="' + INK + '" stroke-width=".6"') + R(498, 328, 4, 12, '#A9A6A0');
    s += '<path d="M436 344L564 344Q560 370 530 370L470 370Q440 370 436 344Z" fill="#F7F6F2" stroke="' + INK + '" stroke-width="1"/>';
    s += objetos(r, 600, 700, 370, 44);
    s += RS(290, 370, 420, 10, c.pedra(o.pedra), 1);
    s += porta(c, 300, 380, 200, 90, m, p, 'n') + porta(c, 500, 380, 200, 90, m, p, 'n');
    s += R(312, 476, 376, 8, 'rgba(0,0,0,.07)');
    s += porta(c, 720, 110, 70, 180, m, p, 'w') + porta(c, 720, 290, 70, 180, m, p, 'w');
    s += R(724, 474, 62, 6, 'rgba(0,0,0,.07)');
    return { svg: s, x0: 290, x1: 790 };
  };

  AMB.gourmet = function (c, o, r) {
    var m = o.mdf, m2 = o.mdf2 || o.mdf, p = o.pux, s = '', i, k;
    s += RS(300, 250, 640, 142, c.pedra(o.pedra), 0.8);
    s += objetos(r, 360, 930, 140, 54) + objetos(r, 360, 930, 210, 54);
    s += RS(360, 140, 570, 8, c.mdf(m2), 0.8) + RS(360, 210, 570, 8, c.mdf(m2), 0.8);
    s += '<path d="M112 40L268 40L296 200L84 200Z" fill="#B5AEA3" stroke="' + INK + '" stroke-width="1.1"/>';
    s += RS(80, 200, 220, 190, '#B5AEA3', 1.1);
    for (var y = 220; y < 390; y += 20) s += L(80, y, 300, y, 0.6, 'rgba(46,42,37,.15)');
    s += RS(104, 236, 172, 140, '#2B2724', 1);
    s += '<ellipse cx="190" cy="372" rx="78" ry="14" fill="' + c.grad('brasa') + '"/>';
    s += L(108, 326, 272, 326, 2, '#77726B');
    for (var gx = 116; gx < 270; gx += 12) s += L(gx, 322, gx, 330, 1, '#77726B');
    s += RS(56, 390, 888, 12, c.pedra(o.pedra), 1);
    s += porta(c, 60, 402, 120, 158, m, p, 'ne') + porta(c, 180, 402, 120, 158, m, p, 'nw');
    var h3 = 158 / 3;
    for (i = 0; i < 3; i++) s += porta(c, 300, 402 + i * h3, 160, h3, m, p, 'n');
    s += porta(c, 460, 402, 80, 158, m, p, 'ne') + porta(c, 540, 402, 80, 158, m, p, 'nw');
    s += RS(621.5, 403.5, 137, 155, c.mdf(m2), 0.9);
    for (i = 0; i < 4; i++) for (k = 0; k < 4; k++) {
      var cx = 641 + i * 32.5, cy = 422 + k * 37;
      s += '<circle cx="' + cx + '" cy="' + cy + '" r="12" fill="#2B2724" stroke="' + INK + '" stroke-width=".6"/>';
      if (r() < 0.75) s += '<circle cx="' + cx + '" cy="' + cy + '" r="7" fill="' + (r() < 0.6 ? '#5A2A2E' : '#3E4A32') + '"/><circle cx="' + cx + '" cy="' + cy + '" r="2.5" fill="#B8955D"/>';
    }
    s += porta(c, 760, 402, 90, 158, m, p, 'ne') + porta(c, 850, 402, 90, 158, m, p, 'nw');
    s += rodape(60, 880);
    s += torneira(536, 390);
    return { svg: s, x0: 56, x1: 944 };
  };

  function cotaH(x0, x1, y, txt) {
    var s = L(x0, y, x1, y, 0.8) + L(x0 - 5, y + 5, x0 + 5, y - 5, 1.1) + L(x1 - 5, y + 5, x1 + 5, y - 5, 1.1) + L(x0, y - 8, x0, y + 8, 0.6) + L(x1, y - 8, x1, y + 8, 0.6);
    var cx = (x0 + x1) / 2;
    return s + R(cx - 34, y - 9, 68, 18, '#F7F3EC') + T(cx, y + 4.5, txt, ' font-size="13" letter-spacing="1" text-anchor="middle" fill="' + INK + '"');
  }
  function metros(un) { return (un / 200).toFixed(2).replace('.', ',') + ' m'; }

  function svgAbre(vb, label, cls) { return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + vb + '" role="img" aria-label="' + esc(label) + '" class="' + (cls || 'desenho') + '" preserveAspectRatio="xMidYMid slice">'; }

  function elevacao(tipo, o, opts) {
    opts = opts || {};
    var c = new Ctx(), r = rng(hashStr(tipo + (o.seed || '')));
    var res = AMB[tipo](c, o, r);
    var s = R(0, 0, 1000, 620, opts.fundo || '#F7F3EC') + R(0, 40, 1000, 540, o.parede || '#EEE7DB');
    s += res.svg;
    s += L(0, 40, 1000, 40, 1.2) + R(0, 580, 1000, 40, '#E2D8C8');
    for (var x = -20; x < 1000; x += 14) s += L(x, 620, x + 22, 582, 0.6, 'rgba(46,42,37,.35)');
    s += L(0, 580, 1000, 580, 1.8);
    if (opts.cotas !== false) {
      s += cotaH(res.x0, res.x1, 20, metros(res.x1 - res.x0));
      s += L(978, 40, 978, 580, 0.8) + L(973, 45, 983, 35, 1.1) + L(973, 585, 983, 575, 1.1);
      s += R(970, 280, 16, 60, '#EEE7DB') + T(982, 310, '2,70 m', ' font-size="13" letter-spacing="1" text-anchor="middle" transform="rotate(-90 982 310)" fill="' + INK + '"');
    }
    return svgAbre('0 0 1000 620', opts.label || 'Elevação do ambiente', opts.cls) + c.out() + s + '</svg>';
  }

  /* ---------- perspectiva com um ponto de fuga ---------- */
  function perspectiva(tipo, o, opts) {
    opts = opts || {};
    var c = new Ctx(), r = rng(hashStr(tipo + (o.seed || '')));
    var res = AMB[tipo](c, o, r);
    var VP = [600, 306], TT = 2.4;
    function P(x, y, t) { return [VP[0] + t * (x - VP[0]), VP[1] + t * (y - VP[1])]; }
    var parede = o.parede || '#ECE5D8', s = '';
    s += poly([[200, 130], [1000, 130], P(1000, 130, TT), P(200, 130, TT)], '#F5F0E7');
    s += poly([[200, 130], P(200, 130, TT), P(200, 562, TT), [200, 562]], parede) + poly([[200, 130], P(200, 130, TT), P(200, 562, TT), [200, 562]], 'rgba(46,42,37,.05)');
    s += poly([[1000, 130], P(1000, 130, TT), P(1000, 562, TT), [1000, 562]], parede) + poly([[1000, 130], P(1000, 130, TT), P(1000, 562, TT), [1000, 562]], 'rgba(255,255,255,.14)');
    s += poly([[200, 562], [1000, 562], P(1000, 562, TT), P(200, 562, TT)], o.piso || '#D8C6AA');
    var xs = [];
    for (var x = 200; x <= 1000; x += 34) { xs.push(x); var pe = P(x, 562, TT); s += L(x, 562, pe[0], pe[1], 0.8, 'rgba(46,42,37,.16)'); }
    [1.12, 1.3, 1.52, 1.78, 2.1].forEach(function (t, ti) {
      for (var i = ti % 2; i < xs.length - 1; i += 2) { var a = P(xs[i], 562, t), b = P(xs[i + 1], 562, t); s += L(a[0], a[1], b[0], b[1], 0.7, 'rgba(46,42,37,.13)'); }
    });
    s += poly([[200, 562], [1000, 562], P(1000, 562, TT), P(200, 562, TT)], c.grad('luzpiso'));
    if (opts.janela !== false) {
      var w1 = P(1000, 180, 1.18), w2 = P(1000, 180, 1.62), w3 = P(1000, 470, 1.62), w4 = P(1000, 470, 1.18);
      s += poly([w1, w2, w3, w4], c.grad('ceu'), ' stroke="' + INK + '" stroke-width="1.1"');
      var m1 = P(1000, 180, 1.4), m2 = P(1000, 470, 1.4); s += L(m1[0], m1[1], m2[0], m2[1], 1.2);
      var h1 = P(1000, 300, 1.18), h2 = P(1000, 300, 1.62); s += L(h1[0], h1[1], h2[0], h2[1], 0.8);
      s += poly([P(1000, 562, 1.2), P(1000, 562, 1.66), P(700, 562, 1.85), P(780, 562, 1.32)], 'rgba(255,250,236,.32)');
    }
    s += '<g transform="translate(200 130) scale(.8) translate(0 -40)">' + R(0, 40, 1000, 540, parede) + res.svg + '</g>';
    s += RS(200, 130, 800, 432, 'none', 1);
    [[200, 130], [1000, 130], [200, 562], [1000, 562]].forEach(function (pt) { var e = P(pt[0], pt[1], TT); s += L(pt[0], pt[1], e[0], e[1], 1); });
    [[420, 1.32], [780, 1.32], [420, 1.82], [780, 1.82]].forEach(function (q) { var pt = P(q[0], 130, q[1]); s += '<ellipse cx="' + f(pt[0]) + '" cy="' + f(pt[1]) + '" rx="' + f(8 * q[1]) + '" ry="' + f(2.4 * q[1]) + '" fill="#FFF6E2" stroke="' + INK + '" stroke-width=".6"/>'; });

    if (opts.tapete) {
      s += poly([P(330, 562, 1.12), P(870, 562, 1.12), P(870, 562, 1.7), P(330, 562, 1.7)], opts.tapete === true ? '#E9E1D2' : opts.tapete, ' stroke="' + INK + '" stroke-width=".8"');
      s += poly([P(345, 562, 1.16), P(855, 562, 1.16), P(855, 562, 1.64), P(345, 562, 1.64)], 'none', ' stroke="' + INK + '" stroke-width=".5" stroke-dasharray="4 4"');
    }
    if (opts.ilha) {
      var t1 = 1.3, t2 = 1.56, xa = 430, xb = 770, yt = 418;
      var A = P(xa, yt, t1), B = P(xb, yt, t1), C = P(xb, yt, t2), D = P(xa, yt, t2), F = P(xb, 562, t2);
      var topo = opts.ilha === 'mdf' ? c.mdf(o.mdf2 || o.mdf) : c.pedra(o.pedra);
      s += poly([A, B, C, D], topo, ' stroke="' + INK + '" stroke-width="1"');
      var fw = C[0] - D[0], fh = F[1] - D[1], tb = 9 * t2;
      s += RS(D[0], D[1], fw, tb, topo, 1);
      var n = 4, dw = fw / n;
      for (var k = 0; k < n; k++) s += porta(c, D[0] + k * dw, D[1] + tb, dw, fh - tb - 22, o.mdf2 && opts.ilhaCor === 2 ? o.mdf2 : o.mdf, o.pux, tipo === 'closet' ? 'n' : (k % 2 ? 'nw' : 'ne'));
      s += R(D[0] + 8, F[1] - 22, fw - 16, 22, '#2E2A25', ' opacity=".78"');
      s += '<ellipse cx="' + f((D[0] + C[0]) / 2) + '" cy="' + f(F[1] + 4) + '" rx="' + f(fw * 0.55) + '" ry="10" fill="rgba(0,0,0,.08)"/>';
      if (opts.pendentes) {
        [520, 680].forEach(function (px) {
          var top = P(px, 130, 1.43), py = 300;
          s += L(px === 520 ? top[0] : top[0], top[1], px === 520 ? top[0] : top[0], py, 0.9);
          var cx = top[0];
          s += '<ellipse cx="' + f(cx) + '" cy="' + (py + 34) + '" rx="34" ry="10" fill="#FFE7BD" opacity=".55"/>';
          s += '<path d="M' + f(cx - 26) + ' ' + (py + 30) + 'Q' + f(cx - 24) + ' ' + py + ' ' + f(cx) + ' ' + py + 'Q' + f(cx + 24) + ' ' + py + ' ' + f(cx + 26) + ' ' + (py + 30) + 'Z" fill="#2E2A25"/>';
        });
      }
    }
    if (opts.planta !== false) {
      var px0 = 62, py0 = 776;
      for (var i2 = 0; i2 < 11; i2++) {
        var ang = -Math.PI / 2 + (i2 - 5) * 0.2 + (r() - 0.5) * 0.15, len = 120 + r() * 120;
        var bx = px0 + 40 + Math.cos(ang) * len, by = py0 - 70 + Math.sin(ang) * len;
        s += '<path d="M' + (px0 + 40) + ' ' + (py0 - 70) + 'Q' + f(px0 + 40 + Math.cos(ang) * len * 0.5 + 10) + ' ' + f(py0 - 70 + Math.sin(ang) * len * 0.5) + ' ' + f(bx) + ' ' + f(by) + '" fill="none" stroke="' + INK + '" stroke-width="1"/>';
        s += folha(bx, by, Math.cos(ang + 0.5) * 46, Math.sin(ang + 0.5) * 46, i2 % 2 ? '#8D9878' : '#A3AC8E');
        s += folha(bx, by, Math.cos(ang - 0.6) * 40, Math.sin(ang - 0.6) * 40, '#7D8A6B');
      }
      s += '<path d="M' + px0 + ' ' + (py0 - 74) + 'L' + (px0 + 80) + ' ' + (py0 - 74) + 'L' + (px0 + 70) + ' ' + (py0 + 10) + 'L' + (px0 + 10) + ' ' + (py0 + 10) + 'Z" fill="#C2A587" stroke="' + INK + '" stroke-width="1.1"/>';
    }
    s += R(0, -20, 1200, 800, c.grad('vinheta'));
    return svgAbre('0 -20 1200 800', opts.label || 'Perspectiva ilustrada do ambiente', opts.cls) + c.out() + s + '</svg>';
  }

  /* ---------- planta de layout ---------- */
  var PLANTAS = {
    cozinha: { blocos: [[100, 100, 600, 64, 'Bancada com cuba e cooktop'], [100, 164, 64, 230, 'Torre de forno e geladeira'], [270, 290, 280, 96, 'Ilha com gavetões', 2]], moveis: [['banq', 300, 410], ['banq', 380, 410], ['banq', 460, 410]], porta: [560, 540, 90, 's'], janela: [300, 100, 200, 'n'] },
    dormitorio: { blocos: [[100, 100, 600, 62, 'Guarda-roupa com nicho e gaveteiro'], [220, 522, 360, 18, 'Painel de cabeceira', 2], [222, 452, 58, 56, 'Criados suspensos'], [520, 452, 58, 56, '']], moveis: [['cama', 290, 330, 220, 192]], porta: [100, 300, 80, 'w'], janela: [700, 260, 160, 'e'] },
    closet: { blocos: [[100, 100, 600, 62, 'Cabideiros e prateleiras'], [100, 162, 62, 280, 'Sapateira inclinada'], [638, 162, 62, 280, 'Gaveteiro e maleiro'], [300, 270, 200, 110, 'Ilha com gavetas e tampo', 2]], moveis: [], porta: [350, 540, 90, 's'] },
    homeoffice: { blocos: [[100, 100, 600, 70, 'Bancada de trabalho com gaveteiro'], [638, 170, 62, 230, 'Estante com portas', 2]], moveis: [['cadeira', 300, 220], ['sofa', 130, 420, 260, 96]], porta: [560, 540, 90, 's'], janela: [700, 250, 120, 'e'] },
    sala: { blocos: [[100, 100, 600, 52, 'Painel ripado e rack suspenso'], [100, 152, 50, 140, 'Nichos laterais', 2], [650, 152, 50, 140, '', 2]], moveis: [['tapete', 200, 240, 400, 250], ['sofa', 220, 400, 360, 96], ['mesa', 400, 310, 42]], porta: [100, 420, 80, 'w'], janela: [700, 300, 160, 'e'] },
    banheiro: { blocos: [[100, 100, 330, 60, 'Gabinete suspenso com bancada'], [430, 100, 50, 60, 'Nicho-torre', 2]], moveis: [['box', 480, 100, 220, 220], ['vaso', 170, 420]], porta: [520, 540, 80, 's'] },
    gourmet: { blocos: [[100, 100, 140, 80, 'Churrasqueira'], [240, 100, 460, 64, 'Bancada com cuba e adega'], [638, 164, 62, 200, 'Armário de apoio', 2]], moveis: [['mesa-ret', 220, 300, 320, 130]], abertura: [200, 540, 400] }
  };

  function planta(tipo, o, dims, opts) {
    opts = opts || {};
    var c = new Ctx(), spec = PLANTAS[tipo], s = '', g = 'rgba(46,42,37,.55)';
    s += R(0, 0, 1000, 700, '#F7F3EC');
    for (var gx = 0; gx <= 1000; gx += 25) s += L(gx, 0, gx, 700, 0.4, 'rgba(46,42,37,.06)');
    for (var gy = 0; gy <= 700; gy += 25) s += L(0, gy, 1000, gy, 0.4, 'rgba(46,42,37,.06)');
    s += R(100, 100, 600, 440, '#FBF8F2');
    (spec.moveis || []).forEach(function (mv) {
      var k = mv[0];
      if (k === 'banq') s += '<circle cx="' + mv[1] + '" cy="' + mv[2] + '" r="17" fill="none" stroke="' + g + '" stroke-width="1"/>';
      if (k === 'cadeira') s += '<circle cx="' + mv[1] + '" cy="' + mv[2] + '" r="28" fill="none" stroke="' + g + '"/><path d="M' + (mv[1] - 24) + ' ' + (mv[2] + 18) + 'q24 18 48 0" fill="none" stroke="' + g + '"/>';
      if (k === 'sofa') s += '<rect x="' + mv[1] + '" y="' + mv[2] + '" width="' + mv[3] + '" height="' + mv[4] + '" rx="12" fill="none" stroke="' + g + '"/><rect x="' + (mv[1] + 14) + '" y="' + mv[2] + '" width="' + (mv[3] - 28) + '" height="' + (mv[4] - 26) + '" rx="8" fill="none" stroke="' + g + '"/>';
      if (k === 'cama') s += '<rect x="' + mv[1] + '" y="' + mv[2] + '" width="' + mv[3] + '" height="' + mv[4] + '" rx="6" fill="none" stroke="' + g + '"/><rect x="' + (mv[1] + 16) + '" y="' + (mv[2] + mv[4] - 44) + '" width="88" height="30" rx="8" fill="none" stroke="' + g + '"/><rect x="' + (mv[1] + mv[3] - 104) + '" y="' + (mv[2] + mv[4] - 44) + '" width="88" height="30" rx="8" fill="none" stroke="' + g + '"/><path d="M' + mv[1] + ' ' + (mv[2] + 70) + 'h' + mv[3] + '" stroke="' + g + '"/>';
      if (k === 'tapete') s += '<rect x="' + mv[1] + '" y="' + mv[2] + '" width="' + mv[3] + '" height="' + mv[4] + '" fill="none" stroke="' + g + '" stroke-dasharray="6 5"/>';
      if (k === 'mesa') s += '<circle cx="' + mv[1] + '" cy="' + mv[2] + '" r="' + mv[3] + '" fill="none" stroke="' + g + '"/>';
      if (k === 'mesa-ret') { s += '<rect x="' + mv[1] + '" y="' + mv[2] + '" width="' + mv[3] + '" height="' + mv[4] + '" rx="4" fill="none" stroke="' + g + '"/>'; for (var i = 0; i < 4; i++) { s += '<rect x="' + (mv[1] + 30 + i * 70) + '" y="' + (mv[2] - 34) + '" width="44" height="26" rx="6" fill="none" stroke="' + g + '"/><rect x="' + (mv[1] + 30 + i * 70) + '" y="' + (mv[2] + mv[4] + 8) + '" width="44" height="26" rx="6" fill="none" stroke="' + g + '"/>'; } }
      if (k === 'box') s += '<rect x="' + mv[1] + '" y="' + mv[2] + '" width="' + mv[3] + '" height="' + mv[4] + '" fill="none" stroke="' + g + '"/><path d="M' + mv[1] + ' ' + mv[2] + 'l' + mv[3] + ' ' + mv[4] + 'M' + (mv[1] + mv[3]) + ' ' + mv[2] + 'l-' + mv[3] + ' ' + mv[4] + '" stroke="' + g + '" stroke-width=".6"/><circle cx="' + (mv[1] + mv[3] / 2) + '" cy="' + (mv[2] + mv[4] / 2) + '" r="8" fill="none" stroke="' + g + '"/>';
      if (k === 'vaso') s += '<rect x="' + (mv[1] - 22) + '" y="' + (mv[2] + 34) + '" width="44" height="18" fill="none" stroke="' + g + '"/><ellipse cx="' + mv[1] + '" cy="' + (mv[2] + 6) + '" rx="20" ry="28" fill="none" stroke="' + g + '"/>';
    });
    var cor1 = (MDF[o.mdf] || MDF.linho).base, cor2 = (MDF[o.mdf2 || o.mdf] || MDF.linho).base, n = 0, leg = [];
    spec.blocos.forEach(function (b) {
      var cor = b[5] === 2 ? cor2 : cor1;
      s += R(b[0], b[1], b[2], b[3], cor, ' opacity=".7"') + RS(b[0], b[1], b[2], b[3], 'none', 1.2);
      s += R(b[0] + 6, b[1] + 6, Math.max(0, b[2] - 12), Math.max(0, b[3] - 12), 'none', ' stroke="' + INK + '" stroke-width=".6" stroke-dasharray="5 4"');
      if (b[4]) {
        n++; leg.push(b[4]);
        var cx = b[0] + b[2] / 2, cy = b[1] + b[3] / 2;
        s += '<circle cx="' + cx + '" cy="' + cy + '" r="15" fill="#2E2A25"/>' + T(cx, cy + 5, String(n), ' font-size="15" font-weight="600" text-anchor="middle" fill="#F2EDE4"');
      }
    });
    s += '<rect x="100" y="100" width="600" height="440" fill="none" stroke="' + INK + '" stroke-width="12"/>';
    if (spec.porta) {
      var pr = spec.porta, px = pr[0], py = pr[1], pw = pr[2];
      if (pr[3] === 's') s += R(px, py - 8, pw, 16, '#FBF8F2') + L(px, py, px, py - pw, 1.2) + '<path d="M' + px + ' ' + (py - pw) + 'A' + pw + ' ' + pw + ' 0 0 1 ' + (px + pw) + ' ' + py + '" fill="none" stroke="' + INK + '" stroke-width=".7" stroke-dasharray="4 3"/>';
      if (pr[3] === 'w') s += R(px - 8, py, 16, pw, '#FBF8F2') + L(px, py, px + pw, py, 1.2) + '<path d="M' + (px + pw) + ' ' + py + 'A' + pw + ' ' + pw + ' 0 0 1 ' + px + ' ' + (py + pw) + '" fill="none" stroke="' + INK + '" stroke-width=".7" stroke-dasharray="4 3"/>';
    }
    if (spec.janela) {
      var j = spec.janela;
      if (j[3] === 'n') s += R(j[0], j[1] - 7, j[2], 14, '#FBF8F2') + L(j[0], j[1] - 3, j[0] + j[2], j[1] - 3, 1) + L(j[0], j[1] + 3, j[0] + j[2], j[1] + 3, 1);
      if (j[3] === 'e') s += R(j[0] - 7, j[1], 14, j[2], '#FBF8F2') + L(j[0] - 3, j[1], j[0] - 3, j[1] + j[2], 1) + L(j[0] + 3, j[1], j[0] + 3, j[1] + j[2], 1);
    }
    if (spec.abertura) { var a = spec.abertura; s += R(a[0], a[1] - 8, a[2], 16, '#FBF8F2') + L(a[0], a[1] - 3, a[0] + a[2] / 2 + 10, a[1] - 3, 1.2) + L(a[0] + a[2] / 2 - 10, a[1] + 3, a[0] + a[2], a[1] + 3, 1.2); }
    s += cotaH(100, 700, 60, (dims && dims[0]) || '4,00 m');
    s += L(60, 100, 60, 540, 0.8) + L(55, 105, 65, 95, 1.1) + L(55, 545, 65, 535, 1.1) + R(51, 285, 18, 70, '#F7F3EC') + T(64, 320, (dims && dims[1]) || '3,00 m', ' font-size="13" letter-spacing="1" text-anchor="middle" transform="rotate(-90 64 320)" fill="' + INK + '"');
    s += T(750, 128, 'PLANTA DE LAYOUT', ' font-size="14" letter-spacing="3" fill="' + INK + '" font-weight="600"') + L(750, 142, 960, 142, 0.8);
    leg.forEach(function (t, i) { var y = 180 + i * 46; s += '<circle cx="762" cy="' + (y - 5) + '" r="11" fill="#2E2A25"/>' + T(762, y, String(i + 1), ' font-size="12" font-weight="600" text-anchor="middle" fill="#F2EDE4"') + T(784, y, t.length > 24 ? t.slice(0, t.lastIndexOf(' ', 24)) : t, ' font-size="15" fill="' + INK + '"') + (t.length > 24 ? T(784, y + 19, t.slice(t.lastIndexOf(' ', 24) + 1), ' font-size="15" fill="' + INK + '"') : ''); });
    s += '<g transform="translate(900 620)"><circle r="22" fill="none" stroke="' + INK + '"/><path d="M0 -18L7 8L0 3L-7 8Z" fill="' + INK + '"/>' + T(0, -28, 'N', ' font-size="12" text-anchor="middle" fill="' + INK + '"') + '</g>';
    s += T(750, 640, 'Escala gráfica', ' font-size="12" fill="' + INK + '"') + R(750, 650, 50, 6, INK) + R(800, 650, 50, 6, 'none', ' stroke="' + INK + '"') + T(750, 676, '0', ' font-size="11" fill="' + INK + '"') + T(842, 676, '1 m', ' font-size="11" fill="' + INK + '"');
    return svgAbre('0 0 1000 700', opts.label || 'Planta de layout', opts.cls) + c.out() + s + '</svg>';
  }

  /* ---------- detalhe de acabamento ---------- */
  function detalhe(o, opts) {
    opts = opts || {};
    var c = new Ctx(), m = o.mdf, p = o.pux || 'cava', s = '';
    var fx = 70, fy = 170, fw = 470, dx = 26, dy = -22, base = (MDF[m] || MDF.linho).base;
    s += R(0, 0, 1000, 700, '#F7F3EC');
    s += R(fx + 24, fy + 24, fw, 560, 'rgba(46,42,37,.07)');
    s += poly([[fx, fy], [fx + fw, fy], [fx + fw + dx, fy + dy], [fx + dx, fy + dy]], base, ' stroke="' + INK + '" stroke-width="1"');
    s += poly([[fx, fy], [fx + fw, fy], [fx + fw + dx, fy + dy], [fx + dx, fy + dy]], 'rgba(255,255,255,.3)');
    s += poly([[fx + fw, fy], [fx + fw + dx, fy + dy], [fx + fw + dx, 700], [fx + fw, 700]], base, ' stroke="' + INK + '" stroke-width="1"');
    s += poly([[fx + fw, fy], [fx + fw + dx, fy + dy], [fx + fw + dx, 700], [fx + fw, 700]], 'rgba(0,0,0,.14)');
    s += R(fx, fy, fw, 540, c.mdf(m), ' stroke="' + INK + '" stroke-width="1.2"');
    var hx = fx + fw - 70, hy = fy + 20;
    if (p === 'cava') { s += R(fx, fy, fw, 34, 'rgba(25,18,12,.45)') + L(fx, fy + 34, fx + fw, fy + 34, 1, 'rgba(255,255,255,.45)') + poly([[fx, fy], [fx + fw, fy], [fx + fw + 10, fy - 9], [fx + 10, fy - 9]], 'rgba(25,18,12,.35)'); hy = fy + 17; }
    else if (p === 'perfil' || p === 'perfil-preto') { var pc = PUX[p].cor; s += R(fx, fy - 4, fw, 14, pc, ' stroke="' + INK + '" stroke-width=".8"') + poly([[fx, fy - 4], [fx + fw, fy - 4], [fx + fw + dx, fy + dy - 4], [fx + dx, fy + dy - 4]], pc, ' stroke="' + INK + '" stroke-width=".8"'); hy = fy + 3; }
    else if (p === 'ponto' || p === 'ponto-preto') { var kc = PUX[p].cor; s += '<ellipse cx="' + (hx + 6) + '" cy="' + (fy + 82) + '" rx="18" ry="8" fill="rgba(0,0,0,.12)"/><circle cx="' + hx + '" cy="' + (fy + 70) + '" r="17" fill="' + kc + '" stroke="' + INK + '"/><circle cx="' + (hx - 5) + '" cy="' + (fy + 65) + '" r="5" fill="rgba(255,255,255,.5)"/>'; hy = fy + 70; }
    else { s += '<circle cx="' + hx + '" cy="' + (fy + 60) + '" r="16" fill="none" stroke="' + INK + '" stroke-dasharray="3 3"/><circle cx="' + hx + '" cy="' + (fy + 60) + '" r="4" fill="' + INK + '"/>'; hy = fy + 60; }
    var hc = [800, 470];
    s += '<clipPath id="' + c.u + '-cl"><circle cx="' + hc[0] + '" cy="' + hc[1] + '" r="118"/></clipPath>';
    s += '<circle cx="' + hc[0] + '" cy="' + hc[1] + '" r="118" fill="#FBF8F2"/>';
    s += '<g clip-path="url(#' + c.u + '-cl)">' + R(682, 350, 60, 240, c.mdf(m), ' stroke="' + INK + '"') + R(742, 350, 200, 26, c.mdf(m), ' stroke="' + INK + '"');
    s += R(752, 440, 70, 30, '#C9C6BF', ' stroke="' + INK + '" rx="4"') + R(800, 446, 110, 18, '#D9D6CF', ' stroke="' + INK + '" rx="5"') + '<circle cx="770" cy="455" r="26" fill="#BDB9B1" stroke="' + INK + '"/><circle cx="770" cy="455" r="18" fill="none" stroke="' + INK + '" stroke-width=".7"/>' + '<circle cx="880" cy="455" r="4" fill="' + INK + '"/><circle cx="840" cy="455" r="4" fill="' + INK + '"/>' + R(790, 480, 60, 8, '#8E8B85', ' rx="4"') + '</g>';
    s += '<circle cx="' + hc[0] + '" cy="' + hc[1] + '" r="118" fill="none" stroke="' + INK + '" stroke-width="1.4"/>';
    s += L(fx + fw - 40, fy + 380, 682, hc[1] - 10, 0.8, INK, ' stroke-dasharray="4 4"') + '<circle cx="' + (fx + fw - 40) + '" cy="' + (fy + 380) + '" r="22" fill="none" stroke="' + INK + '" stroke-dasharray="4 4"/>';
    var lab = function (x1, y1, ly, t1, t2, nn) {
      return '<circle cx="' + x1 + '" cy="' + y1 + '" r="4" fill="' + INK + '"/>' + '<path d="M' + x1 + ' ' + y1 + 'L' + (x1 + 30) + ' ' + ly + 'L640 ' + ly + '" fill="none" stroke="' + INK + '" stroke-width=".8"/>' +
        '<circle cx="660" cy="' + (ly - 1) + '" r="13" fill="#2E2A25"/>' + T(660, ly + 4, String(nn), ' font-size="13" font-weight="600" text-anchor="middle" fill="#F2EDE4"') +
        T(684, ly + 1, t1, ' font-size="20" fill="' + INK + '" font-weight="600"') + T(684, ly + 24, t2, ' font-size="15" fill="#5A544B"');
    };
    s += lab(fx + fw / 2, fy + dy / 2 - 1, 70, 'Chapa de MDF 18 mm', (MDF[m] || MDF.linho).nome + ', dupla face', 1);
    s += lab(fx + fw + dx / 2, fy + 230, 160, 'Fita de borda 1 mm', 'colada com PUR, resiste à umidade', 2);
    s += lab(hx, hy, 250, PUX[p].nome, PUX[p].desc, 3);
    s += '<circle cx="660" cy="623" r="13" fill="#2E2A25"/>' + T(660, 628, '4', ' font-size="13" font-weight="600" text-anchor="middle" fill="#F2EDE4"') + T(684, 625, 'Dobradiça com amortecimento', ' font-size="20" fill="' + INK + '" font-weight="600"') + T(684, 648, 'fecha devagar, regulagem em 3 eixos', ' font-size="15" fill="#5A544B"');
    s += T(40, 60, 'DETALHE DE ACABAMENTO · SEM ESCALA', ' font-size="14" letter-spacing="3" fill="' + INK + '" font-weight="600"');
    return svgAbre('0 0 1000 700', opts.label || 'Detalhe de acabamento', opts.cls) + c.out() + s + '</svg>';
  }

  /* ---------- diagrama didático: corte de um módulo ---------- */
  function corte(o) {
    o = o || { mdf: 'carvalho-hanover', pux: 'cava' };
    var c = new Ctx(), s = '', K = 0.55, KZ = 0.42;
    function O(x, y, z) { return [x + z * K, y - z * KZ]; }
    function caixa3(x0, x1, y0, y1, z0, z1, frente, topo, lado) {
      var r = '';
      r += poly([O(x0, y0, z0), O(x1, y0, z0), O(x1, y0, z1), O(x0, y0, z1)], topo, ' stroke="' + INK + '" stroke-width=".9" stroke-linejoin="round"');
      r += poly([O(x1, y0, z0), O(x1, y0, z1), O(x1, y1, z1), O(x1, y1, z0)], lado, ' stroke="' + INK + '" stroke-width=".9" stroke-linejoin="round"');
      r += poly([O(x0, y0, z0), O(x1, y0, z0), O(x1, y1, z0), O(x0, y1, z0)], frente, ' stroke="' + INK + '" stroke-width=".9" stroke-linejoin="round"');
      return r;
    }
    var w = c.mdf(o.mdf), base = (MDF[o.mdf] || MDF.linho).base, interno = '#EFE9DE', interno2 = '#E2DACB', fita = '#B9915F';
    s += '<g transform="translate(205 175)">';
    s += '<ellipse cx="200" cy="372" rx="300" ry="34" fill="rgba(46,42,37,.07)"/>';
    s += caixa3(14, 286, 330, 360, 30, 36, '#3A342E', '#4A433B', '#2E2A25');
    s += caixa3(18, 282, 0, 330, 228, 234, interno2, interno2, interno2);
    s += caixa3(0, 18, 0, 330, 0, 240, fita, interno, interno);
    s += caixa3(18, 282, 312, 330, 0, 228, fita, interno, interno2);
    s += caixa3(18, 282, 168, 186, 12, 228, fita, interno, interno2);
    s += caixa3(282, 300, 0, 330, 0, 240, fita, interno, w);
    s += caixa3(150, 300, 100, 330, -1, 0, w, base, base);
    s += puxador(150, 100, 150, 230, o.pux, 'nw').replace(/^/, '');
    s += caixa3(-12, 312, -22, 0, -12, 250, '#E9E6E0', '#F1EFEA', '#DAD6CE');
    var zp = -120;
    s += caixa3(30, 270, 22, 96, zp + 18, 200, interno, interno, interno2);
    s += L(O(24, 84, zp + 20)[0], O(24, 84, zp + 20)[1], O(24, 84, 220)[0], O(24, 84, 220)[1], 3, '#8E8B85');
    s += L(O(276, 84, zp + 20)[0], O(276, 84, zp + 20)[1], O(276, 84, 220)[0], O(276, 84, 220)[1], 3, '#8E8B85');
    s += caixa3(2, 298, 14, 100, zp, zp + 18, w, fita, base);
    var pd = O(2, 14, zp); s += puxador(pd[0], pd[1], 296, 86, o.pux, 'n');
    var ang = 105 * Math.PI / 180, dw = 150, ex = dw * Math.cos(ang), ez = -dw * Math.sin(ang);
    s += poly([O(0, 100, 0), O(ex, 100, ez), O(ex, 330, ez), O(0, 330, 0)], interno, ' stroke="' + INK + '" stroke-width=".9"');
    s += poly([O(ex, 100, ez), O(ex - 18 * Math.sin(ang) * 0, 100, ez - 0), O(ex - 6, 100, ez + 0), O(ex - 6, 330, ez)], fita);
    var hc1 = O(ex * 0.16, 130, ez * 0.16), hc2 = O(ex * 0.16, 300, ez * 0.16);
    [hc1, hc2].forEach(function (h) { s += '<ellipse cx="' + f(h[0]) + '" cy="' + f(h[1]) + '" rx="9" ry="7" fill="#BDB9B1" stroke="' + INK + '" stroke-width=".8"/>' + L(h[0], h[1], h[0] + 24, h[1] - 6, 3, '#8E8B85'); });
    s += '</g>';
    var pins = [
      [205 + O(291, 0, 120)[0], 175 + O(291, 0, 120)[1] - 2, 1],
      [205 + O(300, 220, 0)[0] - 9, 175 + 220, 2],
      [205 + O(150, 60, 231)[0], 175 + O(150, 60, 231)[1], 3],
      [205 + hc1[0], 175 + hc1[1], 4],
      [205 + O(276, 84, 120)[0], 175 + O(276, 84, 120)[1], 5],
      [205 + O(150, 345, 33)[0], 175 + O(150, 345, 33)[1], 6],
      [205 + O(9, 321, 120)[0], 175 + O(9, 321, 120)[1], 7]
    ];
    pins.forEach(function (pp) {
      s += '<g class="pino" data-pino="' + pp[2] + '"><circle class="pino-halo" cx="' + f(pp[0]) + '" cy="' + f(pp[1]) + '" r="20"/><circle class="pino-ponto" cx="' + f(pp[0]) + '" cy="' + f(pp[1]) + '" r="13"/>' + T(pp[0], pp[1] + 4.5, String(pp[2]), ' font-size="13" font-weight="700" text-anchor="middle" fill="#F7F3EC"') + '</g>';
    });
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 740 620" role="img" aria-label="Corte ilustrado de um módulo de cozinha com gaveta aberta, porta aberta e prateleira, com sete pontos numerados" class="desenho-corte">' + c.out() + s + '</svg>';
  }

  /* amostra de chapa ou pedra para o mostruário */
  function amostra(tipo, key) {
    var c = new Ctx(), fill = tipo === 'pedra' ? c.pedra(key) : c.mdf(key);
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 150" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">' + c.out() + R(0, 0, 120, 150, fill) + R(0, 0, 120, 150, 'url(#' + c.u + '-lz)') + '<linearGradient id="' + c.u + '-lz" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".08"/></linearGradient></svg>';
  }

  global.VeioDesenho = {
    MDF: MDF, PEDRA: PEDRA, PUX: PUX, amostra: amostra,
    elevacao: elevacao, perspectiva: perspectiva, planta: planta, detalhe: detalhe, corte: corte
  };
})(window);
