/* ==========================================================================
   Vibex AudioCar · motor 3D em traço (SVG puro, sem bibliotecas)
   O perfil 2D do hatch é amostrado em polilinhas e extrudado em 3D.
   Portas e tampa traseira abrem por dobradiça; o sistema de som é dividido
   em camadas: portas, grave, modulos, midia, bateria.
   ========================================================================== */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var DEG = Math.PI / 180;
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (t, x) {
    if (x <= t[0][0]) return t[0][1];
    for (var i = 1; i < t.length; i++) if (x <= t[i][0]) {
      var a = t[i - 1][0], b = t[i - 1][1], c = t[i][0], d = t[i][1];
      return b + (d - b) * (x - a) / (c - a);
    }
    return t[t.length - 1][1];
  };

  /* meia-largura do carro em função da altura (HY) e do comprimento (HX) */
  var HY = [[110, 74], [124, 98], [218, 134], [226, 144], [250, 158], [360, 150]];
  var HX = [[104, 38], [112, 68], [140, 120], [200, 150], [260, 158], [740, 158], [820, 146], [864, 120], [878, 64]];
  var XN = [[230, 130], [238, 122], [252, 116], [270, 110], [294, 108], [318, 110], [334, 124], [350, 132]];
  var XT = [[114, 752], [132, 756], [196, 836], [232, 864], [268, 872], [322, 866], [340, 850]];
  var hw = function (x, y) { return Math.min(lerp(HY, y), lerp(HX, x)); };

  var CX = 490, CY = 236, D = 2000;
  var MAX = { fl: .95, fr: .95, rl: .85, rr: .85, tail: 1.0 };
  var DOORS = { fl: { h: 356, z: 1 }, fr: { h: 356, z: -1 }, rl: { h: 590, z: 1 }, rr: { h: 590, z: -1 } };
  var LAYERS = ['portas', 'grave', 'modulos', 'midia', 'bateria'];

  /* desenho lateral do hatch (classe | caminho) */
  var SIDE = [
    ['s', 'M120 336 L108 320 Q100 296 108 276 L120 250 Q132 234 158 228 L296 210 Q318 206 336 198 L440 132 Q454 122 476 120 L690 114 Q730 116 754 132 L836 196 Q858 210 864 232 L872 268 Q876 302 866 322 L850 338 L813 338 A66 66 0 1 0 707 338 L313 338 A66 66 0 1 0 207 338 Z'],
    ['s', 'M356 210 L448 142 Q458 134 474 134 L682 130 Q712 130 728 142 L790 190 Q796 198 784 200 Z'],
    ['h', 'M410 186 l44 -34 M440 188 l52 -40 M640 158 l34 -28 M672 162 l32 -26'],
    ['s', 'M578 132 H592 V206 H578 Z M706 131 L720 133 L756 192 L742 194 Z'],
    ['t', 'M358 214 Q346 272 356 336 M585 208 V336 M742 196 Q742 236 700 260'],
    ['t', 'M160 240 C330 230 600 224 868 226 M170 262 C340 254 600 246 866 246'],
    ['t', 'M348 318 C430 302 570 276 650 266 Q690 262 700 288'],
    ['t', 'M508 230 H544 V236 H508 Z'],
    ['t', 'M672 224 H704 V230 H672 Z'],
    ['s', 'M368 208 Q360 184 388 180 L410 184 Q416 198 402 208 Z'],
    ['s', 'M114 254 L206 238 L232 240 L216 252 L124 268 Z'],
    ['o', 'M126 261 L216 246'],
    ['s', 'M110 292 L168 286 L176 316 L120 322 Q112 310 110 292 Z'],
    ['h', 'M116 298 L170 293 M117 306 L172 301 M119 314 L174 309'],
    ['s', 'M118 336 L212 340 L208 350 L126 346 Z'],
    ['o', 'M128 344 H206'],
    ['s', 'M150 322 L196 326 L192 338 L148 334 Z'],
    ['s', 'M313 338 L707 338 L704 350 L318 350 Z'],
    ['o', 'M330 344 H692'],
    ['s', 'M776 200 L866 212 L868 228 L786 218 Z'],
    ['o', 'M786 209 L864 219'],
    ['s', 'M714 114 L788 122 Q794 126 786 132 L744 130 Z'],
    ['s', 'M806 322 L872 316 L864 338 L814 340 Z'],
    ['t', 'M833 330 A11 6 0 1 0 855 330 A11 6 0 1 0 833 330'],
    ['t', 'M774 248 A10 10 0 1 0 794 248 A10 10 0 1 0 774 248']
  ];
  var FACE_F = 'M-154 232 H154 L148 336 Q148 342 138 342 L-138 342 Q-148 342 -148 336 Z|s;M-150 236 L-64 244 L-56 258 L-140 266 Q-152 256 -150 236 Z|s;M150 236 L64 244 L56 258 L140 266 Q152 256 150 236 Z|s;M-142 252 L-66 254|o;M142 252 L66 254|o;M-58 244 H58 L52 258 H-52 Z|s;M-54 251 H54|o;M-102 284 H102 L90 322 H-90 Z|s;M-96 294 H96 M-93 304 H93 M-90 314 H90 M-60 284 L-54 322 M-20 284 L-18 322 M20 284 L18 322 M60 284 L54 322|h;M-148 298 L-116 300 L-120 322 L-146 320 Z|s;M148 298 L116 300 L120 322 L146 320 Z|s;M-150 340 H150 L144 350 H-144 Z|s;M-140 345 H140|o';
  var FACE_R = 'M-118 198 H118 L110 278 H-110 Z|t|T;M-84 128 H84 L112 192 H-112 Z|s|T;M-70 136 H70 M-76 148 H76 M-82 160 H82 M-88 172 H88|h|T;M-36 234 H36 V256 H-36 Z|t|T;M-150 206 L-70 200 L-66 216 L-146 224 Z|s;M150 206 L70 200 L66 216 L146 224 Z|s;M-142 213 L-72 208|o;M142 213 L72 208|o;M-66 209 H66|o;M-104 312 H104 L94 338 H-94 Z|s;M-60 312 V338 M-30 312 V338 M0 312 V338 M30 312 V338 M60 312 V338|h';
  var TOPF = 'M150 -104 Q210 -132 340 -134 L340 134 Q210 132 150 104|t;M340 -134 Q322 0 340 134|s;M340 -134 L452 -112 Q442 0 452 112 L340 134|s;M452 -112 L700 -108 L700 108 L452 112|s;M700 -108 L784 -92 Q796 0 784 92 L700 108|s;M170 -46 Q260 -60 336 -62 M170 46 Q260 60 336 62|h;M576 -110 V110|t;M470 -118 V-108 M470 118 V108|h;M356 -120 Q340 0 356 120|h;M744 -100 Q754 0 744 100|h';
  var PLATE_F = 'M358 212 L446 142 Q458 134 474 134 L576 130 L576 336 L356 336 Z;M368 212 L452 148 Q462 142 476 142 L568 138 L568 200 L368 206 Z;M508 230 h36 v6 h-36 Z;M368 300 L568 286';
  var PLATE_R = 'M590 130 L706 131 Q722 133 736 148 L756 196 L744 242 L700 268 L604 336 L590 336 Z;M598 140 L704 141 Q716 142 726 152 L744 194 L598 200 Z;M672 224 h32 v6 h-32 Z;M604 300 L730 280';

  /* ------------------------------------------------------------------ */
  function buildModel(step, discN) {
    var model = [];
    var tmp = document.createElementNS(NS, 'svg');
    tmp.setAttribute('width', 0); tmp.setAttribute('height', 0);
    tmp.style.position = 'absolute'; tmp.setAttribute('aria-hidden', 'true');
    document.body.appendChild(tmp);
    function polys(d) {
      var out = [];
      d.split(/(?=M)/).forEach(function (sub) {
        if (!sub.trim()) return;
        var p = document.createElementNS(NS, 'path');
        p.setAttribute('d', sub); tmp.appendChild(p);
        var L = p.getTotalLength(), n = Math.max(2, Math.ceil(L / step)), a = [];
        for (var i = 0; i <= n; i++) { var q = p.getPointAtLength(L * i / n); a.push([q.x, q.y]); }
        p.remove(); out.push(a);
      });
      return out;
    }

    /* lateral extrudada */
    var bodyPts = null;
    SIDE.forEach(function (row, idx) {
      var cls = row[0];
      polys(row[1]).forEach(function (poly) {
        if (idx === 0 && !bodyPts) {
          bodyPts = poly;
          [1, -1].forEach(function (sgn) {
            model.push({ cls: cls, face: sgn, pts: poly.map(function (p) { return [p[0], p[1], sgn * hw(p[0], p[1])]; }) });
          });
          return;
        }
        // separa os trechos que pertencem a cada porta (somem quando a porta abre)
        var reg = function (p) { return (p[1] < 334 && p[0] > 352 && p[0] < 584) ? 'f' : (p[1] < 334 && p[0] >= 584 && p[0] < 748) ? 'r' : ''; };
        var run = [poly[0]], cur = reg(poly[0]), runs = [];
        for (var i = 1; i < poly.length; i++) {
          var r = reg(poly[i]);
          if (r === cur) run.push(poly[i]);
          else { run.push(poly[i]); runs.push([cur, run]); run = [poly[i]]; cur = r; }
        }
        runs.push([cur, run]);
        runs.forEach(function (rr) {
          if (rr[1].length < 2) return;
          [1, -1].forEach(function (sgn) {
            var keys = rr[0] === 'f' ? [sgn > 0 ? 'fl' : 'fr'] : rr[0] === 'r' ? [sgn > 0 ? 'rl' : 'rr'] : null;
            model.push({ cls: cls, face: sgn, hide: keys, pts: rr[1].map(function (p) { return [p[0], p[1], sgn * hw(p[0], p[1])]; }) });
          });
        });
      });
    });

    /* frente e traseira */
    function face(list, front) {
      list.split(';').forEach(function (item) {
        var parts = item.split('|');
        polys(parts[0]).forEach(function (poly) {
          model.push({
            cls: parts[1], face: front ? 2 : -2, door: (!front && parts[2] === 'T') ? 'tail' : null,
            pts: poly.map(function (p) {
              var u = p[0], y = p[1];
              var X = front ? lerp(XN, y) + 30 * Math.pow(u / 158, 2) : lerp(XT, y) - 22 * Math.pow(u / 158, 2);
              var tp = Math.min(1, lerp(HX, X) / 158);
              return [X, y, (front ? -u : u) * tp];
            })
          });
        });
      });
    }
    face(FACE_F, true); face(FACE_R, false);
    function rearMap(p) {
      var u = p[0], y = p[1];
      var X = lerp(XT, y) - 22 * Math.pow(u / 158, 2), tp = Math.min(1, lerp(HX, X) / 158);
      return [X, y, u * tp];
    }
    polys('M-110 136 H110 L122 198 L114 286 H-114 L-122 198 Z').forEach(function (poly) { model.push({ cls: 't', show: 'tail', pts: poly.map(rearMap) }); });
    polys('M-104 292 H104').forEach(function (poly) { model.push({ cls: 'oh', show: 'tail', pts: poly.map(rearMap) }); });

    /* perfil superior: capô, para-brisa, teto, vidro traseiro */
    var TOP = {};
    bodyPts.forEach(function (p) { var k = Math.round(p[0] / 4) * 4; TOP[k] = Math.min(TOP[k] === undefined ? 1e9 : TOP[k], p[1]); });
    var keys = Object.keys(TOP).map(Number).sort(function (a, b) { return a - b; });
    // alguns intervalos só recebem pontos da borda de baixo: usa o menor y da vizinhança
    var TOP0 = Object.assign({}, TOP);
    keys.forEach(function (k) { keys.forEach(function (k2) { if (Math.abs(k2 - k) <= 12 && TOP0[k2] < TOP[k]) TOP[k] = TOP0[k2]; }); });
    var nearest = function (x) { return keys.reduce(function (a, b) { return Math.abs(b - x) < Math.abs(a - x) ? b : a; }); };
    TOPF.split(';').forEach(function (item) {
      var parts = item.split('|');
      polys(parts[0]).forEach(function (poly) {
        model.push({
          cls: parts[1], pts: poly.map(function (p) {
            var x = p[0], z = p[1], k = nearest(x);
            var w = Math.max(20, lerp(HX, k)), f = Math.min(1, Math.abs(z) / w);
            return [x, TOP[k] + (1 - Math.sqrt(Math.max(0, 1 - f * f))) * 24, z];
          })
        });
      });
    });

    /* portas (chapas com espessura) */
    function plate(d, key) {
      var h = DOORS[key], z = h.z;
      d.split(';').forEach(function (item) {
        polys(item).forEach(function (poly) {
          model.push({ cls: 's', door: key, face: z, pts: poly.map(function (p) { return [p[0], p[1], z * hw(p[0], p[1])]; }) });
          model.push({ cls: 'h', door: key, face: z, pts: poly.map(function (p) { return [p[0], p[1], z * (hw(p[0], p[1]) - 14)]; }) });
        });
      });
    }
    plate(PLATE_F, 'fl'); plate(PLATE_F, 'fr'); plate(PLATE_R, 'rl'); plate(PLATE_R, 'rr');

    /* ---------------- sistema de som ---------------- */
    var DOOR_KEY = null;
    function push(cls, layer, pts) { model.push({ cls: cls, layer: layer, door: DOOR_KEY, pts: pts }); }
    function box(x0, x1, y0, y1, z0, z1, cls, layer) {
      var c = [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0]], d = [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]];
      push(cls, layer, c.concat([c[0]])); push(cls, layer, d.concat([d[0]]));
      for (var i = 0; i < 4; i++) push(cls, layer, [c[i], d[i]]);
    }
    function disc(cx, cy, cz, r, pl, cls, layer, n) {
      n = n || discN; var a = [];
      for (var i = 0; i <= n; i++) {
        var t = i / n * Math.PI * 2, u = r * Math.cos(t), v = r * Math.sin(t);
        a.push(pl === 'xz' ? [cx + u, cy, cz + v] : pl === 'xy' ? [cx + u, cy + v, cz] : [cx, cy + v, cz + u]);
      }
      push(cls, layer, a);
    }
    function speaker(cx, cy, cz, r, pl, layer, depth) {
      var off = function (k) { return pl === 'xz' ? [cx, cy + k, cz] : pl === 'xy' ? [cx, cy, cz + k] : [cx + k, cy, cz]; };
      disc(cx, cy, cz, r, pl, 'o', layer); disc(cx, cy, cz, r * .78, pl, 'oh', layer);
      var c2 = off(depth); disc(c2[0], c2[1], c2[2], r * .30, pl, 'o', layer);
      var c3 = off(depth * 1.5); disc(c3[0], c3[1], c3[2], r * .12, pl, 'oh', layer, 16);
      for (var i = 0; i < 8; i++) {
        var t = i / 8 * Math.PI * 2, u = Math.cos(t), v = Math.sin(t);
        var p1 = pl === 'xz' ? [cx + u * r * .78, cy, cz + v * r * .78] : pl === 'xy' ? [cx + u * r * .78, cy + v * r * .78, cz] : [cx, cy + v * r * .78, cz + u * r * .78];
        var p2 = pl === 'xz' ? [cx + u * r * .3, cy + depth, cz + v * r * .3] : pl === 'xy' ? [cx + u * r * .3, cy + v * r * .3, cz + depth] : [cx + depth, cy + v * r * .3, cz + u * r * .3];
        push('oh', layer, [p1, p2]);
      }
    }
    var wire = function (pts, cls, layer) { push(cls, layer, pts); };

    /* GRAVE · caixa com 6 subs virados para cima */
    box(646, 850, 222, 330, -116, 116, 'o', 'grave');
    box(650, 846, 226, 230, -112, 112, 'oh', 'grave');
    [[706, -76], [706, 0], [706, 76], [792, -76], [792, 0], [792, 76]].forEach(function (p) {
      var x = p[0], z = p[1];
      disc(x, 226, z, 40, 'xz', 'o', 'grave');
      speaker(x, 230, z, 32, 'xz', 'grave', 26);
      disc(x, 262, z, 12, 'xz', 'oh', 'grave', 16);
    });
    box(690, 806, 300, 326, -24, 24, 'oh', 'grave');
    wire([[646, 296, 0], [618, 296, 0], [618, 330, 0]], 'oh', 'grave');

    /* PORTAS · forro com 4 tweeters quadrados + 4 falantes por porta dianteira */
    [150, -150].forEach(function (z) {
      var sg = Math.sign(z);
      DOOR_KEY = sg > 0 ? 'fl' : 'fr';
      var forro = function (pts, cls, zz) { push(cls, 'portas', pts.map(function (p) { return [p[0], p[1], zz]; })); };
      forro([[380, 216], [450, 213], [520, 211], [566, 210], [566, 240], [558, 252], [558, 282], [566, 294], [566, 324], [520, 328], [450, 329], [400, 329], [373.9, 319.6], [372.5, 303.4], [371.9, 287.3], [372.0, 271.5], [372.9, 255.8], [374.5, 240.4], [376.9, 225.1], [380, 216]], 'o', sg * 149);
      forro([[388, 223], [458, 220], [512, 218], [558, 217], [558, 247], [550, 259], [550, 275], [558, 287], [558, 317], [512, 321], [458, 322], [408, 322], [381.9, 312.6], [380.5, 296.4], [379.9, 280.3], [380.0, 264.5], [380.9, 262.8], [382.5, 247.4], [384.9, 232.1], [388, 223]], 'oh', sg * 149);
      [400, 448, 496, 544].forEach(function (x) {
        var y = 238, zz = sg * 148, a = 8;
        push('o', 'portas', [[x - a, y - a, zz], [x + a, y - a, zz], [x + a, y + a, zz], [x - a, y + a, zz], [x - a, y - a, zz]]);
        disc(x, y, zz - sg * 5, a * .45, 'xy', 'oh', 'portas', 16);
      });
      [400, 448, 496, 544].forEach(function (x) {
        var y = 296, zz = sg * 148, r = 21;
        disc(x, y, zz, r, 'xy', 'o', 'portas');
        disc(x, y, zz - sg * 9, r * .3, 'xy', 'oh', 'portas', 16);
        for (var i = 0; i < 6; i++) {
          var t = i / 6 * Math.PI * 2, u = Math.cos(t), v = Math.sin(t);
          push('oh', 'portas', [[x + u * r * .94, y + v * r * .94, zz], [x + u * r * .3, y + v * r * .3, zz - sg * 9]]);
        }
      });
      DOOR_KEY = null;
    });

    /* MÓDULOS · prancha vertical à frente da caixa de grave */
    function fins(x, y0, y1, z0, z1, n) {
      for (var i = 1; i < n; i++) { var z = z0 + (z1 - z0) * i / n; wire([[x, y0 + 3, z], [x, y1 - 3, z]], 'oh', 'modulos'); }
    }
    function modulo(xf, xb, y0, y1, z0, z1, tipo) {
      box(xf, xb, y0, y1, z0, z1, 'o', 'modulos');
      fins(xb, y0, y1, z0, z1, 8);
      wire([[xf, y0 + 4, z0 + 4], [xf, y0 + 4, z1 - 4], [xf, y1 - 4, z1 - 4], [xf, y1 - 4, z0 + 4], [xf, y0 + 4, z0 + 4]], 'oh', 'modulos');
      if (tipo === 'amp') {
        [0.18, 0.34, 0.5, 0.66, 0.82].forEach(function (f) { disc(xf - 1, (y0 + y1) / 2 - 6, z0 + (z1 - z0) * f, 3.2, 'yz', 'oh', 'modulos', 12); });
        [0.12, 0.28].forEach(function (f) { var z = z0 + (z1 - z0) * f; wire([[xf - 1, y1 - 9, z], [xf - 1, y1 - 9, z + 7]], 'oh', 'modulos'); });
        disc(xf - 1, y0 + 8, z1 - 8, 2, 'yz', 'o', 'modulos', 10);
      }
      if (tipo === 'fonte') {
        for (var i = 0; i < 4; i++) { var z = z0 + (z1 - z0) * (0.2 + i * 0.2); wire([[xf - 1, y0 + 8, z], [xf - 1, y1 - 8, z]], 'oh', 'modulos'); }
        disc(xf - 1, y0 + 8, z0 + 8, 2.4, 'yz', 'o', 'modulos', 10);
      }
      if (tipo === 'dsp') {
        wire([[xf - 1, y0 + 5, z0 + 8], [xf - 1, y0 + 5, z1 - 8], [xf - 1, y1 - 5, z1 - 8], [xf - 1, y1 - 5, z0 + 8], [xf - 1, y0 + 5, z0 + 8]], 'oh', 'modulos');
        [0.3, 0.5, 0.7].forEach(function (f) { disc(xf - 1, y1 - 6, z0 + (z1 - z0) * f, 2.4, 'yz', 'oh', 'modulos', 10); });
      }
    }
    box(626, 634, 226, 334, -112, 112, 'o', 'modulos');
    wire([[625, 232, -106], [625, 232, 106], [625, 328, 106], [625, 328, -106], [625, 232, -106]], 'oh', 'modulos');
    [[236, -102], [236, 102], [324, 102], [324, -102]].forEach(function (p) { disc(624, p[0], p[1], 3.5, 'yz', 'oh', 'modulos', 10); });
    [-68, -8, 64].forEach(function (z) { wire([[625, 232, z], [625, 328, z]], 'oh', 'modulos'); });
    modulo(596, 624, 238, 296, -104, -46, 'amp');
    modulo(596, 624, 238, 296, -30, 28, 'amp');
    modulo(596, 624, 238, 296, 44, 102, 'fonte');
    modulo(600, 624, 302, 328, -104, -10, 'dsp');
    box(600, 624, 302, 328, 4, 102, 'o', 'modulos');
    [20, 42, 64, 86].forEach(function (z) {
      box(600, 610, 306, 324, z - 8, z + 8, 'oh', 'modulos');
      wire([[600, 315, z], [586, 315, z]], 'oh', 'modulos');
    });
    wire([[632, 290, 0], [646, 290, 0]], 'oh', 'modulos');

    /* MULTIMÍDIA · central no painel */
    box(352, 372, 214, 268, -46, 46, 'o', 'midia');
    for (var i = 0; i < 4; i++) wire([[352, 222 + i * 12, -40], [352, 222 + i * 12, 40]], 'oh', 'midia');
    wire([[344, 206, -120], [344, 206, 120], [372, 276, 120], [372, 276, -120], [344, 206, -120]], 'oh', 'midia');
    disc(352, 282, -70, 10, 'yz', 'oh', 'midia', 16); disc(352, 282, 70, 10, 'yz', 'oh', 'midia', 16);

    /* ELÉTRICA · bateria, fusível e cabeamento em ângulo reto pelo assoalho */
    box(168, 226, 248, 300, 44, 126, 'o', 'bateria');
    box(172, 222, 244, 248, 48, 122, 'oh', 'bateria');
    wire([[182, 248, 58], [182, 240, 58], [196, 240, 58], [196, 248, 58]], 'o', 'bateria');
    wire([[206, 248, 112], [206, 240, 112], [218, 240, 112], [218, 248, 112]], 'o', 'bateria');
    box(240, 262, 250, 274, 44, 68, 'o', 'bateria');
    wire([[196, 240, 58], [196, 232, 58], [251, 232, 58], [251, 250, 58]], 'cab', 'bateria');
    wire([[251, 274, 58], [251, 332, 58], [251, 332, 0], [600, 332, 0], [600, 316, 0]], 'cab', 'bateria');
    wire([[218, 240, 112], [218, 332, 112], [286, 332, 112], [286, 338, 112]], 'cab', 'bateria');
    wire([[604, 316, -70], [604, 300, -70], [600, 292, -70]], 'cab', 'bateria');
    wire([[604, 316, -8], [604, 296, -8], [600, 290, -8]], 'cab', 'bateria');
    wire([[604, 316, 66], [604, 296, 66], [600, 290, 66]], 'cab', 'bateria');
    wire([[604, 306, -40], [604, 286, -40], [600, 282, -70]], 'cabs', 'bateria');
    wire([[604, 306, -20], [604, 284, -20], [600, 282, -8]], 'cabs', 'bateria');
    wire([[596, 276, -80], [596, 332, -80], [470, 332, -80], [470, 332, -140], [470, 300, -140], [424, 300, -140], [424, 300, -148]], 'cab', 'bateria');
    wire([[596, 276, -60], [596, 332, -60], [500, 332, -60], [500, 332, -140], [500, 304, -140], [496, 304, -148]], 'cabs', 'bateria');
    wire([[596, 276, 80], [596, 332, 80], [470, 332, 80], [470, 332, 140], [470, 300, 140], [424, 300, 140], [424, 300, 148]], 'cab', 'bateria');
    wire([[596, 276, 60], [596, 332, 60], [500, 332, 60], [500, 332, 140], [500, 304, 140], [496, 304, 148]], 'cabs', 'bateria');
    wire([[634, 290, 40], [660, 290, 40], [660, 268, 40]], 'cab', 'bateria');
    wire([[634, 290, -40], [660, 290, -40], [660, 268, -40]], 'cab', 'bateria');
    wire([[366, 274, -20], [366, 332, -20], [366, 332, -30], [604, 332, -30], [604, 312, -30]], 'cabs', 'bateria');

    /* rodas */
    [260, 760].forEach(function (wx) {
      [1, -1].forEach(function (sgn) {
        [60, 47, 12].forEach(function (r) {
          var a = [], n = Math.max(24, discN + 8);
          for (var i = 0; i <= n; i++) { var th = i / n * Math.PI * 2; a.push([wx + r * Math.cos(th), 298 + r * Math.sin(th), sgn * 150]); }
          model.push({ cls: r === 47 ? 's' : 't', face: sgn, pts: a });
          if (r === 47) for (var k = 0; k < 5; k++) {
            var b = [], off = k * 72 * DEG;
            [[-3, -12], [-9, -43], [-2, -45], [0, -21], [2, -45], [9, -43], [3, -12], [-3, -12]].forEach(function (q) {
              var qx = q[0] * Math.cos(off) - q[1] * Math.sin(off), qy = q[0] * Math.sin(off) + q[1] * Math.cos(off);
              b.push([wx + qx, 298 + qy, sgn * 150]);
            });
            model.push({ cls: 't', face: sgn, pts: b });
          }
        });
      });
    });
    /* chão */
    for (var x = 80; x <= 920; x += 40) model.push({ cls: 'g', floor: true, pts: [[x, 362, -210], [x, 362, 210]] });
    for (var z = -200; z <= 200; z += 40) model.push({ cls: 'g', floor: true, pts: [[80, 362, z], [920, 362, z]] });

    tmp.remove();
    return model;
  }

  var MODEL = null;
  function getModel() {
    if (!MODEL) {
      var small = Math.min(window.innerWidth, screen.width || 9999) < 700;
      MODEL = buildModel(small ? 6.5 : 4.5, small ? 26 : 36);
    }
    return MODEL;
  }

  /* ------------------------------------------------------------------ */
  function swing(P, door, ang) {
    var A = door ? (ang[door] || 0) : 0;
    if (!A) return P;
    var X = P[0], Y = P[1], Z = P[2];
    if (door === 'tail') {
      var hx = 754, hy = 132, dx = X - hx, dy = Y - hy, ca = Math.cos(A), sa = Math.sin(A);
      return [hx + dx * ca + dy * sa, hy - dx * sa + dy * ca, Z];
    }
    var h = DOORS[door], ddx = X - h.h;
    return [h.h + ddx * Math.cos(A), Y, Z + h.z * ddx * Math.sin(A)];
  }
  function projector(yaw, pit) {
    var sy = Math.sin(yaw), cy = Math.cos(yaw), sp = Math.sin(pit), cp = Math.cos(pit);
    return function (X, Y, Z) {
      var dx = X - CX, dy = Y - CY, xc = dx * cy + Z * sy, zc = -dx * sy + Z * cy, yc = dy * cp + zc * sp, dp = zc * cp - dy * sp, s = D / (D - dp);
      return [xc * s, yc * s];
    };
  }
  function emptyPose() {
    return { yaw: 35 * DEG, pit: 14 * DEG, ang: { fl: 0, fr: 0, rl: 0, rr: 0, tail: 0 }, rev: { portas: 0, grave: 0, modulos: 0, midia: 0, bateria: 0 }, dim: 0, vb: [0, 0, 100, 100] };
  }
  function clonePose(p) {
    return { yaw: p.yaw, pit: p.pit, ang: Object.assign({}, p.ang), rev: Object.assign({}, p.rev), dim: p.dim, vb: p.vb.slice() };
  }
  var ease = function (k) { return k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; };
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- relógio único: só roda enquanto alguém anima ---------------- */
  var views = [], raf = 0, last = 0;
  function kick() { if (!raf) raf = requestAnimationFrame(tick); }
  function tick(t) {
    raf = 0;
    var dt = last ? Math.min(64, t - last) : 16; last = t;
    var more = false;
    views.forEach(function (v) { if (v.step(t, dt)) more = true; });
    if (more) raf = requestAnimationFrame(tick); else last = 0;
  }
  document.addEventListener('visibilitychange', function () { if (!document.hidden) kick(); });

  /* ------------------------------------------------------------------ */
  function CarView(svg, opts) {
    this.svg = svg; this.o = opts || {};
    this.items = [];
    this.s = emptyPose();
    this.visible = false;
    this.dirty = true;
    this.tw = null; this.vel = 0; this.drag = null;
    this.lastTouch = -1e9;
    var model = getModel(), self = this;
    var frag = document.createDocumentFragment();
    model.forEach(function (m) {
      var el = document.createElementNS(NS, 'path');
      el.setAttribute('class', m.cls + (m.layer ? ' L L-' + m.layer : ''));
      frag.appendChild(el);
      self.items.push({ m: m, el: el, vis: true });
    });
    svg.appendChild(frag);
    views.push(this);

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { self.visible = e.isIntersecting; if (self.visible) { self.dirty = true; kick(); } });
      }, { rootMargin: '80px' }).observe(svg);
    } else { this.visible = true; }
    if (this.o.drag !== false) this.bindDrag();
  }
  CarView.prototype.aspect = function () {
    var r = this.svg.getBoundingClientRect();
    return r.width > 10 && r.height > 10 ? r.width / r.height : 1.6;
  };
  /* caixa envolvente da projeção num pose; filtro opcional */
  CarView.prototype.bounds = function (pose, filter, acc) {
    var P = projector(pose.yaw, pose.pit);
    var b = acc || [1e9, 1e9, -1e9, -1e9];
    this.items.forEach(function (it) {
      var m = it.m;
      if (m.floor) return;
      if (filter && !filter(m)) return;
      if (m.layer && !filter && pose.rev[m.layer] < .05) return;
      for (var i = 0; i < m.pts.length; i += 2) {
        var q = swing(m.pts[i], m.door, pose.ang), p = P(q[0], q[1], q[2]);
        if (p[0] < b[0]) b[0] = p[0]; if (p[1] < b[1]) b[1] = p[1];
        if (p[0] > b[2]) b[2] = p[0]; if (p[1] > b[3]) b[3] = p[1];
      }
    });
    return b;
  };
  CarView.prototype.fit = function (b, pad, aspect, padY) {
    var x0 = b[0] - pad, y0 = b[1] - (padY === undefined ? pad : padY), w = b[2] - b[0] + pad * 2, h = b[3] - b[1] + (padY === undefined ? pad : padY) * 2;
    var ar = aspect || this.aspect();
    if (w / h < ar) { var nw = h * ar; x0 -= (nw - w) / 2; w = nw; } else { var nh = w / ar; y0 -= (nh - h) / 2; h = nh; }
    return [x0, y0, w, h];
  };

  CarView.prototype.render = function () {
    var s = this.s, P = projector(s.yaw, s.pit), cy = Math.cos(s.yaw), sy = Math.sin(s.yaw);
    this.svg.setAttribute('viewBox', s.vb[0].toFixed(1) + ' ' + s.vb[1].toFixed(1) + ' ' + s.vb[2].toFixed(1) + ' ' + s.vb[3].toFixed(1));
    for (var j = 0; j < this.items.length; j++) {
      var it = this.items[j], m = it.m, f = 1, k;
      if (m.hide) for (k = 0; k < m.hide.length; k++) f = Math.min(f, 1 - s.ang[m.hide[k]] / MAX[m.hide[k]]);
      if (m.show) f = Math.min(f, s.ang[m.show] / MAX[m.show]);
      if (m.layer) f = Math.min(f, s.rev[m.layer]);
      if (m.face) {
        var n = Math.abs(m.face) === 1 ? m.face * cy : (m.face / 2) * sy;
        var q = clamp((n + .32) / .64, 0, 1); f *= .3 + .7 * (q * q * (3 - 2 * q));
      }
      if (!m.layer && !m.floor) f *= 1 - s.dim * (m.cls === 'h' ? .86 : .76);
      if (f < .02) { if (it.vis) { it.el.style.display = 'none'; it.vis = false; } continue; }
      if (!it.vis) { it.el.style.display = ''; it.vis = true; }
      it.el.style.opacity = f.toFixed(2);
      var d = '', pts = m.pts, door = m.door && s.ang[m.door] ? m.door : null;
      for (var i = 0; i < pts.length; i++) {
        var p0 = door ? swing(pts[i], door, s.ang) : pts[i], p = P(p0[0], p0[1], p0[2]);
        d += (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1);
      }
      it.el.setAttribute('d', d);
    }
    if (this.o.onRender) this.o.onRender(this);
  };
  /* ponto 3D -> pixels dentro do svg */
  CarView.prototype.toScreen = function (X, Y, Z) {
    var s = this.s, p = projector(s.yaw, s.pit)(X, Y, Z), r = this.svg.getBoundingClientRect();
    return [(p[0] - s.vb[0]) / s.vb[2] * r.width, (p[1] - s.vb[1]) / s.vb[3] * r.height];
  };
  CarView.prototype.set = function (pose) { this.s = clonePose(pose); this.tw = null; this.dirty = true; kick(); };
  CarView.prototype.goTo = function (pose, dur) {
    if (reduced || !dur) { this.set(pose); return; }
    var from = clonePose(this.s), to = clonePose(pose);
    var dy = ((to.yaw - from.yaw) % (2 * Math.PI) + 3 * Math.PI) % (2 * Math.PI) - Math.PI;
    to.yaw = from.yaw + dy;
    this.vel = 0;
    this.tw = { from: from, to: to, t0: performance.now(), dur: dur };
    kick();
  };
  CarView.prototype.step = function (t, dt) {
    var s = this.s, changed = this.dirty, more = false;
    this.dirty = false;
    if (this.tw) {
      var w = this.tw, k = clamp((t - w.t0) / w.dur, 0, 1), e = ease(k), A = w.from, B = w.to, key;
      s.yaw = A.yaw + (B.yaw - A.yaw) * e; s.pit = A.pit + (B.pit - A.pit) * e; s.dim = A.dim + (B.dim - A.dim) * e;
      // portas: fecham na 1a metade se forem fechar, abrem na 2a metade se forem abrir
      for (key in A.ang) {
        var a0 = A.ang[key], a1 = B.ang[key], kk = a1 > a0 ? clamp((k - .3) / .7, 0, 1) : clamp(k / .6, 0, 1);
        s.ang[key] = a0 + (a1 - a0) * ease(kk);
      }
      for (key in A.rev) {
        var r0 = A.rev[key], r1 = B.rev[key], kr = r1 > r0 ? clamp((k - .35) / .65, 0, 1) : clamp(k / .5, 0, 1);
        s.rev[key] = r0 + (r1 - r0) * ease(kr);
      }
      for (var i = 0; i < 4; i++) s.vb[i] = A.vb[i] + (B.vb[i] - A.vb[i]) * e;
      changed = true;
      if (k >= 1) { this.tw = null; if (this.o.onArrive) this.o.onArrive(this); } else more = true;
    } else if (!this.drag && Math.abs(this.vel) > 1e-5) {
      s.yaw += this.vel * dt; this.vel *= Math.pow(.93, dt / 16); changed = true; more = true;
    } else if (this.o.auto && !reduced && !this.drag && this.visible && !document.hidden && t - this.lastTouch > 2600) {
      // giro lento: no celular, ~30 quadros por segundo bastam
      this.acc = (this.acc || 0) + dt;
      if (this.acc >= (this.o.fps30 ? 32 : 0)) { s.yaw += this.o.auto * DEG * this.acc / 1000; this.acc = 0; changed = true; }
      more = true;
    }
    if (changed && this.visible) this.render();
    else if (changed) this.dirty = true;
    return more;
  };
  CarView.prototype.bindDrag = function () {
    var self = this, svg = this.svg, lastX = 0, lastY = 0, lastT = 0;
    svg.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      self.drag = { id: e.pointerId }; lastX = e.clientX; lastY = e.clientY; lastT = performance.now();
      self.tw = null; self.vel = 0; self.lastTouch = lastT;
      try { svg.setPointerCapture(e.pointerId); } catch (_) { }
      svg.classList.add('is-grabbing');
      if (self.o.onDrag) self.o.onDrag(self);
    });
    svg.addEventListener('pointermove', function (e) {
      if (!self.drag || self.drag.id !== e.pointerId) return;
      var now = performance.now(), dx = e.clientX - lastX, dy = e.clientY - lastY;
      var w = svg.getBoundingClientRect().width || 600, k = 3.4 / w;
      self.s.yaw += dx * k;
      if (e.pointerType === 'mouse') self.s.pit = clamp(self.s.pit + dy * k * .8, -4 * DEG, 42 * DEG);
      var vdt = Math.max(8, now - lastT);
      self.vel = dx * k / vdt;
      lastX = e.clientX; lastY = e.clientY; lastT = now; self.lastTouch = now;
      self.dirty = true; kick();
    });
    var end = function (e) {
      if (!self.drag || self.drag.id !== e.pointerId) return;
      self.drag = null; self.lastTouch = performance.now();
      if (performance.now() - lastT > 90) self.vel = 0;
      self.vel = clamp(self.vel, -.006, .006);
      svg.classList.remove('is-grabbing'); kick();
    };
    svg.addEventListener('pointerup', end);
    svg.addEventListener('pointercancel', end);
    svg.addEventListener('keydown', function (e) {
      var step = 12 * DEG;
      if (e.key === 'ArrowLeft') self.s.yaw -= step;
      else if (e.key === 'ArrowRight') self.s.yaw += step;
      else if (e.key === 'ArrowUp') self.s.pit = clamp(self.s.pit + 5 * DEG, -4 * DEG, 42 * DEG);
      else if (e.key === 'ArrowDown') self.s.pit = clamp(self.s.pit - 5 * DEG, -4 * DEG, 42 * DEG);
      else return;
      e.preventDefault(); self.tw = null; self.lastTouch = performance.now(); self.dirty = true; kick();
    });
  };

  window.VibexCar = {
    DEG: DEG, MAX: MAX, LAYERS: LAYERS, reduced: reduced,
    create: function (svg, opts) { return new CarView(svg, opts); },
    pose: function (o) {
      var p = emptyPose();
      if (o) {
        if (o.yaw !== undefined) p.yaw = o.yaw * DEG;
        if (o.pit !== undefined) p.pit = o.pit * DEG;
        (o.open || []).forEach(function (k) { p.ang[k] = MAX[k]; });
        if (o.rev !== undefined) LAYERS.forEach(function (l) { p.rev[l] = typeof o.rev === 'number' ? o.rev : (o.rev[l] || 0); });
        if (o.dim !== undefined) p.dim = o.dim;
      }
      return p;
    }
  };
})();
